import { NavLink, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  BookOpen,
  ExternalLink,
  FolderKanban,
  Images,
  LayoutDashboard,
  LogOut,
  PenLine,
  ShieldCheck,
} from 'lucide-react'
import { useAdminAuth } from '../../lib/useAdminAuth'

/** Sidebar order is fixed: Dashboard, Projects, Images, Story, Blog. */
const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/images', label: 'Images', icon: Images },
  { to: '/admin/story', label: 'Story', icon: PenLine },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen },
] as const

function Waiting() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <p className="text-sm text-muted">Checking your session…</p>
    </div>
  )
}

/**
 * Gate for every /admin route. No session -> /admin/login; a session whose email
 * isn't the admin's is signed out by useAdminAuth before it ever renders here.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth()
  const location = useLocation()

  if (status === 'loading') return <Waiting />
  if (status !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

/**
 * Admin chrome. Deliberately different from the public site: a fixed rail with
 * an explicit "Admin" label, no hero, no grain, no cursor glow, no Lenis — the
 * panel is a working surface, not a page to look at. The palette, glass and
 * Inter stay identical so it still reads as the same product.
 */
export default function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const { email, signOut } = useAdminAuth()

  // The gate lives here rather than at each route so a new admin screen cannot
  // be added without it. RLS is still the real authorisation — this only avoids
  // flashing an empty panel at someone who is not signed in.
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-bg">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>

      <aside className="sticky top-0 z-20 flex h-screen w-16 shrink-0 flex-col gap-2 border-r border-stroke bg-bg-elevated/60 px-2 py-4 backdrop-blur-xl md:w-16 lg:w-60 lg:px-3">
        <div className="mb-2 flex items-center gap-3 px-1 lg:px-2">
          <span className="logo-ring relative grid h-9 w-9 flex-shrink-0 place-items-center rounded-full">
            <span className="absolute inset-[1.5px] grid place-items-center rounded-full bg-bg">
              <span className="font-display text-[13px] italic text-text-primary">
                RS
              </span>
            </span>
          </span>
          <span className="hidden min-w-0 lg:block">
            <span className="block truncate text-sm font-semibold text-text-primary">
              Rachit Sharma
            </span>
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-accent-ink">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Admin
            </span>
          </span>
        </div>

        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
          {LINKS.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest ? rest.end : false}
              title={label}
              className={({ isActive }) =>
                `nav-hit flex items-center justify-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-300 lg:justify-start ${
                  isActive
                    ? 'bg-accent-soft text-text-primary'
                    : 'text-muted hover:bg-glass-hover hover:text-text-primary'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
              <span className="sr-only lg:hidden">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-stroke pt-3">
          <p className="hidden px-2 text-[11px] text-muted lg:block">
            <span className="block truncate">{email}</span>
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View live site"
            className="flex items-center justify-center gap-3 rounded-2xl px-3 py-2 text-sm text-muted transition-colors duration-300 hover:text-text-primary lg:justify-start"
          >
            <ExternalLink
              className="h-[18px] w-[18px] flex-shrink-0"
              aria-hidden="true"
            />
            <span className="hidden lg:inline">View live site</span>
            <span className="sr-only lg:hidden">View live site</span>
          </a>
          <button
            type="button"
            onClick={() => {
              void signOut()
            }}
            title="Sign out"
            className="flex w-full items-center justify-center gap-3 rounded-2xl px-3 py-2 text-sm text-muted transition-colors duration-300 hover:text-text-primary lg:justify-start"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">Sign out</span>
            <span className="sr-only lg:hidden">Sign out</span>
          </button>
        </div>
      </aside>

      <main
        id="admin-main"
        tabIndex={-1}
        className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
      >
        <header className="mb-8">
          <p className="eyebrow mb-4">Admin</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-text-primary md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted">{subtitle}</p>
        </header>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
          {children}
        </div>
      </main>
      </div>
    </AdminGuard>
  )
}
