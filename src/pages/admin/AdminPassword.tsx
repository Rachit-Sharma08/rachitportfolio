import { useState } from 'react'
import type { ReactNode } from 'react'
import AdminLayout from './AdminLayout'
import { AdminPanel, Button, Status, TextField } from '../../components/admin/Fields'
import { changePassword, sendPasswordReset } from '../../lib/adminApi'
import { ADMIN_EMAIL } from '../../lib/supabase'

export default function AdminPassword(): ReactNode {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const [resetBusy, setResetBusy] = useState(false)
  const [resetState, setResetState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [resetMessage, setResetMessage] = useState('')

  const change = async () => {
    if (!password) {
      setState('error')
      setMessage('Type a new password.')
      return
    }
    if (password !== confirm) {
      setState('error')
      setMessage('The two passwords do not match.')
      return
    }
    setBusy(true)
    setState('idle')
    try {
      await changePassword(password)
      setState('ok')
      setMessage('Password updated. Use the new one next time you sign in.')
      setPassword('')
      setConfirm('')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not update the password.')
    } finally {
      setBusy(false)
    }
  }

  const sendReset = async () => {
    setResetBusy(true)
    setResetState('idle')
    try {
      await sendPasswordReset(ADMIN_EMAIL)
      setResetState('ok')
      setResetMessage(`A reset link is on its way to ${ADMIN_EMAIL}.`)
    } catch (error) {
      setResetState('error')
      setMessage(error instanceof Error ? error.message : 'Could not send the reset email.')
    } finally {
      setResetBusy(false)
    }
  }

  return (
    <AdminLayout
      title="Password"
      subtitle="Change the password you sign in with, or send a password-reset link to your email."
    >
      <Status state={state} message={message} />

      <AdminPanel
        title="Change password"
        description="Pick a new password for the admin account."
        action={
          <Button variant="primary" loading={busy} onClick={() => void change()}>
            Update password
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <TextField
            label="New password"
            type="password"
            name="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setState('idle')
            }}
          />
          <TextField
            label="Confirm new password"
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              setState('idle')
            }}
          />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Forgot your password?"
        description="A password-recovery email is sent to your address. The link signs you in, then you can set a fresh password above."
        action={
          <Button loading={resetBusy} onClick={() => void sendReset()}>
            Send reset link
          </Button>
        }
      >
        <Status state={resetState} message={resetMessage} />
        <p className="text-sm text-muted">
          Reset link goes to <span className="text-accent-ink">{ADMIN_EMAIL}</span>.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Needs Supabase Auth email sending to be on (SMTP configured in the
          Supabase dashboard) — if the button errors, that is the setting to
          check.
        </p>
      </AdminPanel>
    </AdminLayout>
  )
}