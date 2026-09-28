import { useEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'

/**
 * Owns every scroll-driven animation in the projects section.
 *
 * The pinning itself is pure CSS (`position: sticky`), so ScrollTrigger is only
 * asked to do the two things CSS cannot express:
 *   1. scrub the covered card (scale / dim / blur) as the next one slides over
 *   2. play the one-shot entrance reveal when a card first appears
 *
 * ScrollTrigger is ~46 kB and is dynamically imported rather than statically
 * bundled, so it stays off the critical path and never runs during pre-render.
 *
 * Everything is created inside a `gsap.matchMedia()` so that flipping the OS
 * "reduce motion" setting tears the animations down and puts the plain cards
 * back, and so `revert()` on unmount kills every ScrollTrigger instance.
 */
export function useWorkStackAnim(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let dispose: (() => void) | undefined

    void (async () => {
      const { default: ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      const cards = Array.from(
        root.querySelectorAll<HTMLElement>('[data-work-card]'),
      )
      if (cards.length === 0) return

      // Single source of truth: read the offset back off the DOM so the scrub
      // range can never drift from the CSS sticky value at any breakpoint.
      const stickyTop = () => {
        const value = Number.parseFloat(getComputedStyle(cards[0]).top)
        return Number.isFinite(value) ? value : 100
      }

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1 — scrub: the covered card recedes while the next one travels up.
        // ease 'none' keeps it 1:1 with the scroll wheel (physical, not springy).
        cards.forEach((card, i) => {
          const next = cards[i + 1]
          if (!next) return
          gsap.to(card, {
            scale: 0.94,
            opacity: 0.6,
            filter: 'blur(2px)',
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: () => `top top+=${stickyTop()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
        })

        // 2 — entrance: clip-path wipe + settle on the media, staggered text.
        cards.forEach((card) => {
          const media = card.querySelector<HTMLElement>('[data-reveal="media"]')
          const lines = card.querySelectorAll<HTMLElement>('[data-reveal="line"]')
          if (!media || lines.length === 0) return

          const tl = gsap.timeline({
            scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          })

          tl.fromTo(
            media,
            { clipPath: 'inset(0 0 100% 0)', scale: 1.15 },
            {
              clipPath: 'inset(0 0 0% 0)',
              scale: 1,
              duration: 1.2,
              ease: 'power3.out',
              clearProps: 'clipPath',
            },
            0,
          )

          tl.fromTo(
            lines,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'power3.out',
              stagger: 0.08,
              clearProps: 'transform',
            },
            0.15,
          )
        })
      })

      // Sticky offsets are viewport-height based and the remote card images
      // resolve after first paint — refresh once they are all in so ScrollTrigger
      // start/end maths matches the final layout.
      const refresh = () => ScrollTrigger.refresh()
      const images = Array.from(root.querySelectorAll('img'))
      const pending = images.filter((img) => !img.complete)

      if (pending.length === 0) {
        refresh()
      } else {
        let left = pending.length
        const settle = () => {
          left -= 1
          if (left <= 0) {
            images.forEach((img) => {
              img.removeEventListener('load', settle)
              img.removeEventListener('error', settle)
            })
            refresh()
          }
        }
        pending.forEach((img) => {
          img.addEventListener('load', settle)
          img.addEventListener('error', settle)
        })
      }

      dispose = () => mm.revert()
    })()

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [rootRef])
}
