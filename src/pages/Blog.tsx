import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { useSiteContent } from '../lib/content'
import { PAGE_DESCRIPTIONS, PAGE_TITLES, applyMeta } from '../lib/seo'

const META = {
  title: PAGE_TITLES['/blog'],
  description: PAGE_DESCRIPTIONS['/blog'],
}

export default function Blog() {
  const { posts } = useSiteContent()

  useEffect(() => {
    applyMeta({ ...META, path: '/blog' })
  }, [])

  return (
    <main id="main" tabIndex={-1} className="section section-glow pt-32 md:pt-40">
      <div className="shell">
        <div className="shell-inner">
          <SectionHeader
            as="h1"
            eyebrow="Journal"
            segments={[{ text: 'All ' }, { text: 'writing', italic: true }]}
            subtext="Notes from my digital marketing and AI work, plus what I learn building things."
            id="blog-heading"
            action={
              <Link to="/" className="pill px-5 py-2.5 text-sm" data-no-intercept>
                Back home
              </Link>
            }
          />

          {posts.length === 0 ? (
            <p className="glass rounded-tile p-6 text-base text-muted">
              No posts published yet. Check back soon.
            </p>
          ) : (
            <RevealGroup className="flex flex-col gap-5" stagger={0.08}>
              {posts.map((post) => {
                const card = (
                  <>
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        loading="lazy"
                        width={1280}
                        height={630}
                        className="h-40 w-full flex-shrink-0 rounded-tile object-cover md:h-24 md:w-40"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <span className="chip mb-3 inline-block px-3 py-1.5 text-xs uppercase tracking-[0.2em]">
                        {post.category || 'Notes'}
                      </span>
                      <h2 className="text-xl font-extrabold leading-tight tracking-[-0.02em] text-text-primary md:text-2xl">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-3 text-base leading-relaxed text-muted">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <ArrowUpRight
                      className="h-5 w-5 flex-shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent-ink"
                      aria-hidden="true"
                    />
                  </>
                )

                // A row only links out once it has a real slug. Fallback rows
                // (no Supabase configured) have none, and linking them would
                // point every card at /blog/ — a page that is already open.
                return (
                  <RevealItem key={post.id}>
                    {post.slug ? (
                      <Link
                        to={`/blog/${post.slug}`}
                        data-no-intercept
                        className="glass lift group flex flex-col gap-5 rounded-card p-6 md:flex-row md:items-center md:gap-8 md:p-7"
                      >
                        {card}
                      </Link>
                    ) : (
                      <article className="glass lift group flex flex-col gap-5 rounded-card p-6 md:flex-row md:items-center md:gap-8 md:p-7">
                        {card}
                      </article>
                    )}
                  </RevealItem>
                )
              })}
            </RevealGroup>
          )}
        </div>
      </div>
    </main>
  )
}
