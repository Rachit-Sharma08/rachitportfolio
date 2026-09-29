import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { AdminPanel, Button, Status, TextArea } from '../../components/admin/Fields'
import { getStory, saveStory } from '../../lib/adminApi'
import { renderInline, splitParagraphs } from '../../lib/markdown'
import { STORY_FIELDS } from './constants'
import { STORY } from '../../data'

export default function AdminStory() {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { content } = await getStory()
        if (cancelled) return
        setDrafts(content)
      } catch {
        // An empty table is the normal first-run state, not a failure.
        if (!cancelled) setDrafts({})
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (key: string) => {
    setBusy(key)
    setState('idle')
    try {
      await saveStory(key, drafts[key] ?? '')
      setState('ok')
      setMessage('Story saved. It is on the live About section now.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not save.')
    } finally {
      setBusy(null)
    }
  }

  const cardText = drafts.my_story_card ?? ''
  const paragraphs = splitParagraphs(drafts.my_story ?? '')

  return (
    <AdminLayout
      title="My Story"
      subtitle="The copy in the About section. Blank line = new paragraph. Markdown works for links and bold."
    >
      <Status state={state} message={message} />

      {!loaded ? (
        <AdminPanel title="Loading">
          <p className="text-sm text-muted">Fetching the current story…</p>
        </AdminPanel>
      ) : null}

      {STORY_FIELDS.map((field) => (
        <AdminPanel
          key={field.key}
          title={field.label}
          description={field.hint}
          action={
            <Button
              variant="primary"
              loading={busy === field.key}
              onClick={() => void save(field.key)}
            >
              Save
            </Button>
          }
        >
          <TextArea
            label={field.label}
            rows={field.rows}
            value={drafts[field.key] ?? ''}
            placeholder={
              field.key === 'my_story_card' ? STORY.card : 'First paragraph…'
            }
            onChange={(e) => {
              setDrafts((prev) => ({ ...prev, [field.key]: e.target.value }))
              setState('idle')
            }}
          />
          <p className="mt-3 text-xs text-muted">
            {(drafts[field.key] ?? '').length} characters
          </p>
        </AdminPanel>
      ))}

      {/* Same markup, same classes, same font as About.tsx — so what you see
          here is what the public page renders, not an approximation of it. */}
      <AdminPanel
        title="Live preview"
        description="Exactly how this will look in the About section."
      >
        <div className="grid gap-5 md:grid-cols-[320px_1fr] md:gap-7">
          <div className="glass lift p-6">
            <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-muted">
              My Story
            </h3>
            <p
              className="text-base leading-relaxed text-muted"
              dangerouslySetInnerHTML={{
                __html: renderInline(cardText) || ' ',
              }}
            />
          </div>

          <div className="flex flex-col gap-5">
            {paragraphs.length === 0 ? (
              <p className="text-sm text-muted">
                Nothing here yet — type a paragraph on the left.
              </p>
            ) : (
              // Grouped two-per-card, which is how About.tsx lays the copy out.
              chunk(paragraphs, 2).map((group, index) => (
                <div key={index} className="glass lift p-6 md:p-7">
                  {group.map((paragraph, i) => (
                    <p
                      key={i}
                      className={`text-base leading-relaxed text-muted ${
                        i === 0 ? '' : 'mt-4'
                      }`}
                      dangerouslySetInnerHTML={{ __html: renderInline(paragraph) }}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </AdminPanel>
    </AdminLayout>
  )
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}
