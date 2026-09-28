import { useRef } from 'react'
import gsap from 'gsap'
import type { MutableRefObject } from 'react'
import type { Project } from '../../data'

interface ProjectDetailCardProps {
  project: Project
  accent: string
  onClose: () => void
  cardRef: MutableRefObject<HTMLDivElement | null>
}

export default function ProjectDetailCard({
  project,
  accent,
  onClose,
  cardRef,
}: ProjectDetailCardProps) {
  const shakeRef = useRef<HTMLButtonElement>(null)

  const shake = () => {
    if (!shakeRef.current) return
    gsap.fromTo(
      shakeRef.current,
      { x: 0 },
      { x: -10, duration: 0.08, repeat: 5, yoyo: true, ease: 'power1.inOut' },
    )
  }

  return (
    <div
      ref={cardRef}
      className="pointer-events-auto absolute inset-0 flex items-center justify-center p-6 opacity-0"
    >
      <div className="glass relative z-10 w-full max-w-md p-8 text-center shadow-[0_40px_90px_-30px_rgba(214,46,74,0.45)] md:p-10">
        <p
          className="mb-3 text-[11px] uppercase tracking-[0.25em]"
          style={{ color: accent }}
        >
          {project.comingSoon ? 'Coming soon' : project.tag}
        </p>
        <h3 className="text-4xl font-extrabold leading-none tracking-[-0.03em] text-text-primary md:text-5xl">
          {project.title}
        </h3>
        <p className="mt-4 text-sm text-muted">{project.tagline}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {project.comingSoon ? (
            <button
              ref={shakeRef}
              type="button"
              onClick={shake}
              className="pill cursor-pointer px-6 py-3 text-sm transition-transform duration-200 hover:scale-105"
            >
              Keep me posted <span className="inline-block">→</span>
            </button>
          ) : project.href ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-primary cursor-pointer px-6 py-3 text-sm transition-transform duration-300 hover:scale-105"
            >
              View Details <span className="inline-block">↗</span>
            </a>
          ) : (
            <span className="pill px-6 py-3 text-sm text-muted">
              Details coming soon
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pill cursor-pointer px-5 py-3 text-sm text-muted hover:text-text-primary"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}