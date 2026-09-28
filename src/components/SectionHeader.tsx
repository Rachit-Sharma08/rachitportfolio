import type { ReactNode } from 'react'
import RevealHeading from './RevealHeading'
import { Reveal } from './Reveal'

interface SectionHeaderProps {
  eyebrow: string
  segments: { text: string; italic?: boolean }[]
  subtext: string
  action?: ReactNode
  id?: string
}

export default function SectionHeader({
  eyebrow,
  segments,
  subtext,
  action,
  id,
}: SectionHeaderProps) {
  return (
    <Reveal className="mb-12 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end">
      <div>
        <div className="eyebrow mb-5">{eyebrow}</div>
        <RevealHeading
          as="h2"
          id={id}
          segments={segments}
          className="text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
          delay={0.1}
        />
        <p className="mt-5 max-w-md text-base text-muted">
          {subtext}
        </p>
      </div>
      {action}
    </Reveal>
  )
}
