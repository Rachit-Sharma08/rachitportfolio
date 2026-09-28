import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import type { Project } from '../../data'
import ProjectDetailCard from './ProjectDetailCard'

interface ProjectDetailTransitionProps {
  project: Project
  originRect: DOMRect
  onClose: () => void
}

const CIRCLE_EASE = 'cubic-bezier(.16,.84,.28,1)'

interface TileData {
  size: number
  startX: number
  startY: number
  scatterX: number
  scatterY: number
  circleX: number
  circleY: number
  rotation: number
  bgPos: string
  solid: boolean
}

function isNeon(title: string) {
  return title.toLowerCase().includes('neon')
}

export default function ProjectDetailTransition({
  project,
  originRect,
  onClose,
}: ProjectDetailTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const closingRef = useRef(false)

  const neon = isNeon(project.title)
  const accent = project.accent ?? (project.comingSoon ? '#7d6a70' : '#d62e4a')
  const comingSoon = Boolean(project.comingSoon)

  const reduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const tiles = useMemo<TileData[]>(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const small = vw < 768
    const count = small ? 9 : 15
    const minDim = Math.min(vw, vh)
    const centerX = vw / 2
    const centerY = vh / 2
    const radius = minDim * 0.24
    const baseSize = minDim / (small ? 8 : 13)
    const originX = originRect.left + originRect.width / 2
    const originY = originRect.top + originRect.height / 2

    return Array.from({ length: count }, (_, i) => {
      const size = baseSize * (0.8 + Math.random() * 0.45)
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      return {
        size,
        startX: originX - size / 2,
        startY: originY - size / 2,
        scatterX: Math.random() * (vw - size),
        scatterY: Math.random() * (vh - size),
        circleX: centerX + Math.cos(angle) * radius - size / 2,
        circleY: centerY + Math.sin(angle) * radius - size / 2,
        rotation: (Math.random() - 0.5) * 210,
        bgPos: `${Math.floor(Math.random() * 70)}% ${Math.floor(Math.random() * 80)}%`,
        solid: neon && i % 4 === 1,
      }
    })
  }, [originRect, neon])

  const close = () => {
    if (closingRef.current) return
    closingRef.current = true
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose,
    })
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = tileRefs.current.filter(Boolean) as HTMLDivElement[]

      if (reduceMotion) {
        gsap.set(els, { opacity: 0 })
        if (comingSoon) {
          if (rootRef.current) gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.3, onComplete: onClose })
        } else if (cardRef.current) {
          gsap.set(cardRef.current, { autoAlpha: 1, scale: 1 })
        }
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      gsap.set(els, (i: number) => ({
        x: tiles[i].startX,
        y: tiles[i].startY,
        scale: 0.55,
        rotation: 0,
        opacity: 0,
      }))

      els.forEach((el, i) => {
        const t = tiles[i]
        tl.set(el, { opacity: 1 }, i * 0.025)
        tl.to(
          el,
          {
            x: t.scatterX,
            y: t.scatterY,
            rotation: t.rotation,
            scale: 1,
            duration: 0.5,
          },
          i * 0.025,
        )
      })

      els.forEach((el, i) => {
        const t = tiles[i]
        tl.to(
          el,
          {
            x: t.circleX,
            y: t.circleY,
            rotation: 0,
            duration: 0.65,
            ease: CIRCLE_EASE,
          },
          0.6 + i * 0.04,
        )
      })

      if (comingSoon) {
        tl.to(
          els,
          {
            x: () => `+=14`,
            y: () => `+=10`,
            duration: 0.07,
            repeat: 4,
            yoyo: true,
            ease: 'sine.inOut',
          },
          1.9,
        )
        tl.to(
          els,
          {
            scale: 0.3,
            opacity: 0,
            duration: 0.35,
            stagger: 0.02,
            ease: 'power2.in',
          },
          2.7,
        )
        tl.to(
          rootRef.current,
          { autoAlpha: 0, duration: 0.25, ease: 'power2.in', onComplete: onClose },
          3.1,
        )
        return
      }

      tl.to(
        els,
        { scale: 0.3, opacity: 0, duration: 0.35, stagger: 0.02, ease: 'power2.in' },
        2.1,
      )
      tl.fromTo(
        cardRef.current,
        { autoAlpha: 0, scale: 0.92, y: 16 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: CIRCLE_EASE },
        2.2,
      )
    }, rootRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-[1000]"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} details`}
    >
      <div className="pointer-events-none absolute inset-0 bg-bg/90 backdrop-blur-sm" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {tiles.map((tile, i) => (
          <div
            key={i}
            ref={(el) => {
              tileRefs.current[i] = el
            }}
            className="absolute left-0 top-0 rounded-[4px] will-change-transform"
            style={{
              width: tile.size,
              height: tile.size,
              opacity: 0,
              backgroundImage: tile.solid
                ? `radial-gradient(circle at 40% 35%, ${accent} 0%, rgba(214, 46, 74, 0.3) 45%, transparent 75%)`
                : project.image && !comingSoon
                  ? `url(${project.image})`
                  : `linear-gradient(135deg, ${accent}33 0%, ${accent}11 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: tile.bgPos,
              backgroundColor: comingSoon
                ? '#1a0c11'
                : project.image
                  ? 'transparent'
                  : `${accent}1a`,
              border: tile.solid
                ? `1px solid ${accent}88`
                : '1px solid rgba(255,255,255,0.12)',
              boxShadow: tile.solid
                ? `0 0 28px ${accent}66`
                : '0 18px 44px rgba(0,0,0,0.45)',
              filter: comingSoon ? 'grayscale(0.6)' : undefined,
            }}
          />
        ))}
      </div>

      {!comingSoon && (
        <ProjectDetailCard
          project={project}
          accent={accent}
          onClose={close}
          cardRef={cardRef}
        />
      )}
    </div>,
    document.body,
  )
}