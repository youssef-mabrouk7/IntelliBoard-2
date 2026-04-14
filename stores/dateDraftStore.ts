import { create } from 'zustand'

export type DateDraftContext = 'project' | 'task' | 'event' | 'calendar'

type DateDraftState = {
  byContext: Partial<Record<DateDraftContext, { dateISO: string; time?: string }>>
  setDateDraft: (context: DateDraftContext, draft: { dateISO: string; time?: string }) => void
  clearDateDraft: (context: DateDraftContext) => void
}

export const useDateDraftStore = create<DateDraftState>((set) => ({
  byContext: {},
  setDateDraft: (context, draft) =>
    set((s) => ({ byContext: { ...s.byContext, [context]: draft } })),
  clearDateDraft: (context) =>
    set((s) => {
      const next = { ...s.byContext }
      delete next[context]
      return { byContext: next }
    }),
}))

