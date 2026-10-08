import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import AdminLayout from './AdminLayout'
import {
  AdminPanel,
  Button,
  Status,
  TextArea,
  TextField,
} from '../../components/admin/Fields'
import { getSettings, requestRebuild, saveResume } from '../../lib/adminApi'
import { parseResume } from '../../lib/content'
import { RESUME } from '../../data'
import type { ResumeData } from '../../data'

interface Draft {
  subtitle: string
  educationTitle: string
  educationPeriod: string
  skills: string
  projects: { title: string; desc: string }[]
}

const toDraft = (resume: ResumeData): Draft => ({
  subtitle: resume.subtitle,
  educationTitle: resume.education.title,
  educationPeriod: resume.education.period,
  skills: resume.skills.join('\n'),
  projects: resume.projects.map((project) => ({
    title: project.title,
    desc: project.desc,
  })),
})

export default function AdminResume(): ReactNode {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const settings = await getSettings()
        if (cancelled) return
        setDraft(toDraft(parseResume(settings.resume, RESUME)))
      } catch {
        if (!cancelled) setDraft(toDraft(RESUME))
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const save = async () => {
    if (!draft) return
    setBusy(true)
    setState('idle')
    try {
      const resume: ResumeData = {
        subtitle: draft.subtitle.trim(),
        education: {
          title: draft.educationTitle.trim(),
          period: draft.educationPeriod.trim(),
        },
        skills: draft.skills
          .split('\n')
          .map((skill) => skill.trim())
          .filter(Boolean),
        projects: draft.projects
          .map((project) => ({
            title: project.title.trim(),
            desc: project.desc.trim(),
          }))
          .filter((project) => project.title || project.desc),
      }
      await saveResume(resume)
      setState('ok')
      setMessage('Resume saved. The page is rebuilding so the new copy gets baked in.')
      void requestRebuild()
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const patch = (part: Partial<Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...part } : prev))
    setState('idle')
  }

  const patchProject = (index: number, part: { title?: string; desc?: string }) => {
    setDraft((prev) => {
      if (!prev) return prev
      const projects = prev.projects.map((project, i) =>
        i === index ? { ...project, ...part } : project,
      )
      return { ...prev, projects }
    })
    setState('idle')
  }

  const addProject = () => {
    setDraft((prev) => (prev ? { ...prev, projects: [...prev.projects, { title: '', desc: '' }] } : prev))
    setState('idle')
  }

  const removeProject = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      const projects = prev.projects.filter((_, i) => i !== index)
      return { ...prev, projects }
    })
    setState('idle')
  }

  return (
    <AdminLayout
      title="Resume"
      subtitle="Everything the Resume page shows. Skills: one per line. Projects: title + description each."
    >
      <Status state={state} message={message} />

      {!loaded ? (
        <AdminPanel title="Loading">
          <p className="text-sm text-muted">Fetching the current resume…</p>
        </AdminPanel>
      ) : null}

      {draft ? (
        <>
          <AdminPanel
            title="Introduction"
            description="The line under your name on the Resume page."
            action={
              <Button variant="primary" loading={busy} onClick={() => void save()}>
                Save resume
              </Button>
            }
          >
            <TextField
              label="Tagline"
              value={draft.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
            />
            <p className="mt-3 text-xs text-muted">
              {draft.subtitle.length} characters
            </p>
          </AdminPanel>

          <AdminPanel
            title="Education"
            description="One course — change the fields to show another."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="Course"
                value={draft.educationTitle}
                onChange={(e) => patch({ educationTitle: e.target.value })}
              />
              <TextField
                label="Period"
                value={draft.educationPeriod}
                onChange={(e) => patch({ educationPeriod: e.target.value })}
              />
            </div>
          </AdminPanel>

          <AdminPanel
            title="Skills"
            description="One per line — like the chips on the page."
          >
            <TextArea
              label="Skills"
              rows={8}
              value={draft.skills}
              placeholder={'Social Media Marketing\nSEO & Content'}
              onChange={(e) => patch({ skills: e.target.value })}
            />
          </AdminPanel>

          <AdminPanel
            title="Projects"
            description="Title + description each. Empty rows are dropped on save."
            action={
              <Button onClick={addProject} className="border-accent/40 text-accent-ink">
                Add project
              </Button>
            }
          >
            <div className="flex flex-col gap-6">
              {draft.projects.length === 0 ? (
                <p className="text-sm text-muted">
                  No projects yet — add one to show something here.
                </p>
              ) : (
                draft.projects.map((project, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-2xl border border-stroke p-4">
                    <TextField
                      label={`Project ${index + 1} — title`}
                      value={project.title}
                      onChange={(e) => patchProject(index, { title: e.target.value })}
                    />
                    <TextArea
                      label="Description"
                      rows={3}
                      value={project.desc}
                      onChange={(e) => patchProject(index, { desc: e.target.value })}
                    />
                    <div className="flex justify-end">
                      <Button variant="danger" onClick={() => removeProject(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminPanel>
        </>
      ) : null}
    </AdminLayout>
  )
}