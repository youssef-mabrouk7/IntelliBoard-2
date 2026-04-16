import { create } from 'zustand';

export type DraftSubtask = {
  id: string;
  title: string;
  completed: boolean;
};

type SubtaskDraftState = {
  byContext: {
    task?: DraftSubtask[];
  };
  setSubtasks: (context: 'task', subtasks: DraftSubtask[]) => void;
  clearSubtasks: (context: 'task') => void;
};

export const useSubtaskDraftStore = create<SubtaskDraftState>((set) => ({
  byContext: {},
  setSubtasks: (context, subtasks) =>
    set((state) => ({ byContext: { ...state.byContext, [context]: subtasks } })),
  clearSubtasks: (context) =>
    set((state) => {
      const next = { ...state.byContext };
      delete next[context];
      return { byContext: next };
    }),
}));

