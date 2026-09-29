import { useCallback, useEffect, useState } from 'react'
import { ADMIN_EMAIL, isSupabaseConfigured, supabase } from './supabase'

export type AdminStatus = 'loading' | 'anonymous' | 'admin'

export interface AdminSession {
  status: AdminStatus
  email: string
  /** True when the app has no Supabase env vars yet, so the login screen can say so. */
  unconfigured: boolean
  error: string
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

/**
 * Single-admin session for the /admin panel.
 *
 * The client-side gate here is UX, not security: it decides what to render and
 * where to redirect. A signed-in user whose email doesn't match is signed out
 * immediately. What actually stops a non-admin from writing is the RLS policy on
 * every table — a request made with a stranger's token is rejected by Postgres
 * no matter what this hook believes.
 */
export function useAdminAuth(): AdminSession {
  const [status, setStatus] = useState<AdminStatus>('loading')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const evaluate = useCallback(async () => {
    const client = await supabase()
    if (!client) {
      setStatus('anonymous')
      return
    }
    const { data } = await client.auth.getSession()
    const session = data.session
    if (!session) {
      setStatus('anonymous')
      setEmail('')
      return
    }
    const address = (session.user.email ?? '').toLowerCase()
    if (!ADMIN_EMAIL || address !== ADMIN_EMAIL) {
      // Signed in as someone else — don't leave their token lying around.
      await client.auth.signOut()
      setStatus('anonymous')
      setEmail('')
      return
    }
    setEmail(address)
    setStatus('admin')
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false

    void (async () => {
      const client = await supabase()
      if (!client) {
        if (!cancelled) setStatus('anonymous')
        return
      }
      await evaluate()
      if (cancelled) return
      const { data: sub } = client.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          setStatus('anonymous')
          setEmail('')
          return
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          void evaluate()
        }
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    })()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [evaluate])

  const signIn = useCallback(async (address: string, password: string) => {
    const client = await supabase()
    if (!client) {
      setError('Supabase is not configured yet.')
      return
    }
    setError('')
    const { error: signInError } = await client.auth.signInWithPassword({
      email: address.trim().toLowerCase(),
      password,
    })
    if (signInError) {
      setError(
        signInError.status === 400
          ? 'Wrong email or password.'
          : signInError.message,
      )
      return
    }
    await evaluate()
  }, [evaluate])

  const signOut = useCallback(async () => {
    const client = await supabase()
    await client?.auth.signOut()
    setStatus('anonymous')
    setEmail('')
  }, [])

  return {
    status,
    email,
    unconfigured: !isSupabaseConfigured,
    error,
    signIn,
    signOut,
  }
}
