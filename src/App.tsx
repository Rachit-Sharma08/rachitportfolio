import { useEffect } from 'react'
import { BrowserRouter, useLocation, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import Landing from './pages/Landing'
import Resume from './pages/Resume'
import NotFound from './pages/NotFound'
import Grain from './components/Grain'
import CursorGlow from './components/CursorGlow'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import { initAnchorLinks, setLenis } from './lib/lenis'
import { startKeepAlive } from './lib/keepalive'
import { titleForPath } from './lib/seo'
import { easeExpo } from './lib/motion'

function AnimatedRoutes() {
  const location = useLocation()

  // Keep <title> in sync with client-side navigation — the pre-rendered HTML
  // only carries the title of the initially loaded route.
  useEffect(() => {
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export function AppContent() {
  useEffect(() => {
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
  }, [])

  return (
    <>
      <a
        href="#main"
        data-no-intercept
        className="skip-link"
      >
        Skip to content
      </a>
      <Grain />
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <AnimatedRoutes />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
