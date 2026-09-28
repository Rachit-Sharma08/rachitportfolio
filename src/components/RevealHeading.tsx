import { motion } from 'framer-motion'

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
}

const EASE = [0.16, 1, 0.3, 1] as const

export default function RevealHeading({
  segments,
  as = 'h2',
  className = '',
  delay = 0,
}: RevealHeadingProps) {
  const Tag = as
  let wordIndex = 0

  const words = segments.flatMap((segment, s) => {
    const parts = segment.text.split(' ').filter(Boolean)
    return parts.map((word, w) => {
      const isLast = s === segments.length - 1 && w === parts.length - 1
      return {
        word,
        italic: segment.italic,
        className: segment.className,
        trail: isLast ? '' : ' ',
        index: wordIndex++,
      }
    })
  })

  return (
    <Tag className={className} aria-label={segments.map((s) => s.text).join(' ')}>
      {words.map(({ word, italic, className: wordCls, trail, index }) => (
        <span
          key={index}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
        >
          <motion.span
            className={`inline-block ${
              italic ? 'font-display text-[0.76em] font-normal italic' : ''
            } ${wordCls ?? ''}`}
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: delay + index * 0.06,
            }}
          >
            {word}
            {trail}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}