import type { ReactNode } from 'react'
import { SOCIAL_LINKS } from '../data'

export default function Footer() {
  const socialLinks: ReactNode = SOCIAL_LINKS.map((link) => (
    <a
      key={link.label}
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className="chip px-4 py-2 text-sm"
    >
      {link.label}
    </a>
  ))

  return (
    <footer className="flex flex-col items-center justify-between gap-6 border-t border-stroke px-6 pt-10 pb-8 text-center md:flex-row md:text-left">
      <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
        {socialLinks}
      </div>

      <div className="flex items-center gap-2.5 text-sm text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent/80" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Open to Digital Marketing opportunities
      </div>
    </footer>
  )
}
