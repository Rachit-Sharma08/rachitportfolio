import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { NAV_LINKS } from '../data'
import Magnetic from './Magnetic'
import { easeExpo, REDUCED_DURATION } from '../lib/motion'
import { scrollToSection, scrollToTop } from '../lib/lenis'

/** Pixels of travel that must be exceeded before the direction flips. */
const DIRECTION_THRESHOLD = 6

/** Below this the navbar stays put — it must not flicker at the top of the page. */
const REVEAL_ALWAYS_BELOW = 140

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const location = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()

  useEffect(() => {
    let last = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 100)

      if (y > REVEAL_ALWAYS_BELOW && y > last + DIRECTION_THRESHOLD) {
        setHidden(true)
      } else if (y < last - DIRECTION_THRESHOLD) {
        setHidden(false)
      }
      last = y
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/') return
    const sections = NAV_LINKS.filter((l) => !l.route).map((l) =>
      document.getElementById(l.target),
    )
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [location.pathname])

  const active = location.pathname === '/' ? activeSection : ''

  const goTo = (target: string, route?: string) => {
    if (route) {
      navigate(route)
      return
    }
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: target } })
      return
    }
    // During the route enter transition the sections aren't mounted yet, so a
    // same-page click would find no target. Defer to the Landing queued scroll
    // by forwarding the target through router state (replace keeps history).
    if (!document.getElementById(target)) {
      navigate('/', { replace: true, state: { scrollTo: target } })
      return
    }
    scrollToSection(target)
  }

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6"
      // Hides on the way down to hand the screen back to the content, comes
      // straight back the instant the user scrolls up — the gesture people
      // expect from a nav on a long page.
      initial={false}
      animate={{ y: hidden && !reduce ? '-130%' : '0%' }}
      transition={{
        duration: reduce ? REDUCED_DURATION : 0.5,
        ease: easeExpo(),
      }}
    >
      <nav
        className={`inline-flex max-w-[calc(100vw-2rem)] items-center overflow-x-auto rounded-full border border-stroke bg-bg/60 px-2 py-2 backdrop-blur-xl [scrollbar-width:none] transition-shadow duration-500 [&::-webkit-scrollbar]:hidden ${
          scrolled ? 'shadow-[0_18px_50px_-24px_rgba(214,46,74,0.55)]' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (location.pathname !== '/') navigate('/')
            else scrollToTop()
          }}
          className="group relative ml-1 mr-1 h-9 w-9 rounded-full transition-transform duration-300 hover:scale-110"
          aria-label="Rachit Sharma — home"
        >
          <span className="logo-ring absolute inset-0 rounded-full" />
          <span className="absolute inset-[1.5px] grid place-items-center rounded-full bg-bg">
            <span className="font-display text-[13px] italic text-text-primary">
              RS
            </span>
          </span>
        </button>

        <span className="mx-1 hidden h-5 w-px bg-stroke md:block" />

        <div className="flex items-center gap-1 md:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = link.route
              ? location.pathname === link.route
              : active === link.target
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => goTo(link.target, link.route)}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-full px-3 py-2 text-[13px] transition-colors duration-300 md:px-4 ${
                  isActive
                    ? 'bg-accent-soft text-text-primary'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </div>

        <span className="mx-1 hidden h-5 w-px bg-stroke md:block" />

        <div className="ml-1 mr-1 md:ml-2">
          <Magnetic strength={0.3}>
            <button
              type="button"
              onClick={() => goTo('contact', undefined)}
              className="pill pill-primary border-gradient-ring px-4 py-2 text-[13px] md:px-5"
            >
              Say hi <span className="inline-block">↗</span>
            </button>
          </Magnetic>
        </div>
      </nav>
    </motion.header>
  )
}
