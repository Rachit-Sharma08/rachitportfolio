import { useEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { STORY_FROM } from './motion'

/**
 * Scroll-linked opacity for the about/story paragraphs.
 *
 * Unlike everything else on the site this one is *scrubbed* rather than
 * triggered: the paragraph is tied directly to scroll position, so the reading
 * pace sets the reveal pace. `ease: 'none'` is deliberate — easing a
 * scroll-linked value makes the text lag behind the scrollbar in a way that
 * feels broken rather than smooth.
 *
 * Marked paragraphs with `data-story-line`. Because the fade is written to the
 * paragraph itself, never wrap one in a framer `whileInView` opacity or the two
 * libraries will overwrite each other.
 */
export function useStoryReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let dispose: (() => void) | undefined

    void (async () => {
      const { default: ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      const lines = Array.from(
        root.querySelectorAll<HTMLElement>('[data-story-line]'),
      )
      if (lines.length === 0) return

      const mm = gsap.matchMedia()

      // Under reduced motion nothing is attached at all, so the paragraphs
      // simply render at full opacity from the start.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        lines.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: STORY_FROM },
            {
              opacity: 1,
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: el,
                start: 'top 94%',
                end: 'top 64%',
                scrub: true,
              },
            },
          )
        })
      })

      dispose = () => mm.revert()
    })()

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [rootRef])
}
