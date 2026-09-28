/**
 * One place for every animation value on the site.
 *
 * Before this file each component carried its own `const EASE = [0.16, 1, 0.3, 1]`
 * and its own opinion about how far a card should travel (`y: 20`, `y: 24`,
 * `y: 30`) and how long it should take (`0.7s`, `0.8s`, `0.9s`, `1s`). Same
 * motion, four different feels. Everything now reads its numbers from here so
 * the whole page moves like one thing.
 *
 * House rules, applied to every reveal on the site:
 *   - only `transform` (translate/scale) and `opacity` are animated. Nothing
 *     that triggers layout or paint, so scrubbing stays on the compositor.
 *   - no spring, no elastic, no back — those overshoot, and a heading that
 *     bounces reads as a template rather than a considered site.
 *   - durations sit in 0.6-1.2s, the range where motion still feels immediate.
 */

/** expo.out — the workhorse. Long, decisive tail. */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const

/** power3.out — used for masked line reveals, slightly softer mid-curve. */
export const EASE_POWER3 = [0.215, 0.61, 0.355, 1] as const

/** Distance a faded-up element travels. */
export const REVEAL_Y = 30

/** Default duration for a fade-up. */
export const REVEAL_DURATION = 0.9

/** Gap between items in a staggered group. */
export const STAGGER = 0.08

/**
 * How far before an element enters the viewport its reveal fires. A negative
 * bottom margin holds the animation back until the element is genuinely on
 * screen, which is what makes a scroll-triggered reveal feel deliberate instead
 * of firing while the element is still below the fold.
 */
export const VIEWPORT_MARGIN = '-12% 0px -12% 0px'

/** Opacity a scroll-linked paragraph starts from. */
export const STORY_FROM = 0.25

/** Duration used for the reduced-motion path: a plain, gentle fade. */
export const REDUCED_DURATION = 0.4

/**
 * Cubic bezier arrays are readonly tuples, but framer-motion wants a mutable
 * number[]-ish type. Spreading once here keeps every call site free of casts.
 */
export const easeExpo = (): [number, number, number, number] => [...EASE_EXPO]
export const easePower3 = (): [number, number, number, number] => [...EASE_POWER3]

/** GSAP accepts a named ease string instead of a bezier tuple. */
export const GSAP_POWER3_OUT = 'power3.out'
