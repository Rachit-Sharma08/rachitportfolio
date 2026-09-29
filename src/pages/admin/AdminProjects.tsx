import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ImagePlus, Pencil, Plus, X } from 'lucide-react'
import AdminLayout from './AdminLayout'
import {
  AdminPanel,
  Button,
  ConfirmButton,
  SelectField,
  Status,
  TextArea,
  TextField,
} from '../../components/admin/Fields'
import {
  deleteProject,
  listProjects,
  saveProject,
  uploadImage,
} from '../../lib/adminApi'
import type { ProjectDraft, ProjectRecord } from '../../lib/adminApi'
import { prepareImage } from '../../lib/imagePrep'

const EMPTY: ProjectDraft = {
  title: '',
  category: '',
  tagline: '',
  description: '',
  tech: [],
  image_url: null,
  project_url: '',
  accent: '#d62e4a',
  display_order: 0,
}

const ACCENTS = ['#d62e4a', '#a11f3c', '#7d6a70', '#e85a70', '#2a0711']

export default function AdminProjects() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState<ProjectRecord[]>([])
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY)
  const [open, setOpen] = useState(params.get('new') === '1')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setRows(await listProjects())
  }, [])

  useEffect(() => {
    void refresh().catch((error: unknown) => {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not load projects.')
    })
  }, [refresh])

  const startNew = () => {
    setDraft({ ...EMPTY, display_order: rows.length + 1 })
    setState('idle')
    setMessage('')
    setOpen(true)
    setParams({}, { replace: true })
  }

  const startEdit = (row: ProjectRecord) => {
    setDraft({
      id: row.id,
      title: row.title,
      category: row.category,
      tagline: row.tagline,
      description: row.description,
      tech: row.tech ?? [],
      image_url: row.image_url,
      project_url: row.project_url ?? '',
      accent: row.accent,
      display_order: row.display_order,
    })
    setState('idle')
    setMessage('')
    setOpen(true)
  }

  const submit = async () => {
    if (!draft.title.trim()) {
      setState('error')
      setMessage('A project needs a title.')
      return
    }
    setBusy(true)
    setState('idle')
    try {
      await saveProject(draft)
      await refresh()
      setState('ok')
      setMessage(draft.id ? 'Project updated.' : 'Project added.')
      if (!draft.id) setOpen(false)
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteProject(id)
      await refresh()
      setState('ok')
      setMessage('Project deleted.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not delete.')
    }
  }

  const pickImage = async (file: File) => {
    setUploading(true)
    setState('idle')
    try {
      const prepared = await prepareImage(file, 0.9)
      const url = await uploadImage(prepared.file, 'projects', prepared.file.name)
      setDraft((prev) => ({ ...prev, image_url: url }))
      setState('ok')
      setMessage('Image uploaded.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AdminLayout
      title="Projects"
      subtitle="These are the cards in the Selected Work section, in order. No redeploy needed — the site reads them on every load."
    >
      <Status state={state} message={message} />

      <AdminPanel
        title={draft.id ? 'Edit project' : 'Add a project'}
        action={
          <Button onClick={open ? () => setOpen(false) : startNew}>
            {open ? (
              <>
                <X className="h-4 w-4" aria-hidden="true" /> Close
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" /> New project
              </>
            )}
          </Button>
        }
      >
        {!open ? (
          <p className="text-sm text-muted">
            {rows.length} project{rows.length === 1 ? '' : 's'} live. Open one below to
            edit, or add a new one.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Fitness Website"
              />
              <TextField
                label="Category"
                hint="shows as the small tag"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="Web · Fitness"
              />
            </div>

            <TextField
              label="Tagline"
              hint="the one line under the title"
              value={draft.tagline}
              onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
            />

            <TextArea
              label="Description"
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Project URL"
                hint="leave empty for Coming soon"
                type="url"
                value={draft.project_url ?? ''}
                onChange={(e) => setDraft({ ...draft, project_url: e.target.value })}
                placeholder="https://github.com/…"
              />
              <TextField
                label="Display order"
                hint="1 = first"
                type="number"
                min={0}
                value={String(draft.display_order)}
                onChange={(e) =>
                  setDraft({ ...draft, display_order: Number(e.target.value) })
                }
              />
            </div>

            <TextField
              label="Tech chips"
              hint="comma separated"
              value={(draft.tech ?? []).join(', ')}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tech: e.target.value.split(',').map((t) => t.trim()),
                })
              }
              placeholder="UI Design, Responsive, Branding"
            />

            <SelectField
              label="Accent colour"
              hint="used for the fallback gradient"
              value={draft.accent}
              onChange={(e) => setDraft({ ...draft, accent: e.target.value })}
            >
              {ACCENTS.map((accent) => (
                <option key={accent} value={accent}>
                  {accent}
                </option>
              ))}
            </SelectField>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-muted">
                Image
              </span>
              {draft.image_url ? (
                <img
                  src={draft.image_url}
                  alt=""
                  className="mb-3 h-32 w-full rounded-tile object-cover"
                />
              ) : (
                <p className="mb-3 text-xs text-muted">
                  No image — the card falls back to an accent gradient.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <label className="pill inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {uploading ? 'Uploading…' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void pickImage(file)
                      e.target.value = ''
                    }}
                  />
                </label>
                {draft.image_url ? (
                  <Button onClick={() => setDraft({ ...draft, image_url: null })}>
                    Remove image
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                loading={busy}
                disabled={uploading}
                onClick={() => void submit()}
              >
                {draft.id ? 'Save changes' : 'Add project'}
              </Button>
              <Status state={state} message={message} />
            </div>
          </div>
        )}
      </AdminPanel>

      <AdminPanel title="Live order" description="Top to bottom is the order on the site.">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No projects yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-4 rounded-tile border border-stroke p-3"
              >
                <span className="w-6 flex-shrink-0 text-center text-sm tabular-nums text-muted">
                  {row.display_order}
                </span>
                {row.image_url ? (
                  <img
                    src={row.image_url}
                    alt=""
                    className="h-12 w-20 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span
                    className="h-12 w-20 flex-shrink-0 rounded-lg"
                    style={{ background: `linear-gradient(160deg, ${row.accent}55, #0a0407)` }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{row.title}</p>
                  <p className="truncate text-xs text-muted">
                    {row.category || 'No category'} ·{' '}
                    {row.project_url ? 'linked' : 'coming soon'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => startEdit(row)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </Button>
                  <ConfirmButton onConfirm={() => void remove(row.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminLayout>
  )
}
