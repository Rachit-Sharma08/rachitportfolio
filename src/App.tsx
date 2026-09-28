import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter, useLocation, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import Landing from './pages/Landing'
import Resume from './pages/Resume'
import LoadingScreen from './components/LoadingScreen'
import Grain from './components/Grain'
import CursorGlow from './components/CursorGlow'
import Navbar from './components/Navbar'
import { setLenis } from './lib/lenis'
import { startKeepAlive } from './lib/keepalive'

const EASE = [0.16, 1, 0.3, 1] as const

function AnimatedRoutes({ ready }: { ready: boolean }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing ready={ready} />} />
          <Route path="/resume" element={<Resume />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

interface AppContentProps {
  skipLoading?: boolean
}

export function AppContent({ skipLoading = false }: AppContentProps) {
  const [isLoading, setIsLoading] = useState(() => (skipLoading ? false : true))

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
    })
    setLenis(lenis)
    const stopKeepAlive = startKeepAlive()
    return () => {
      stopKeepAlive?.()
      setLenis(null)
      lenis.destroy()
    }
  }, [])

  const onComplete = useCallback(() => setIsLoading(false), [])

  return (
    <>
      <Grain />
      <CursorGlow />
      <Navbar />

      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={onComplete} />}
      </AnimatePresence>

      <AnimatedRoutes ready={!isLoading} />
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