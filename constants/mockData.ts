import { User, Task, Project, Team, CalendarEvent, AnalyticsData } from './types';

// Deprecated static fixtures. Keep exports empty so app data comes from Supabase only.
export const currentUser: User = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  role: '',
};
export const users: User[] = [];
export const tasks: Task[] = [];
export const projects: Project[] = [];
export const teams: Team[] = [];
export const calendarEvents: CalendarEvent[] = [];
export const analyticsData: AnalyticsData = {
  totalTasks: 0,
  completed: 0,
  overdue: 0,
  overdued: 0,
  ongoing: 0,
  weeklyData: [],
};

export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const calendarDays = [
  { day: 18, date: '2024-04-18' },
  { day: 19, date: '2024-04-19' },
  { day: 20, date: '2024-04-20' },
  { day: 17, date: '2024-04-17', isToday: true },
  { day: 18, date: '2024-04-18' },
  { day: 19, date: '2024-04-19' },
  { day: 20, date: '2024-04-20' },
];

export const homeDays = [
  { day: 'Fri', date: 11 },
  { day: 'Sat', date: 12 },
  { day: 'Sun', date: 14, isSelected: true },
  { day: 'Mon', date: 14 },
  { day: 'Tue', date: 15 },
];
