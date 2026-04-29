export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    companyId?: string;
    companyName?: string;
    department?: string;
    jobTitle?: string;
    phone?: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'inProgress' | 'completed' | 'overdue';
    progress: number;
    assignees: User[];
    attachmentUrls?: string[];
    category?: string;
    subtasks?: number;
    projectId?: string;
    teamId?: string;
  }

export interface TaskSubtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  dueDate?: string | null;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  changedBy?: string | null;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  actionType: 'create' | 'update' | 'delete';
  createdAt: string;
  actor?: User | null;
}
  
  export interface Project {
    id: string;
    name: string;
    description?: string;
    companyName?: string;
    dueDate: string;
    progress: number;
    status: 'active' | 'completed' | 'onHold';
    tasks: number;
    members: User[];
    tags: string[];
    color: string;
  }
  
  export interface Team {
    id: string;
    name: string;
    description?: string;
    members: User[];
    memberCount: number;
    progress: number;
    color: string;
  }
  
  export interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    assignees: User[];
    status?: string;
    color?: string;
    taskCount?: number;
    assignee?: string;
  }

export interface EventInvite {
  id: string;
  eventId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string | null;
  event?: CalendarEvent | null;
  inviter?: User | null;
}
  
  export interface AnalyticsData {
    totalTasks: number;
    completed: number;
    overdue: number;
    overdued: number;
    ongoing: number;
    weeklyData: {
      day: string;
      completed: number;
      overdue: number;
    }[];
  }
  