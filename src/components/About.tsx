import { useRef } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { Reveal, RevealGroup, RevealItem } from './Reveal'
import { useStoryReveal } from '../lib/useStoryReveal'
import { easeExpo } from '../lib/motion'
import { renderInline, splitParagraphs } from '../lib/markdown'
import { useSiteContent } from '../lib/content'
import { SOCIALS } from '../data'

const STAT_CHIPS = [
  'AI Tools: 25+',
  'Focus: Digital Marketing + AI',
  'Building: VoiceMemories AI',
]

const JOURNEY = [
  {
    year: '2025',
    text: 'Discovered AI and started exploring it seriously.',
  },
  {
    year: '2025',
    text: 'Wanted to start Digital Marketing with AI, but 12th CBSE boards and some family circumstances meant it had to wait.',
  },
  {
    year: '2026',
    text: 'Finished 12th. Chose to follow my own interest instead of the path others wanted for me, and completed the Digital Marketing with AI course.',
  },
  {
    year: '2026',
    text: 'Started working on real projects (GitHub/LinkedIn) and began building my own AI product, VoiceMemories AI.',
  },
]

export default function About() {
  const { storyCard, storyBody } = useSiteContent()
  const storyRef = useRef<HTMLDivElement>(null)
  useStoryReveal(storyRef)

  // The body is authored as blank-line separated paragraphs and laid out two per
  // glass card, which is the shape the static version was hand-built in.
  const cards: string[][] = []
  for (const paragraph of splitParagraphs(storyBody)) {
    const last = cards[cards.length - 1]
    if (last && last.length < 2) last.push(paragraph)
    else cards.push([paragraph])
  }

  return (
    <section id="about" className="section section-glow bg-bg" aria-labelledby="about-heading">
      <div className="shell">
        <div className="shell-inner">
        <SectionHeader
          eyebrow="About"
          id="about-heading"
          segments={[{ text: 'Who is ' }, { text: 'Rachit Sharma', italic: true }, { text: '?' }]}
          subtext="A bit about me, what I do, and why I do it."
        />

        <div className="grid gap-10 md:grid-cols-[320px_1fr] md:gap-14 lg:gap-20">
          <div className="flex flex-col items-center gap-8 md:items-start">
            <Reveal>
              <div
                className="rounded-full p-[2px]"
                style={{
                  width: 240,
                  height: 240,
                  background:
                    'linear-gradient(135deg, rgba(214,46,74,0.85) 0%, #7a1226 55%, #2a0711 100%)',
                }}
              >
                <img
                  src="/rachit.jpg"
                  alt="Rachit Sharma — digital marketer building with AI"
                  className="h-full w-full rounded-full object-cover"
                  width={240}
                  height={240}
                />
              </div>
            </Reveal>

            <Reveal delay={0.1} className="w-full">
              <div className="glass lift p-6">
                <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-muted">
                  My Story
                </h3>
                {/* Opacity is owned by the scroll-linked story scrub, not by a
                    framer fade — the two would fight over the same property. */}
                <p
                  data-story-line
                  className="text-base leading-relaxed text-muted"
                  dangerouslySetInnerHTML={{ __html: renderInline(storyCard) }}
                />
              </div>
            </Reveal>
          </div>

          <div className="flex flex-col gap-5" ref={storyRef}>
            {cards.map((group, index) => (
              <Reveal key={index} delay={0.05 + index * 0.07}>
                <div className="glass lift p-6 md:p-7">
                  {group.map((paragraph, i) => (
                    <p
                      key={i}
                      data-story-line
                      className={`text-base leading-relaxed text-muted ${
                        i === 0 ? '' : 'mt-4'
                      }`}
                      dangerouslySetInnerHTML={{ __html: renderInline(paragraph) }}
                    />
                  ))}
                </div>
              </Reveal>
            ))}

            <RevealGroup
              className="flex flex-wrap items-center gap-3"
              delay={0.24}
            >
              {STAT_CHIPS.map((chip) => (
                <RevealItem key={chip}>
                  <span className="chip cursor-default px-4 py-2 text-xs">
                    {chip}
                  </span>
                </RevealItem>
              ))}
              <RevealItem>
                <a
                  href={SOCIALS.github}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="chip px-5 py-2.5 text-xs"
                >
                  GitHub ↗
                </a>
              </RevealItem>
              <RevealItem>
                <a
                  href={SOCIALS.linkedin}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="chip px-5 py-2.5 text-xs"
                >
                  LinkedIn ↗
                </a>
              </RevealItem>
            </RevealGroup>
          </div>
        </div>

        <Reveal className="mt-16 md:mt-24">
          <h2 className="mb-8 text-xs uppercase tracking-[0.3em] text-muted">
            My Journey
          </h2>
          <RevealGroup className="relative flex flex-col gap-9 pl-8" stagger={0.1}>
            <div className="absolute bottom-2 left-[5px] top-2 w-px bg-stroke" />
            {JOURNEY.map((item) => (
              <RevealItem key={item.year + item.text.slice(0, 20)} y={20}>
                <div className="relative">
                  {/* Was `type: 'spring'`, which bounces past its target and
                      rings back — replaced with the shared power3-out curve. */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
                    transition={{ duration: 0.7, ease: easeExpo() }}
                    className="absolute -left-8 top-1.5 h-2.5 w-2.5 rounded-full accent-gradient"
                    style={{ boxShadow: '0 0 12px rgba(214, 46, 74, 0.65)' }}
                  />
                  <span className="font-display text-xl italic text-accent-ink">
                    {item.year}
                  </span>
                  <p className="mt-1 max-w-2xl text-base leading-relaxed text-muted">
                    {item.text}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
        </div>
      </div>
    </section>
  )
}
