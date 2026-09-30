const API_BASE = import.meta.env.VITE_API_URL || ''
const INTERVAL = 8 * 60 * 1000

async function ping() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' })
    if (!res.ok) throw new Error(String(res.status))
    console.debug('[keepalive] backend healthy')
  } catch {
    console.debug('[keepalive] backend cold/offline (wakes on demand)')
  }
}

export function startKeepAlive() {
  if (typeof window === 'undefined') return

  let handle: number | undefined
  const begin = () => {
    ping()
    handle = window.setInterval(ping, INTERVAL)
  }

  // The first ping is fire-and-forget but still opens a connection to the API
  // origin; delaying it until the browser is idle keeps it from racing the
  // hero's first paint. The interval itself still keeps the instance warm.
  const idle = window.requestIdleCallback?.(
    () => begin(),
    { timeout: 4000 },
  )
  if (idle === undefined) handle = window.setTimeout(begin, 4000)

  return () => {
    if (idle !== undefined) window.cancelIdleCallback(idle)
    if (handle !== undefined) window.clearInterval(handle)
  }
}