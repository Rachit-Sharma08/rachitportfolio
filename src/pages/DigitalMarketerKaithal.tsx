import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '../components/Reveal'
import Footer from '../components/Footer'
import { renderInline } from '../lib/markdown'
import { DEFINITION, PERSONAL, QUICK_FACTS, SOCIALS } from '../data'

/**
 * The local landing page. It exists for one intent the home page only answers in
 * passing: someone searching for a digital marketer in Kaithal. Every claim here
 * is one the rest of the site already makes (the Google Ads / Meta Ads / SEO
 * skills on the resume, the projects in Selected Work), so a crawler reading
 * this page and the resume sees the same person, not two.
 */

const SERVICES = [
  {
    title: 'Google Ads',
    body: 'Search and performance campaigns: keyword and intent research, ad copy, landing page checks, and reporting that shows what the spend returned.',
  },
  {
    title: 'Meta Ads',
    body: 'Facebook and Instagram campaigns: audience setup, creative variants, and testing that finds the version people actually respond to.',
  },
  {
    title: 'SEO, AEO and GEO',
    body: 'On-page SEO, structured data, llms.txt and content written so a business can be found on Google and quoted in AI answers.',
  },
  {
    title: 'Web development',
    body: 'React, TypeScript and Vite sites that load fast, work on a phone, and are built to be found from the first line of HTML.',
  },
]

// The questions a local visitor actually asks, taken from the same canonical
// list the home page shows so the two pages cannot answer differently. The
// definition and the contact answer stay on the home page: repeating them here
// would be the same paragraph twice, and this page has its own contact block.
const LOCAL_FACTS = [QUICK_FACTS[1], QUICK_FACTS[2], QUICK_FACTS[5]]

export default function DigitalMarketerKaithal() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="section section-glow pt-32 md:pt-40" aria-labelledby="kaithal-heading">
        <div className="shell">
          <div className="shell-inner">
            <Reveal>
              <p className="eyebrow mb-5">Kaithal, Haryana</p>
              <h1
                id="kaithal-heading"
                className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-text-primary md:text-5xl lg:text-6xl"
              >
                Digital marketer in{' '}
                <span className="font-display italic text-accent-ink">Kaithal</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
                {DEFINITION}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                The projects and AI builds on this site are my own work. The same
                approach — plan it, measure it, explain what it returned — is what I would
                bring to a business in or around Kaithal.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${PERSONAL.email}`}
                  className="pill pill-primary border-gradient-ring nav-hit px-6 py-3 text-sm"
                >
                  Email me
                </a>
                <Link to="/resume" className="pill nav-hit px-6 py-3 text-sm">
                  See the resume
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section bg-bg" aria-labelledby="kaithal-services-heading">
        <div className="shell">
          <div className="shell-inner">
            <Reveal>
              <h2
                id="kaithal-services-heading"
                className="text-2xl font-extrabold tracking-[-0.02em] text-text-primary md:text-3xl"
              >
                What can I do for a business in Kaithal?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                Four things: Google Ads, Meta Ads, search visibility (SEO, AEO and GEO),
                and the website the traffic lands on.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {SERVICES.map((service, index) => (
                <Reveal key={service.title} delay={0.05 + index * 0.05}>
                  <div className="glass lift h-full p-6">
                    <h3 className="text-base font-semibold text-text-primary">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{service.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-bg" aria-labelledby="kaithal-work-heading">
        <div className="shell">
          <div className="shell-inner">
            <Reveal>
              <h2
                id="kaithal-work-heading"
                className="text-2xl font-extrabold tracking-[-0.02em] text-text-primary md:text-3xl"
              >
                Can I see your work?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                Yes. Every build in the portfolio has public code on GitHub, so you can
                read it before you trust it. Nothing there is a mockup. I am based in
                Kaithal and work remotely.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/" state={{ scrollTo: 'work' }} className="pill nav-hit px-5 py-2.5 text-sm">
                  See selected work
                </Link>
                <a
                  href={SOCIALS.github}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="chip nav-hit px-5 py-2.5 text-sm"
                >
                  GitHub
                  <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section bg-bg" aria-labelledby="kaithal-facts-heading">
        <div className="shell">
          <div className="shell-inner">
            <Reveal>
              <h2
                id="kaithal-facts-heading"
                className="text-2xl font-extrabold tracking-[-0.02em] text-text-primary md:text-3xl"
              >
                Quick answers
              </h2>
            </Reveal>
            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              {LOCAL_FACTS.map((fact, index) => (
                <Reveal
                  key={fact.q}
                  delay={0.05 + index * 0.05}
                  className="glass lift h-full p-6"
                >
                  <dt className="text-sm font-semibold text-text-primary">{fact.q}</dt>
                  <dd
                    className="mt-2 text-sm leading-relaxed text-muted"
                    dangerouslySetInnerHTML={{ __html: renderInline(fact.a) }}
                  />
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section bg-bg" aria-labelledby="kaithal-contact-heading">
        <div className="shell">
          <div className="shell-inner">
            <Reveal>
              <h2
                id="kaithal-contact-heading"
                className="text-2xl font-extrabold tracking-[-0.02em] text-text-primary md:text-3xl"
              >
                Get in touch
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                The fastest way to reach me is email. Tell me what you are trying to sell,
                who you want to reach, and what you have tried so far.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`mailto:${PERSONAL.email}`}
                  className="pill pill-primary border-gradient-ring nav-hit max-w-full break-all px-6 py-3 text-sm"
                >
                  {PERSONAL.email}
                </a>
                <Link to="/" className="pill nav-hit px-6 py-3 text-sm">
                  Back to the portfolio
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Same footer the home and resume pages show, in the same shell. */}
      <div className="shell pb-4">
        <div className="shell-inner">
          <Footer />
        </div>
      </div>
    </main>
  )
}
