import type { ReactNode } from 'react'
import Footer from '../components/Footer'
import RevealHeading from '../components/RevealHeading'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { PERSONAL } from '../data'
import { useSiteContent } from '../lib/content'

export default function Resume(): ReactNode {
  const { resume } = useSiteContent()
  const { education } = resume
  // A section vanishes only when the admin cleared it on purpose (empty array)
  // or left both its fields blank — the bundled copy never is, so the
  // pre-rendered page still shows all three.
  const hasEducation = Boolean(education.title || education.period)
  const hasSkills = resume.skills.length > 0
  const hasProjects = resume.projects.length > 0

  return (
    <main id="main" tabIndex={-1} className="section section-glow min-h-screen bg-bg">
      <div className="shell">
        <div className="shell-inner">
          <Reveal>
            <p className="eyebrow mb-5">Resume</p>
            <RevealHeading
              as="h1"
              id="resume-heading"
              segments={[
                { text: 'Rachit ' },
                { text: 'Sharma', italic: true },
              ]}
              className="text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary md:text-7xl"
            />
            <p className="mt-6 text-sm text-muted md:text-base">{resume.subtitle}</p>
            <a
              href={`mailto:${PERSONAL.email}`}
              className="mt-4 inline-block text-sm text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
            >
              {PERSONAL.email}
            </a>
            <span className="mx-3 text-muted">·</span>
            <a
              href={PERSONAL.phoneHref}
              className="inline-block text-sm text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
            >
              {PERSONAL.phone}
            </a>
          </Reveal>

          <div className="mt-16 flex flex-col gap-14 md:mt-20">
            {hasEducation ? (
              <Reveal delay={0.08}>
                <h2 id="education-heading" className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
                  Education
                </h2>
                <div className="border-l border-stroke pl-6">
                  <div className="flex flex-col gap-1 pb-8">
                    <p className="text-base font-medium text-text-primary">
                      {education.title}
                    </p>
                    <p className="text-sm text-muted">{education.period}</p>
                  </div>
                </div>
              </Reveal>
            ) : null}

            {hasSkills ? (
              <Reveal delay={0.14}>
                <h2 id="skills-heading" className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
                  Skills
                </h2>
                <RevealGroup className="flex flex-wrap gap-2.5" stagger={0.05}>
                  {resume.skills.map((skill) => (
                    <RevealItem key={skill}>
                      <span className="chip px-4 py-2 text-sm text-text-primary">
                        {skill}
                      </span>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </Reveal>
            ) : null}

            {hasProjects ? (
              <Reveal delay={0.2}>
                <h2 id="projects-heading" className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
                  Projects
                </h2>
                <RevealGroup className="space-y-6 border-l border-stroke pl-6" stagger={0.08}>
                  {resume.projects.map((project) => (
                    <RevealItem key={project.title}>
                      <div>
                        <h3 className="text-base font-medium text-text-primary">
                          {project.title}
                        </h3>
                        <p className="mt-1 max-w-xl text-base text-muted">{project.desc}</p>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </Reveal>
            ) : null}
          </div>

          <div className="mt-20">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  )
}