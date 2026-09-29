import { useEffect, useRef, useState } from 'react'
import { SOCIALS } from '../data'
import { useSiteContent } from '../lib/content'
import RevealHeading from './RevealHeading'
import WorkViewCursor from './work/WorkViewCursor'
import { useWorkStackAnim } from './work/useWorkStackAnim'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export default function SelectedWork() {
  const { projects } = useSiteContent()
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)
  const total = projects.length

  useWorkStackAnim(rootRef)

  useEffect(() => {
    let threshold = 76

    const measure = () => {
      const card = cardRefs.current[0]
      if (!card) return
      const top = Number.parseFloat(getComputedStyle(card).top)
      if (Number.isFinite(top)) threshold = top
      update()
    }

    const update = () => {
      let next = 0
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i]
        if (el && el.getBoundingClientRect().top <= threshold + 1) next = i
      }
      setActive((prev) => (prev === next ? prev : next))
    }

    measure()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <section id="work" className="section-glow relative bg-bg pb-24 md:pb-32" aria-labelledby="work-heading">
      <WorkViewCursor />
      <div className="shell work-stack" ref={rootRef}>
        <div className="flex flex-col items-start justify-between gap-8 pb-14 pt-24 md:flex-row md:items-end md:pb-16 md:pt-32">
          <div>
            <div className="eyebrow mb-5">Selected Work</div>
            <RevealHeading
              as="h2"
              id="work-heading"
              segments={[
                { text: 'Four builds, zero' },
                { text: 'templates', italic: true },
              ]}
              className="max-w-2xl text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-2 font-extrabold tracking-[-0.02em] text-text-primary">
              <span className="text-3xl text-accent-ink tabular-nums">
                {pad(active + 1)}
              </span>
              <span className="text-lg text-muted tabular-nums">
                / {pad(total)}
              </span>
            </div>
            <a
              href={SOCIALS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="pill border-gradient-ring px-5 py-2.5 text-xs uppercase tracking-[0.2em]"
            >
              View all work ↗
            </a>
          </div>
        </div>

        {projects.map((project, i) => {
          const imageRight = i % 2 === 1
          const accent = project.accent ?? '#d62e4a'

          return (
            <article
              key={project.id}
              className="glass work-card flex min-h-[70vh] flex-col overflow-hidden lg:min-h-[75vh] lg:flex-row"
              data-work-card={i}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
            >
              <div
                className={`work-media relative h-[28vh] shrink-0 overflow-hidden lg:h-auto lg:w-[55%] ${
                  imageRight ? 'lg:order-2' : ''
                }`}
                data-reveal="media"
              >
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={`${project.title} project preview`}
                    loading="lazy"
                    width={1280}
                    height={640}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `radial-gradient(120% 120% at 22% 12%, ${accent}59, transparent 62%), linear-gradient(160deg, #1c0a0f, #0a0407)`,
                    }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/55 via-transparent to-transparent" />
              </div>

              <div
                className={`flex flex-1 flex-col justify-between gap-5 p-6 lg:gap-7 lg:p-10 xl:p-12 ${
                  imageRight ? 'lg:order-1' : ''
                }`}
              >
                <div
                  className="flex items-start justify-between gap-6"
                  data-reveal="line"
                >
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">
                    {project.category}
                  </span>
                  <span className="font-display text-4xl italic leading-none text-accent-ink">
                    {pad(i + 1)}
                  </span>
                </div>

                <div data-reveal="line">
                  <h3 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-text-primary md:text-4xl">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-text-primary/90 lg:mt-4">
                    {project.tagline}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted lg:mt-3">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-col gap-4 lg:gap-6" data-reveal="line">
                  <div className="flex flex-wrap gap-2">
                    {(project.tech ?? []).map((item) => (
                      <span
                        key={item}
                        className="chip px-3.5 py-1.5 text-xs tracking-wide"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {project.projectUrl ? (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title} project on GitHub`}
                      className="pill pill-primary self-start px-6 py-3 text-sm"
                    >
                      View project
                      <span className="work-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <span className="pill px-6 py-3 text-sm opacity-45">
                      {project.comingSoon ? 'Coming soon' : 'View project'}
                    </span>
                  )}
                </div>
              </div>
            </article>
          )
        })}

        <div className="work-hold" aria-hidden="true" />
      </div>
    </section>
  )
}
