import { create } from 'zustand';

export type AttachmentContext = 'task' | 'event';

export type DraftAttachment = {
  id: string;
  name: string;
  uri: string;
  type: 'image' | 'link';
  size?: string;
};

type AttachmentDraftState = {
  byContext: Partial<Record<AttachmentContext, DraftAttachment[]>>;
  setAttachments: (context: AttachmentContext, attachments: DraftAttachment[]) => void;
  removeAttachment: (context: AttachmentContext, id: string) => void;
};

export const useAttachmentDraftStore = create<AttachmentDraftState>((set) => ({
  byContext: {},
  setAttachments: (context, attachments) =>
    set((state) => ({ byContext: { ...state.byContext, [context]: attachments } })),
  removeAttachment: (context, id) =>
    set((state) => ({
      byContext: {
        ...state.byContext,
        [context]: (state.byContext[context] || []).filter((file) => file.id !== id),
      },
    })),
}));
