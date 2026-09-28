import { useRef } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { Reveal, RevealGroup, RevealItem } from './Reveal'
import { useStoryReveal } from '../lib/useStoryReveal'
import { easeExpo } from '../lib/motion'
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
  const storyRef = useRef<HTMLDivElement>(null)
  useStoryReveal(storyRef)

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
                >
                  I'm not from a big city or a coding background — I'm a self-taught
                  builder who chose to follow what actually interests me, even when
                  the easier path was right there. I got into AI in 2025, and once I
                  started, I didn't stop. Today I work with 25+ AI tools, I'm doing
                  Digital Marketing with AI, and I'm building my own AI products on
                  the side.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="flex flex-col gap-5" ref={storyRef}>
            <Reveal delay={0.05}>
              <div className="glass lift p-6 md:p-7">
                <p
                  data-story-line
                  className="text-base leading-relaxed text-muted"
                >
                  I got interested in AI in 2025, and that's when I started exploring
                  it seriously.
                </p>
                <p
                  data-story-line
                  className="mt-4 text-base leading-relaxed text-muted"
                >
                  I wanted to do a "Digital Marketing with AI" course early on, but I
                  couldn't start right away — I had my 12th CBSE boards going on, and
                  some family situations made it hard to begin. After I finished 12th,
                  my family wanted me to take a different course. But I decided to
                  follow what I was actually interested in, so I went ahead and
                  completed the Digital Marketing with AI course anyway.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="glass lift p-6 md:p-7">
                <p
                  data-story-line
                  className="text-base leading-relaxed text-muted"
                >
                  Now I'm working on real projects — you can check them out on my{' '}
                  <a
                    href={SOCIALS.github}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
                  >
                    GitHub
                  </a>{' '}
                  and{' '}
                  <a
                    href={SOCIALS.linkedin}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
                  >
                    LinkedIn
                  </a>
                  .
                </p>
                <p
                  data-story-line
                  className="mt-4 text-base leading-relaxed text-muted"
                >
                  I currently know how to use 25+ AI tools. The ones I use the most
                  are OpenCode (a coding agent), OpenAI's GPT, ElevenLabs, Cartesia
                  AI, and Claude.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.19}>
              <div className="glass lift p-6 md:p-7">
                <p
                  data-story-line
                  className="text-base leading-relaxed text-muted"
                >
                  I'm also starting to build my own AI products. One of them is called{' '}
                  <strong className="text-text-primary">VoiceMemories AI</strong> —
                  the idea is that someone can clone a loved one's voice (if they
                  have a voice sample) and have a real, emotionally supportive
                  conversation with that voice — even live calls, not just text. It's
                  meant for people who've lost someone and want a way to feel close
                  to them again. The project isn't finished yet — I've paused it for
                  now because of funding — but it's something I really care about and
                  plan to come back to.
                </p>
              </div>
            </Reveal>

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
