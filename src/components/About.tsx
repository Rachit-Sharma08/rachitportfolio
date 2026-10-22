import { useRef } from 'react'
import { Link } from 'react-router-dom'
import SectionHeader from './SectionHeader'
import { Reveal, RevealGroup, RevealItem } from './Reveal'
import { useStoryReveal } from '../lib/useStoryReveal'
import { renderInline, splitParagraphs } from '../lib/markdown'
import { useSiteContent } from '../lib/content'
import { SOCIALS, DEFINITION, QUICK_FACTS } from '../data'

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
    text: 'Decided to study Digital Marketing with AI.',
  },
  {
    year: '2026',
    text: 'Finished 12th (CBSE) and chose Digital Marketing with AI, alongside a BBA at RKSD College.',
  },
  {
    year: '2026',
    text: 'Started working on real projects (GitHub/LinkedIn) and began building my own AI product, VoiceMemories AI.',
  },
]

// One column per year: two 2025 rows stacked with "2025" repeated read as noise,
// and a year is the unit a reader actually scans a timeline for.
const CHAPTERS = JOURNEY.reduce<{ year: string; items: string[] }[]>((chapters, item) => {
  const last = chapters[chapters.length - 1]
  if (last && last.year === item.year) last.items.push(item.text)
  else chapters.push({ year: item.year, items: [item.text] })
  return chapters
}, [])

export default function About() {
  const { storyCard, storyBody } = useSiteContent()
  const storyRef = useRef<HTMLDivElement>(null)
  useStoryReveal(storyRef)

  // The body is authored as blank-line separated paragraphs: the first one is
  // the statement, the rest are detail that sits two-up underneath it.
  const [statement, ...detail] = splitParagraphs(storyBody)

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

        <Reveal className="mb-10 md:mb-14">
          {/* The site's one-line answer to "who is Rachit Sharma?", in the same
              words as the Person schema description and the llms.txt summary.
              Real copy rather than a hidden attribute: an answer engine quotes
              what it can read on the page, and a claim that exists only in markup
              is one nobody can check. */}
          <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            {DEFINITION}
          </p>
        </Reveal>

        <Reveal className="mb-12 md:mb-16">
          <h3 className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">
            Quick facts
          </h3>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_FACTS.map((fact) => (
              <div key={fact.q} className="glass lift p-5">
                <dt className="text-sm font-semibold text-text-primary">{fact.q}</dt>
                {/* Answers render inline (`[Resume page](/resume)` becomes the
                    anchor in the Q6 answer); a plain text node would print the
                    markdown source. */}
                <dd
                  className="mt-2 text-sm leading-relaxed text-muted"
                  dangerouslySetInnerHTML={{ __html: renderInline(fact.a) }}
                />
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              to="/resume"
              className="inline-flex items-center gap-1 text-sm text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
            >
              View the full resume <span className="inline-block">↗</span>
            </Link>
            <Link
              to="/digital-marketer-kaithal"
              className="inline-flex items-center gap-1 text-sm text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
            >
              Digital marketer in Kaithal <span className="inline-block">↗</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-[320px_1fr] md:gap-14 lg:gap-20">
          <div className="flex flex-col items-center gap-8 md:items-start">
            <Reveal>
              <div
                className="relative overflow-hidden rounded-full p-[2px]"
                style={{
                  width: 240,
                  height: 240,
                  background:
                    'linear-gradient(135deg, rgba(214,46,74,0.85) 0%, #7a1226 55%, #2a0711 100%)',
                  boxShadow: '0 0 70px -18px rgba(214, 46, 74, 0.55)',
                }}
              >
                {/* Same rotating conic as the navbar logo, so the ring reads as
                    part of the site's language rather than a new effect. It sits
                    behind the photo, so only the 2px band is visible. */}
                <span aria-hidden="true" className="logo-ring absolute inset-0 rounded-full" />
                <img
                  src="/rachit-480.webp"
                  /* The frame is a fixed 240px ring with 2px of padding, so the
                     image box is a 236 CSS px square at every viewport, and the
                     sources are pre-cropped to that same centre square (visible
                     pixels identical to what CSS object-cover shows). Each width
                     is then the exact device-pixel need of one DPR
                     (236 x 1 / 1.3 / 1.75 / 2 / 3), so no viewport downloads
                     more than it draws — the 1200px JPEG this replaced cost
                     92 KiB per visit into that box. */
                  srcSet="/rachit-240.webp 240w, /rachit-320.webp 320w, /rachit-420.webp 420w, /rachit-480.webp 480w, /rachit-720.webp 720w"
                  sizes="236px"
                  alt="Rachit Sharma, AI-powered digital marketer in Kaithal, Haryana"
                  className="relative h-full w-full rounded-full object-cover"
                  width={240}
                  height={240}
                  loading="lazy"
                  decoding="async"
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
            {statement && (
              <Reveal>
                {/* The opening paragraph carries the column on its own, so it
                    gets a bigger box and a bigger size instead of being one of
                    three equal cards nobody knows where to start on. */}
                <div className="glass lift p-7 md:p-9">
                  <p
                    data-story-line
                    className="text-xl leading-[1.55] text-text-primary md:text-2xl md:leading-[1.45]"
                    dangerouslySetInnerHTML={{ __html: renderInline(statement) }}
                  />
                </div>
              </Reveal>
            )}

            {detail.length > 0 && (
              <RevealGroup
                className="grid items-start gap-6 md:grid-cols-2 md:gap-x-10"
                delay={0.08}
                stagger={0.08}
              >
                {/* Detail is a hairline column, not a card — boxes of unequal
                    copy expose their own empty space, and the rules match the
                    journey ledger below. */}
                {detail.map((paragraph, index) => (
                  <RevealItem key={index}>
                    <div className="border-t border-stroke/70 pt-5">
                      <p
                        data-story-line
                        className="text-base leading-relaxed text-muted"
                        dangerouslySetInnerHTML={{ __html: renderInline(paragraph) }}
                      />
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}

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
          <h3 className="mb-8 text-xs uppercase tracking-[0.3em] text-muted">
            My Journey
          </h3>
          {/* A chapter ledger: the year is the anchor and each year is one rule
              line, rather than four rows hanging off a dotted rail — the rail is
              the most template-looking thing a timeline can do. */}
          <RevealGroup className="border-t border-stroke/70" stagger={0.12}>
            {CHAPTERS.map((chapter) => (
              <RevealItem key={chapter.year}>
                <div className="grid gap-5 border-b border-stroke/70 py-8 md:grid-cols-[200px_1fr] md:gap-12">
                  <div className="font-display text-4xl italic leading-none text-accent-ink md:text-6xl">
                    {chapter.year}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 md:gap-x-10">
                    {chapter.items.map((item) => (
                      <p
                        key={item}
                        className="relative pl-6 text-base leading-relaxed text-muted before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-3.5 before:bg-accent/60"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
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
