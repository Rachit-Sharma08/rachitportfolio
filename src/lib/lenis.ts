import type Lenis from 'lenis'

let current: Lenis | null = null

/**
 * When a route arrives with `state.scrollTo`, Landing defers the actual scroll
 * until the route transition + web fonts settle (the delay is deliberate).
 * But if the user manually clicks a nav link while that deferred scroll is
 * still queued, the queued one would later fire and yank the page back to the
 * old target. Any intentional scroll therefore cancels the queued one first.
 */
let cancelQueued: (() => void) | null = null

export function setLenis(lenis: Lenis | null) {
  current = lenis
}

export function getLenis() {
  return current
}

export function queueScroll(cancel: () => void) {
  cancelQueued = cancel
  return () => {
    const c = cancelQueued
    cancelQueued = null
    c?.()
  }
}

function cancelQueuedScroll() {
  const c = cancelQueued
  cancelQueued = null
  c?.()
}

/**
 * Lenis already respects `scroll-margin-top` on the target element when it
 * resolves an element (dest = element.top - scrollMarginTop), and
 * `scrollIntoView` does the same. If we *also* passed a negative JS offset we
 * would double-count the navbar gap — measured in QA: the section landed a
 * full ~186px below the top instead of ~96px. So there is exactly ONE knob:
 * the `section[id] { scroll-margin-top: 96px }` rule in index.css. Every path
 * (Lenis, native scrollIntoView fallback, browser hash jumps, keyboard focus)
 * lands on the same number.
 */
export function scrollToSection(targetId: string) {
  const el = document.getElementById(targetId)
  if (!el) return
  cancelQueuedScroll()
  if (reducedMotion()) {
    el.scrollIntoView({ behavior: 'auto', block: 'start' })
  } else if (current) {
    current.scrollTo(el, { offset: 0, duration: 1.2 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function scrollToTop() {
  cancelQueuedScroll()
  if (reducedMotion()) {
    window.scrollTo({ top: 0, behavior: 'auto' })
  } else if (current) {
    current.scrollTo(0, { duration: 1.1 })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Any in-page `href="#id"` link goes through Lenis rather than the browser's
 * own jump, so hash links and the navbar buttons share one motion curve
 * instead of the browser cutting one of them short. Capture-phase, because it
 * has to win before React Router or the default action.
 */
export function initAnchorLinks() {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const anchor = (event.target as HTMLElement | null)?.closest?.('a')
    const href = anchor?.getAttribute('href')
    if (!href || href === '#' || !href.startsWith('#')) return

    const id = href.slice(1)
    if (!document.getElementById(id)) return

    event.preventDefault()
    scrollToSection(id)
  }

  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}
