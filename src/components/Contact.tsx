import Footer from './Footer'
import Magnetic from './Magnetic'
import RevealHeading from './RevealHeading'
import Marquee from './Marquee'
import { PERSONAL } from '../data'

export default function Contact() {
  return (
    <section
      id="contact"
      className="glow-section relative flex flex-col overflow-hidden pt-16 pb-8 md:pt-20 md:pb-12"
      style={{ minHeight: '100vh' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(120% 78% at 50% 8%, rgba(107, 18, 32, 0.55) 0%, rgba(42, 7, 17, 0.35) 42%, transparent 78%)',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <Marquee />

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <div className="eyebrow eyebrow-center mb-8">Contact</div>

          <RevealHeading
            as="h2"
            segments={[
              { text: "Let's " },
              { text: 'grow', italic: true },
              { text: ' something ' },
              { text: 'together', italic: true },
            ]}
            className="mb-10 text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
            delay={0.1}
          />

          <Magnetic strength={0.35}>
            <a
              href={`mailto:${PERSONAL.email}`}
              className="pill pill-primary border-gradient-ring px-8 py-4 text-sm transition-transform duration-500 hover:scale-105 md:text-base"
            >
              {PERSONAL.email}
              <span className="inline-block">↗</span>
            </a>
          </Magnetic>

          <p className="mt-6 text-sm text-muted">
            or call me on{' '}
            <a
              href={PERSONAL.phoneHref}
              className="text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
            >
              {PERSONAL.phone}
            </a>
          </p>
        </div>

        <Footer />
      </div>
    </section>
  )
}
