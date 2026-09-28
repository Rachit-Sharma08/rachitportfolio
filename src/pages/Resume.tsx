import type { ReactNode } from 'react'
import Footer from '../components/Footer'
import RevealHeading from '../components/RevealHeading'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { PERSONAL } from '../data'

export default function Resume(): ReactNode {
  return (
    <main className="section section-glow min-h-screen bg-bg">
      <div className="shell">
        <div className="shell-inner">
          <Reveal>
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
          </Reveal>

          <div className="mt-16 flex flex-col gap-14 md:mt-20">
            <Reveal delay={0.08}>
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
            </Reveal>

            <Reveal delay={0.14}>
              <h2 className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
                Skills
              </h2>
              <RevealGroup className="flex flex-wrap gap-2.5" stagger={0.05}>
                {[
                  'Social Media Marketing',
                  'SEO & Content',
                  'AI Prompting',
                  'Copywriting',
                  'Campaign Planning',
                  'Canva',
                  'Ad Design Basics',
                ].map((skill) => (
                  <RevealItem key={skill}>
                    <span className="chip px-4 py-2 text-sm text-text-primary">
                      {skill}
                    </span>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Reveal>

            <Reveal delay={0.2}>
              <h2 className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
                Projects
              </h2>
              <RevealGroup className="space-y-6 border-l border-stroke pl-6" stagger={0.08}>
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
                  <RevealItem key={p.title}>
                    <div>
                      <p className="text-sm font-medium text-text-primary md:text-base">
                        {p.title}
                      </p>
                      <p className="mt-1 max-w-xl text-sm text-muted">{p.desc}</p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Reveal>
          </div>

          <div className="mt-20">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  )
}