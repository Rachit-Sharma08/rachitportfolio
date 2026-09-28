import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const tween = gsap.to(el, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
    })

    return () => {
      tween.kill()
    }
  }, [])

  const text = Array.from({ length: 10 }, (_, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-6">
      OPEN TO WORK <span className="text-muted/60">•</span>
    </span>
  ))

  return (
    <div className="relative z-10 overflow-hidden border-y border-stroke py-6 select-none">
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap will-change-transform"
        aria-hidden="true"
      >
        <span className="inline-flex items-center font-display text-5xl italic tracking-tight text-text-primary/10 md:text-7xl">
          {text}
        </span>
        <span className="inline-flex items-center font-display text-5xl italic tracking-tight text-text-primary/10 md:text-7xl">
          {text}
        </span>
      </div>
    </div>
  )
}