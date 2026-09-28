import { motion, useReducedMotion } from 'framer-motion'
import Footer from './Footer'
import Magnetic from './Magnetic'
import RevealHeading from './RevealHeading'
import Marquee from './Marquee'
import { PERSONAL } from '../data'
import { easeExpo, REDUCED_DURATION, REVEAL_Y } from '../lib/motion'

export default function Contact() {
  const reduce = useReducedMotion()

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
          <motion.div
            className="eyebrow eyebrow-center mb-8"
            initial={{ opacity: 0, y: reduce ? 0 : REVEAL_Y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
            transition={{
              duration: reduce ? REDUCED_DURATION : 0.8,
              ease: easeExpo(),
            }}
          >
            Contact
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : REVEAL_Y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
            transition={{
              duration: reduce ? REDUCED_DURATION : 0.9,
              ease: easeExpo(),
              delay: reduce ? 0 : 0.35,
            }}
          >
            {/* One soft breath as it comes into view, then stillness for good.
                A keyframe array under `whileInView` with `once: true` plays a
                single pass and holds, so it never loops. The pulse is
                deliberately tiny (1.5%) — any more and a CTA that sits on
                screen permanently starts to nag. */}
            <motion.div
              whileInView={reduce ? undefined : { scale: [1, 1.015, 1] }}
              viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
              transition={{ duration: 1.2, ease: easeExpo() }}
            >
              <Magnetic strength={0.35}>
                <a
                  href={`mailto:${PERSONAL.email}`}
                  className="pill pill-primary border-gradient-ring px-8 py-4 text-sm md:text-base"
                >
                  {PERSONAL.email}
                  <span className="inline-block">↗</span>
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-muted"
            initial={{ opacity: 0, y: reduce ? 0 : REVEAL_Y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
            transition={{
              duration: reduce ? REDUCED_DURATION : 0.8,
              ease: easeExpo(),
              delay: reduce ? 0 : 0.45,
            }}
          >
            or call me on{' '}
            <a
              href={PERSONAL.phoneHref}
              className="text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
            >
              {PERSONAL.phone}
            </a>
          </motion.p>
        </div>

        <Footer />
      </div>
    </section>
  )
}
