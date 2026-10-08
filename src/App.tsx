import { Suspense, lazy, useEffect, useRef } from 'react'
import { BrowserRouter, useLocation, Routes, Route, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import Landing from './pages/Landing'
import Resume from './pages/Resume'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import NotFound from './pages/NotFound'
import Grain from './components/Grain'
import CursorGlow from './components/CursorGlow'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import { initAnchorLinks, setLenis } from './lib/lenis'
import { startKeepAlive } from './lib/keepalive'
import { setIndexable, setNoIndex, titleForPath } from './lib/seo'
import { easeExpo } from './lib/motion'
import { SiteContentProvider } from './lib/content'
import type { SiteContent } from './lib/content'

/**
 * The admin panel is code a visitor to the public site never runs, and it is
 * roughly a third of the main chunk, so it is split out.
 *
 * BlogPost is deliberately NOT lazy: renderToStaticMarkup cannot await a lazy
 * component, so a lazy post page pre-renders as its Suspense fallback — which
 * would ship "Loading…" to every crawler and defeat the whole point of
 * re-rendering on publish. It would also save nothing, because `marked` is
 * already in the main chunk for the About section's story copy.
 */
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminImages = lazy(() => import('./pages/admin/AdminImages'))
const AdminStory = lazy(() => import('./pages/admin/AdminStory'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'))
const AdminResume = lazy(() => import('./pages/admin/AdminResume'))
const AdminPassword = lazy(() => import('./pages/admin/AdminPassword'))

/** Shown for the fraction of a second a lazy route takes to arrive. */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <p className="text-sm text-muted">Loading…</p>
    </div>
  )
}

/**
 * The admin is a tool, not part of the site. It gets none of the public chrome
 * — no nav, no cursor glow, no grain, no scroll progress — and no page
 * transition, because those exist to sell the landing page rather than to help
 * with a form-heavy layout.
 */
function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

function AdminRoutes() {
  const location = useLocation()
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes location={location}>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/images" element={<AdminImages />} />
        <Route path="/admin/story" element={<AdminStory />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/resume" element={<AdminResume />} />
        <Route path="/admin/password" element={<AdminPassword />} />
        <Route path="*" element={<AdminNotFound />} />
      </Routes>
    </Suspense>
  )
}

function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">Admin</p>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-text-primary">
        No such page
      </h1>
      <Link to="/admin" className="pill pill-primary px-5 py-2.5 text-sm">
        Back to dashboard
      </Link>
    </div>
  )
}

function PublicRoutes() {
  const location = useLocation()

  // Keep <title> in sync with client-side navigation — the pre-rendered HTML
  // only carries the title of the initially loaded route. Blog pages are skipped
  // because they set their own title from the post data.
  useEffect(() => {
    if (location.pathname.startsWith('/blog')) return
    document.title = titleForPath(location.pathname)
  }, [location.pathname])

  return (
    // `initial={false}` suppresses the enter animation on the very first render
    // only — the page fade-in is handled in CSS instead. Beyond fixing that, it
    // matters for pre-rendering: framer would otherwise serialise
    // `style="opacity:0"` into the static HTML that ships to crawlers.
    // Subsequent route changes still transition.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.6, ease: easeExpo() }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function Shell() {
  const location = useLocation()
  const admin = isAdminPath(location.pathname)
  // Tracks whether the panel is the view we came from, so the effect below knows
  // if it is leaving admin (and owes the head its indexability back) or simply
  // sitting on a public route.
  const wasAdmin = useRef(false)

  useEffect(() => {
    // The admin panel is an ordinary scrolling page — no smooth-scroll hijack,
    // no anchor interception and no keep-alive pings for a contact form it never
    // renders. Scoping the effect to the public site also means switching between
    // the two tears the runtime down and rebuilds it, rather than leaking it.
    if (admin) return
    // lerp 0.1 keeps the glide long enough to feel smooth without the
    // rubber-band lag that a lower value produces on a trackpad.
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })
    setLenis(lenis)

    const stopAnchors = initAnchorLinks()
    const stopKeepAlive = startKeepAlive()

    return () => {
      stopAnchors()
      stopKeepAlive?.()
      setLenis(null)
      lenis.destroy()
    }
  }, [admin])

  useEffect(() => {
    if (!admin) {
      // Leaving the panel is a client-side navigation, so the noindex tag we set
      // on the way in is still in the head. Put it back, or the whole site
      // inherits it for the rest of the session.
      //
      // Only on the way out, though. This used to call setIndexable() on every
      // public render, which included a cold load of the 404 document — where it
      // overwrote that page's `noindex, nofollow` with `index, follow`, the exact
      // soft-404 the tag exists to prevent. Child effects run before parent
      // ones, so a page that sets noindex for itself cannot win a race with this.
      if (wasAdmin.current) setIndexable()
      wasAdmin.current = false
      return
    }
    wasAdmin.current = true
    document.title = 'Admin — Rachit Sharma'
    setNoIndex()
  }, [admin])

  if (admin) return <AdminRoutes />

  return (
    <>
      <a href="#main" data-no-intercept className="skip-link">
        Skip to content
      </a>
      <Grain />
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <PublicRoutes />
    </>
  )
}

export function AppContent({ initialContent }: { initialContent?: SiteContent } = {}) {
  return (
    <SiteContentProvider initial={initialContent}>
      <Shell />
    </SiteContentProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
