import { useEffect, useRef } from 'react'

/**
 * A 2px crimson line pinned to the very top of the viewport that fills as the
 * page is read.
 *
 * Written straight to `style.transform` from a rAF loop and never through
 * React state — a scroll listener that re-renders on every frame is the most
 * reliable way to make an otherwise cheap site stutter.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0

    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
      el.style.transform = `scaleX(${progress})`
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
    >
      <div
        ref={ref}
        className="h-full w-full origin-left"
        style={{
          transform: 'scaleX(0)',
          background:
            'linear-gradient(90deg, rgba(214,46,74,0.15) 0%, #d62e4a 45%, #e85a70 100%)',
          boxShadow: '0 0 10px rgba(214, 46, 74, 0.5)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
