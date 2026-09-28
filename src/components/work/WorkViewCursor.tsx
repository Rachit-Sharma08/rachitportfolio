import { useEffect, useRef } from 'react'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const LERP = 0.16

/**
 * Desktop-only "View" pill that trails the cursor with lerp smoothing while it
 * is over a project card, and fades out everywhere else. Coarse pointers
 * (touch) never mount it, so mobile pays nothing for it.
 */
export default function WorkViewCursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia(FINE_POINTER).matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pos = { x: 0, y: 0, tx: 0, ty: 0, on: false, alpha: 0, raf: 0 }
    let seeded = false

    const tick = () => {
      pos.x += (pos.tx - pos.x) * LERP
      pos.y += (pos.ty - pos.y) * LERP
      pos.alpha += ((pos.on ? 1 : 0) - pos.alpha) * LERP

      el.style.opacity = pos.alpha.toFixed(3)
      el.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0) translate(-50%, -50%)`

      // Idle out completely so we are not burning a rAF loop all page-long.
      if (pos.on || pos.alpha > 0.01) {
        pos.raf = requestAnimationFrame(tick)
      } else {
        pos.raf = 0
      }
    }

    const wake = () => {
      if (!pos.raf) pos.raf = requestAnimationFrame(tick)
    }

    // One delegated listener does both jobs: the hit test via `closest` is
    // evaluated on every move, so crossing card children can never flicker.
    const onMove = (event: PointerEvent) => {
      pos.tx = event.clientX
      pos.ty = event.clientY
      if (!seeded) {
        pos.x = pos.tx
        pos.y = pos.ty
        seeded = true
      }
      const target = event.target as Element | null
      pos.on = !!target?.closest?.('[data-work-card]')
      wake()
    }

    const onLeaveWindow = () => {
      pos.on = false
      wake()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeaveWindow)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeaveWindow)
      if (pos.raf) cancelAnimationFrame(pos.raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-text text-[11px] font-medium uppercase tracking-[0.18em] text-bg opacity-0 shadow-[0_10px_40px_-12px_rgba(214,46,74,0.6)] will-change-transform,opacity"
    >
      View
    </div>
  )
}
