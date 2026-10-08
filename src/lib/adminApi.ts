import { STORAGE_BUCKET, supabase } from './supabase'
import { toPost } from './content'
import type { Post } from './content'
import type { ResumeData } from '../data'

/**
 * Every read and write the admin panel makes. All of it goes straight to
 * Supabase with the signed-in user's JWT attached — there is no proxy and no
 * service-role key on this side. RLS accepts the call because the JWT's email
 * matches is_admin(); an unrecognised token is rejected by Postgres.
 */

async function client() {
  const instance = await supabase()
  if (!instance) throw new Error('Supabase is not configured.')
  return instance
}

function message(error: { message: string } | null, fallback: string) {
  return error ? error.message : fallback
}

/* -------------------------------------------------------------------------- */
/*  Projects                                                                  */
/* -------------------------------------------------------------------------- */

export interface ProjectDraft {
  id?: string
  title: string
  category: string
  tagline: string
  description: string
  tech: string[]
  image_url: string | null
  project_url: string | null
  accent: string
  display_order: number
}

export interface ProjectRecord extends ProjectDraft {
  id: string
  created_at: string
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const { data, error } = await (await client())
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw new Error(message(error, 'Could not load projects.'))
  return (data ?? []) as ProjectRecord[]
}

export async function saveProject(draft: ProjectDraft) {
  const payload = {
    title: draft.title.trim(),
    category: draft.category.trim(),
    tagline: draft.tagline.trim(),
    description: draft.description.trim(),
    tech: draft.tech.filter(Boolean),
    image_url: draft.image_url || null,
    project_url: draft.project_url?.trim() || null,
    accent: draft.accent || '#d62e4a',
    display_order: Number(draft.display_order) || 0,
  }
  const query = (await client()).from('projects')
  const result = draft.id
    ? await query.update(payload).eq('id', draft.id)
    : await query.insert(payload)
  if (result.error) throw new Error(message(result.error, 'Could not save the project.'))
  return result.data
}

export async function deleteProject(id: string) {
  const { error } = await (await client()).from('projects').delete().eq('id', id)
  if (error) throw new Error(message(error, 'Could not delete the project.'))
}

/* -------------------------------------------------------------------------- */
/*  Blog                                                                      */
/* -------------------------------------------------------------------------- */

export async function listPosts(): Promise<Post[]> {
  const { data, error } = await (await client())
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(message(error, 'Could not load posts.'))
  return (data ?? []).map(toPost)
}

export interface PostDraft {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  cover_image_url: string | null
  published: boolean
  published_at: string | null
}

export async function savePost(draft: PostDraft) {
  const payload = {
    title: draft.title.trim(),
    slug: draft.slug.trim().toLowerCase(),
    excerpt: draft.excerpt.trim(),
    content: draft.content,
    category: draft.category.trim(),
    cover_image_url: draft.cover_image_url || null,
    published: draft.published,
    published_at: draft.published
      ? (draft.published_at ?? new Date().toISOString())
      : null,
  }
  const query = (await client()).from('blog_posts')
  const result = draft.id
    ? await query.update(payload).eq('id', draft.id)
    : await query.insert(payload)
  if (result.error) {
    // The most likely failure by far is the unique index on slug.
    throw new Error(
      result.error.code === '23505'
        ? 'That slug is already taken by another post.'
        : message(result.error, 'Could not save the post.'),
    )
  }
  return result.data
}

export async function deletePost(id: string) {
  const { error } = await (await client()).from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(message(error, 'Could not delete the post.'))
}

/* -------------------------------------------------------------------------- */
/*  Story + settings                                                          */
/* -------------------------------------------------------------------------- */

export async function getStory(): Promise<{
  content: Record<string, string>
  updatedAt: string | null
}> {
  const { data, error } = await (await client())
    .from('site_story')
    .select('section_key, content, updated_at')
  if (error) throw new Error(message(error, 'Could not load the story.'))
  const content: Record<string, string> = {}
  let updatedAt: string | null = null
  for (const row of data ?? []) {
    content[row.section_key] = row.content
    if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at
  }
  return { content, updatedAt }
}

export async function saveStory(sectionKey: string, content: string) {
  const { error } = await (await client())
    .from('site_story')
    .upsert({ section_key: sectionKey, content })
  if (error) throw new Error(message(error, 'Could not save the story.'))
}

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await (await client())
    .from('site_settings')
    .select('key, value')
  if (error) throw new Error(message(error, 'Could not load image settings.'))
  const out: Record<string, string> = {}
  for (const row of data ?? []) out[row.key] = row.value
  return out
}

export async function saveSetting(key: string, value: string) {
  const { error } = await (await client())
    .from('site_settings')
    .upsert({ key, value })
  if (error) throw new Error(message(error, 'Could not save the image setting.'))
}

/** The whole resume is one JSON string under the `resume` settings key. */
export async function saveResume(resume: ResumeData) {
  await saveSetting('resume', JSON.stringify(resume))
}

/* -------------------------------------------------------------------------- */
/*  Account                                                                   */
/* -------------------------------------------------------------------------- */

export async function changePassword(password: string) {
  const { error } = await (await client()).auth.updateUser({ password })
  if (error) throw new Error(message(error, 'Could not update the password.'))
}

/**
 * Sends Supabase Auth's password-recovery email to the admin address. The link
 * lands on /admin/login, where `detectSessionInUrl` reads its token and signs
 * the admin in so they can set a new password. Requires Supabase Auth to have a
 * working email provider (SMTP config in the dashboard).
 */
export async function sendPasswordReset(email: string) {
  const { error } = await (await client()).auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/login`,
  })
  if (error) throw new Error(message(error, 'Could not send the reset email.'))
}

/* -------------------------------------------------------------------------- */
/*  Storage                                                                   */
/* -------------------------------------------------------------------------- */

export type MediaFolder = 'hero' | 'projects' | 'blog'

/** Uploads into the public `site-media` bucket and returns the CDN URL. */
export async function uploadImage(
  file: File,
  folder: MediaFolder,
  name: string,
): Promise<string> {
  const path = `${folder}/${name}`
  const { error } = await (await client()).storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: true,
      contentType: file.type,
    })
  if (error) throw new Error(message(error, 'Upload failed.'))
  return (await client()).storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
}

/* -------------------------------------------------------------------------- */
/*  Rebuild hook                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Asks /api/rebuild to ping the Vercel deploy hook, so a published post gets
 * pre-rendered and added to sitemap.xml. Fire-and-forget: a failure here never
 * blocks the save, because the post is already live in the SPA.
 */
export async function requestRebuild() {
  try {
    const { data } = await (await client()).auth.getSession()
    const token = data.session?.access_token
    if (!token) return
    await fetch('/api/rebuild', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-fatal */
  }
}
