import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { GSAP_POWER3_OUT } from '../lib/motion'

interface MagneticProps {
  children: ReactNode
  className?: string
  /** How much of the cursor's distance is used, before the MAX_MOVE clamp. */
  strength?: number
}

/** Hard ceiling on the travel, in px. A pill that drifts 40px reads as broken. */
const MAX_MOVE = 8

const DURATION = 0.45

const DESKTOP = '(hover: hover) and (pointer: fine)'
const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/**
 * Magnetic hover for the primary pills.
 *
 * The previous version used `elastic.out`, which overshoots and wobbles back —
 * the opposite of the restrained motion the rest of the site now uses. This one
 * runs on `power3.out` with the travel clamped, so the pill leans toward the
 * cursor and settles immediately once it arrives.
 *
 * Desktop pointers only: on touch the element would sit permanently offset
 * after a tap, and there is no hover to attract the pointer in the first place.
 */
export default function Magnetic({
  children,
  className,
  strength = 0.35,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia(DESKTOP).matches) return
    if (!window.matchMedia(MOTION_OK).matches) return

    const xTo = gsap.quickTo(el, 'x', {
      duration: DURATION,
      ease: GSAP_POWER3_OUT,
    })
    const yTo = gsap.quickTo(el, 'y', {
      duration: DURATION,
      ease: GSAP_POWER3_OUT,
    })

    const clamp = (value: number) =>
      Math.max(-MAX_MOVE, Math.min(MAX_MOVE, value * strength))

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      xTo(clamp(event.clientX - (rect.left + rect.width / 2)))
      yTo(clamp(event.clientY - (rect.top + rect.height / 2)))
    }

    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(el)
    }
  }, [strength])

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className ?? ''}`}>
      {children}
    </div>
  )
}
