import type { ReactNode } from 'react'
import Footer from '../components/Footer'
import RevealHeading from '../components/RevealHeading'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { PERSONAL } from '../data'
import { useSiteContent } from '../lib/content'

export const RESUME_PDF = '/Rachit-Sharma-Resume.pdf'

export default function Resume(): ReactNode {
  const { resume } = useSiteContent()
  // A section vanishes only when the admin cleared it on purpose (empty array) —
  // the bundled copy never is, so the pre-rendered page still shows all three.
  const hasEducation = resume.education.length > 0
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
                { text: ' — Resume' },
              ]}
              className="text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary md:text-7xl"
            />
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
              {resume.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
              <a
                href={`mailto:${PERSONAL.email}`}
                className="text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
              >
                {PERSONAL.email}
              </a>
              <span>·</span>
              <span>Last updated · {resume.lastUpdated}</span>
            </div>
            <a
              href={RESUME_PDF}
              download
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 px-5 py-2.5 text-sm text-accent-ink transition-colors duration-300 hover:border-accent hover:bg-accent-soft"
            >
              Download resume (PDF)
              <span className="inline-block">↗</span>
            </a>
          </Reveal>

          <div className="mt-16 flex flex-col gap-14 md:mt-20">
            {hasEducation ? (
              <Reveal delay={0.08}>
                <h2 id="education-heading" className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
                  Education
                </h2>
                <div className="border-l border-stroke pl-6">
                  <div className="flex flex-col gap-8">
                    {resume.education.map((entry) => (
                      <div key={entry.title + entry.period}>
                        <h3 className="text-base font-medium text-text-primary">
                          {entry.title}
                        </h3>
                        {entry.institution ? (
                          <p className="mt-0.5 text-sm text-muted">{entry.institution}</p>
                        ) : null}
                        <p className="mt-0.5 text-sm text-muted">{entry.period}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}

            {hasSkills ? (
              <Reveal delay={0.14}>
                <h2 id="skills-heading" className="mb-5 text-2xl font-extrabold tracking-[-0.03em] text-text-primary md:text-3xl">
                  Skills
                </h2>
                <div className="flex flex-col gap-7">
                  {resume.skills.map((group) => (
                    <div key={group.heading}>
                      <h3 className="mb-3 text-sm font-semibold tracking-[0.08em] text-muted uppercase">
                        {group.heading}
                      </h3>
                      <RevealGroup className="flex flex-wrap gap-2.5" stagger={0.04}>
                        {group.items.map((skill) => (
                          <RevealItem key={skill}>
                            <span className="chip px-4 py-2 text-sm text-text-primary">
                              {skill}
                            </span>
                          </RevealItem>
                        ))}
                      </RevealGroup>
                    </div>
                  ))}
                </div>
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
                          {project.url ? (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
                            >
                              {project.title} <span className="inline-block">↗</span>
                            </a>
                          ) : (
                            project.title
                          )}
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