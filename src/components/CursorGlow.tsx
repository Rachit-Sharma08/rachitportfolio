import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const visible = useRef(false)
  const inSection = useRef(false)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    let rafId: number | null = null

    const render = () => {
      rafId = null
      const isActive = inSection.current && visible.current
      glow.style.opacity = isActive ? '1' : '0'
      glow.style.setProperty('--glow-x', `${target.current.x}px`)
      glow.style.setProperty('--glow-y', `${target.current.y}px`)
    }

    const onPointerMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY }

      const el = e.target as Element | null
      const inside = Boolean(el?.closest?.('.glow-section'))
      if (inside !== inSection.current) {
        inSection.current = inside
        visible.current = true
      }

      if (rafId === null) {
        rafId = window.requestAnimationFrame(render)
      }
    }

    const onPointerLeave = (e: PointerEvent) => {
      if ((e.relatedTarget as Element | null)?.closest?.('.glow-section')) return
      visible.current = false
      if (rafId === null) {
        rafId = window.requestAnimationFrame(render)
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}