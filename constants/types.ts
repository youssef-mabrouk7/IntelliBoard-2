export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
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
    category?: string;
    subtasks?: number;
    projectId?: string;
    teamId?: string;
  }
  
  export interface Project {
    id: string;
    name: string;
    description?: string;
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
  