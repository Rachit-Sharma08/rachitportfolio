import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  easePower3,
  REDUCED_DURATION,
  STAGGER,
  VIEWPORT_MARGIN,
} from '../lib/motion'

interface Segment {
  text: string
  italic?: boolean
  className?: string
}

interface RevealHeadingProps {
  segments: Segment[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
  id?: string
}

const LINE_DURATION = 0.9
const ITALIC_EXTRA_DELAY = 0.14

/**
 * Line-by-line masked heading reveal.
 *
 * The words are laid out normally first, then measured to find where the
 * browser actually broke the text. Words sharing a line get the same delay, so
 * the heading rises one *line* at a time rather than one word at a time — which
 * is what stops a big heading from looking like a slot machine. Because the
 * breaks are measured rather than hard-coded, the same component behaves
 * correctly at every width without a single breakpoint-specific line array.
 *
 * `offsetTop` is used rather than `getBoundingClientRect()` on purpose: the
 * measurement runs while the words are still translated down inside their
 * masks, and a transform-aware rect would report the offset position instead of
 * the layout one.
 */
export default function RevealHeading({
  segments,
  as = 'h2',
  className = '',
  delay = 0,
  id,
}: RevealHeadingProps) {
  const Tag = as
  const reduce = useReducedMotion()
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [lineOf, setLineOf] = useState<number[]>([])

  // One flat word list drives both the render and the accessible name, so the
  // two can never disagree about how many spaces sit between the words.
  const words = segments.flatMap((segment) =>
    segment.text
      .split(' ')
      .filter(Boolean)
      .map((word) => ({
        word,
        italic: Boolean(segment.italic),
        className: segment.className,
      })),
  )

  // A closing mark clings to the word before it ("Rachit Sharma?"), so no space
  // goes in front of it. Every other gap between words is a single space.
  const isClosingMark = (word: string) => /^[?!.,;:%)…]/.test(word)

  // The accessible name is the same words joined the same way the render lays
  // them out. Building it from the shared list is what stops the double spaces
  // that segment-by-segment joining used to leave at every boundary.
  const label = words.reduce(
    (acc, { word }, index) =>
      index === 0 || isClosingMark(word) ? `${acc}${word}` : `${acc} ${word}`,
    '',
  )

  useLayoutEffect(() => {
    const measure = () => {
      let line = 0
      let lastTop = Number.NaN
      const next = wordRefs.current.map((el) => {
        const top = el?.offsetTop
        if (typeof top !== 'number') return line
        // Same line-height => same offsetTop. 4px of slack absorbs the
        // sub-pixel rounding that differing font metrics introduce.
        if (Number.isFinite(lastTop) && Math.abs(top - lastTop) > 4) line += 1
        lastTop = top
        return line
      })
      setLineOf((prev) =>
        prev.length === next.length && prev.every((v, i) => v === next[i])
          ? prev
          : next,
      )
    }

    measure()

    const node = wordRefs.current[0]?.offsetParent
    let observer: ResizeObserver | undefined
    if (node) {
      observer = new ResizeObserver(measure)
      observer.observe(node)
    }
    // Web fonts land after first paint and can re-break the lines.
    void document.fonts?.ready.then(measure)

    return () => observer?.disconnect()
  }, [words.length])

  return (
    <Tag
      id={id}
      className={`relative ${className}`}
      aria-label={label}
    >
      {words.map(({ word, italic, className: wordCls }, index) => {
        const line = lineOf[index] ?? 0
        const wordDelay =
          delay + line * STAGGER + (italic ? ITALIC_EXTRA_DELAY : 0)

        return (
          <Fragment key={index}>
            {index > 0 && !isClosingMark(word) ? ' ' : null}
            <span
              ref={(el) => {
                wordRefs.current[index] = el
              }}
              className="inline-block overflow-hidden align-bottom"
              style={{ paddingBottom: '0.1em', marginBottom: '-0.1em' }}
            >
              <motion.span
                className={`inline-block ${
                  italic ? 'font-display text-[0.76em] font-normal italic' : ''
                } ${wordCls ?? ''}`}
                initial={reduce ? { opacity: 0 } : { y: '110%', opacity: italic ? 0 : 1 }}
                whileInView={reduce ? { opacity: 1 } : { y: '0%', opacity: 1 }}
                viewport={{ once: true, margin: VIEWPORT_MARGIN }}
                transition={{
                  duration: reduce ? REDUCED_DURATION : LINE_DURATION,
                  ease: easePower3(),
                  delay: reduce ? 0 : wordDelay,
                }}
              >
                {word}
              </motion.span>
            </span>
          </Fragment>
        )
      })}
    </Tag>
  )
}
