import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LOADING_WORDS } from '../data'

interface LoadingScreenProps {
  onComplete: () => void
}

const DURATION = 2700
const EASE = [0.16, 1, 0.3, 1] as const

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [count, setCount] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    let rafId: number
    const start = performance.now()

    const tick = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * 100))

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick)
      } else if (!doneRef.current) {
        doneRef.current = true
        window.setTimeout(onComplete, 400)
      }
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [onComplete])

  useEffect(() => {
    const interval = window.setInterval(
      () => setWordIndex((i) => (i + 1) % LOADING_WORDS.length),
      900,
    )
    return () => window.clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-bg"
      initial={false}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <motion.span
        className="absolute left-6 top-6 text-xs uppercase tracking-[0.3em] text-muted md:left-10 md:top-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
      >
        Portfolio
      </motion.span>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="block font-display text-4xl italic text-accent-ink md:text-6xl lg:text-7xl"
            >
              {LOADING_WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <motion.p
        className="absolute bottom-10 right-6 text-5xl font-extrabold tracking-[-0.04em] text-text-primary tabular-nums md:right-10 md:text-8xl lg:text-9xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
      >
        {String(count).padStart(3, '0')}
      </motion.p>

      <div className="absolute bottom-6 left-6 right-6 h-[3px] bg-stroke/50 md:left-10 md:right-10">
        <div
          className="h-full accent-gradient"
          style={{
            transform: `scaleX(${count / 100})`,
            transformOrigin: 'left',
            boxShadow: '0 0 8px rgba(214, 46, 74, 0.45)',
          }}
        />
      </div>
    </motion.div>
  )
}