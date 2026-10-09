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

interface SkillDraft {
  heading: string
  items: string
}

interface EducationDraft {
  title: string
  institution: string
  period: string
}

interface ProjectDraft {
  title: string
  url: string
  desc: string
}

interface Draft {
  summary: string
  skills: SkillDraft[]
  education: EducationDraft[]
  projects: ProjectDraft[]
  lastUpdated: string
}

const toDraft = (resume: ResumeData): Draft => ({
  summary: resume.summary,
  skills: resume.skills.map((group) => ({
    heading: group.heading,
    items: group.items.join('\n'),
  })),
  education: resume.education.map((entry) => ({
    title: entry.title,
    institution: entry.institution,
    period: entry.period,
  })),
  projects: resume.projects.map((project) => ({
    title: project.title,
    url: project.url ?? '',
    desc: project.desc,
  })),
  lastUpdated: resume.lastUpdated,
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
        summary: draft.summary.trim(),
        skills: draft.skills
          .map((group) => ({
            heading: group.heading.trim(),
            items: group.items
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean),
          }))
          .filter((group) => group.heading || group.items.length > 0),
        education: draft.education
          .map((entry) => ({
            title: entry.title.trim(),
            institution: entry.institution.trim(),
            period: entry.period.trim(),
          }))
          .filter((entry) => entry.title || entry.institution || entry.period),
        projects: draft.projects
          .map((project) => ({
            title: project.title.trim(),
            url: project.url.trim() || undefined,
            desc: project.desc.trim(),
          }))
          .filter((project) => project.title || project.desc),
        lastUpdated: draft.lastUpdated.trim(),
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

  const patchAt = (
    key: 'skills' | 'education' | 'projects',
    index: number,
    part: Partial<SkillDraft> | Partial<EducationDraft> | Partial<ProjectDraft>,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev
      const rows = [...prev[key]]
      const row = rows[index] as SkillDraft | EducationDraft | ProjectDraft
      rows[index] = {
        ...row,
        ...part,
      } as SkillDraft & EducationDraft & ProjectDraft
      return { ...prev, [key]: rows } as Draft
    })
    setState('idle')
  }

  const addAt = (key: 'skills' | 'education' | 'projects') => {
    setDraft((prev) => {
      if (!prev) return prev
      const empty =
        key === 'skills'
          ? { heading: '', items: '' }
          : key === 'education'
            ? { title: '', institution: '', period: '' }
            : { title: '', url: '', desc: '' }
      return { ...prev, [key]: [...prev[key], empty] } as Draft
    })
    setState('idle')
  }

  const removeAt = (key: 'skills' | 'education' | 'projects', index: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      const rows = prev[key].filter((_, i) => i !== index)
      return { ...prev, [key]: rows } as Draft
    })
    setState('idle')
  }

  return (
    <AdminLayout
      title="Resume"
      subtitle="Everything the Resume page shows. Skill items: one per line. Projects: title, link (optional) + description."
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
            title="Summary"
            description="The paragraph under your name on the Resume page."
            action={
              <Button variant="primary" loading={busy} onClick={() => void save()}>
                Save resume
              </Button>
            }
          >
            <TextArea
              label="Summary"
              rows={5}
              value={draft.summary}
              onChange={(e) => patch({ summary: e.target.value })}
            />
            <p className="mt-3 text-xs text-muted">
              {draft.summary.length} characters
            </p>
          </AdminPanel>

          <AdminPanel
            title="Skills"
            description="Group + items (one per line) each. Empty rows are dropped on save; clearing a whole group hides it from the page."
            action={
              <Button onClick={() => addAt('skills')} className="border-accent/40 text-accent-ink">
                Add group
              </Button>
            }
          >
            <div className="flex flex-col gap-6">
              {draft.skills.length === 0 ? (
                <p className="text-sm text-muted">
                  No skill groups yet — add one to show something here.
                </p>
              ) : (
                draft.skills.map((group, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-2xl border border-stroke p-4">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <TextField
                          label={`Group ${index + 1} — heading`}
                          value={group.heading}
                          onChange={(e) => patchAt('skills', index, { heading: e.target.value })}
                        />
                      </div>
                      <Button variant="danger" onClick={() => removeAt('skills', index)}>
                        Remove
                      </Button>
                    </div>
                    <TextArea
                      label="Items (one per line)"
                      rows={4}
                      value={group.items}
                      placeholder={'SEO\nAEO\nStructured data'}
                      onChange={(e) => patchAt('skills', index, { items: e.target.value })}
                    />
                  </div>
                ))
              )}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Education"
            description="Title, institution and period each. Empty rows are dropped on save."
            action={
              <Button onClick={() => addAt('education')} className="border-accent/40 text-accent-ink">
                Add entry
              </Button>
            }
          >
            <div className="flex flex-col gap-6">
              {draft.education.length === 0 ? (
                <p className="text-sm text-muted">
                  No education entries yet — add one to show something here.
                </p>
              ) : (
                draft.education.map((entry, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-2xl border border-stroke p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <TextField
                        label="Title"
                        value={entry.title}
                        onChange={(e) => patchAt('education', index, { title: e.target.value })}
                      />
                      <TextField
                        label="Institution"
                        value={entry.institution}
                        onChange={(e) => patchAt('education', index, { institution: e.target.value })}
                      />
                      <TextField
                        label="Period"
                        value={entry.period}
                        onChange={(e) => patchAt('education', index, { period: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="danger" onClick={() => removeAt('education', index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Projects"
            description="Title, optional link and description each. Empty rows are dropped on save."
            action={
              <Button onClick={() => addAt('projects')} className="border-accent/40 text-accent-ink">
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
                    <div className="grid gap-3 md:grid-cols-2">
                      <TextField
                        label={`Project ${index + 1} — title`}
                        value={project.title}
                        onChange={(e) => patchAt('projects', index, { title: e.target.value })}
                      />
                      <TextField
                        label="Link (optional)"
                        value={project.url}
                        onChange={(e) => patchAt('projects', index, { url: e.target.value })}
                      />
                    </div>
                    <TextArea
                      label="Description"
                      rows={3}
                      value={project.desc}
                      onChange={(e) => patchAt('projects', index, { desc: e.target.value })}
                    />
                    <div className="flex justify-end">
                      <Button variant="danger" onClick={() => removeAt('projects', index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Last updated"
            description="Shown on the page next to your email — a month and year."
          >
            <TextField
              label="Last updated"
              value={draft.lastUpdated}
              onChange={(e) => patch({ lastUpdated: e.target.value })}
            />
          </AdminPanel>
        </>
      ) : null}
    </AdminLayout>
  )
}