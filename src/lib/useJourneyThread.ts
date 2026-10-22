import { useEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'

/**
 * Draws the "My Journey" thread down the timeline as it scrolls.
 *
 * The line is scrubbed rather than triggered: it grows exactly as far as the
 * reader has scrolled, so it reads as progress through the timeline instead of
 * one more entrance animation. `ease: 'none'` for the same reason as the story
 * scrub — easing a scroll-linked value makes it lag the scrollbar.
 *
 * The CSS default is a fully drawn line. Under reduced motion nothing is
 * attached here, so those visitors keep the finished line and just read it.
 * Marked with `data-journey-thread`; `scaleY` from the top so it always starts
 * at the first dot.
 */
export function useJourneyThread(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let dispose: (() => void) | undefined

    void (async () => {
      const { default: ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      const thread = root.querySelector<HTMLElement>('[data-journey-thread]')
      if (!thread) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          thread,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top center',
            force3D: true,
            scrollTrigger: {
              trigger: root,
              start: 'top 82%',
              end: 'bottom 68%',
              scrub: true,
            },
          },
        )
      })

      dispose = () => mm.revert()
    })()

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [rootRef])
}
