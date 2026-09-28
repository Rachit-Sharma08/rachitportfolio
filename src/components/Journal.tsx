import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import RevealHeading from './RevealHeading'

interface JournalProps {
  action?: ReactNode
}

const EASE = [0.16, 1, 0.3, 1] as const

export default function Journal({ action }: JournalProps) {
  const entries = [
    {
      title:
        'Learning how ChatGPT can turn one sharp brief into a full campaign sprint.',
      tag: 'AI · Prompting',
    },
    {
      title: "SEO isn't dead — it's just learning to speak AI to search engines.",
      tag: 'SEO',
    },
    {
      title:
        'Rebuilt the landing page twice. The third pass finally felt like a brand.',
      tag: 'Branding',
    },
    {
      title:
        'Content that converts starts with one strong hook, not a wall of text.',
      tag: 'Copywriting',
    },
  ]

  return (
    <section id="journal" className="section bg-bg">
      <div className="shell">
        <div className="shell-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: EASE }}
          className="mb-12 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end"
        >
          <div>
            <div className="eyebrow mb-5">Journal</div>
            <RevealHeading
              as="h2"
              segments={[
                { text: 'Recent ' },
                { text: 'thoughts', italic: true },
              ]}
              className="text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
              delay={0.1}
            />
            <p className="mt-5 max-w-md text-sm text-muted md:text-base">
              Notes from my digital marketing + AI course work.
            </p>
          </div>
          {action}
        </motion.div>

        <div className="flex flex-col gap-4">
          {entries.map((entry, i) => (
            <motion.article
              key={entry.tag + i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
              className="glass lift flex items-center gap-6 rounded-tile p-5 sm:rounded-full sm:py-5 sm:pl-8 sm:pr-7"
            >
              <span className="hidden h-2 w-2 flex-shrink-0 rounded-full accent-gradient sm:block" />
              <p className="flex-1 text-sm text-text-primary md:text-base">
                {entry.title}
              </p>
              <span className="chip flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]">
                {entry.tag}
              </span>
            </motion.article>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
