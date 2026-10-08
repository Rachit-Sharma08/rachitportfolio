import { useEffect } from 'react'
import type { MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import RichText from '../components/RichText'
import { Reveal } from '../components/Reveal'
import NotFound from './NotFound'
import { useSiteContent } from '../lib/content'
import { renderMarkdown } from '../lib/markdown'
import {
  applyArticleSchema,
  applyMeta,
  clearArticleSchema,
  isMeaningfullyUpdated,
  postTitle,
} from '../lib/seo'
import { scrollToTop } from '../lib/lenis'
import { PERSONAL } from '../data'

function formatDate(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { posts } = useSiteContent()
  const post = posts.find((entry) => entry.slug === slug)

  useEffect(() => {
    if (!post) {
      clearArticleSchema()
      return
    }
    const title = postTitle(post.title)
    const description =
      post.excerpt || `${post.title}. Notes on digital marketing and AI by Rachit Sharma.`
    applyMeta({
      title,
      description,
      path: `/blog/${post.slug}`,
      image: post.coverImageUrl,
      type: 'article',
      publishedTime: post.publishedAt,
    })
    applyArticleSchema({
      title: post.title,
      description,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      image: post.coverImageUrl,
    })
    return () => clearArticleSchema()
  }, [post])

  // A post is normally reached from the list, but a direct load or a refresh
  // starts at the top of the previous scroll position otherwise.
  useEffect(() => {
    scrollToTop()
  }, [slug])

  if (!post) {
    // Not this component's own not-found block. A missing slug is the single
    // most common 404 on this site — every post ever deleted leaves one behind —
    // and there is only one 404.html, so a second copy of the same idea would
    // guarantee the pre-rendered HTML and the hydrated DOM drift apart. The
    // crawler would read one page and the visitor the other.
    return <NotFound />
  }

  const date = formatDate(post.publishedAt)
  // Shown only when the edit is real. Supabase stamps updated_at on every save,
  // so printing it unconditionally would claim a revision ninety seconds after
  // publishing — and a blog that looks routinely revised is what structured-data
  // spam looks like. Same gate as dateModified, so the line and the schema agree.
  const updatedDate = isMeaningfullyUpdated(post.publishedAt, post.updatedAt)
    ? formatDate(post.updatedAt)
    : ''
  const minutes = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 220))

  /**
   * Byline → About, over to the homepage rather than jumping by hash.
   *
   * Landing defers its scroll until fonts are ready and the route transition has
   * settled, so the section doesn't move under a stale measurement — which is the
   * whole reason `#about` is not scrolled from here directly. The href stays as
   * the real target so the link is a link without JS.
   */
  function goAbout(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault()
    navigate('/', { state: { scrollTo: 'about' } })
  }

  return (
    <main id="main" tabIndex={-1} className="section section-glow pt-32 md:pt-40">
      <div className="shell">
        <article className="mx-auto w-full max-w-3xl">
          <Reveal>
            <Link
              to="/blog"
              data-no-intercept
              className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-accent-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All writing
            </Link>
          </Reveal>

          <Reveal>
            <span className="chip mb-5 inline-block px-3 py-1.5 text-xs uppercase tracking-[0.2em]">
              {post.category || 'Notes'}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-text-primary md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 text-sm text-muted">
              <span>
                By{' '}
                <a
                  href="/#about"
                  data-no-intercept
                  onClick={goAbout}
                  className="text-text-primary transition-colors duration-300 hover:text-accent-ink"
                >
                  Rachit Sharma
                </a>
              </span>
              {date ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <time dateTime={post.publishedAt ?? undefined}>{date}</time>
                </>
              ) : null}
              {updatedDate ? (
                <>
                  <span aria-hidden="true"> · </span>
                  Updated <time dateTime={post.updatedAt ?? undefined}>{updatedDate}</time>
                </>
              ) : null}
              <span aria-hidden="true"> · </span>
              {minutes} min read
            </p>
          </Reveal>

          {/* Standfirst: the same line that appears on the card and in the meta
              description, so the page opens with a sentence rather than the
              first line of the body. */}
          {post.excerpt ? (
            <Reveal>
              <p className="mt-8 max-w-2xl font-display text-xl italic leading-relaxed text-text-primary md:text-2xl">
                {post.excerpt}
              </p>
            </Reveal>
          ) : null}

          {post.coverImageUrl ? (
            <Reveal>
              <img
                src={post.coverImageUrl}
                alt={post.title}
                width={1280}
                height={630}
                className="mt-10 aspect-[1200/630] w-full rounded-card border border-stroke object-cover"
              />
            </Reveal>
          ) : null}

          <Reveal>
            <div className="mt-12">
              <RichText html={renderMarkdown(post.content)} />
            </div>
          </Reveal>

          <Reveal>
            <footer className="mt-16 border-t border-stroke pt-8">
              <p className="text-base text-muted">
                If this was useful and you want more like it, I&rsquo;m{' '}
                <a
                  href={`mailto:${PERSONAL.email}`}
                  className="text-accent-ink underline decoration-accent/40 underline-offset-4"
                >
                  one email away
                </a>
                .
              </p>
              <Link
                to="/blog"
                data-no-intercept
                className="pill mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to the Journal
              </Link>
            </footer>
          </Reveal>
        </article>
      </div>
    </main>
  )
}
