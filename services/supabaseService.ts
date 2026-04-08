import { supabase } from '../utils/supabase';
import { Project, Task, User, Team, CalendarEvent } from '../constants/types';

export const supabaseService = {
  // --- Projects ---
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        members:project_members(profiles(*))
      `);
    
    if (error) throw error;
    
    // Transform data to match local types if necessary
    return data.map(p => ({
      ...p,
      members: p.members?.map((m: any) => m.profiles) || [],
      tags: p.tags || [], // Assumption: tags might be stored in a tags column or separate table
    })) as Project[];
  },

  async createProject(project: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    if (error) throw error;
    return data as Project;
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

    const { data, error } = await query;
    if (error) throw error;

    return data.map(t => ({
      ...t,
      assignees: t.assignees?.map((a: any) => a.profiles) || [],
    })) as Task[];
  },

  async createTask(task: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  async updateTaskStatus(taskId: string, status: Task['status'], progress: number) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status, progress })
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
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

  // --- Teams ---
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(profiles(*))
      `);
    
    if (error) throw error;
    return data.map(t => ({
      ...t,
      members: t.members?.map((m: any) => m.profiles) || [],
    })) as Team[];
  },

  // --- Calendar Events ---
  async getEvents() {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        assignees:event_assignees(profiles(*))
      `);
    
    if (error) throw error;
    return data.map(e => ({
      ...e,
      assignees: e.assignees?.map((a: any) => a.profiles) || [],
    })) as CalendarEvent[];
  }
};
