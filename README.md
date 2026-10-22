# Rachit Sharma — Portfolio

Dark, cinematic portfolio site for **Rachit Sharma** — a digital marketer in
Kaithal, Haryana, India who uses AI tools to build brands, campaigns and
creative web projects.

**Live:** [rachitportfolio-rouge.vercel.app](https://rachitportfolio-rouge.vercel.app/)

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** — design system with dark theme, grain texture, cursor glow
- **Framer Motion + GSAP + Lenis** — scroll-driven animations and smooth scrolling
- **Supabase** — headless CMS for projects, blog posts, story and images
- **Vercel** — static frontend with serverless functions and pre-rendered SEO

## Features

- **Pre-rendered SEO** — every route served as static HTML with per-route meta,
  OG/Twitter cards and JSON-LD (Person, WebSite, ProfilePage, BreadcrumbList,
  Article). `/llms.txt` + `/llms-full.txt` for AI crawlers.
- **Admin CMS** — `/admin` (Supabase auth) to manage projects, blog posts, story
  and images. Publishing triggers a Vercel rebuild hook.
- **Contact form** — POSTs to `/api/send-email` (Resend) with rate limiting.
- **Accessibility** — skip link, landmarks, focus-visible, reduced-motion support.

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # tsc + vite build + prerender
npm run verify   # prerender/XSS/empty-state assertions
```

## Repo layout

- `src/pages/` — Landing, Resume, Blog, BlogPost, NotFound
- `src/components/` — Navbar, Hero, About, Capabilities, SelectedWork, Vision,
  Journal, Stats, EnquiryForm, Contact, Footer
- `src/lib/` — SEO, content, markdown, motion, lenis
- `src/pages/admin/` — CMS
- `api/` — Vercel serverless functions (content, rebuild, send-email)
- `scripts/` — seo-config, head, prerender, verify-prerender, check-secrets
- `supabase/` — schema.sql + seed.sql

## Deploy

Push to `main` auto-deploys on Vercel.

## Contact

[Portfolio](https://rachitportfolio-rouge.vercel.app/) ·
[LinkedIn](https://www.linkedin.com/in/rachit-sharma08/) ·
[Email](mailto:rachitsharma9990888@gmail.com)
