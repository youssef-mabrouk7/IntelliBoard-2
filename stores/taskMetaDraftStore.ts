import { create } from 'zustand';

type TaskMetaDraftState = {
  priority?: 'High' | 'Medium' | 'Low';
  category?: string;
  setPriority: (priority: 'High' | 'Medium' | 'Low') => void;
  setCategory: (category: string) => void;
  clear: () => void;
};

export const useTaskMetaDraftStore = create<TaskMetaDraftState>((set) => ({
  priority: undefined,
  category: undefined,
  setPriority: (priority) => set({ priority }),
  setCategory: (category) => set({ category }),
  clear: () => set({ priority: undefined, category: undefined }),
}));
