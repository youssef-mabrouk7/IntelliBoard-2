import { Platform } from 'react-native'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    'Supabase env vars are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env (local) and EAS environment variables (cloud builds).',
  )
}

const inMemoryStorage = new Map<string, string>()

const authStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null
    }
    return inMemoryStorage.get(key) ?? null
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value)
      return
    }
    inMemoryStorage.set(key, value)
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key)
      return
    }
    inMemoryStorage.delete(key)
  },
}

const fallbackUrl = 'https://example.supabase.co'
const fallbackAnonKey = 'missing-supabase-anon-key'

export const supabase = createClient(supabaseUrl ?? fallbackUrl, supabaseAnonKey ?? fallbackAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/** User-facing hint when fetch fails (common if EAS build has no EXPO_PUBLIC_* at compile time). */
export function friendlyAuthNetworkMessage(raw: string | undefined): string {
  const m = (raw ?? '').toLowerCase()
  if (m.includes('network request failed')) {
    return (
      'Cannot reach Supabase. For release/APK builds, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY ' +
      'in Expo (Project → Environment variables) for the same profile you use to build, then create a new build. ' +
      'Local .env is not shipped to EAS.'
    )
  }
  return raw ?? 'Something went wrong.'
}
