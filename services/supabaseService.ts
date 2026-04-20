import { supabase } from '../utils/supabase';
import { Project, Task, User, Team, CalendarEvent, TaskSubtask } from '../constants/types';

const isMissingTableError = (error: { code?: string } | null) => error?.code === 'PGRST205' || error?.code === '42P01';
const TRANSIENT_ERROR_CODES = new Set(['57014', 'ETIMEDOUT', 'ECONNRESET', 'ENETUNREACH']);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function withRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const code = error?.code || error?.name;
      const isTransient = TRANSIENT_ERROR_CODES.has(String(code)) || String(error?.message || '').includes('timed out');
      if (!isTransient || attempt === retries) break;
      await sleep(300 * (attempt + 1));
    }
  }
  throw lastError;
}

const mapTask = (t: any): Task => ({
  id: t.id,
  title: t.title,
  description: t.description ?? '',
  dueDate: t.due_date ?? new Date().toISOString().slice(0, 10),
  priority: t.priority ?? 'medium',
  status: t.status ?? 'inProgress',
  progress: t.progress ?? 0,
  category: t.category ?? '',
  subtasks: t.subtasks_count ?? 0,
  projectId: t.project_id ?? undefined,
  teamId: t.team_id ?? undefined,
  attachmentUrls: Array.isArray(t.attachment_urls) ? t.attachment_urls : [],
  assignees: t.assignees?.map((a: any) => a.profiles) || [],
});

const mapProject = (p: any): Project => ({
  id: p.id,
  name: p.name,
  description: p.description ?? '',
  companyName: p.company_name ?? p.company ?? '',
  dueDate: p.due_date ?? new Date().toISOString().slice(0, 10),
  progress: p.progress ?? 0,
  status: p.status ?? 'active',
  // Prefer real task count via `tasks_count:tasks(count)` relation, fall back to legacy `projects.tasks` column.
  tasks:
    (Array.isArray(p.tasks_count) ? Number(p.tasks_count?.[0]?.count ?? 0) : Number(p.tasks_count?.count ?? 0)) ||
    Number(p.tasks ?? 0),
  color: p.color ?? '#4A7C9B',
  members: p.members?.map((m: any) => m.profiles) || [],
  tags: p.tags || [],
});

const mapTeam = (t: any): Team => ({
  id: t.id,
  name: t.name,
  description: t.description ?? '',
  progress: t.progress ?? 0,
  color: t.color ?? '#4A7C9B',
  members: t.members?.map((m: any) => m.profiles) || [],
  memberCount: t.members?.length ?? 0,
});

const mapEvent = (e: any): CalendarEvent => ({
  id: e.id,
  title: e.title,
  startTime: e.start_time ?? '',
  endTime: e.end_time ?? '',
  date: e.date,
  status: e.status ?? undefined,
  color: e.color ?? '#4A7C9B',
  taskCount: e.task_count ?? undefined,
  assignee: e.assignee ?? undefined,
  assignees: e.assignees?.map((a: any) => a.profiles) || [],
});

const mapTaskSubtask = (s: any): TaskSubtask => ({
  id: s.id,
  taskId: s.task_id,
  title: s.title ?? '',
  completed: Boolean(s.completed),
});

function getStatusFromProgress(task: Task, progress: number): Task['status'] {
  if (progress >= 100) return 'completed';
  const today = new Date().toISOString().slice(0, 10);
  const due = toISODateOnly(task.dueDate);
  if (due < today) return 'overdue';
  return 'inProgress';
}

function toISODateOnly(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function normalizeTaskStatus(task: Task): Task {
  if (task.status === 'completed') return { ...task, progress: 100 };
  const today = new Date().toISOString().slice(0, 10);
  const due = toISODateOnly(task.dueDate);
  if (due < today) {
    return { ...task, status: 'overdue', progress: 0 };
  }
  return { ...task, status: 'inProgress', progress: 0 };
}

function applySubtaskProgress(tasks: Task[], subtasks: TaskSubtask[]): Task[] {
  const grouped = new Map<string, TaskSubtask[]>();
  for (const s of subtasks) {
    const bucket = grouped.get(s.taskId) ?? [];
    bucket.push(s);
    grouped.set(s.taskId, bucket);
  }

  return tasks.map((task) => {
    const forTask = grouped.get(task.id) ?? [];
    if (!forTask.length) return normalizeTaskStatus(task);
    const done = forTask.filter((s) => s.completed).length;
    const progress = Math.round((done / forTask.length) * 100);
    const status: Task['status'] = progress >= 100 ? 'completed' : normalizeTaskStatus(task).status;
    return {
      ...task,
      subtasks: forTask.length,
      progress,
      status,
    };
  });
}

async function ensureCurrentProfileExists() {
  const { data: authData, error: authError } = await withTimeout(withRetry(() => supabase.auth.getUser()));
  if (authError) throw authError;
  const user = authData.user;
  if (!user) return null;

  const payload = {
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata as any)?.name ?? '',
    avatar: (user.user_metadata as any)?.avatar_url ?? (user.user_metadata as any)?.avatar ?? null,
    role: (user.user_metadata as any)?.role ?? 'Member',
  };

  // Upsert is idempotent and fixes FK failures when `profiles` row doesn't exist yet.
  const { error } = await withTimeout(
    withRetry(() => supabase.from('profiles').upsert(payload, { onConflict: 'id' })),
  );
  if (error) throw error;
  return user.id;
}

export const supabaseService = {
  async testConnection() {
    const { error } = await withTimeout(
      withRetry(() => supabase.from('projects').select('id').limit(1)),
    );

    if (!error) {
      return {
        connected: true,
        message: 'Connected to Supabase successfully.',
      };
    }

    // These errors can still mean the network/project connection is valid,
    // but the table or permissions are not configured yet.
    const connectionReached = error.code === '42P01' || error.code === '42501';
    return {
      connected: connectionReached,
      message: connectionReached
        ? `Connected to Supabase, but table access failed (${error.code}). Check schema/policies.`
        : `Could not reach Supabase: ${error.message}`,
    };
  },

  // --- Projects ---
  async getProjects() {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
      .from('projects')
      .select(`
        *,
        tasks_count:tasks(count),
        members:project_members(profiles(*))
      `),
      ),
    );
    
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    
    // Transform data to match local types if necessary
    return (data || []).map(mapProject);
  },

  async getProjectById(projectId: string) {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('projects')
          .select(
            `
        *,
        tasks_count:tasks(count),
        members:project_members(profiles(*))
      `,
          )
          .eq('id', projectId)
          .single(),
      ),
    );
    if (error) throw error;
    return mapProject(data);
  },

  async createProject(project: Partial<Project>) {
    const userId = await ensureCurrentProfileExists();
    const payload: any = {
      name: project.name,
      description: project.description,
      due_date: project.dueDate,
      progress: project.progress,
      status: project.status,
      color: project.color,
      created_by: userId,
    };
    const attemptInsert = (p: any) =>
      withTimeout(
        withRetry(() =>
          supabase
            .from('projects')
            .insert([p])
            .select()
            .single(),
        ),
      );

    // Try a few payload shapes to handle schema drift:
    // - `tags` missing column
    // - `tags` is text[] but client sent wrong literal
    // - `tags` is text, not text[]
    let res = await attemptInsert(payload);
    if (!res.error) return mapProject(res.data);

    throw res.error;
  },

  // --- Tasks ---
  async getTasks(projectId?: string) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignees:task_assignees(profiles(*))
      `);
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await withTimeout(withRetry(() => query));
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }

    const mapped = (data || []).map(mapTask);
    if (!mapped.length) return mapped;
    const { data: subtasksData, error: subtasksError } = await withTimeout(
      withRetry(() =>
        supabase
          .from('task_subtasks')
          .select('*')
          .in('task_id', mapped.map((t) => t.id)),
      ),
    );
    if (subtasksError && !isMissingTableError(subtasksError)) throw subtasksError;
    return applySubtaskProgress(mapped, (subtasksData || []).map(mapTaskSubtask));
  },

  async getTasksByTeamId(teamId: string) {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('tasks')
          .select(
            `
        *,
        assignees:task_assignees(profiles(*))
      `,
          )
          .eq('team_id', teamId),
      ),
    );
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    const mapped = (data || []).map(mapTask);
    if (!mapped.length) return mapped;
    const { data: subtasksData, error: subtasksError } = await withTimeout(
      withRetry(() =>
        supabase
          .from('task_subtasks')
          .select('*')
          .in('task_id', mapped.map((t) => t.id)),
      ),
    );
    if (subtasksError && !isMissingTableError(subtasksError)) throw subtasksError;
    return applySubtaskProgress(mapped, (subtasksData || []).map(mapTaskSubtask));
  },

  async createTask(task: Partial<Task>) {
    const payload: any = {
      project_id: task.projectId,
      team_id: task.teamId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      category: task.category,
      subtasks_count: task.subtasks,
      attachment_urls: task.attachmentUrls ?? [],
    };
    const attemptInsert = (p: any) =>
      withTimeout(
        withRetry(() =>
          supabase
            .from('tasks')
            .insert([p])
            .select()
            .single(),
        ),
      );

    let res = await attemptInsert(payload);
    if (!res.error) return mapTask(res.data);

    // If the DB schema doesn't have `team_id`, retry without it.
    const msg = String(res.error?.message || '').toLowerCase();
    const details = String((res.error as any)?.details || '').toLowerCase();
    const hint = String((res.error as any)?.hint || '').toLowerCase();
    const combined = `${msg}\n${details}\n${hint}`;
    const missingTeamId =
      combined.includes("could not find the 'team_id' column") ||
      (combined.includes('team_id') && (combined.includes('schema cache') || combined.includes('column'))) ||
      res.error?.code === 'PGRST204';

    if (missingTeamId) {
      const { team_id: _omit, ...withoutTeam } = payload;
      res = await attemptInsert(withoutTeam);
      if (!res.error) return mapTask(res.data);
    }

    // If the DB schema doesn't have `attachment_urls`, retry without it.
    const missingAttachmentUrls =
      combined.includes("could not find the 'attachment_urls' column") ||
      (combined.includes('attachment_urls') && (combined.includes('schema cache') || combined.includes('column'))) ||
      res.error?.code === 'PGRST204';
    if (missingAttachmentUrls) {
      const { attachment_urls: _omit, ...withoutAttachments } = payload;
      res = await attemptInsert(withoutAttachments);
      if (!res.error) return mapTask(res.data);
    }

    throw res.error;
  },

  async getTaskSubtasks(taskId: string) {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('task_subtasks')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true }),
      ),
    );
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []).map(mapTaskSubtask);
  },

  async createTaskSubtasks(
    taskId: string,
    subtasks: Array<{ title: string; completed?: boolean }>,
  ) {
    if (!subtasks.length) return [];
    const payload = subtasks
      .filter((s) => s.title.trim().length > 0)
      .map((s) => ({
        task_id: taskId,
        title: s.title.trim(),
        completed: Boolean(s.completed),
      }));
    if (!payload.length) return [];
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('task_subtasks')
          .insert(payload)
          .select('*'),
      ),
    );
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []).map(mapTaskSubtask);
  },

  async updateTaskSubtaskStatus(taskId: string, subtaskId: string, completed: boolean) {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('task_subtasks')
          .update({ completed })
          .eq('id', subtaskId)
          .eq('task_id', taskId)
          .select('*')
          .single(),
      ),
    );
    if (error) throw error;

    const mappedSubtask = mapTaskSubtask(data);
    const subtasks = await this.getTaskSubtasks(taskId);
    const task = await this.getTaskById(taskId);
    const total = subtasks.length;
    const done = subtasks.filter((s) => s.completed).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : task.progress;
    const status = getStatusFromProgress(task, progress);

    await this.updateTaskStatus(taskId, status, progress);
    return mappedSubtask;
  },

  async getTaskById(taskId: string) {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('tasks')
          .select(
            `
        *,
        assignees:task_assignees(profiles(*))
      `,
          )
          .eq('id', taskId)
          .single(),
      ),
    );
    if (error) throw error;
    const mapped = mapTask(data);
    const subtasks = await this.getTaskSubtasks(taskId);
    return applySubtaskProgress([mapped], subtasks)[0];
  },

  async updateTaskStatus(taskId: string, status: Task['status'], progress: number) {
    const { data, error } = await withTimeout(
      withRetry(() => supabase
      .from('tasks')
      .update({ status, progress })
      .eq('id', taskId)
      .select()
      .single()),
    );
    if (error) throw error;
    return mapTask(data);
  },

  async getTeamById(teamId: string) {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('teams')
          .select(
            `
        *,
        members:team_members(profiles(*))
      `,
          )
          .eq('id', teamId)
          .single(),
      ),
    );
    if (error) throw error;
    return mapTeam(data);
  },

  // --- Profiles / Users ---
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async getProfiles() {
    const { data, error } = await withTimeout(
      withRetry(() => supabase.from('profiles').select('*')),
    );
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []) as User[];
  },

  async updateCurrentProfile(patch: Partial<User>) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const user = authData.user;
    if (!user) throw new Error('No authenticated user.');

    const payload: any = {
      id: user.id,
      name: patch.name,
      email: patch.email,
      avatar: patch.avatar,
      role: patch.role,
      company_name: patch.companyName,
      department: patch.department,
      job_title: patch.jobTitle,
      phone: patch.phone,
    };

    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select('*').single(),
      ),
    );
    if (error) throw error;
    return {
      ...(data as any),
      companyName: (data as any)?.company_name ?? (data as any)?.company,
      jobTitle: (data as any)?.job_title,
    } as User;
  },

  async createInvites(payload: { emails: string[]; role: string; message?: string; attachmentUrls?: string[] }) {
    const { error } = await withTimeout(
      withRetry(() =>
        supabase.from('invites').insert([
          {
            emails: payload.emails,
            role: payload.role,
            message: payload.message ?? '',
            attachment_urls: payload.attachmentUrls ?? [],
          },
        ]),
      ),
    );
    if (error) {
      if (isMissingTableError(error)) return { ok: true };
      throw error;
    }
    return { ok: true };
  },

  // --- Teams ---
  async getTeams() {
    const { data, error } = await withTimeout(
      withRetry(() => supabase
      .from('teams')
      .select(`
        *,
        members:team_members(profiles(*))
      `)),
    );
    
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []).map(mapTeam);
  },

  async createTeam(team: Pick<Team, 'name' | 'description' | 'color' | 'progress'>, memberIds: string[] = []) {
    const { data, error } = await withTimeout(
      withRetry(() =>
        supabase
          .from('teams')
          .insert([
            {
              name: team.name,
              description: team.description,
              color: team.color,
              progress: team.progress ?? 0,
            },
          ])
          .select()
          .single(),
      ),
    );
    if (error) throw error;

    if (memberIds.length > 0) {
      const { error: membersError } = await withTimeout(
        withRetry(() =>
          supabase.from('team_members').insert(
            memberIds.map((userId) => ({
              team_id: data.id,
              user_id: userId,
            })),
          ),
        ),
      );
      if (membersError) throw membersError;
    }

    return mapTeam({
      ...data,
      members: [],
    });
  },

  // --- Calendar Events ---
  async getEvents() {
    const { data, error } = await withTimeout(
      withRetry(() => supabase
      .from('calendar_events')
      .select(`
        *,
        assignees:event_assignees(profiles(*))
      `)),
    );
    
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []).map(mapEvent);
  },

  async createEvent(event: Pick<CalendarEvent, 'title' | 'date' | 'startTime' | 'endTime' | 'color' | 'status'>) {
    const payload = {
      title: event.title,
      date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      color: event.color ?? '#4A7C9B',
      status: event.status,
    };
    const { data, error } = await withTimeout(
      withRetry(() => supabase
        .from('calendar_events')
        .insert([payload])
        .select()
        .single()),
    );
    if (error) throw error;
    return mapEvent(data);
  },
};
