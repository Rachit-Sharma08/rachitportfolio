import { useEffect, useId, useState } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/**
 * Admin form primitives. Same surface language as the public site — glass
 * panels, `.field` inputs, `.pill` buttons — so moving between the two never
 * feels like a different product.
 */

export function AdminPanel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="glass p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-text-primary">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-prose text-sm text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-muted">
        {label}
        {hint ? <span className="ml-2 normal-case tracking-normal">{hint}</span> : null}
      </span>
      {children(id)}
    </label>
  )
}

type Labelled = { label: string; hint?: string }

export function TextField({
  label,
  hint,
  className = '',
  ...props
}: Labelled & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} hint={hint}>
      {(id) => (
        <input
          id={id}
          {...props}
          className={`field w-full px-5 py-3 text-sm ${className}`}
        />
      )}
    </FieldShell>
  )
}

export function TextArea({
  label,
  hint,
  className = '',
  ...props
}: Labelled & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} hint={hint}>
      {(id) => (
        <textarea
          id={id}
          {...props}
          className={`field w-full resize-y px-5 py-3 text-sm leading-relaxed ${className}`}
        />
      )}
    </FieldShell>
  )
}

export function SelectField({
  label,
  hint,
  children,
  ...props
}: Labelled & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} hint={hint}>
      {(id) => (
        <select id={id} {...props} className="field w-full px-5 py-3 text-sm">
          {children}
        </select>
      )}
    </FieldShell>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
  loading?: boolean
}

export function Button({
  variant = 'ghost',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const skin =
    variant === 'primary'
      ? 'pill-primary'
      : variant === 'danger'
        ? 'border-danger/40 text-danger hover:bg-danger/10'
        : ''
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      className={`pill px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${skin} ${className}`}
    >
      {loading ? 'Saving…' : children}
    </button>
  )
}

/**
 * Success/error line. `role="alert"` for bad news so a screen reader announces it
 * without the user having to go looking.
 */
export function Status({
  state,
  message,
}: {
  state: 'idle' | 'ok' | 'error'
  message: string
}) {
  if (state === 'idle' || !message) return null
  return (
    <p
      role={state === 'error' ? 'alert' : 'status'}
      className={`text-sm ${state === 'error' ? 'text-danger' : 'text-accent-ink'}`}
    >
      {message}
    </p>
  )
}

/**
 * Two-step delete. The second click confirms, and the armed state resets on its
 * own after a few seconds so a stray tap can never destroy anything.
 */
const REARM_MS = 4000

export function ConfirmButton({
  onConfirm,
  label = 'Delete',
  confirmLabel = 'Tap again',
  className = '',
}: {
  onConfirm: () => void
  label?: string
  confirmLabel?: string
  className?: string
}) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), REARM_MS)
    return () => window.clearTimeout(timer)
  }, [armed])

  if (armed) {
    return (
      <button
        type="button"
        onClick={() => {
          setArmed(false)
          onConfirm()
        }}
        className="pill border-danger/50 bg-danger/10 px-4 py-2 text-sm text-danger"
      >
        {confirmLabel}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      className={`pill px-4 py-2 text-sm ${className || 'border-danger/40 text-danger hover:bg-danger/10'}`}
    >
      {label}
    </button>
  )
}

/** Small pill toggle used for the Published switch. */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm"
    >
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 flex-shrink-0 rounded-full border transition-colors duration-300 ${
          checked ? 'border-accent bg-accent/30' : 'border-stroke bg-glass'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-300 ${
            checked ? 'left-[22px] bg-accent-ink' : 'left-0.5 bg-muted'
          }`}
        />
      </span>
      <span className={checked ? 'text-text-primary' : 'text-muted'}>{label}</span>
    </button>
  )
}
