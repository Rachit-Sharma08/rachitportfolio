import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileText, FolderKanban, PenLine, Plus } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { AdminPanel, Status } from '../../components/admin/Fields'
import { getSettings, getStory, listPosts, listProjects } from '../../lib/adminApi'
import { DEFAULT_SETTINGS, formatDate } from './constants'

interface Summary {
  projects: number
  published: number
  drafts: number
  storyUpdated: string | null
  imagesSet: number
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [projects, posts, story, settings] = await Promise.all([
          listProjects(),
          listPosts(),
          getStory(),
          getSettings(),
        ])
        if (cancelled) return
        setSummary({
          projects: projects.length,
          published: posts.filter((post) => post.published).length,
          drafts: posts.filter((post) => !post.published).length,
          storyUpdated: story.updatedAt,
          imagesSet: Object.keys(DEFAULT_SETTINGS).filter(
            (key) => settings[key],
          ).length,
        })
        setState('ok')
      } catch (error) {
        if (cancelled) return
        setState('error')
        setMessage(
          error instanceof Error ? error.message : 'Could not load the dashboard.',
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Everything on the public site that you can change from here."
    >
      <Status
        state={state === 'error' ? 'error' : 'idle'}
        message={state === 'error' ? message : ''}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={<FolderKanban className="h-4 w-4" aria-hidden="true" />}
          value={summary ? String(summary.projects) : '—'}
          label="Projects"
          sub="live in Selected Work"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
          value={summary ? String(summary.published) : '—'}
          label="Published posts"
          sub={
            summary
              ? `${summary.drafts} draft${summary.drafts === 1 ? '' : 's'} waiting`
              : 'loading'
          }
        />
        <StatCard
          icon={<PenLine className="h-4 w-4" aria-hidden="true" />}
          value={summary ? formatDate(summary.storyUpdated) : '—'}
          label="My Story last edited"
          sub="About section copy"
        />
        <StatCard
          icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}
          value={summary ? `${summary.imagesSet}/3` : '—'}
          label="Images configured"
          sub="hero base, hero reveal, social"
        />
      </div>

      <AdminPanel
        title="Quick actions"
        description="Jump straight to the thing you came here to change."
      >
        <div className="flex flex-wrap gap-3">
          <QuickAction to="/admin/projects?new=1" icon={<Plus className="h-4 w-4" />}>
            Add project
          </QuickAction>
          <QuickAction to="/admin/blog?new=1" icon={<Plus className="h-4 w-4" />}>
            Write new post
          </QuickAction>
          <QuickAction to="/admin/story" icon={<PenLine className="h-4 w-4" />}>
            Edit My Story
          </QuickAction>
          <QuickAction to="/admin/resume" icon={<FileText className="h-4 w-4" />}>
            Edit Resume
          </QuickAction>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="pill inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View live site
          </a>
        </div>
      </AdminPanel>

      <AdminPanel
        title="How changes go live"
        description="So you know what to expect after you hit Save."
      >
        <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-muted marker:text-accent-ink">
          <li>
            Saving writes straight to Supabase. Projects, the story and images are on
            the live site the next time anyone loads a page.
          </li>
          <li>
            A blog post appears in the list immediately once published. It also pings
            a Vercel deploy hook, which re-renders that post's page and adds it to{' '}
            <code className="text-accent-ink">sitemap.xml</code> so search engines
            can find it.
          </li>
          <li>
            Image changes clear the five-minute cache on the content endpoint, so give
            it a few minutes to show everywhere.
          </li>
        </ol>
      </AdminPanel>
    </AdminLayout>
  )
}

function StatCard({
  icon,
  value,
  label,
  sub,
}: {
  icon: ReactNode
  value: string
  label: string
  sub: string
}) {
  return (
    <div className="glass p-6">
      <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
        {icon}
      </span>
      <p className="text-2xl font-extrabold tracking-[-0.02em] text-text-primary md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-text-primary">{label}</p>
      <p className="mt-0.5 text-xs text-muted">{sub}</p>
    </div>
  )
}

function QuickAction({
  to,
  icon,
  children,
}: {
  to: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Link to={to} className="pill pill-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
      <span aria-hidden="true">{icon}</span>
      {children}
    </Link>
  )
}
