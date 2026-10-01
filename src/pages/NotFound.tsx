import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { setIndexable, setNoIndex } from '../lib/seo'

export default function NotFound() {
  // A 404 must be `noindex` in the HTML a crawler receives, which is why the
  // pre-rendered dist/404.html carries the tag. This covers the other half:
  // reaching an unknown URL through client-side navigation, where the static
  // head was never involved. Restored on the way out so a visitor who clicks
  // through to a real page does not carry `noindex` with them.
  useEffect(() => {
    setNoIndex()
    return () => setIndexable()
  }, [])

  return (
    <main
      id="main"
      tabIndex={-1}
      className="section section-glow flex min-h-screen flex-col items-center justify-center bg-bg text-center"
    >
      <div className="shell-inner">
        <p className="eyebrow eyebrow-center mb-6">404</p>
        <h1 className="text-5xl font-extrabold tracking-[-0.03em] text-text-primary md:text-6xl">
          Page not found
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base text-muted">
          This page doesn&rsquo;t exist. If you followed a link to a journal post,
          it has probably been unpublished &mdash; everything currently
          published is on the Journal page.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" data-no-intercept className="pill pill-primary px-8 py-3.5 text-sm">
            Back to home
          </Link>
          <Link
            to="/blog"
            data-no-intercept
            className="pill inline-flex items-center gap-2 px-6 py-3.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Journal
          </Link>
        </div>
      </div>
    </main>
  )
}
