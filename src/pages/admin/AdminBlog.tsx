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
  Toggle,
} from '../../components/admin/Fields'
import {
  deletePost,
  listPosts,
  requestRebuild,
  savePost,
  uploadImage,
} from '../../lib/adminApi'
import type { PostDraft } from '../../lib/adminApi'
import type { Post } from '../../lib/content'
import { prepareImage } from '../../lib/imagePrep'
import { formatDate, slugify } from './constants'

const CATEGORIES = [
  'AI · Prompting',
  'SEO',
  'Branding',
  'Copywriting',
  'Digital Marketing',
  'Other',
]

const EMPTY: PostDraft = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: CATEGORIES[0],
  cover_image_url: null,
  published: false,
  published_at: null,
}

export default function AdminBlog() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState<Post[]>([])
  const [draft, setDraft] = useState<PostDraft>(EMPTY)
  const [open, setOpen] = useState(params.get('new') === '1')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')
  /** Once the author edits the slug by hand it stops tracking the title. */
  const [slugLocked, setSlugLocked] = useState(false)

  const refresh = useCallback(async () => {
    setRows(await listPosts())
  }, [])

  useEffect(() => {
    void refresh().catch((error: unknown) => {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not load posts.')
    })
  }, [refresh])

  const startNew = () => {
    setDraft(EMPTY)
    setSlugLocked(false)
    setState('idle')
    setMessage('')
    setOpen(true)
    setParams({}, { replace: true })
  }

  const startEdit = (post: Post) => {
    setDraft({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      cover_image_url: post.coverImageUrl,
      published: post.published,
      published_at: post.publishedAt,
    })
    setSlugLocked(true)
    setState('idle')
    setMessage('')
    setOpen(true)
  }

  const submit = async () => {
    if (!draft.title.trim()) {
      setState('error')
      setMessage('A post needs a title.')
      return
    }
    if (!draft.slug.trim()) {
      setState('error')
      setMessage('A post needs a URL slug.')
      return
    }
    setBusy(true)
    setState('idle')
    try {
      const wasPublished = Boolean(draft.id && draft.published)
      await savePost(draft)
      await refresh()
      setState('ok')
      setMessage(
        draft.published
          ? wasPublished
            ? 'Post updated.'
            : 'Published. The site is rebuilding so search engines can find it — give it a minute.'
          : 'Draft saved.',
      )
      if (draft.published) void requestRebuild()
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
      await deletePost(id)
      await refresh()
      setState('ok')
      setMessage('Post deleted.')
      void requestRebuild()
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not delete.')
    }
  }

  const pickCover = async (file: File) => {
    setUploading(true)
    setState('idle')
    try {
      const prepared = await prepareImage(file, 0.88)
      const url = await uploadImage(prepared.file, 'blog', prepared.file.name)
      setDraft((prev) => ({ ...prev, cover_image_url: url }))
      setState('ok')
      setMessage('Cover uploaded.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AdminLayout
      title="Blog"
      subtitle="Drafts stay private. Publishing makes a post show on /blog, on the homepage Journal, and in the sitemap."
    >
      <Status state={state} message={message} />

      <AdminPanel
        title={draft.id ? 'Edit post' : 'Write a post'}
        action={
          <Button onClick={open ? () => setOpen(false) : startNew}>
            {open ? (
              <>
                <X className="h-4 w-4" aria-hidden="true" /> Close
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" /> New post
              </>
            )}
          </Button>
        }
      >
        {!open ? (
          <p className="text-sm text-muted">
            {rows.length} post{rows.length === 1 ? '' : 's'} ·{' '}
            {rows.filter((post) => post.published).length} published
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <TextField
              label="Title"
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value
                setDraft((prev) => ({
                  ...prev,
                  title,
                  slug: slugLocked ? prev.slug : slugify(title),
                }))
              }}
              placeholder="One Brief, One Campaign Sprint"
            />

            <TextField
              label="Slug"
              hint="the /blog/… part of the URL"
              value={draft.slug}
              onChange={(e) => {
                setSlugLocked(true)
                setDraft((prev) => ({ ...prev, slug: e.target.value }))
              }}
              placeholder="one-brief-one-campaign-sprint"
            />

            <TextArea
              label="Excerpt"
              hint="shown on cards and used as the meta description"
              rows={3}
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Category"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </SelectField>
              <div className="flex items-end pb-2">
                <Toggle
                  checked={draft.published}
                  label={draft.published ? 'Published' : 'Draft'}
                  onChange={(published) => setDraft({ ...draft, published })}
                />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-muted">
                Cover image
              </span>
              {draft.cover_image_url ? (
                <img
                  src={draft.cover_image_url}
                  alt=""
                  className="mb-3 aspect-[1200/630] w-full rounded-tile object-cover"
                />
              ) : (
                <p className="mb-3 text-xs text-muted">
                  Optional. Without one the post uses the accent gradient.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <label className="pill inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {uploading ? 'Uploading…' : 'Upload cover'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void pickCover(file)
                      e.target.value = ''
                    }}
                  />
                </label>
                {draft.cover_image_url ? (
                  <Button onClick={() => setDraft({ ...draft, cover_image_url: null })}>
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>

            <div>
              <TextArea
                label="Content"
                hint="markdown — blank line = new paragraph, **bold**, [link](url), ## heading"
                rows={18}
                className="font-mono text-[13px]"
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
              <p className="mt-3 text-xs text-muted">
                {draft.content.length} characters ·{' '}
                {splitCount(draft.content)} paragraphs
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                loading={busy}
                disabled={uploading}
                onClick={() => void submit()}
              >
                {draft.id ? 'Save changes' : 'Create post'}
              </Button>
            </div>
          </div>
        )}
      </AdminPanel>

      <AdminPanel title="All posts" description="Newest first.">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-4 rounded-tile border border-stroke p-3"
              >
                <span
                  className={`chip flex-shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] ${
                    post.published ? 'text-accent-ink' : ''
                  }`}
                >
                  {post.published ? 'Live' : 'Draft'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{post.title}</p>
                  <p className="truncate text-xs text-muted">
                    /blog/{post.slug} · {post.category || 'uncategorised'} ·{' '}
                    {post.published
                      ? formatDate(post.publishedAt)
                      : `edited ${formatDate(post.updatedAt)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => startEdit(post)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </Button>
                  <ConfirmButton onConfirm={() => void remove(post.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminLayout>
  )
}

function splitCount(markdown: string) {
  return markdown.split(/\n\s*\n/).filter((block) => block.trim()).length
}
