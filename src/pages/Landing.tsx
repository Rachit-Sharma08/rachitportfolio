import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import SelectedWork from '../components/SelectedWork'
import Journal from '../components/Journal'
import About from '../components/About'
import Capabilities from '../components/Capabilities'
import Vision from '../components/Vision'
import Stats from '../components/Stats'
import EnquiryForm from '../components/EnquiryForm'
import Contact from '../components/Contact'
import { SOCIALS } from '../data'
import { scrollToSection, scrollToTop } from '../lib/lenis'

interface LandingProps {
  ready?: boolean
}

export default function Landing({ ready = true }: LandingProps) {
  const location = useLocation()

  useEffect(() => {
    const targetId = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (targetId && location.pathname === '/') {
      const timeout = window.setTimeout(() => {
        scrollToSection(targetId)
      }, 100)
      return () => window.clearTimeout(timeout)
    }
    scrollToTop()
  }, [location])

  return (
    <main>
      <Hero ready={ready} />
      <About />
      <Capabilities />
      <SelectedWork />
      <Vision />
      <Journal
        action={
          <a
            href={SOCIALS.github}
            target="_blank"
            rel="noreferrer"
            className="pill border-gradient-ring hidden px-6 py-3 text-sm transition-transform duration-500 hover:scale-105 md:inline-flex"
          >
            View all ↗
          </a>
        }
      />
      <Stats />
      <EnquiryForm />
      <Contact />
    </main>
  )
}