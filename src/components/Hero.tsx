import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Magnetic from './Magnetic'
import { HERO_IMAGES, HERO_INTRO } from '../data'
import { scrollToSection } from '../lib/lenis'

const REVEAL_RADIUS = 140
const LERP = 0.14
const SWEEP_RESUME_MS = 2600

interface HeroProps {
  ready?: boolean
}

export default function Hero({ ready = true }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!ready) {
        gsap.set('.hero-rise', { opacity: 0, y: 40 })
        gsap.set('.hero-photo', { opacity: 0, y: 70, scale: 0.98 })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        '.hero-photo',
        { opacity: 0, y: 70, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4 },
        0,
      ).fromTo(
        '.hero-rise',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 },
        0.3,
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [ready])

  useEffect(() => {
    const section = sectionRef.current
    const figure = figureRef.current
    if (!section || !figure) return

    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    let isTouch = coarse.matches
    let inside = false
    let lastTouch = 0
    const started = performance.now()

    let seeded = false
    let raf = 0
    const cur = { x: 0, y: 0, r: 0 }
    const goal = { x: 0, y: 0, r: 0 }

    const paint = () => {
      figure.style.setProperty('--x', `${cur.x.toFixed(2)}px`)
      figure.style.setProperty('--y', `${cur.y.toFixed(2)}px`)
      figure.style.setProperty('--r', `${cur.r.toFixed(2)}px`)
    }

    const seed = (x: number, y: number) => {
      goal.x = x
      goal.y = y
      goal.r = REVEAL_RADIUS
      if (seeded) return
      cur.x = x
      cur.y = y
      seeded = true
    }

    const frame = (now: number) => {
      if (isTouch && !reduce.matches && now - lastTouch > SWEEP_RESUME_MS) {
        const box = figure.getBoundingClientRect()
        const t = (now - started) / 1000
        seed(
          box.width * 0.5 + Math.cos(t * 0.32) * box.width * 0.24,
          box.height * 0.44 + Math.sin(t * 0.5) * box.height * 0.2,
        )
      }

      cur.x += (goal.x - cur.x) * LERP
      cur.y += (goal.y - cur.y) * LERP
      cur.r += (goal.r - cur.r) * LERP
      paint()

      const busy =
        isTouch ||
        inside ||
        cur.r > 0.05 ||
        Math.abs(goal.x - cur.x) > 0.1 ||
        Math.abs(goal.y - cur.y) > 0.1

      raf = busy ? window.requestAnimationFrame(frame) : 0
    }

    const kick = () => {
      if (!raf) raf = window.requestAnimationFrame(frame)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') lastTouch = performance.now()
      inside = true
      const box = figure.getBoundingClientRect()
      seed(event.clientX - box.left, event.clientY - box.top)
      kick()
    }

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') lastTouch = performance.now()
      inside = true
      goal.r = REVEAL_RADIUS
      kick()
    }

    const onPointerLeave = () => {
      inside = false
      goal.r = 0
      kick()
    }

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      lastTouch = performance.now()
      inside = true
      const box = figure.getBoundingClientRect()
      seed(touch.clientX - box.left, touch.clientY - box.top)
      kick()
    }

    const onCoarseChange = (event: MediaQueryListEvent) => {
      isTouch = event.matches
      kick()
    }

    section.addEventListener('pointerenter', onPointerEnter)
    section.addEventListener('pointermove', onPointerMove)
    section.addEventListener('pointerleave', onPointerLeave)
    section.addEventListener('touchstart', onTouchMove, { passive: true })
    section.addEventListener('touchmove', onTouchMove, { passive: true })
    coarse.addEventListener('change', onCoarseChange)

    if (isTouch) kick()

    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      section.removeEventListener('pointerenter', onPointerEnter)
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', onPointerLeave)
      section.removeEventListener('touchstart', onTouchMove)
      section.removeEventListener('touchmove', onTouchMove)
      coarse.removeEventListener('change', onCoarseChange)
    }
  }, [])

  const scrollToWork = () => scrollToSection('work')
  const scrollToContact = () => scrollToSection('contact')

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative isolate flex min-h-screen w-full flex-col overflow-hidden"
    >
      <div className="hero-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="hero-bloom pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="hero-vignette pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div
        ref={figureRef}
        className="hero-figure pointer-events-none absolute bottom-0 left-1/2 aspect-[3/4] h-[46vh] -translate-x-1/2 sm:h-[54vh] lg:left-[55%] lg:h-[74vh] xl:left-[56%] xl:h-[80vh]"
      >
        <div className="hero-photo absolute inset-0">
          <img
            src={HERO_IMAGES.base}
            alt="Rachit Sharma, Digital Marketer"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-bottom"
          />
          <img
            src={HERO_IMAGES.reveal}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="hero-mask pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-bottom"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-start px-6 pt-[14vh] sm:px-8 lg:justify-center lg:pt-0 xl:px-16">
        <div className="max-w-[34rem] lg:max-w-[36%]">
          <p className="hero-rise font-display text-lg italic text-muted sm:text-xl">
            I&apos;m
          </p>

          <h1 className="hero-rise mt-1 font-body text-[clamp(3rem,min(9vw,15vh),8.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.03em] text-text-primary">
            Rachit
          </h1>

          <p className="hero-rise mt-3 font-display text-2xl italic text-text-primary/90 sm:text-3xl xl:text-4xl">
            Digital Marketer
          </p>

          <div className="hero-rise mt-8 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.35}>
              <button
                type="button"
                onClick={scrollToWork}
                className="border-gradient-ring rounded-full bg-text-primary px-7 py-3.5 text-sm font-medium text-bg transition-all duration-500 hover:scale-105 hover:bg-bg hover:text-text-primary"
              >
                See Work
              </button>
            </Magnetic>

            <button
              type="button"
              onClick={scrollToContact}
              className="border-gradient-ring rounded-full border border-stroke bg-bg/40 px-7 py-3.5 text-sm text-text-primary backdrop-blur-sm transition-all duration-500 hover:scale-105"
            >
              Reach out...
            </button>
          </div>
        </div>

        <p className="hero-rise mt-9 max-w-md text-sm leading-relaxed text-muted lg:absolute lg:bottom-12 lg:right-6 lg:mt-0 lg:max-w-[280px] lg:text-right lg:text-[13px] xl:right-16">
          {HERO_INTRO}
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-6 z-10 hidden flex-col items-center gap-3 lg:flex xl:left-16">
        <span className="text-[10px] uppercase tracking-[0.35em] text-muted">Scroll</span>
        <div className="overflow-hidden pt-0">
          <div className="animate-scroll-down h-10 w-px bg-stroke" />
        </div>
      </div>
    </section>
  )
}
