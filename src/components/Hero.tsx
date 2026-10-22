import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Magnetic from './Magnetic'
import { HERO_IMAGES, HERO_INTRO, HERO_SIZES, HERO_SRCSET } from '../data'
import { useSiteContent } from '../lib/content'
import { scrollToSection } from '../lib/lenis'

const REVEAL_RADIUS = 140
const LERP = 0.14
const SWEEP_RESUME_MS = 2600

/**
 * `settings` is pre-seeded with these same paths (content.tsx FALLBACK), so a
 * truthy `heroBaseUrl` alone does not mean the CMS was overridden — testing
 * truthiness would silently disable responsive loading on every normal visit.
 * The -480/-720 derivatives only exist for the two cut-outs shipped in
 * public/assets; a CMS-supplied storage URL is a lone file with no siblings, so
 * srcset is offered only for ours rather than 404ing on made-up variants.
 */
const hasBundledVariants = (src: string) =>
  src === HERO_IMAGES.base || src === HERO_IMAGES.reveal

interface HeroProps {
  ready?: boolean
}

export default function Hero({ ready = true }: HeroProps) {
  const { settings } = useSiteContent()
  const sectionRef = useRef<HTMLElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)

  // Resolve the empty-string case here so the variants test sees the path that
  // will actually be fetched, not the "not set" marker.
  const baseSrc = settings.heroBaseUrl || HERO_IMAGES.base
  const revealSrc = settings.heroRevealUrl || HERO_IMAGES.reveal

  /**
   * Entrance timeline, gated on `no-preference` so the OS-level "reduce motion"
   * setting leaves the hero fully painted instead of hiding content behind a
   * tween it will never play — same reason the projects section gates its
   * ScrollTrigger work the same way (see useWorkStackAnim).
   *
   * The branch is the timeline verbatim, so a default visitor's animation is
   * unchanged. `gsap.matchMedia()` inherits the enclosing scoped context's
   * selector, so the `'.hero-rise'` / `'.hero-photo'` lookups below still
   * resolve inside `sectionRef`.
   */
  useEffect(() => {
    const mm = gsap.matchMedia()

    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
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
      })
    }, sectionRef)

    return () => {
      mm.revert()
      ctx.revert()
    }
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
      aria-labelledby="home-heading"
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
            src={baseSrc}
            alt="Rachit Sharma, AI-powered digital marketer in Kaithal, Haryana"
            width={1086}
            height={1448}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-bottom"
            {...(hasBundledVariants(baseSrc)
              ? { srcSet: HERO_SRCSET.base, sizes: HERO_SIZES }
              : {})}
          />
          <img
            src={revealSrc}
            alt="Rachit Sharma, portrait with reveal effect"
            aria-hidden="true"
            width={1086}
            height={1448}
            draggable={false}
            className="hero-mask pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-bottom"
            {...(hasBundledVariants(revealSrc)
              ? { srcSet: HERO_SRCSET.reveal, sizes: HERO_SIZES }
              : {})}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-start px-6 pt-[14vh] sm:px-8 lg:justify-center lg:pt-0 xl:px-16">
        <div className="max-w-[34rem] lg:max-w-[36%]">
          {/* One h1 for the whole hero statement. The three lines stay separate
              mask/rise targets so the GSAP stagger and typography are unchanged.
              Keeping a single h1 gives crawlers and screen readers the full
              "I'm Rachit — Digital Marketer" headline instead of just the name.

              The spans are block-level, so JSX drops the whitespace between them
              and the h1's text content came out as the run-on
              "I'mRachitDigital Marketer". The explicit {' '} text nodes below put
              the word breaks back. They are collapsible plain spaces between
              block-level boxes in a block container, so no anonymous line box is
              generated and the layout is untouched.

              Keep the aria-label too: it is what guarantees the accessible name
              regardless of how the spans are reordered or split, since the
              spaces above only help when they survive in the markup. Keep it in
              sync with the spans. */}
          <h1 id="home-heading" aria-label="I'm Rachit Digital Marketer">
            <span className="hero-rise block font-display text-lg italic text-muted sm:text-xl">
              I&apos;m
            </span>
            {' '}
            <span className="hero-rise mt-1 block font-body text-[clamp(3rem,min(9vw,15vh),8.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.03em] text-text-primary">
              Rachit
            </span>
            {' '}
            <span className="hero-rise mt-3 block font-display text-2xl italic text-text-primary/90 sm:text-3xl xl:text-4xl">
              Digital Marketer
            </span>
          </h1>

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
        <span className="text-xs uppercase tracking-[0.35em] text-muted">Scroll</span>
        <div className="overflow-hidden pt-0">
          <div className="animate-scroll-down h-10 w-px bg-stroke" />
        </div>
      </div>
    </section>
  )
}
