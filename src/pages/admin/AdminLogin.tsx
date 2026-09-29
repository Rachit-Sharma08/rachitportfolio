import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../lib/useAdminAuth'
import { Button, Status, TextField } from '../../components/admin/Fields'

export default function AdminLogin() {
  const auth = useAdminAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (auth.status === 'admin') {
    return <Navigate to={from} replace />
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    await auth.signIn(email, password)
    setBusy(false)
  }

  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center bg-bg px-5 py-16"
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="eyebrow eyebrow-center mb-5">Admin</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-text-primary md:text-4xl">
            Sign in to manage
            <span className="font-display font-normal italic text-accent-ink">
              {' '}
              the site
            </span>
          </h1>
        </div>

        <form onSubmit={submit} className="glass flex flex-col gap-5 p-6 md:p-8">
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={auth.unconfigured ? 'Supabase not configured' : 'you@example.com'}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Status state={auth.error ? 'error' : 'idle'} message={auth.error} />

          <Button
            type="submit"
            variant="primary"
            loading={busy}
            disabled={auth.unconfigured}
            className="w-full py-3"
          >
            Sign in
          </Button>

          {auth.unconfigured ? (
            <p className="text-xs leading-relaxed text-muted">
              <code className="text-accent-ink">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-accent-ink">VITE_SUPABASE_ANON_KEY</code> are
              empty. Add them to <code className="text-accent-ink">.env</code> and
              restart the dev server.
            </p>
          ) : null}
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          <a href="/" className="nav-hit text-accent-ink underline underline-offset-4">
            Back to the site
          </a>
        </p>
      </div>
    </main>
  )
}
