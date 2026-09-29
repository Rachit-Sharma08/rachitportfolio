import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase client.
 *
 * This is the *anon* key, which is designed to be public — every statement it
 * makes is filtered by the RLS policies in supabase/schema.sql before it
 * reaches a row. The service-role key is never imported here; it lives only in
 * api/*.ts and is read from a non-VITE_ env var.
 *
 * When the env vars are still placeholders (or the project hasn't been set up
 * yet) `isSupabaseConfigured` is false and the whole site silently falls back to
 * the hardcoded content in src/data.ts, so a fresh clone still renders.
 *
 * The SDK itself is imported on demand rather than at module scope. A visitor
 * who never touches the admin and whose content is already in the static HTML
 * never triggers the download — which is the point, since the client is larger
 * than everything else on the page put together.
 */

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

export const isSupabaseConfigured =
  /^https?:\/\//.test(url) && anonKey.length > 20

export const STORAGE_BUCKET = 'site-media'

/** Kept in sync with public.is_admin() in supabase/schema.sql. RLS wins on conflict. */
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL ?? '')
  .trim()
  .toLowerCase()

let client: SupabaseClient | null = null
let loading: Promise<SupabaseClient | null> | null = null

/**
 * Resolves to the client, or to null when Supabase is not configured.
 * Concurrent callers share one in-flight import + create.
 */
export function supabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  if (client) return Promise.resolve(client)
  if (!loading) {
    loading = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: 'rs-admin-session',
        },
      })
      return client
    })
  }
  return loading
}

/**
 * Synchronous access, for callers that already hold a client — the admin API,
 * which cannot render until auth has resolved anyway. Returns null before the
 * first `supabase()` call has settled.
 */
export function supabaseSync(): SupabaseClient | null {
  return client
}
