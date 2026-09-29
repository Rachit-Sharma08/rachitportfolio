import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import RevealHeading from './RevealHeading'
import { Reveal, RevealGroup, RevealItem } from './Reveal'
import { useSiteContent } from '../lib/content'

interface JournalProps {
  action?: ReactNode
}

export default function Journal({ action }: JournalProps) {
  const { posts } = useSiteContent()

  return (
    <section id="journal" className="section bg-bg" aria-labelledby="journal-heading">
      <div className="shell">
        <div className="shell-inner">
        <Reveal className="mb-12 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <div className="eyebrow mb-5">Journal</div>
            <RevealHeading
              as="h2"
              id="journal-heading"
              segments={[
                { text: 'Recent ' },
                { text: 'thoughts', italic: true },
              ]}
              className="text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
              delay={0.1}
            />
            <p className="mt-5 max-w-md text-base text-muted">
              Notes from my digital marketing + AI course work.
            </p>
          </div>
          {action}
        </Reveal>

        <RevealGroup className="flex flex-col gap-4" stagger={0.08}>
          {posts.map((post) => {
            // A row only becomes a link once it has a real slug to link to, which
            // is the case for every database row and never for the static
            // fallback — so the section is never a dead-end before Supabase is
            // configured.
            const body = (
              <>
                <span className="hidden h-2 w-2 flex-shrink-0 rounded-full accent-gradient sm:block" />
                <h3 className="flex-1 text-base text-text-primary">
                  {post.title}
                </h3>
                <span className="chip flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-xs uppercase tracking-[0.2em]">
                  {post.category}
                </span>
              </>
            )

            return (
              <RevealItem key={post.id}>
                {post.slug ? (
                  <Link
                    to={`/blog/${post.slug}`}
                    data-no-intercept
                    className="glass lift flex items-center gap-6 rounded-tile p-5 transition-colors duration-300 hover:border-accent/40 sm:rounded-full sm:py-5 sm:pl-8 sm:pr-7"
                  >
                    {body}
                  </Link>
                ) : (
                  <article className="glass lift flex items-center gap-6 rounded-tile p-5 sm:rounded-full sm:py-5 sm:pl-8 sm:pr-7">
                    {body}
                  </article>
                )}
              </RevealItem>
            )
          })}
        </RevealGroup>
        </div>
      </div>
    </section>
  )
}
