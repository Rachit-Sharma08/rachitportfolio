import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { PANEL_COUNT, type WorkProject } from './projectsData'

interface WorksOverlayProps {
  progressRef: MutableRefObject<number>
  projects: WorkProject[]
}

export default function WorksOverlay({ progressRef, projects }: WorksOverlayProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const slugRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = Math.max(0, Math.min(1, progressRef.current))
      const idx = Math.min(PANEL_COUNT - 1, Math.floor(p * PANEL_COUNT))
      if (numRef.current) {
        numRef.current.textContent = String(idx + 1).padStart(2, '0')
      }
      if (slugRef.current) {
        slugRef.current.textContent = projects[idx]?.slug ?? ''
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef, projects])

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-white">
      <div className="absolute bottom-6 left-6 flex items-center gap-4 sm:left-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            Scroll to fly through
          </span>
          <span
            ref={slugRef}
            className="font-display text-base italic text-accent-ink"
          >
            {projects[0]?.slug ?? 'selected work'}
          </span>
          <div className="mt-1 h-px w-40 bg-white/15 sm:w-56">
            <div
              ref={barRef}
              className="h-px w-full origin-left accent-gradient"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex items-baseline gap-1 sm:right-10">
        <span
          ref={numRef}
          className="text-2xl font-extrabold tabular-nums text-white"
        >
          01
        </span>
        <span className="text-sm text-white/40">/ {String(PANEL_COUNT).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
