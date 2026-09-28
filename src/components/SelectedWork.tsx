import { Suspense, lazy, useEffect, useMemo, useRef } from 'react'
import type { Project } from '../data'
import { PROJECTS, SOCIALS } from '../data'
import WorksOverlay from './works/WorksOverlay'
import PanelClickLayer from './works/PanelClickLayer'
import ProjectDetailTransition from './works/ProjectDetailTransition'
import { useProjectTransition } from './works/useProjectTransition'
import type { PanelOpenEvent, PanelScreenRect } from './works/ProjectPanel'
import type { WorkProject } from './works/projectsData'
import { WORK_PROJECTS } from './works/projectsData'

type WorksSceneModule = typeof import('./works/WorksScene')
type WorksSceneComponent = WorksSceneModule['default']

const WorksScene = lazy<WorksSceneComponent>(() =>
  typeof window === 'undefined'
    ? Promise.resolve({ default: WorksFallback })
    : import('./works/WorksScene'),
)

function toProject(work: WorkProject): Project | undefined {
  const base = PROJECTS.find((p) => p.title === work.title)
  if (base) return base
  return { title: work.title, tag: work.tag, href: work.repoUrl, comingSoon: true, accent: work.accentTo, tagline: '', description: '', tech: [], aspect: '', span: '' }
}

function WorksFallback() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 px-6 sm:px-10">
      {WORK_PROJECTS.map((project) => (
        <div
          key={project.id}
          className="flex items-baseline justify-between gap-4 border-b border-stroke pb-3 pt-3"
        >
          <span className="text-2xl font-extrabold tracking-[-0.03em] text-text-primary sm:text-3xl">
            {project.title}
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted">
            {project.tag}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const screenRects = useMemo<PanelScreenRect[]>(
    () => WORK_PROJECTS.map(() => ({ x: 0, y: 0, w: 0, h: 0, visible: false })),
    [],
  )
  const { request, open, close } = useProjectTransition()

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const p = Math.max(
        0,
        Math.min(1, -el.getBoundingClientRect().top / total),
      )
      progressRef.current = p
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const onOpen = (work: WorkProject, point: PanelOpenEvent) => {
    const project = toProject(work)
    if (!project) return
    const size = Math.min(window.innerWidth, window.innerHeight) * (project.comingSoon ? 0.09 : 0.28)
    const rect = new DOMRect(point.x - size / 2, point.y - size / 2, size, size)
    open(project, rect)
  }

  return (
    <section id="work" className="section-glow relative h-[400vh] bg-bg" ref={sectionRef}>
      <div className="sticky top-0 h-screen overflow-hidden bg-bg">
        <div className="pointer-events-none absolute inset-x-0 top-6 z-30 flex items-start justify-between px-6 sm:px-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
              Selected Work
            </span>
            <span className="hidden h-px w-8 bg-stroke sm:block" />
            <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted/70 sm:block">
              04 Projects
            </span>
          </div>
          <a
            href={SOCIALS.github}
            target="_blank"
            rel="noreferrer"
            className="pill pointer-events-auto px-5 py-2 text-[11px] uppercase tracking-[0.2em]"
          >
            View all work ↗
          </a>
        </div>

        <div ref={blurRef} className="absolute inset-0">
          <Suspense fallback={<WorksFallback />}>
            <WorksScene
              progressRef={progressRef}
              blurEl={blurRef}
              projects={WORK_PROJECTS}
              screenRects={screenRects}
            />
          </Suspense>
        </div>

        <WorksOverlay progressRef={progressRef} projects={WORK_PROJECTS} />

        <PanelClickLayer
          projects={WORK_PROJECTS}
          rects={screenRects}
          onOpen={onOpen}
        />
      </div>

      {request && (
        <ProjectDetailTransition
          key={request.seq}
          project={request.project}
          originRect={request.originRect}
          onClose={close}
        />
      )}
    </section>
  )
}