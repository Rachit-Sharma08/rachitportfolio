import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CalendarClock, ExternalLink, PenLine } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { AdminPanel, Button, Status } from '../../components/admin/Fields'
import { listPosts } from '../../lib/adminApi'
import type { Post } from '../../lib/content'
import { formatDate } from './constants'

/**
 * The agent keeps its own clock: every slot below is IST, whatever the browser's
 * timezone is. Shifting the timestamp by +05:30 and reading UTC fields is the
 * whole conversion — no date library needed.
 */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000
const PUBLISH_DAYS = new Set([1, 3, 5])
const PUBLISH_HOUR = 9

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const LINKS = [
  {
    label: 'GitHub Issues',
    href: 'https://github.com/Rachit-Sharma08/blog-agent/issues?q=is%3Aissue+is%3Aopen+label%3Apending-publish',
  },
  {
    label: 'GitHub Actions',
    href: 'https://github.com/Rachit-Sharma08/blog-agent/actions',
  },
  { label: 'dev.to dashboard', href: 'https://dev.to/dashboard' },
] as const

/** Read-only window into the blogger agent. Nothing here writes anything. */
export default function AdminAgent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const rows = await listPosts()
        if (cancelled) return
        setPosts(rows)
        setState('ok')
      } catch (error) {
        if (cancelled) return
        setState('error')
        setMessage(error instanceof Error ? error.message : 'Could not load posts.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Keeps the hours-remaining line honest if the page is left open.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const drafts = newestFirst(
    posts.filter((post) => !post.published),
    'updatedAt',
  )
  const live = newestFirst(
    posts.filter((post) => post.published),
    'publishedAt',
  )
  const nextSlot = nextPublishSlot(now)

  const copyLink = async (post: Post) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/blog/${post.slug}`,
      )
      setCopied(post.id)
    } catch {
      /* Clipboard blocked — leave the button as it was. */
    }
  }

  return (
    <AdminLayout
      title="Blogger agent"
      subtitle="A draft is written on its own. It is published on its own."
    >
      <Status
        state={state === 'error' ? 'error' : 'idle'}
        message={state === 'error' ? message : ''}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CountCard
          icon={<BookOpen className="h-4 w-4" aria-hidden="true" />}
          value={state === 'ok' ? String(live.length) : '—'}
          label="Live posts"
          sub="published on /blog"
        />
        <CountCard
          icon={<PenLine className="h-4 w-4" aria-hidden="true" />}
          value={state === 'ok' ? String(drafts.length) : '—'}
          label="Drafts"
          sub="written, not live yet"
        />
      </div>

      <AdminPanel
        title="Schedule"
        description="The agent writes and publishes on fixed IST slots."
      >
        <ul className="flex flex-col gap-3">
          <li className="rounded-tile border border-stroke p-4 text-sm text-text-primary">
            Draft written: Sun, Tue, Thu at 6:00 PM IST
          </li>
          <li className="rounded-tile border border-stroke p-4 text-sm text-text-primary">
            Publish: Mon, Wed, Fri at 9:00 AM IST
          </li>
        </ul>

        <div className="mt-4 flex items-start gap-4 rounded-tile border border-stroke p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Next publish slot
            </p>
            <p className="mt-1 text-sm text-text-primary">{formatSlot(nextSlot)}</p>
            <p className="mt-0.5 text-xs text-muted">
              {formatRemaining(nextSlot.getTime() - now.getTime())}
            </p>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Drafts" description="Written but not live yet.">
        {state === 'loading' ? (
          <p className="text-sm text-muted">Loading posts…</p>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-muted">No drafts right now.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {drafts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-4 rounded-tile border border-stroke p-3"
              >
                <span className="chip flex-shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]">
                  {post.category || 'Uncategorised'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{post.title}</p>
                  <p className="truncate text-xs text-muted">
                    Last edited {formatDate(post.updatedAt)}
                  </p>
                </div>
                <Link to="/admin/blog" className="pill px-4 py-2 text-sm">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Only a draft with an open GitHub Issue labelled pending-publish goes live
          on its own. Check the Issues link below.
        </p>
      </AdminPanel>

      <AdminPanel title="Live posts" description="Already on the public blog.">
        {state === 'loading' ? (
          <p className="text-sm text-muted">Loading posts…</p>
        ) : live.length === 0 ? (
          <p className="text-sm text-muted">No live posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {live.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-4 rounded-tile border border-stroke p-3"
              >
                <span className="chip flex-shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]">
                  {post.category || 'Uncategorised'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{post.title}</p>
                  <p className="truncate text-xs text-muted">
                    Published {formatDate(post.publishedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill px-4 py-2 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    View post
                  </a>
                  <Button onClick={() => void copyLink(post)}>
                    {copied === post.id ? 'Copied' : 'Copy link'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Paste this into Medium &gt; Import a story.
        </p>
      </AdminPanel>

      <AdminPanel title="Links" description="Where the agent works.">
        <div className="flex flex-wrap gap-3">
          {LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="pill inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </AdminPanel>
    </AdminLayout>
  )
}

function CountCard({
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

/** Newest first, with missing dates sorting last. */
function newestFirst(posts: Post[], field: 'updatedAt' | 'publishedAt') {
  const stamp = (value: string | null) => (value ? new Date(value).getTime() : 0)
  return [...posts].sort((a, b) => stamp(b[field]) - stamp(a[field]))
}

/**
 * The next Mon/Wed/Fri 09:00 IST strictly after `now`. Today's slot only counts
 * while it is still ahead, so at exactly 09:00 the answer is the following one.
 */
function nextPublishSlot(now: Date): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS)
  const day = ist.getUTCDay()
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes()

  for (let ahead = 0; ahead <= 7; ahead += 1) {
    if (!PUBLISH_DAYS.has((day + ahead) % 7)) continue
    if (ahead === 0 && minutes >= PUBLISH_HOUR * 60) continue
    const slot = Date.UTC(
      ist.getUTCFullYear(),
      ist.getUTCMonth(),
      ist.getUTCDate() + ahead,
      PUBLISH_HOUR,
      0,
    )
    return new Date(slot - IST_OFFSET_MS)
  }

  // Every week contains a Mon/Wed/Fri, so the loop always returns. This is only
  // here to satisfy the compiler.
  return new Date(now.getTime())
}

/** "Wed, 21 Oct 2026, 9:00 AM IST" — read off the shifted clock. */
function formatSlot(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS)
  const hours = ist.getUTCHours()
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  const minutes = String(ist.getUTCMinutes()).padStart(2, '0')
  return `${WEEKDAYS[ist.getUTCDay()]}, ${ist.getUTCDate()} ${
    MONTHS[ist.getUTCMonth()]
  } ${ist.getUTCFullYear()}, ${hour12}:${minutes} ${hours < 12 ? 'AM' : 'PM'} IST`
}

function formatRemaining(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} minute${minutes === 1 ? '' : 's'} remaining`
  const hourLabel = `${hours} hour${hours === 1 ? '' : 's'}`
  if (minutes === 0) return `${hourLabel} remaining`
  return `${hourLabel} ${minutes} minute${minutes === 1 ? '' : 's'} remaining`
}
