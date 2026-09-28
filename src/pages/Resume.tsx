import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'
import RevealHeading from '../components/RevealHeading'
import { PERSONAL } from '../data'

const EASE = [0.16, 1, 0.3, 1] as const

function Block({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Resume(): ReactNode {
  return (
    <main className="section section-glow min-h-screen bg-bg">
      <div className="shell">
        <div className="shell-inner">
      <Block>
        <p className="eyebrow mb-5">Resume</p>
        <RevealHeading
          as="h1"
          segments={[
            { text: 'Rachit ' },
            { text: 'Sharma', italic: true },
          ]}
          className="text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary md:text-7xl"
        />
        <p className="mt-6 text-sm text-muted md:text-base">
          Digital Marketing Specialist (in training) · Digital Marketing with AI
          course, in progress.
        </p>
        <a
          href={`mailto:${PERSONAL.email}`}
          className="mt-4 inline-block text-sm text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
        >
          {PERSONAL.email}
        </a>
        <span className="mx-3 text-muted">·</span>
        <a
          href={PERSONAL.phoneHref}
          className="inline-block text-sm text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
        >
          {PERSONAL.phone}
        </a>
      </Block>

      <div className="mt-16 flex flex-col gap-14 md:mt-20">
        <Block delay={0.1}>
          <h2 className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
            Education
          </h2>
          <div className="border-l border-stroke pl-6">
            <div className="flex flex-col gap-1 pb-8">
              <p className="text-sm font-medium text-text-primary md:text-base">
                Digital Marketing with AI
              </p>
              <p className="text-sm text-muted">Currently completing · 2026</p>
            </div>
          </div>
        </Block>

        <Block delay={0.2}>
          <h2 className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              'Social Media Marketing',
              'SEO & Content',
              'AI Prompting',
              'Copywriting',
              'Campaign Planning',
              'Canva',
              'Ad Design Basics',
            ].map((skill) => (
              <span key={skill} className="chip px-4 py-2 text-sm text-text-primary">
                {skill}
              </span>
            ))}
          </div>
        </Block>

        <Block delay={0.3}>
          <h2 className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
            Projects
          </h2>
          <div className="space-y-6 border-l border-stroke pl-6">
            {[
              {
                title: 'Fitness Website',
                desc: 'A fitness-focused website built to practice clean UI, responsive layout, and brand messaging.',
              },
              {
                title: 'Neon Car Racing Game',
                desc: 'A browser racing game built for fun and practice with JavaScript game loops.',
              },
            ].map((p) => (
              <div key={p.title}>
                <p className="text-sm font-medium text-text-primary md:text-base">
                  {p.title}
                </p>
                <p className="mt-1 max-w-xl text-sm text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </Block>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
        </div>
      </div>
    </main>
  )
}
