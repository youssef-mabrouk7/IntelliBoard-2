import { supabase } from '@/utils/supabase';

export type LocalUploadFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

export type UploadValidationRules = {
  maxBytes: number;
  allowedMimeTypes?: string[];
};

export type UploadTarget = 'attachments' | 'avatars';

export function validateUploadFile(file: LocalUploadFile, rules: UploadValidationRules) {
  if (typeof file.size === 'number' && file.size > rules.maxBytes) {
    return {
      ok: false as const,
      error: `File size exceeds ${(rules.maxBytes / (1024 * 1024)).toFixed(0)}MB limit.`,
    };
  }

  if (rules.allowedMimeTypes?.length) {
    const mt = (file.mimeType ?? '').toLowerCase();
    const allowed = rules.allowedMimeTypes.map((m) => m.toLowerCase());
    if (!mt || !allowed.includes(mt)) {
      return { ok: false as const, error: 'Unsupported file type.' };
    }
  }

  return { ok: true as const };
}

function uid() {
  const maybeCrypto = globalThis.crypto as { randomUUID?: () => string };
  if (maybeCrypto?.randomUUID) return maybeCrypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function sanitizeName(name: string) {
  return (name || 'file').replace(/[^\w.\-() ]+/g, '_');
}

async function toBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  if (!res.ok) throw new Error(`Could not read file (${res.status})`);
  return await res.blob();
}

export async function uploadToStorage(params: {
  bucket: UploadTarget;
  file: LocalUploadFile;
  folder?: string;
  upsert?: boolean;
}) {
  const { bucket, file, folder, upsert } = params;
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? 'anonymous';

  const fileName = sanitizeName(file.name);
  const objectPath = `${folder ? `${folder.replace(/\/+$/, '')}/` : ''}${userId}/${uid()}_${fileName}`;
  const blob = await toBlob(file.uri);

  const upload = await supabase.storage.from(bucket).upload(objectPath, blob, {
    upsert: Boolean(upsert),
    contentType: file.mimeType ?? undefined,
  });
  if (upload.error) throw upload.error;

  const pub = supabase.storage.from(bucket).getPublicUrl(objectPath);
  const url = pub?.data?.publicUrl;
  if (!url) throw new Error('No storage URL was returned.');

  return { path: objectPath, url };
}

