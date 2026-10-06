const API_BASE = import.meta.env.VITE_API_URL || ''
const INTERVAL = 8 * 60 * 1000

// Start warming the backend well before the form is actually on screen. The
// point of the ping is to absorb the free-tier cold start, so it has to begin
// early — but doing it on page load put a cross-origin request on the critical
// path of every visit, including the many that never reach the form at all.
const APPROACH_MARGIN = '800px 0px'

// The two sections that hold, or lead into, the contact form. `#enquiry` is the
// form itself; `#contact` sits after it and is only present on some routes.
const FORM_SECTIONS = ['#enquiry', '#contact']

async function ping() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' })
    if (!res.ok) throw new Error(String(res.status))
    console.debug('[keepalive] backend healthy')
  } catch {
    console.debug('[keepalive] backend cold/offline (wakes on demand)')
  }
}

// Called by the form itself the instant someone submits, so a visitor who never
// scrolled the contact section into view still nudges the backend awake. The
// form's own retry loop remains the real safety net; this just makes the first
// attempt more likely to land on a warm instance.
export function wakeBackend() {
  ping()
}

export function startKeepAlive() {
  if (typeof window === 'undefined') return

  let handle: number | undefined
  let observer: IntersectionObserver | null = null
  let started = false

  const begin = () => {
    if (started) return
    started = true
    observer?.disconnect()
    ping()
    handle = window.setInterval(ping, INTERVAL)
  }

  // Degrade to the old load-time ping rather than throwing. An exception here
  // would abort the caller's effect before it returns a cleanup, which would
  // leak the smooth-scroll instance on every route change.
  if (typeof IntersectionObserver === 'undefined') {
    begin()
    return () => {
      if (handle !== undefined) window.clearInterval(handle)
    }
  }

  const targets = FORM_SECTIONS.map((sel) => document.querySelector(sel)).filter(
    (el): el is Element => el !== null,
  )

  // Nothing to warm up on routes without a form (e.g. /resume). Staying quiet
  // is the whole point of deferring the ping, so don't manufacture one.
  if (targets.length === 0) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) begin()
    },
    { rootMargin: APPROACH_MARGIN },
  )
  for (const el of targets) observer.observe(el)

  return () => {
    observer?.disconnect()
    if (handle !== undefined) window.clearInterval(handle)
  }
}