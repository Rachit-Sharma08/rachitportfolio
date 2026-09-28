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
import Magnetic from '../components/Magnetic'
import { SOCIALS } from '../data'
import { scrollToSection, scrollToTop, queueScroll } from '../lib/lenis'

export default function Landing() {
  const location = useLocation()

  useEffect(() => {
    const targetId = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (targetId && location.pathname === '/') {
      // The cross-route scroll can't fire on the first frame: the page is still
      // mid route-transition and the web fonts haven't swapped the headings
      // into their final width yet, so any measurement taken now is stale and
      // Lenis would lock onto a target that later moves (seen in QA as the
      // scroll holding ~296px short). Wait for fonts + the 600ms enter
      // transition to finish, then measure once.
      let cancelled = false
      const run = () => {
        if (cancelled) return
        scrollToSection(targetId)
      }
      const timer = window.setTimeout(() => {
        const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } })
          .fonts?.ready
        if (fonts) {
          fonts.then(() => requestAnimationFrame(run)).catch(run)
        } else {
          run()
        }
      }, 650)
      const cancel = () => {
        cancelled = true
        window.clearTimeout(timer)
      }
      return queueScroll(cancel)
    }
    scrollToTop()
  }, [location])

  return (
    <main>
      <Hero />
      <About />
      <Capabilities />
      <SelectedWork />
      <Vision />
      <Journal
        action={
          <Magnetic className="hidden md:inline-block">
            <a
              href={SOCIALS.github}
              target="_blank"
              rel="noreferrer"
              className="pill border-gradient-ring inline-flex px-6 py-3 text-sm"
            >
              View all ↗
            </a>
          </Magnetic>
        }
      />
      <Stats />
      <EnquiryForm />
      <Contact />
    </main>
  )
}