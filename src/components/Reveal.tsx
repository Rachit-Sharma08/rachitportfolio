import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  easeExpo,
  REDUCED_DURATION,
  REVEAL_DURATION,
  REVEAL_Y,
  STAGGER,
  VIEWPORT_MARGIN,
} from '../lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Seconds to wait before this element starts. */
  delay?: number
  /** Travel distance in px. */
  y?: number
  duration?: number
}

/**
 * The site's default entrance: fade up `y: 30 -> 0` when the element enters the
 * viewport, once, and never again on the way back up.
 *
 * `once: true` is the whole point — a section that re-animates every time it
 * scrolls past is the fastest way to make a site feel cheap. `whileInView` +
 * `viewport` hands the observer work to framer's own IO, so there is no scroll
 * listener here.
 *
 * Under `prefers-reduced-motion` the travel is dropped entirely and only the
 * opacity crossfade remains: no vestibular trigger, still a soft arrival.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = REVEAL_Y,
  duration = REVEAL_DURATION,
}: RevealProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      transition={{
        duration: reduce ? REDUCED_DURATION : duration,
        ease: easeExpo(),
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  )
}

interface RevealGroupProps {
  children: ReactNode
  className?: string
  stagger?: number
  /** Head start before the first child animates. */
  delay?: number
}

/**
 * Parent for a run of sibling elements that should cascade. The stagger lives
 * on the group, the travel on each `<RevealItem>`, so a list reads as one
 * gesture instead of N unrelated fades.
 *
 * The reduced-motion path keeps a very small stagger so the sequence still
 * feels ordered, just without the movement.
 */
export function RevealGroup({
  children,
  className,
  stagger = STAGGER,
  delay = 0,
}: RevealGroupProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      variants={{
        hidden: {},
        show: {
          transition: reduce
            ? { staggerChildren: 0.04 }
            : { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface RevealItemProps {
  children: ReactNode
  className?: string
  y?: number
  duration?: number
}

/** A single child of a `<RevealGroup>`. */
export function RevealItem({
  children,
  className,
  y = REVEAL_Y,
  duration = REVEAL_DURATION,
}: RevealItemProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduce ? REDUCED_DURATION : duration,
            ease: easeExpo(),
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
