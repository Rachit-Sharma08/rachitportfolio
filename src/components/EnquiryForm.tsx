import { useState } from 'react'
import RevealHeading from './RevealHeading'
import { Reveal } from './Reveal'
import Magnetic from './Magnetic'

const API_URL = '/api/send-email'

const REASONS = ['Hire me', 'Collaborate', 'Just say hi', 'Other'] as const
type Reason = (typeof REASONS)[number]

interface FormData {
  name: string
  email: string
  reason: Reason
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = 'Name is required'
  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email'
  }
  if (!data.message.trim()) errors.message = 'Message is required'
  return errors
}

export default function EnquiryForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    reason: 'Hire me',
    message: '',
  })
  // Bots fill every field they can see, including this one. A human never does.
  // The name carries no "company" label so browser autofill leaves it alone.
  const [hp, setHp] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: val }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFailed(false)

    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    try {
      // One attempt: the endpoint is a Vercel function, not a sleeping Render
      // instance, so there is no cold start to retry around. A failure is shown
      // and the visitor can press Send again.
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hp }),
      })
      if (!res.ok) throw new Error('send failed')
      setSent(true)
      setSending(false)
      setTimeout(() => {
        setSent(false)
        setForm({ name: '', email: '', reason: 'Hire me', message: '' })
      }, 3000)
    } catch {
      setFailed(true)
      setSending(false)
    }
  }

  return (
    <section id="enquiry" className="section section-glow-right bg-bg" aria-labelledby="enquiry-heading">
      <div className="shell">
        <div className="shell-inner">
        <div className="max-w-lg">
          <RevealHeading
            as="h2"
            id="enquiry-heading"
            segments={[{ text: 'Get in ' }, { text: 'touch', italic: true }]}
            className="mb-4 text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-5xl md:text-6xl"
            delay={0.1}
          />
          <Reveal>
            <p className="mb-12 text-base text-muted">
              Have a project, a collab idea, or just want to say hi? Fill this in and
              I'll get back to you.
            </p>
          </Reveal>

          <Reveal>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Honeypot: off-screen, out of the tab order and hidden from screen
                readers, so only an automated form filler ever puts anything in
                it. The server silently accepts and drops those submissions. */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
            >
              <input
                id="enquiry-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="enquiry-name" className="sr-only">
                Name
              </label>
              <input
                id="enquiry-name"
                type="text"
                placeholder="Name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="field w-full px-5 py-3 text-sm"
              />
              {errors.name && (
                <p className="mt-1.5 px-4 text-xs text-danger" role="alert">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="enquiry-email" className="sr-only">
                Email
              </label>
              <input
                id="enquiry-email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="field w-full px-5 py-3 text-sm"
              />
              {errors.email && (
                <p className="mt-1.5 px-4 text-xs text-danger" role="alert">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="enquiry-reason" className="sr-only">
                Reason for reaching out
              </label>
              <select
                id="enquiry-reason"
                value={form.reason}
                onChange={(e) => set('reason', e.target.value as Reason)}
                className="field w-full appearance-none px-5 py-3 text-sm"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="enquiry-message" className="sr-only">
                Your message
              </label>
              <textarea
                id="enquiry-message"
                placeholder="Your message"
                rows={4}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                className="field w-full resize-none px-5 py-3 text-sm"
              />
              {errors.message && (
                <p className="mt-1.5 px-4 text-xs text-danger" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <Magnetic strength={0.4} className="self-start">
              <button
                type="submit"
                disabled={sending || sent}
                className="pill pill-primary border-gradient-ring cursor-pointer px-8 py-3 text-sm disabled:cursor-default disabled:opacity-70"
              >
                {sent ? 'Message sent ✓' : sending ? 'Sending...' : 'Send'}
              </button>
            </Magnetic>

            {failed && (
              <p className="mt-2 text-xs text-danger">
                Something went wrong. Try again or email me directly.
              </p>
            )}
          </form>
          </Reveal>
        </div>
        </div>
      </div>
    </section>
  )
}
