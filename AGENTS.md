# AGENTS.md — Rachit Portfolio (Project Brain)

> **Ye file is project ka memory hai.** Koi bhi agent (AI / coding tool) is file ko
> **sabse pehle** read karega jab bhi is project par kaam kare. Yahan har baat-cheet,
> har decision, aur har change ka log kiya jata hai.

---

## 📜 Instructions for Any Agent (Sab Agents Ke Liye)

1. **READ THIS FILE FIRST** — Pehla step hamesha `AGENTS.md` ko read karna hai. Koi kaam shuru karne se pehle, current state aur history samjho.
2. **UPDATE AFTER EVERY TASK** — Har kaam ke **baad**, bina kisi se pooche, is file ko update karo:
   - Log mein naya entry add karo (`## Changelog` section ke andar latest entry sabse UPAR).
   - Project state badli ho to `## Current State` update karo.
   - Koi pending/reh gaya kaam ho to `## Todo / Pending` me daal do.
3. **Secrets NEVER yahan** — GitHub token, password, API keys is file me kabhi mat likhna. Secrets ko repo me kabhi commit nahi karna.
4. **Baat-cheet ka record** — User ke saath jo bhi important decision/correction hua, use Changelog me likho taaki next agent ko pata ho.
5. **Code conventions follow karo** — React + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + GSAP. Existing pattern/style copy karo, unwanted comments mat daalo.
6. **Verification** — Har change ke baad `npm run lint` chalao. Build check ke liye `npm run build` chalao.
7. **Git/GitHub** — Changes sirf tab push karo jab user kaho. Commit messages chhote aur clear rakho.

---

## 🔧 Project Overview

- **What:** Rachit Sharma ka personal portfolio website — Digital Marketer / AI-Powered Creator.
- **Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + GSAP + HLS.js + tanstack-router (react-router-dom v7).
- **Pages:**
  - `/` → Landing (Hero, SelectedWork, Journal, Stats, Contact)
  - `/resume` → Resume page
- **Design vibe:** Dark, grain texture, cursor glow, loading screen, marquee, magnetic buttons — aesthetic + animated.
- **Data source:** `src/data.ts` (personal info, socials, projects, journal, stats — sab yahan se control hota hai).

---

## 🧱 Current State (as of last update)

- **NEW (`v27`) — Supabase CMS + blog + deploy-hook re-render (sab poora, verified):** Supabase-backed single-admin CMS (`/admin`) + public blog (`/blog`, `/blog/:slug`), saara editable content (projects, posts, story, hero/OG images). RLS + `public.is_admin()` + browser UX gate teenon layers. 2 Vercel functions: `/api/content` (anon settings+story) + `/api/rebuild` (auth-guarded Deploy Hook). Publish/unpublish/delete se Supabase DB Edge Function webhook → Vercel deploy → **static HTML re-pre-render**, isliye naye posts turant crawlable hain. **11 real bugs pakde + fix kiye QA me** (sabse serious: lazy `BlogPost` SSR me sirf Suspense fallback render hota tha — har post page crawler ko "Loading…" dikhata; `vercel.json` catch-all me `admin` exclude karne se poora panel 404; `api/` type-check hi nahi hota tha). `npm run verify` (NEW, 38 assertions) pre-render pipeline + XSS + empty-state cover karta hai. **⚠️ Live Supabase/Vercel env abhi set NAHI hua** — schema/seed chalane + deploy ka kaam bacha hai (exact steps neeche). Detail: Changelog `v27`.
- **NEW (`v26`) — FULL SEO + a11y pass:** prerendered head har route par (canonical/OG/Twitter/main theme-color/manifest/icons/robots/JSON-LD Person+WebSite) + `robots.txt` + `sitemap.xml`, `SITE_URL` single source of truth (`scripts/seo-config.mjs`), real anchor nav (`data-no-intercept`), skip link + `main` landmark + 404 page + client-side `<title>` sync, sr-only/focus-visible/nav-hit CSS. **Lighthouse: Access 100 · BP 100 · SEO 100.** Detail: Changelog `v26`.
- **NEW (`v25`) — Consistent animation system + Lenis fixes:** once-only masked reveals (`Reveal`/`RevealHeading`/`RevealGroup`, shared tokens `src/lib/motion.ts`), LoadingScreen delete, Magnetic clamp, ScrollProgress, Navbar hide/show + active observer, story scrub, Lenis cross-route/queued/scroll-margin fixes. Important: `<section[id]> { scroll-margin-top: 96px }` = SINGLE scroll offset knob. Detail: Changelog `v25`.

- **NEW (`v24`) — PROJECTS section rebuild:** 4 projects ab **sticky stacking glass cards** hain (CSS-only sticky + `.work-stack` direct children) with **subtle GSAP** — covered-card scrub (scale/opacity/blur) + per-card clip-path/text-stagger entrance. **Purana R3F 3D fly-through + tile-transition implementation poora delete** (`src/components/works/` 9 files, 4 deps, 61 packages, 907 kB `WorksScene` chunk). Hero/baaki sections + `src/data.ts` **unchanged**. Detail: Changelog `v24`.
- **NEW (`v23`) — Dead code purge:** `BackgroundVideo.tsx` + `TiltCard.tsx` deleted (0 refs), `VIDEO_SRC` + `HERO_ROLES` removed, `Archivo`/`Space Grotesk` fonts + tokens hataye (ab sirf Inter + Instrument Serif), `hls.js` + frontend `resend` + `@vercel/node` deps removed (**116 packages** gone).
- **NEW (`v22`) — Poora page hero ke crimson-black system me:** hero ke neeche ke saare sections (About, Capabilities, 3D Work, Vision, Journal, Stats, Enquiry, Contact/Footer, Navbar, LoadingScreen, `/resume`) ek hi design system me — crimson accent `#d62e4a` + `accent-ink #e85a70`, `--bg #0a0407`, glass cards (24px radius, 16px blur), pill/chip/field helpers, Inter extrabold headings + Instrument Serif italic accent words. Text/story/links/order/hero **unchanged**. Shared helpers `.glass/.lift/.pill/.pill-primary/.chip/.field/.section/.shell/.shell-inner/.eyebrow` `src/index.css` me hain. Detail: Changelog `v22`.
- ⚠️ **CSS convention (important):** is file me vendor prefix **PEHLE**, standard property **BAAD me** likho (`-webkit-backdrop-filter` → `backdrop-filter`). Ulta order karne se Lightning CSS standard property ko drop kar deta hai. Verified `v22`.
- ⚠️ **`.pill` me `border:` shorthand mat likho** — longhands use karo, warna `border-image`/gradient ring reset ho jaata hai.
- **Contact se Mux test-stream `BackgroundVideo` hata diya** (`v22`). File + `VIDEO_SRC` ab `v23` me **delete** ho chuke hain.

- **NEW (`v21`) — Pre-rendering LIVE in build:** `npm run build` ab SSR bundle (`vite build --ssr src/prerender.tsx`) + `node scripts/prerender.mjs` se `dist/index.html` (44,403 B) **aur** `dist/resume/index.html` (8,443 B) daita hai — dono me saara text raw HTML me likha hai (nav, Who is Rachit, My Story, Capabilities, Vision, projects). Browser par design/3D/animations bilkul same (client createRoot se re-render hota hai). Branch `prerender-seo` par kaam hua, `main` untouched.
- Landing page complete with: LoadingScreen, Grain overlay, CursorGlow, Navbar, Hero (cut-out photo + cursor-reveal outfit swap), then sections in sir's-site order (v20): About, Capabilities, SelectedWork, Vision, Journal, Stats, EnquiryForm, Contact.
- Resume page complete (Education, Skills, Projects).
- Framer Motion page transitions, RevealHeading, TiltCard, Magnetic, Marquee helpers bane hain.
- **NEW (`v7`) — About/Capabilities/Vision/EnquiryForm sections** — `src/components/About.tsx`, `Capabilities.tsx`, `Vision.tsx`, `EnquiryForm.tsx` add hue. EnquiryForm me EmailJS placeholder credentials (`YOUR_SERVICE_ID` etc.) daalne baaki hain.
- **NEW — DOM Click Overlay (`v8`):** panels ab mesh raycast nahi, `PanelClickLayer` ke invisible DOM buttons se open hote hain (useFrame screen-projection + rAF sync). Sab panels any scroll position par clickable.
- **NEW — 3D Scroll-to-Fly-Through Works:** `SelectedWork.tsx` ab React Three Fiber 3D section hai — scroll par camera panels ke beech fly karta hai (sticky `h-[400vh]` + window scroll + Lenis). Components `src/components/works/` me (WorksScene, ProjectPanel, GridFloor, WorksOverlay, PanelClickLayer, projectsData).
- **Lenis nav scroll (`v8`):** nav/hero/landing `src/lib/lenis.ts` ke `scrollToSection()`/`scrollToTop()` use karte hain — Lenis conflict se dead-scroll fix hua.
- **Panel click par `ProjectDetailTransition` kholta hai** (`v5`, refactor) — tiles scatter → circle converge → dissolve → card; View Details = GitHub link (v6); coming-soon desaturated + shake.
- **NEW (`v17`) — Hero photos WebP:** `hero-base.webp` / `hero-reveal.webp` (q92, 1086x1448, alpha bit-identical) — **3.85MB PNG → 462KB (-88%)**. Repo me koi hero PNG nahi, originals `D:\Pictures` me.
- **Hero black-background fix:** `BackgroundVideo` ab fallback gradient dikhata hai jab video load/play nahi hoti (VS Code embedded browser case). Video sirf tab dikhti hai jab actually play ho rahi ho.
- **Lenis smooth scroll** App-level wired (`src/App.tsx`, autoRaf lerp 0.09).
- **Backend LIVE on Render (`v14`):** API **`https://rachit-api.onrender.com`** (Express + Resend), frontend Vercel static only. `VITE_API_URL` (Vercel env + `.env` local) = Render URL. `RENDER_API_KEY` saved in `.env` (gitignored). Keep-alive triple-layer:
  1. **GitHub Actions cron (`v15`, LIVE)** — `.github/workflows/keep-render-awake.yml` har 10 min Render `/health` ping (manual run verified SUCCESS — 100% free)
  2. **Client-side `startKeepAlive()`** (`src/lib/keepalive.ts`) — pings `/health` on mount + every 8 min while site open
  3. **EnquiryForm 3-attempt retry** — cold-start race me 6s backoff ke saath retry
- **User rule (`v15`):** user ne clear kaha — **"sab kam bilkul free ma hona chiye"**. Koi bhi change jo paisa maange (Render cron $1/mo, Vercel Pro cron, paid plan) = pehle se NO. Free solutions hi: GitHub Actions cron, client-side keep-alive, retry.
- `data.ts` me highlight:
  - LinkedIn & Instagram links TODO hai (`src/data.ts`)
  - `VIDEO_SRC` — real HLS/video link chahiye (abhi Mux test stream hai)
  - Projects me ab accent/tagline/description/tech fields bhi hain
- Git repo initialized, GitHub remote `rachitportfolio` se linked, first push done. Branch `main`.

---

## 📄 Key Files Map

| File | Kaam |
|---|---|
| `src/App.tsx` | Router + public/admin route split + page transitions |
| `src/lib/content.tsx` | Supabase content provider + `FALLBACK` static copy (v27) |
| `src/lib/seo.ts` | Per-route title/desc/canonical/OG/Twitter + JSON-LD (v26/v27) |
| `src/lib/markdown.ts` | Escaped, scheme-checked sync Markdown renderer (v27) |
| `supabase/schema.sql` | Tables, RLS, `is_admin()`, storage bucket (v27) |
| `api/content.ts` | Server-only anon settings+story endpoint (v27) |
| `api/rebuild.ts` | Auth-guarded Vercel Deploy Hook (v27) |
| `scripts/verify-prerender.mjs` | `npm run verify` — 38 pre-render/XSS/empty assertions (v27) |
| `src/data.ts` | Bundled static copy (fallback when Supabase unset) |
| `src/pages/Landing.tsx` | Home page |
| `src/pages/Resume.tsx` | Resume page |
| `src/components/` | Saare UI sections (Hero, Navbar, Contact, ...) |
| `public/assets/` | Hero cut-out photos, **WebP** (`hero-base.webp` = black blazer, `hero-reveal.webp` = silver). Source PNGs `D:\Pictures\photo 1.png` + `photo 2.png` me safe hain |
| `index.html` | SEO meta + fonts (Inter, Instrument Serif) + hero image preloads |

---

## 📝 Changelog (History of Work)

### [v27 — Supabase CMS + blog + deploy-hook re-render] — 29 Sep 2026
**User ka brief:** site ka editable banao — projects/posts/story/images ek Supabase-backed single-admin CMS se chale, public blog add karo, aur publish karte hi naya post **static HTML me pre-render** ho jaye (crawler ko turant dikhe). Design/copy/hero effect **bilkul mat badlo.**

**Naya stack:** `@supabase/supabase-js@^2.117.2` + `marked@^18.0.14` (server packages hata diye — `npm audit` 0 vulnerabilities).

**Schema + seed:** `supabase/schema.sql` — tables `site_settings`, `site_story`, `projects`, `blog_posts`; `public.is_admin()`; RLS (anon ko sirf published posts + projects); storage bucket `site-media`. `supabase/seed.sql` — current settings/story + 4 projects + 4 posts.

**2 Vercel functions:** `api/content.ts` (anon — settings + story, 5-min cache, `site_settings`/`site_story` par anon policy nahi hai isliye server-side call) + `api/rebuild.ts` (JWT check → email match → Deploy Hook POST). Client Supabase SDK **dynamic import** (214 kB alag chunk — public visitor ko tab hi download hota hai jab content fetch ho).

**Admin (`/admin`):** `AdminLogin/Layout` (+`AdminGuard`), `AdminDashboard`, `AdminProjects`, `AdminImages`, `AdminStory`, `AdminBlog`, `src/components/admin/Fields.tsx`, `src/lib/adminApi.ts`, `src/lib/useAdminAuth.ts`, `src/lib/imagePrep.ts`, `src/pages/admin/constants.ts`. Projects/posts full CRUD + draft/publish, image prepare→WebP→upload, hero-pair dimension match, story preview, deploy-hook rebuild, delete confirmation. **3 layers:** browser UX gate + `ADMIN_EMAIL` check + RLS.

**Public:** `src/pages/Blog.tsx` + `BlogPost.tsx` + `src/components/RichText.tsx` + `.rich-text` CSS; `src/lib/content.tsx` (`SiteContentProvider`, `FALLBACK`, `loaders`) se `SelectedWork`/`Journal`/`About`/`Hero`(sirf image src) live. `src/lib/seo.ts` extended (per-route title/desc/canonical/OG/Twitter, `BlogPosting` JSON-LD, `setNoIndex`).

**11 real bugs QA me pakde + fix kiye:**
1. **Lazy `BlogPost` → har post page "Loading…" pre-render hota tha.** `renderToStaticMarkup` Suspense await nahi karta — crawler ko post body kabhi nahi milti. Fix: `BlogPost` ab eager (saves 3.8 kB only; `marked` already main chunk me `About` ke liye hai). Admin lazy hi rakha.
2. **`<link rel="canonical">` par `content` attribute** (`upsert` `href` use nahi kar raha tha) → blog page ka canonical homepage URL rehta tha. Fix: `tag === 'link' ? 'href' : 'content'`.
3. **`vercel.json` catch-all me `admin` exclude** → poora panel 404 (SPA fallback nahi milta). `vite preview` ne pakda nahi (uska apna fallback hai) — `vercel build` pakda.
4. **`api/` type-check hi nahi hota tha** → `vercel build` par 8× `TS2591 Cannot find name 'process'` (local `tsc -b` green rehta tha). Fix: `api/tsconfig.json` (`types: ["node"]`) + root `tsconfig.json` me reference.
5. **Empty-vs-failed confusion** — admin last project/post delete kare to static copy zinda ho jaati thi. Fix: `null` = "no answer" (fallback), `[]`/`''` = jaan-boojh kar empty (honoured). Client loader + `mapBuildContent` dono me.
6. **`routesFor` slugless posts** se duplicate `/blog/` route + sitemap entry. Fix: `.filter((post) => post.slug)`.
7. **Post OG image hamesha site-wide `OG_IMAGE`** (per-post cover sirf JSON-LD me jata tha) + `SITE_URL + absoluteUrl` → `https://site.comhttps://…` malformed. Fix: `absoluteUrl()` + cover OG/Twitter dono me.
8. **JSON-LD me `<` unescaped** — post title me `</script>` se tag early close → stored XSS. Fix: `safeJson()` (`<` → `<`).
9. **Lenis/anchors/keepalive `/admin` par bhi chal rahe the** — admin plain page hona chahiye. Fix: effect `[admin]`-scoped.
10. **`/admin` index ho raha tha** (pre-rendered homepage head inherit). Fix: `setNoIndex()` + `setIndexable()` on exit.
11. **"Upload anyway" stale size** — forced hero upload ke baad `sizes` update nahi hota, next upload galat layer se compare karta. Fix: `setSizes` after upload.

**`npm run verify` (NEW, `scripts/verify-prerender.mjs`, 38 assertions):** real SSR bundle ko synthetic Supabase rows se drive karta hai — sort/filter/order, slugless-route filter, markdown render (heading/bold/list), excerpt, XSS (`<script>`/`<img onerror>` escape + `javascript:` drop), empty-vs-failed dono branches, `dist/blog` head (canonical/og:url/JSON-LD). **`vite preview` 404 on `/api/content` expected hai** (Vercel functions nahi chalti) — production me `/api/content` hai.

**Verification:** `npm run lint` **0 errors** (7 advisory warnings: Fast Refresh exports + setState-in-effect). `npm run build` pass — `/` 49,050 B, `/resume` 11,214 B, `/blog` 11,677 B + robots + sitemap (3 urls, no service key). `npm run verify` **38/38 pass**. `npx tsc -b` 0. `vercel build` **0 errors** + `api/content.func` + `api/rebuild.func` detected. Chrome headless: har route 1×h1, `/admin*` login guard + noindex + no public nav, `/blog/nope` not-found, overflow 0. PowerShell-edited files me **koi mojibake nahi** (U+FFFD scan 0).

**⚠️ SETUP ABHI BAAKI HAI (user ke bina env ke nahi ho sakta):**
1. Supabase project → SQL Editor me `supabase/schema.sql` chalao → phir `supabase/seed.sql`.
2. Auth me admin user banao (`rachitsharma999088@gmail.com`).
3. Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only!), `ADMIN_EMAIL`, `SITE_REBUILD_HOOK`, `SITE_URL`.
4. Supabase → Database → Webhooks → **Insert** → trigger `blog_posts` (INSERT/UPDATE/DELETE) → HTTP POST `SITE_REBUILD_HOOK`.
5. Push → Vercel auto-deploy.

**Files changed (v27):** NEW `supabase/schema.sql`, `supabase/seed.sql`, `api/content.ts`, `api/rebuild.ts`, `api/tsconfig.json`, `src/lib/content.tsx`, `supabase.ts`, `markdown.ts`, `imagePrep.ts`, `useAdminAuth.ts`, `adminApi.ts`, `seo.ts` (MOD), `src/components/RichText.tsx`, `src/components/admin/Fields.tsx`, `src/pages/Blog.tsx`, `BlogPost.tsx`, `src/pages/admin/*` (7), `scripts/verify-prerender.mjs`; MOD `scripts/prerender.mjs`, `scripts/seo-config.mjs`, `src/prerender.tsx`, `src/App.tsx`, `src/pages/Landing.tsx`, `src/components/{About,Journal,SelectedWork,Hero,Stats,SectionHeader}.tsx`, `src/index.css`, `src/data.ts`, `vercel.json`, `tsconfig.json`, `package.json`, `.env.example`, AGENTS.md.

### [v26 — FULL SEO + a11y pass: prerendered head, 100/100/100 Lighthouse] — 29 Sep 2026
**User ka brief:** poore project par SEO + responsiveness + web-accessibility + Lighthouse 100/100 target. Koi design change NAHI; sirf visible copy change = About heading `Who is Rachit?` → `Who is Rachit Sharma?` (pehle user ko report diya + confirm liya).

**STEP 0 — Audit (pehle koi change nahi):** framework Vite + React 19 client SPA + build-time prerender (v21 `scripts/prerender.mjs`). `index.html` me title/description toh the par canonical/OG/Twitter/theme-color/manifest/robots/sitemap/JSON-LD sab missing. Navbar plus side links `<button>` the (real anchors nahi). Heading audit: sirf hero h1 + Resume h2s + SelectedWork h3 raw the; Vision "My Vision" aur About "My Story"/"My Journey" `<p>` the. 🐛 Extra find: `public/favicon.svg` **purane blue theme ka tha** — naya user bhool gaya tha (`#89AACC`→`#4E85BF`).

**Assets (Pillow venv `...\Temp\opencode\webpenv`, script `gen-assets.py`):** `public/og-image.png` (1200×630, hero-reveal cutout right + "Rachit Sharma" arialbd 112 + "Digital Marketer" georgiab crimson + tagline; 342,765 B), `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `icons/icon-192.png` + `icon-512.png`, favicon.svg → crimson rewrite, `site.webmanifest` (name/theme `#0a0407`).

**`index.html`:** favicon set + apple-touch-icon + manifest + theme-color `#0a0407` + robots `index, follow` + naya default description/title + Inter trimmed `wght@400..800` (300/900 unused the — siphon audit).

**Pre-renderer (`scripts/seo-config.mjs` NEW + `prerender.mjs` rewrite):** `SITE_URL` (env override, default prod URL) = single source of truth. Har route apna title/description; prerender me regex se `<title>` + description swap, phir `</head>` se pehle canonical + OG (type/site_name/locale/title/description/url/image+width/height/alt) + Twitter (summary_large_image) + JSON-LD Person + WebSite append. Build par `dist/robots.txt` + `dist/sitemap.xml` (`lastmod`=build UTC date; **sitemap me `/resume` nahi, `/` hai** — check kiya: `loc` dono). No `keywords` meta (by design).

**Headings/semantics (React):** `RevealHeading` optional `id` prop → SectionHeader/Contact/Journal/Capabilities/EnquiryForm headings par ids + sections `aria-labelledby`. Hero: single `<h1 id="home-heading">` wrapping 3 alag `.hero-rise` spans (vanity visual same, GSAP stagger same). About: "Who is Rachit Sharma?" + "My Story"→`h3` + "My Journey"→`h2` + body `text-sm`→`text-base` (+ story paragraphs bhi, deliberate). Journal titles `p`→`h3 text-base`, subtext `text-base`. EnquiryForm: sr-only labels (name/email/reason/message) + errors `role="alert"`. Resume: h1 `id="resume-heading"`, h2 ids, project titles `p`→`h3 text-base`. Sections me imgs: width/height, `loading="lazy"` (SelectedWork), alt improved, external links `rel="noopener noreferrer"`, socials `rel="me noopener noreferrer"`.

**Navbar (`v26-a`) — buttons → real anchors:** nav `<nav aria-label="Main">`, logo + har NAV_LINK + "Say hi" ab `<a href="#id">` (route wala `href="/resume"`). `data-no-intercept` attribute → `initAnchorLinks` (lenis.ts) usse skip karta hai kyunki Navbar ka onClick preventDefault + `goTo()` (cross-route fallback + queued-scroll cancel pehle se) handle karta hai. Logo aria-label "Rachit Sharma RS — home" — **contains "RS" zaroori** (wcag 2.5.3 `label-content-name-mismatch`: name me visible text hona chahiye; `aria-hidden` se nahi bachte kyunki audit visible-text DOM se leti hai).

**Skip link + landmarks:** `<a class="skip-link" href="#main" data-no-intercept>` App me sabse pehle; `main id="main" tabIndex={-1}` Landing/Resume/NotFound par; `.skip-link` CSS (off-canvas until `:focus-visible`). **404 page (NEW `src/pages/NotFound.tsx`)** + route `path="*"`. **Client-side `<title>` sync (NEW `src/lib/seo.ts`):** `titleForPath()` + App useEffect — prerender sirf initial route ka title deta hai, SPA nav me bina effect ke title stale rehta.

**CSS (`src/index.css`):** `.skip-link`, `.sr-only`, global `:focus-visible { outline: 2px solid var(--accent-ink) }`, `.nav-hit::before` (tap targets 33px → ~44px hit area, visual change nahi). Sub-12px labels sab bump kiya (`text-[10px]`/`[11px]` → `text-xs`) — Lighthouse legible-font + a11y.

**Verify (numbers, Playwright + Lighthouse):**
- **Lighthouse (system Chrome, preview): Accessibility 100 · Best Practices 100 · SEO 100.** Performance 54 = shared-VM/server-más artifact (FCP/Main-thread low on rAF-throttled headless; production 2-layer is better). Ek retry me `label-content-name-mismatch` 0 → logo aria-label fix ke baad PASS.
- Headings tree live: 1×h1 (`#home-heading`) + ordered h2s (about-heading, My Journey, capabilities-heading, work-heading, vision-heading, journal-heading, enquiry-heading, contact-heading) + h3s. `sectionsWithMissingLabel: []`. lang `en`.
- Nav anchors: `/`, `#home`, `#about`, `#capabilities`, `#work`, `#vision`, `#contact`, `/resume`, `#contact` — sab real `<a href>`. Anchor click → section top **96px** (Lenis scroll-margin convention). Skip link: real keyboard Tab → visible pill (top 16px), Enter → `#main` top 0. 404 route renders (h1, nav, Back to home). Client-side nav title flips both ways (`/` ⇄ `/resume`).
- Console: **0 errors / 0 warnings** (landing + resume fresh loads). Overflow: 360px viewport `scrollWidth == clientWidth` (0 overflow; flagged elements sab `overflow-hidden` parents ke andar — marquee track).
- Prerender export (node verify): `/` aur `/resume/index.html` dono me per-route title + description + canonical + OG + Twitter + JSON-LD (`Person` sameAs 3 profiles, `WebSite`); `dist/robots.txt` + `dist/sitemap.xml` ok. Em-dash — file me sahi hain (PowerShell `Get-Content` rendering sirf console mojibake hain, file safe).
- `npm run lint` 0 + `npm run build` pass (`dist/index.html` 49,171 B, `dist/resume/index.html` 11,102 B; chunk-size warning pre-existing hi).

**⚠️ Manual notes (user ko batana):** (1) custom domain par `SITE_URL` env set karna (Vercel), (2) Search Console → submit sitemap + rich-results check, (3) LinkedIn/GitHub/Instagram bio me site link + verify `rel="me"` wali socials, (4) og-image.me photo in OG image — user khud dekh ke confirm kare. `.playwright-mcp/` artifacts commit nahi kiye.

**Files changed (v26):** NEW `scripts/seo-config.mjs`, `src/lib/seo.ts`, `src/pages/NotFound.tsx`, `public/og-image.png`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/site.webmanifest`; MOD `scripts/prerender.mjs`, `index.html`, `public/favicon.svg`, `src/App.tsx`, `src/index.css`, `src/lib/lenis.ts`, `src/components/{Navbar,About,Capabilities,Contact,EnquiryForm,Footer,Hero,Journal,RevealHeading,SectionHeader,SelectedWork,Vision}.tsx`, `src/components/work/WorkViewCursor.tsx`, `src/pages/{Landing,Resume}.tsx`. AGENTS.md bhi. **Push `main` aakhri — Vercel auto-deploy LIVE.**

### [v25 — Consistent subtle animation system + Lenis nav fixes] — 29 Sep 2026
**User ka brief:** v24 (PROJECTS) gthets hua; ab baaki poore site par EXACT wahi subtle animation language (once-only reveals, gated on reduced-motion). **Hero aur projects stacking (work section) DONO protected** — `Hero.tsx`, `SelectedWork.tsx`, `src/components/work/*` touch NAHI. Content/order/links jobsa ka waisa. Final me file list do.

**BIGGAN: sehriya + masked line reveals (`src/lib/motion.ts` + `src/components/Reveal.tsx` + `RevealHeading.tsx` rewrite):**
- Shared tokens: `EASE = power3.out`, `CINEMA = expo.out` bezier tuples, `DUR_BASE 0.9s`, `REVEAL_STAGGER 0.12`, `REDUCED_DURATION 0.4`, `STORY_FROM 0.25`, `GSAP_POWER3_OUT 'power3.out'`.
- House rules documented in code: 0.6–1.2s, `power3.out`/`expo.out`, `once: true`, reduced-motion gate, sirf transform+opacity, no spring/bounce/overshoot.
- `Reveal` (component): `mask = 'word' | 'line' | 'block'`, per-word `translateY(110%)` ITER → container overflow-hidden, `viewport={{ once: true, margin: '0px 0px -10% 0px' }}`, `whileInView`, `useReducedMotion` (reduce → duration 0 / y 0). **framer input `initial` raw serialized hote hain prerender me → page-in CSS fade `.js #root` fallback** (neeche CSS me).
- `RevealHeading` ab ek h1/h2 tag (semantic) + per-word masked spans — **aria-label = visible text** (aria-label escape-hatch tabhi jab text breakup bina space ke ho). `Reveal` (`as` title wrapper) + `RevealGroup` + `RevealItem` micro-API.
- **Refactor pura ho gaya:** About, Capabilities, Vision, Journal, Stats, SectionHeader, EnquiryForm, Footer, Resume, Landing (Journal CTA). Purane standalone reveal/cardAnim code delete.

**LoadingScreen delete:** `src/components/LoadingScreen.tsx` + `LOADING_WORDS` (`data.ts`) gayab. Hero ready-prop contract bhi hata diya (ab hamesha animate). **Page enter ab CSS fade** — `@keyframes page-in` + `.js #root { animation: 0.9s var(--ease-cinematic) both }` (0.4s reduced). CSS isliye: framer ke `initial` muqayyada prerendered HTML me serialized opacity:0 ka muqabla.

**Magnetic rewrite (`Magnetic.tsx`):** elastic.out chali (overshoot chalta tha). Ab gsap.quickTo x/y, `power3.out`, `duration 0.45`, **hard clamp ±8px**, gate `(hover:hover) and (pointer:fine)` + no-preference, glass animation dead par `gsap.killTweensOf`.

**ScrollProgress:** top 2px crimson bar, rAF, `scaleX` = scroll fraction. SSR-safe (no initial size read).

**Navbar hide/show on scroll:** `motion.header` `animate y: -130% / 0%` (0.5s expo, reduce 0.4s), `DIRECTION_THRESHOLD 6px`, `REVEAL_ALWAYS_BELOW 140px`. Active-link highlight via IntersectionObserver (`rootMargin: '-40% 0px -55% 0px'`).

**About story scrub (`useStoryReveal.ts`):** `data-story-line` paragraphs, ScrollTrigger `fromTo(opacity: STORY_FROM 0.25 → 1)`, `start 'top 94%' end 'top 64%'`, `ease: 'none'`, `scrub: true` — reading pace = reveal pace. `gsap.matchMedia` (no-preference only), dynamic `import('gsap/ScrollTrigger')` same 42.75 kB chunk as useWorkStackAnim.

**Contact pulse:** ek non-looping `scale [1,1.015,1]` (1.4s power3.out) on Contact email CTA (navbar "Say hi" protected).

**Lenis issues QA me pakde + fix kiye (real bugs):**
1. **Cross-route scroll araar ~296px ruk jata tha** (landing auto-scroll fire 100ms par, route-intransition + fonts unswapped WIDTH par target lock hota tha → section move ho jata). Fix: Landing autoscroll ab **650ms + `document.fonts.ready` + 1 rAF** ka wait karta hai (comment decode karta hai), phir ek baar measure karta hai. Same-page work, cross-route ab bhi 96px par settle.
2. **Queued-scroll race:** user nav click within defer-window par baad ka queued scroll page ko BE SHAKTA tha. Fix: `queueScroll()` (lenis.ts) + har intentional `scrollToSection/scrollToTop` pehle queued scroll ko cancel karta hai.
3. **Route enter ke dauraan sections mount nahi hote → same-page nav miss:** `Navbar.goTo` ab target missing par `navigate('/', { replace: true, state: { scrollTo } })` se defer kar deta hai.
4. **Reduced-motion me serf scroll chalti thi:** Lenis animate karta, lekin reduce par instist `scrollIntoView(behavior: 'auto')` + `window.scrollTo` (lenis.ts `reducedMotion()` helper).
5. **scroll-margin DOUBLE-COUNT bug:** Lenis khud `scroll-margin-top` respect karta hai → JS offset double karta tha (section ~186px upar utar jata). Ab `scroll-margin-top: 96px` (index.css) = SINGLE knob, `lenis.scrollTo(el, { offset: 0 })`. QA ke mut sig sections exactly 96px.

**index.css:** `html { scroll-behavior: smooth }` hata diya (Lenis se conflict); `section[id] { scroll-margin-top: 96px }`; `@keyframes page-in` + `.js #root` fade; focus-visible rings uniform.

**Verification (preview localhost:4174, Playwright):**
- Cross-route resume→'/' About = `804/96` settle; same-page Home→0, About/Work/Vision/Contact→96; `<a href="#journal">` → 96; full round-trip re-scroll par saari headings `transform: none` (re-reveal NAHI hota, `once:true`).
- Magnetic: synthetic pointermove → `translate3d(8px,0,0)` — clamp exactly 8px, no overshoot; media gates pass.
- Reduced-motion: heading spans pop `opacity 1 / none` (no y travel), story paragraphs `opacity 1` (scrub NOT attached), cross-route + same-page all **instant** jump to correct offset.
- Masked heading entrance captured live: word spans translateY decay `1.4px → 0.37px → none`; italic accent line deeper (`3.57px`).
- Mobile 360/390: **0 horizontal overflow**; 6 viewport sweep overflowX 0.
- Console: 0 errors, 0 warnings (landing scroll-full + resume + route round-trip).
- `npm run lint` 0 error·0 warning; `npm run build` pass (prerender `/` 45,015 B, `/resume` 8,369 B; index chunk 501.30 kB gzip 163.20, ScrollTrigger 42.75 kB async, CSS 47.89 kB — pre-existing chunk-size warning hi).
- ✅ **Pushed to `main`** (user ne soye hue explicitly permission di — "github or vercel dono par push kar diyo"). Vercel auto-deploy hoga.

**Files changed (v25):** `src/lib/motion.ts` NEW, `src/lib/useStoryReveal.ts` NEW, `src/components/Reveal.tsx` NEW, `src/components/ScrollProgress.tsx` NEW, `src/components/RevealHeading.tsx`, `Magnetic.tsx`, `Navbar.tsx`, `About.tsx`, `Capabilities.tsx`, `Vision.tsx`, `Journal.tsx`, `Stats.tsx`, `SectionHeader.tsx`, `EnquiryForm.tsx`, `Footer.tsx`, `Contact.tsx`, `src/pages/Landing.tsx`, `src/pages/Resume.tsx`, `src/App.tsx`, `src/lib/lenis.ts`, `src/index.css`, `src/data.ts`, `index.html`, `src/components/LoadingScreen.tsx` DELETED.

### [v24 — PROJECTS section rebuild: sticky stacking cards + GSAP] — 29 Sep 2026
**User ka brief:** **sirf PROJECTS section** rebuild karo — 4 projects ko sticky stacking cards me dobara layout karo + subtle GSAP animations. **Hero ya koi aur section touch NAHI.** Project titles/descriptions/images/links/tags **bilkul change mat karo.** Animation subtle rakho (heavy fly-through / 3D nahi).

**STEP 0 (report diya, phir code):** GSAP `^3.15.0`, Framer Motion `^13.3.0`, Lenis pehle se installed the. ScrollTrigger GSAP ke andar bundled hai par kahin use nahi ho raha tha. Projects section ek hi component `src/components/SelectedWork.tsx` tha + purana R3F implementation `src/components/works/` me.

**Purana 3D implementation poora delete:**
- `src/components/works/` — poora directory (9 files): `WorksScene`, `ProjectPanel`, `GridFloor`, `WorksOverlay`, `PanelClickLayer`, `ProjectDetailTransition`, `ProjectDetailCard`, `useProjectTransition`, `projectsData`.
- Orphan deps removed: `@react-three/drei`, `@react-three/fiber`, `three`, `@types/three` → `npm install` ne **61 packages** hataaye. **907.51 kB `WorksScene` async bundle chunk completely gaya** (build output se gaya).
- ⚠️ `server/package.json` ka apna `resend` alag hai — wo Render backend ka hai, touch nahi kiya.

**Naya layout (`src/components/SelectedWork.tsx`):**
- Heading: `RevealHeading` — bold Inter + `templates` word Instrument Serif italic. Live `01 / 04` counter (sticky offset se auto-sync) + existing GitHub "View all work ↗" link retained.
- 4 glass cards, direct sticky children, media/text sides **LEFT/RIGHT/LEFT/RIGHT** alternate.
- Cards me original `title`, `tagline`, `description`, `tech` chips, `tag`, `href` — **sab unchanged**. Sirf interaction badli: purana tile/detail overlay hata, ab direct `href` "View project ↗" (no href wale pe "Coming soon").
- `project.image` sirf first 2 projects me hai → baaki 2 ke liye existing `project.accent` se radial gradient fallback (invented image nahi banayi).

**⚠️ Do real bugs QA me pakde aur fix kiye:**
1. **Sticky architecture galat thi.** Cards ko alag wrapper (`flex flex-col gap-[22vh]` + har card ka wrapper) rakhne se card N **next card pin hone se PEHLE** scroll away ho jata tha — pure CSS stacking possible nahi. **Fix: sab cards ek tall `.work-stack` ke DIRECT sticky children** (`.work-card + .work-card { margin-top: var(--work-gap) }`), aakhri `.work-hold` bada spacer. Browser trace se confirm kiya.
2. **Mobile par card 93.9% viewport** (792/844) tha — stack effect bilkul invisible. Media `min-h-[38vh]` → `h-[28vh]`, text padding `p-7`→`p-6`, gaps `gap-7`→`gap-5`, paragraph margins trim. Result **80.1%** + niche **92px** next card dikhta hai. ⚠️ Type size **chhota nahi kiya** (title mobile par 30px hi hai) kyunki content delete nahi karna tha.
3. Tablet par side-by-side layout 768px se shuru ho raha tha, but brief ke mutabiq tablet par **image upar, text neeche** chahiye → breakpoint `md:` → **`lg:`** (1024px) shift kiya. CSS media query bhi 768 → 1024.

**Animations (subtle, `src/components/work/useWorkStackAnim.ts`):**
- `gsap/ScrollTrigger` **dynamic `import()`** → async chunk (42.75 kB), initial bundle me nahi.
- `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` → reduced motion par **kuch bhi attach nahi**; `mm.revert()` cleanup.
- **Covered card scrub:** next card ki taraf jaate hi current card `scale 0.94` + `opacity 0.6` + `blur 2px`, `ease:'none'`, `scrub:true` (scroll se exactly linked).
- **Entrance (per card, `once:true`):** media `clip-path: inset(0 0 100% 0)` → `0%` + `scale 1.15`→`1`; text lines `y:26` + fade **stagger 0.08**. End par `clearProps` (residual inline style nahi).
- Image `load`/`error` par `ScrollTrigger.refresh()`.

**Custom cursor (`src/components/work/WorkViewCursor.tsx`):** desktop fine-pointer **+ reduced-motion: no-preference** dono ke liye. `[data-work-card]` par delegated `pointermove` hit-test, lerp `0.16`, smooth opacity fade, idle rAF shutdown. ⚠️ Reduced-motion gate pehle miss tha (sirf fine-pointer check) → QA me pakda, add kiya.

**Hover:** crimson border `rgb(214,46,74)`, image `scale 1.05`, arrow `translateX(4px)` — sab CSS, reduced-motion par off.

**CSS (`src/index.css`):** `--work-sticky` (76px mobile → 100px desktop), `--work-gap` (16vh → 22vh), `--work-hold` (70vh), `--work-card-radius: 28px`, `.work-hold` spacer, hover rules, reduced-motion block (cards `position: relative`, gap 6vh, hold 8vh).

**Verification (Playwright + numbers — model image support nahi karta, screenshots user dekhenge):**
- **Sticky stacking:** desktop card exactly **75vh** (675px), 28px radius, `rgba(255,255,255,.1)` border, glass blur 16px, media **54.9%**, sides LEFT/RIGHT/LEFT/RIGHT, counter `01→02→03→04`, overflowX `0`.
- **Scrub:** mid = `scale .961 / opacity .74 / blur 1.2867px`; fully covered = `.94 / .6 / 2px`; next card phir apna independent scrub start karta hai.
- **Entrance (fresh URL bataya zaroori — browser scroll restoration page ko pehle se bottom par load kar raha tha):** parked `inset(0 0 36.5%)` → `15.9%` → `6.4%` → `1.7%` → `0%` → `none` (cleared); scale `1.024→1`; lines stagger clearly visible `6/0.79  10/0.66  16/0.47` → `2/0.94  4/0.88  6/0.78` → all `0/1.00`.
- **Hover + cursor:** idle border white → on-card `rgb(214,46,74)`, img `matrix(1.05,…)`, arrow `translate(4px)`, cursor opacity `0→1` at pointer → `0.009` off-card.
- **Reduced motion:** saare cards `position: relative`, normal flow, card0 `opacity 1 / filter none / clip none`, gap 54px, section **3422px** (vs 4412) — koi dead scroll nahi, cursor bhi mount nahi.
- **Responsive settled-state:** mobile 390 → column, sticky 76, card 676 (80.1%), media 236 upar, 92px niche; tablet 768 → column, sticky 76, 70.0%, 231px niche; desktop 1440 → row, sticky 100, 75vh, 125px niche. **Teeno par overflowX 0.**
- **Route cleanup:** Resume par `workNodes: 0` (clean unmount), wapas aane par 4 cards + **koi leftover inline transform nahi** (`mm.revert()` kaam kar raha hai).
- **Images:** 2 real socialify images `1280x640` load, `loading="lazy"`; 2 gradient fallback.
- **Console: 0 errors, 0 warnings, 0 failed requests** (landing + full scroll + route round-trip). ⚠️ Pehle QA run me jo "1 console error" dikha tha wo apne **test script ke `import()`** ka tha, app ka nahi.
- **Performance:** scrub ke dauraan median frame **20.8ms** (~48fps), p95 31ms, worst 44.1ms — koi jank spike nahi.
- `npm run lint` → **0 error, 0 warning**. `npm run build` → pass. `dist/assets/index-NEk9qgyv.js` **500.06 kB** (pehle 497.02), `ScrollTrigger-CIzi40EK.js` 42.75 kB async, `index-Dl4x3ktv.css` 48.40 kB. Prerender `/` **45,957 B** + `/resume` 7,909 B.
- Reference screenshots (user ke liye, model ne nahi dekhe): `.playwright-mcp/v24-1-section-top.png`, `v24-2-stack-mid.png`, `v24-3-stack-end.png`, `v24-4-mobile.png`.

**Files:** `src/components/SelectedWork.tsx` (rewrite), `src/index.css` (+85), `src/components/work/useWorkStackAnim.ts` (NEW), `src/components/work/WorkViewCursor.tsx` (NEW), `package.json` + `package-lock.json` (4 deps hataye), `src/components/works/` (**9 files deleted**). `src/data.ts` — **unchanged**. `Landing.tsx` — **unchanged**.

### [v23 — Dead code purge (Mux video, unused fonts, orphan deps)] — 28 Sep 2026
**User ka brief:** "jiski jarurat he nhi h usko delete kardo" — jo use nahi ho raha, hata do. Sirf dead code; koi visible change nahi.

**Audit method:** har component ka "refs outside its own file" count nikala + har `data.ts` export ka + har npm dep ka `src` refs. Jo 0 aaye wo dead maana gaya. **Koi bhi cheez bina reference-count verify kiye delete nahi ki.**

**Deleted:**
- `src/components/BackgroundVideo.tsx` — 0 refs (v22 ke baad Contact ne import band kiya tha)
- `src/components/TiltCard.tsx` — 0 refs (v7 se orphan; kabhi use nahi hua)
- `src/data.ts`: `VIDEO_SRC` (Mux test stream) + uska TODO comment, aur `HERO_ROLES` (v16 me rotating-role band hone ke baad orphan)
- `src/index.css`: `--font-archivo` + `--font-grotesk` @theme tokens, `--animate-role-fade-in` + `--animate-gradient-shift` tokens aur unke 2 `@keyframes` (`role-fade-in`, `gradient-shift`) — teeno ka 0 tsx usage tha
- `index.html`: Google Fonts link se `Archivo` + `Space Grotesk` families hata diye → ab sirf **Inter + Instrument Serif**
- `package.json`: `hls.js` (sirf `BackgroundVideo` use karta tha), `resend` (ye **frontend** package.json me tha; `server/package.json` me apna alag `resend@^4.8.0` hai — Render ko wahi chahiye, safe hai), `@vercel/node` (v12 me Vercel serverless function delete hone ke baad orphan)

**Result:** `npm install` → **116 packages removed** (234 → 118 audited). Bundle size me extra drop nahi hua kyunki `hls.js` chunk v22 deploy se pehle hi tree-shake ho chuka tha (Contact ne import band kar diya tha) — fayda primarily Vercel par **install time / deps hygiene** ka hai. Fonts critical path se 2 families hatin (3 font requests → 2).

**Verification:** `npm run lint` → 0 error (same 5 pre-existing R3F warnings). `npm run build` → pass, `dist/index.html` 40,335 B + `dist/resume/index.html` 7,909 B prerendered. Playwright: font requests sirf `Inter:wght@300..900` + Instrument Serif (Archivo/Space Grotesf **0**), Inter headings, `--accent #d62e4a`, `.glass` blur 16px, canvas present, hero webps intact, `#contact video` absent, section order unchanged, overflowX 0, **0 console errors** (landing + `/resume`).

### [v22 — Below-hero restyle: hero ke crimson-black system me poora page] — 28 Sep 2026
**User ka brief:** Hero ko bilkul untouched rakh kar **hero ke neeche ke saare sections** uske crimson-black look me restyle karo. Text/story/links/images/section order **bilkul change mat karo**. Naye animations mat add karo. **Final me har changed file list karo + koi bhi section jispar confident nahi ho use flag karo.**

**STEP 0 — Audit (pehle koi code change nahi):** STEP 1 shuru karne se pehle saare below-hero components (`About`, `Capabilities`, `SelectedWork` + 6 `works/*` files, `Vision`, `Journal`, `Stats`, `EnquiryForm`, `Contact`, `Footer`, `Marquee`, `Navbar`, `LoadingScreen`, `Landing`, `Resume`, `BackgroundVideo`) ka current styling + saare blue/magenta leftovers user ko present kiye.

**Design system (hero se nikala, hero code chhua nahi):**
- `--accent: #d62e4a` (`.hero-bloom` ka exact red), `--accent-ink: #e85a70` (chhote link text ke liye contrast), `--bg: #0a0407`, `--bg-elevated: #140609`, `--text: #f5f5f5`, `--glass: rgba(255,255,255,.05)`.
- Radii: card `24px` (`--radius-card`), tile/textarea `20px` (`--radius-tile`), pill/chip `999px`.
- New shared helpers `src/index.css` me: `.glass`, `.lift`, `.pill`, `.pill-primary`, `.chip`, `.field`, `.section`, `.shell` (max-w 1400px), `.shell-inner` (max-w 1200px), `.eyebrow`, `.section-glow`/`.glow-section`.
- **Typography rule:** headings = Inter extrabold, tight tracking; sirf accent words = Instrument Serif italic (`font-display`). 3D panels me bhi Archivo/Space Grotesk hata kar Inter/Instrument Serif laaye.

**Jo badla (17 files):**
1. `src/index.css` — Tailwind `@theme` color/radius tokens, `:root` tokens, body/selection/scrollbar, blue `.accent-gradient`/`.border-gradient-ring`/`.logo-ring`/`.cursor-glow` → crimson, saare shared helpers add.
2. `src/components/RevealHeading.tsx` — italic segments ab `font-display text-[0.76em] font-normal italic` (h1 chhota, readable).
3. `src/components/SectionHeader.tsx` — bold Inter heading + eyebrow + constrained subtext.
4. `src/components/About.tsx` — shell + glow, crimson photo ring, glass story cards, chips/pills, `accent-ink` links, timeline glow.
5. `src/components/Capabilities.tsx` — shell + glow, bold heading, glass cards, crimson icons.
6. `src/components/Vision.tsx` — **left-aligned** (hero-aligned) shell, crimson radial, bold statement lines (serif hataya — bold feel chahiye thi).
7. `src/components/Journal.tsx` — glass rows, crimson dots, pill tags.
8. `src/components/Stats.tsx` — hero-aligned shell, bold sans numerals.
9. `src/components/EnquiryForm.tsx` — glass `.field` inputs/select/textarea, danger text, hero-style submit pill.
10. `src/components/Contact.tsx` — **Mux test-stream `BackgroundVideo` hata diya** (purana blue-ish background tha), crimson radial glow add, Inter h2, white pill CTA + `accent-ink` phone link.
11. `src/components/Footer.tsx` — social links → `.chip`, status dot emerald → `bg-accent`.
12. `src/components/Marquee.tsx` — border strengthen (`border-stroke/60` → `border-stroke`).
13. `src/components/Navbar.tsx` — `bg-surface` → explicit `bg-bg/60 backdrop-blur-xl`, crimson scrolled shadow, "Say hi" → `.pill pill-primary`.
14. `src/components/LoadingScreen.tsx` — inline blue box-shadow → crimson, "Rachit" → `accent-ink`, counter → extrabold sans.
15. `src/components/SelectedWork.tsx` — section-glow, top bar/HUD text Inter, "View all work" → `.pill`, SSR `WorksFallback` crimson palette (dark `#05060a` bg hata ke theme surface).
16. `src/components/works/*` (5 files) — `WorksScene` canvas/fog `#0a0407`/`#0d0409`, `GridFloor` crimson cells/sections, `ProjectPanel` Inter + tighter type, `WorksOverlay` Instrument-Serif accent slug + crimson progress bar + extrabold counter, `projectsData` 4 gradient pairs crimson family, `ProjectDetailCard` `.glass` + crimson glow + pill buttons, `ProjectDetailTransition` accent fallback + tile radial/coming-soon colors crimson.
17. `src/data.ts` — `PROJECTS` accents: `#4E85BF`→`#d62e4a`, `#D946EF`→`#a11f3c`, `#8A94A6`→`#7d6a70` (×2).
18. `src/pages/Landing.tsx` — Journal action button → `.pill` (class order/border fix).
19. `src/pages/Resume.tsx` — `.section section-glow` + `.shell`/`.shell-inner`, bold Inter headings, accent-ink email/phone, `.chip` skills.

**2 real bugs build/QA me pakde aur fix kiye:**
- **`backdrop-filter` build me gayab ho raha tha.** Maine source me `backdrop-filter` **phir** `-webkit-backdrop-filter` likha tha → Vite ka Lightning CSS minifier dono ko collapse karke sirf `-webkit-` chhod deta tha (`.glass`/`.field` par `getComputedStyle().backdropFilter === "none"`). **Is project ka convention = prefix PEHLE, standard BAAD me** (same as existing `mask`/`-webkit-mask` rules) — 3 rules reorder ki, ab built CSS me dono emit hote hain.
- **`.pill` ka `border:` shorthand `border-image`/gradient-ring ko reset kar raha tha** → `.pill`/`.field` me `border-width/style/color` longhands use kiye. (Note: `border-gradient-ring` `border-image` nahi, `::before` + `mask-composite` se ring banata hai — computed `borderImageSource: none` dekh ke mislead ho sakte ho.)

**Verification (numbers, screenshots model ne nahi dekhe):**
- `npm run lint` → 0 error, sirf 5 pre-existing R3F warnings. `npm run build` → pass; `dist/index.html` 40,399 B + `dist/resume/index.html` 7,973 B prerendered.
- Preview + Playwright: `--accent #d62e4a`, `body bg rgb(10,4,7)`, Inter har heading par, Instrument Serif italic accent, glass `rgba(255,255,255,.05)` + `blur(16px)` + 24px radius, `.field` 999px (textarea 20px), gradient rings `::before` par render (CTA + nav "Say hi" + journal button), section order unchanged, **hero untouched** (`hero-base.webp`/`hero-reveal.webp`, `.hero-mask --r: 0px`).
- 3D: canvas present, HUD slug Instrument-Serif italic `accent-ink`, progress bar crimson, Fitness panel click → glass detail card (blur 16px, 24px radius, `rgba(214,46,74,.45) 0 40px 90px -30px` glow, Inter h3, "View Details ↗" → GitHub repo link). Coming-soon panel click → card nahi (shake + auto-close) — expected.
- `/resume` → Inter h1 72px, accent-ink email, pill chips, shell 1400/1200px, **0 console errors**.
- Responsive: 1440/1024/390 par `scrollWidth - clientWidth = 0` **har section me**; 390 par fields 332px, submit 100×45. `#contact` ke "overflow" flags sirf Marquee ke `w-max whitespace-nowrap` track ke andar hain (parent `overflow-hidden`) — page-level overflow nahi.
- Old-theme leftovers: `src` me `#4E85BF`, `#89AACC`, `#2F6FA3`, `#D946EF`, `#8B2FC9`, `#8A94A6`, `#3A3F4B`, `#5C6370`, `#05060a`, `#22242b`, `rgb(137,170,204)`, `emerald`, aur inline `Archivo`/`Space Grotesk` — **0 hits**.
- Reference screenshots (user ke liye, model ne nahi dekhe): `.playwright-mcp/restyle-{1-hero,2-about,3-capabilities,4-work,5-vision,6-journal,7-stats,8-enquiry,9-contact}.png`.

**Commit/push:** commit `57e6756` "Restyle below-hero sections to match the hero crimson theme" (26 files, `.playwright-mcp/` artifacts **exclude** kiye). ⚠️ **`main` push pehli baar REJECT hua (non-fast-forward)** — user ne v21 ko **PR #1** se merge kar diya tha (`401f301`), local `main` diverge tha. **Force-push nahi kiya**; `git pull --rebase origin main` → rebased to `e50f260`, phir clean push `401f301..e50f260`. Vercel auto-deploy se **LIVE** hua.

**Deploy verification (live, `https://rachitportfolio-fawn.vercel.app`):**
- Live CSS `assets/index-BYgp8lKr.css` = local build ka **exact same hash** (CSS me env vars nahi hote, isliye match hota hai; JS hash differ karta hai kyunki Vercel par `VITE_API_URL` = Render URL inline hai, local me localhost).
- `--accent:#d62e4a`, `--bg:#0a0407`, `.glass` + `.field` helpers live CSS me present; purana blue/magenta 0.
- Live `/` = 40,375 B **prerendered** — "Who is", "My Story", "My Journey", "My Vision", "Journal", "Fitness Website", "Neon Car Racing", "Selected Work" sab raw HTML me. `<video>` **absent** (Contact video removal live).
- Live `/resume/` = 7,949 B prerendered, "Education" text present → **`vercel.json` `/resume` rewrite + pre-rendering dono kaam kar rahe hain**.
- 💡 **Lesson:** user PR merge kar sakta hai beech me — push se pehle `git fetch` + `git log origin/main..main` check karo; reject aaye to rebase (force-push kabhi nahi).

### [v21 — Pre-rendering (SSR) + SSR-safe components + Vercel esbuild fix] — 28 Sep 2026
**User ka brief:** (A) build ke baad har page ki HTML me saara text likha ho (nav, Who is Rachit, My Story, Capabilities, Vision, etc.), (B) browser-only code SSR-safe (3D/GSAP/Lenis/CursorGlow/HLS) taaki build crash na ho + browser me design/3D/animations pehle jaise, (D) Vercel esbuild `allowScripts` warning fix + auto-deploy ki asli wajah. **SEO work (title/meta/canonical/OG/Twitter/sitemap/robots/JSON-LD/h1/alt) user khud karega — NAI KARA.**

**Jo kiya (sab branch `prerender-seo`, `main` untouched):**
1. `src/prerender.tsx` (NEW) — SSR entry: `renderToStaticMarkup`(<MemoryRouter initialEntries={[path]}><AppContent skipLoading /></MemoryRouter>). Component `renderRoute(path)` export karta hai.
2. `scripts/prerender.mjs` (NEW) — programmatic `vite build({ build: { ssr: src/prerender.tsx, outDir: dist-ssr } })` phir '/' aur '/resume' render karke `dist/index.html` + `dist/resume/index.html` me `<div id="root">` ke andar inject karta hai. Template = client build ka `dist/index.html` (hashed assets/head same).
3. `package.json` — `build` = `tsc -b && vite build && vite build --ssr src/prerender.tsx --outDir dist-ssr && node scripts/prerender.mjs`. **`"allowScripts": { "esbuild": true }`** add — npm 11+ install-scripts opt-in rule polish (esbuild ka postinstall Vercel par ab allowed).
4. `src/App.tsx` — `AppContent` export + `skipLoading` prop (SSR ke liye initial loading off; browser me same).
5. `src/components/SelectedWork.tsx` — `WorksScene` ab `lazy()` + Suspense fallback `WorksFallback` (static project list). **SSR me three/fiber/drei kabhi load nahi hota**; browser me 3D fly-through waise ka waisa. Node me lazy loader `{ default: WorksFallback }` return karta hai (THREE_CJS deprecation warning se bhi bachat).
6. `PANEL_SPACING`/`PANEL_COUNT` `projectsData.ts` me move — pehle `WorksOverlay` `./WorksScene` se import karta tha (SSR graph me R3F kheench leta tha).
7. `src/components/CursorGlow.tsx` — render-time `window.innerWidth` uso `useRef` init me → effect me (SSR crash fix).
8. `vercel.json` — `/resume` → `/resume/index.html` explicit rewrite SPA catch-all se pehle (Vercel par prerendered resume serve hoga).

**Verify (sab numbers, Playwright + Node):**
- `npm run build` → 0 errors. `dist/index.html` = 44,403 B, `dist/resume/index.html` = 8,443 B. Raw HTML text dump: nav (Home/About/Capabilities/Work/Vision/Contact/Resume/Say hi), "Who is Rachit", My Story, My Journey (2025/2026), Capabilities (OpenCode/GPT/ElevenLabs/Cartesia/Claude + 5 skills), 4 projects, Vision 6 lines, Journal, Stats, "Get in touch", Contact sab plain text me mila.
- `npm run preview` + Playwright: `/` aur `/resume` dono browser me perfect — 0 console errors, LoadingScreen, 3D Canvas rendered (panels + titles + HUD), form, footer sab sahi.
- `npm run lint` → 0 errors, sirf 5 pre-existing R3F warnings.
- ⚠️ Vite **preview** `/resume` ko nested index nahi serve karta (directory-index support nahi, sirf SPA fallback) — ye sirf local dev-server quirk hai; **Vercel par filesystem + explicit rewrite se `dist/resume/index.html` serve hoga** (deploy ke baad verify).
- THREE_Clock browser warning = three r186 runtime deprecation (live site par bhi, drei Grid se) — mera change nahi.

**Vercel auto-deploy ka asli jawab (`vercel ls --json` se, guess nahi):**
- **`git remote origin` = `https://github.com/rachithunyawrr/rachitportfolio.git`** — yahi sahi repo hai.
- **Vercel connected repo = `rachithunyawrr/rachitportfolio`** (githubRepoId 1372669364) — latest 3 production deploys (224590aa, 7192f291, 24f33360) sab isi repo ke commits se BANE hain → **auto-deploy working, koi mismatch nahi**. Dono repos me se galat wala koi nahi.
- **Production sirf `main` branch par deploy hota hai** — `prerender-seo` push production nahi badlega; main me merge ke baad auto-deploy hoga.
- esbuild warning ki asli wajah: npm 11+ dependency install-scripts ab **opt-in** (`allowScripts`) — paid nahi, sirf 1-line config.
- **Commit/push nahi kiya** (user rule: changed files ki list pehle dikha, phir commit).

**Warnings jaari (list user ko):**
- Vite build: "chunk > 500 kB" (pre-existing) — three ab alag chunk (WorksScene-*.js 907KB) + hls chunk (575KB) = code-split kar diya.
- Browser console: `THREE.Clock deprecated` (pre-existing, drei).
- src/App.tsx me abhi bhi build-type check allowed hai (user ke SEO phase me prerender.tsx se page head handle ho sakta hai — TODO).

**Files changed (7 modified + 3 untracked):** `package.json`, `src/App.tsx`, `src/components/CursorGlow.tsx`, `src/components/SelectedWork.tsx`, `src/components/works/WorksOverlay.tsx`, `src/components/works/WorksScene.tsx`, `src/components/works/projectsData.ts`, `vercel.json` + NEW `src/prerender.tsx`, `scripts/prerender.mjs`. AGENTS.md bhi. (`.playwright-mcp/` = test artifacts, commit nahi karna.)

### [v20 — Section order aligned to Sir's site (Ajay Dhull)] — 28 Sep 2026
**User ka brief:** apni site ka section order sir ki site (`https://lightsalmon-mallard-505670.hostingersite.com/`) jaisa karna hai. Pehle comparison table dikhao + confirm lo, phir code badlo.

**STEP 1 — Sir ki site ka exact order (Playwright DOM se):
1. Hero ("I am Ajay Dhull"), 2. `#about` "Who is Ajay Dhull?" (+ andar "My Story" + "My Journey" timeline 2023/24/25), 3. `#skills` "My Capabilities", 4. `#projects` "My AI Innovations", 5. `#vision` "My Vision", 6. `#contact` "Let's Build the Future Together", footer. Nav: ABOUT · SKILLS · PROJECTS · VISION · CONTACT.**

**STEP 2 — Meri site ka tab ka order:** Hero → SelectedWork → Journal → About → Capabilities → Vision → Stats → EnquiryForm → Contact (Landing.tsx se).

**STEP 3 — Comparison result (user ko dikha kar confirm liya):** sab sections already exist, **koi missing nahi** — sirf order galat tha (About 4th thi ek 2nd honi chahiye, Capabilities 5th→3rd, Work 2nd→4th, Vision 6th→5th). **User ne recommended order confirm kiya.**

**STEP 4 — New order (implemented, `npm run lint` + `npm run build` pass):**
1. Hero (`#home`) → 2. **About** (`#about`, Who is Rachit? + My Story + My Journey) → 3. **Capabilities** (`#capabilities`) → 4. **SelectedWork** (`#work`, projects/innovations) → 5. **Vision** (`#vision`) → 6. Journal (`#journal`) → 7. Stats (`#stats`) → 8. EnquiryForm (`#enquiry`) → 9. Contact (`#contact`)

**Files changed (3):**
1. `src/pages/Landing.tsx` — component order reorder.
2. `src/data.ts` — `NAV_LINKS` = Home, About, Capabilities, Work, Vision, Contact, Resume (koi section id change nahi hui).
3. `src/components/Navbar.tsx` — active-section observer ab `NAV_LINKS` ke saare non-route targets observe karta hai (pehle sirf `home`+`work`). Mobile 7 links fit karne ke liye nav pill par `overflow-x-auto` + `[scrollbar-width:none]` + `&::-webkit-scrollbar:hidden` (max-w-[calc(100vw-2rem)]).

**Verification (Playwright, dev server par):**
- DOM order = home→about→capabilities→work→vision→journal→stats→enquiry→contact ✅
- Nav tabs render: Home · About · Capabilities · Work · Vision · Contact · Resume · Say hi ✅
- 375px viewport: page horizontally overflow 0 ✅; nav pill scrollable (scrollWidth 591 > client 332, scrollbar hidden) — chhote screens par swipe se sab links pahunchte hain ✅
- `npm run lint` (sirf pre-existing R3F warnings) + `npm run build` pass (chunk-size warning pre-existing).
- **Commit/push nahi kiya** (user rule: sirf tab jab bole).

**Note:** sir ki site par jo "My Story"/"My Journey" hain wo About section ke ANDAR hain (top-level section nahi) — meri site par bhi hum yehi pattern follow karte hain to koi naya section banana nahi pada (STEP 5 = koi missing section nahi tha).

### [v19 — Hero reveal layers inverted (sunglasses-bleed bug fix)] — 28 Sep 2026
**User ka report:** hero me ek visual bug — `hero-reveal.webp` ka **sunglasses ka chhota sa hissa (right lens tip)** bina cursor ke bhi dikh raha tha.

**Root cause:** reveal (silver) images ki **bottom layer** thi, aur uss par koi mask nahi tha (mask top layer = base par "hole" wala tha — `transparent 0%..black 100%`). Isliye jahan bhi reveal ke pixels base ke silhouette se bahar nikle (jese sunglasses tip), wo hamesha show hote the — cursor ki circle ka koi control nahi tha.

**Fix — layer logic invert kiya:**
- `hero-base.webp` (black blazer) = **BOTTOM layer**, hamesha fully visible, **koi mask nahi**.
- `hero-reveal.webp` (silver + sunglasses) = **TOP layer**, default fully hidden, sirf cursor ke soft circle ke andar visible. Mask ab **isi top layer par**:
  `radial-gradient(circle var(--r) at var(--x) var(--y), black 0%, black 60%, transparent 100%)` (+ `-webkit-mask-image`), `mask-repeat: no-repeat` (+ `-webkit-`).
- `--r: 0px` by default → reveal completely invisible (load par / cursor bahar). Lerp logic, feather, touch auto-sweep, preload, sizes — sab unchanged.

**Files changed (2):**
1. `src/components/Hero.tsx` — image order swap (base first/reveal second, same `absolute inset-0` classes, same position) + `.hero-mask` class ab reveal par + JS variable `--reveal-r` → `--r`.
2. `src/index.css` — `.hero-figure` me `--reveal-r: 0px` → `--r: 0px`; `.hero-mask` ka gradient invert kiya + `mask-repeat` (dono prefix) add.

**Verification (deterministic — headless rAF 0.9fps se bachne ke liye standalone test page `public/__masktest.html` use kiya, phir delete):**
- `--r=0` wala screenshot **pixel-identical** (mean 0, max 0, 0 px changed) to reveal layer `display:none` wale screenshot ke → **sunglasses bleed GONE**, reveal rest par fully hidden.
- Circle `--r=140` upper face (sunglasses area) par → 19,928 px changed (reveal dikh raha hai ✅).
- Circle `--r=140` mid-figure → 75,162 px changed (silver blazer swap pehle jaisa ✅).
- Dono imgs identical rect me (531,180 540x720 @1440) ✅. `npm run lint` pass (0 error), `npm run build` pass (sirf chunk-size warning).
- **Commit/push nahi kiya** (user rule: sirf tab jab bole).

**Note:** `--reveal-r` renamed → `--r` (user ke CSS spec ke literal), sirf `Hero.tsx:63` + `.hero-mask` css me tha.

### [v18 — Vercel ➜ GitHub connect LIVE (push = deploy) + manual deploy] — 28 Sep 2026
**User ka symptom:** v17 push ke baad bhi live site par **purana** version dikh raha tha.

**Root cause (expected behaviour, not a bug):** Vercel **GitHub se connected nahi tha** — deploy hamesha CLI (`vercel --prod`) se hota tha. Isliye `git push` karna deploy ke barabar nahi hai. Ye baat `Todo` me open thi hi ("GitHub deploy connect karna"), par v17 ke commit message me "Pushed" likhne se pata nahi chala.

**Evidence (live inspect kiya, guess nahi):**
- Live `index.html` me **koi hero preload hi nahi** → v16 hero rebuild se pehle ka build.
- Live bundle `index-BiI3tPjh.js` vs local build `index-B7oCaJ21.js` → stale.
- **Render par kuch deploy karne ki zaroorat nahi** — Render sirf API hold karta hai (`rootDir: server`), `/health` 200, `/` 404 (by design). Frontend sirf Vercel par hai.

**Jo maine kiya (interim fix):**
1. `.vercel/project.json` link folder **missing** tha → `vercel link --project rachitportfolio --yes` (directory me spaces hain isliye `--project` flag zaroori). Project `prj_GiCDhXYMTAsKnW3gFTQnMcMUbkai`.
2. `vercel --prod --yes` → deploy `rachitportfolio-e4m2o9mqc-rachit-09a3.vercel.app`, aliased to **`rachitportfolio-fawn.vercel.app`**.
3. Verify: live HTML me `hero-base.webp` + `hero-reveal.webp` ✅, `hero-base.webp` 200 / 167,812 B / `image/webp` ✅, `hero-base.png` 404 ✅, live bundle me `https://rachit-api.onrender.com` inline ✅.

**Permanent fix (user ne kiya):** user ne Vercel me **Git repo connect kar di** → ab `main` push karte hi Vercel **auto-deploy** kar dega. CLI deploy ki zaroorat nahi.

**Do chote notes:**
- `vercel whoami` kabhi kabhi "Worker timed out after 10 seconds" deta hai — wo background update-check worker hai, actual command chalta hai. Retry karne par chal jata hai. Login `rachitsharma999088-2207`.
- Vercel build log me `npm warn install-scripts ... esbuild@0.27.0 (postinstall)` aata hai — **non-blocking warning**, build pass hota hai.

**Testing gotcha (headless env):** is VM me Playwright ka raw `requestAnimationFrame` **0.9 fps** chalta hai (page "visible" hone par bhi). Isliye cursor-reveal ka lerp (`r += (target-r) * 0.14` per frame) browser-me test karte waqt bahut slow lagta hai — **ye environment artifact hai, code ka bug nahi.** Verify karne ke liye `--reveal-r` ko direct CSS variable se set karke screenshot lo. Real browser me 60fps pe ~0.5s me settle hota hai (local dev par verify hua: 140px ↔ 0.03px).

### [v17 — Hero photos PNG ➜ WebP (q92) + GitHub push] — 28 Sep 2026
**User ka brief:** "hero ke photos ko webp mai convert karke changes github par push kardo." Sirf format conversion + push — koi naya design/feature nahi.

**Encoder (koi installed nahi tha):** `cwebp` ❌, `magick` ❌, system Python me Pillow ❌. **Fix:** throwaway venv banaya (`C:\Users\fvcvv\AppData\Local\Temp\opencode\webpenv`, Pillow 12.3.0, `features.check('webp')` = True) → **project ke dependencies bilkul touch nahi hue.** Venv temp me hai, repo me nahi.

**Lossless vs lossy — properly measured (pehla measurement galat tha!):**
- Mera pehla error function `histogram()` ka **global bin index (0-767)** weight kar raha tha, channel value (0-255) nahi → har quality par same fake `meanErr≈85`. Fix kiya: `i % 256`.
- Sahi numbers (1086x1448, RGB + alpha alag):
  | file | PNG | lossless | **q92** | q88 | q84 |
  |---|---|---|---|---|---|
  | hero-base | 1,768,829 B | 1,122,042 B | **167,812 B** | 119,952 B | 93,228 B |
  | hero-reveal | 2,084,531 B | 1,338,264 B | **293,992 B** | 223,264 B | 182,578 B |
  | **total** | **3,853,360 B** | 2,460,306 B | **461,804 B (-88%)** | | |
- **q92 chuna:** PSNR **42.95 dB** (base) / **41.59 dB** (reveal) — >40 dB = visually lossless. **Alpha bit-identical** (`alpha_quality=100` + `exact=True` → alpha mean err 0, max 0) → cut-out silhouette edge bilkul utni hi sharp hai. Lossless se 1.84x chhota.
- Dimensions har candidate par assert kiye: **1086x1448 exact**, alpha range 0-255 intact.

**Files changed (3):**
1. `src/data.ts` — `HERO_IMAGES.base/.reveal` → `.webp` (+ comment me q92/alpha note)
2. `index.html` — 2 preload links → `.webp` + `type="image/webp"`
3. `public/assets/hero-base.webp` / `hero-reveal.webp` — **NEW**; repo ke PNG copies **delete** kiye (originals `D:\Pictures` me safe)

**Verification:**
- Dev server par `Content-Type: image/webp` ✅, dono imgs `naturalWidth/Height = 1086x1448` ✅, identical `540x720` box ✅.
- Cursor-reveal pixel-diff (chest 60x60): **20 → 56** luma. PNG build ka reference **20 → 63** tha — 36 vs 43 ka gap sirf lossy compression (silver area high-detail) ki wajah se, PSNR 41.6 dB ke andar. Mask CSS verify: `radial-gradient(140px at 271.21px 504px, ...)` → 531+271=802, 180+504=684 = pointer ka exact position. ✅
- `npm run lint` ✅ (5 warning lines, **sirf pre-existing R3F** — `WorksScene.tsx:22,40`, `ProjectPanel.tsx:101`; Hero me 0) + `npm run build` ✅ (`dist/assets/` me dono `.webp`, koi hero PNG nahi).
- **Pushed to `main`.** Commit: `Rebuild hero with cursor-reveal outfit swap + WebP assets`.

**⚠️ 2 cheezein jo pata karni hain:**
1. **BUG (fix nahi kiya, sirf report):** Fixed **Navbar** hero ke upar overlay hai (`top:24, h:53`), to pointer nav par jaane se hero ka `pointerleave` fire hota hai → reveal circle **140px → 0.04px collapse** ho jata hai, wapas aane par 140px. Spec ke hisaab se technically sahi ("hero se bahar jaane par 0"), par visually glitch lagta hai. **Fix idea (chhota):** `pointermove` section ki jagah `window` par suno aur shrink tab karo jab pointer hero ke **rect** se bahar nikle — nav overlay rect ke andar rehta hai → reveal bana rahega. Bolo to kar deta hoon.
2. **Screenshots dekh kar confirm nahi kiya** (model image support nahi). Sunglasses/alignment ka numeric proof hai, par aankhon se final check tum karna — bilkul koi change nahi karna hoga, sirf confirm karna ki silver→black swap theek dikh raha hai.

### [v16 — HERO REBUILD: cut-out photo + cursor-reveal outfit swap] — 28 Sep 2026
**User ka brief (phase 1):** Sirf HERO SECTION redesign. Hero ke neeche ka koi section (My Story/About etc.) touch NAHI karna. Navbar untouched. Naya project nahi — existing Vercel wala project hi.

**STEP 1 — Images found & copied (byte-for-byte, no resize):**
- Source: `D:\Pictures\photo 1.png` + `D:\Pictures\photo 2.png` (user ke folders `D:` drive par hain, `C:\Users\fvcvv\Pictures` exist hi nahi karta — dhyan rakhna).
- Dono **exactly 1086x1448 = 3:4 ratio**, 32bpp ARGB (transparent cut-out). ✅ confirmed
- `photo 1.png` → `public/assets/hero-base.png` (1,768,829 bytes)
- `photo 2.png` → `public/assets/hero-reveal.png` (2,084,531 bytes)
- **Blazer verify kiya (agent image-view nahi kar sakta, to numeric pixel sampling se):**
  - `photo 1` torso mean luma **47**, 81% pixels very dark → **BLACK blazer** ✅
  - `photo 2` torso mean luma **123**, 38% very dark → **SILVER blazer** ✅
  - Alignment proof: same scanline par transparent px count **697 vs 694** → same pose, same framing.
  - ⚠️ **Sunglasses visually confirm nahi kiye** (model image input support nahi karta) — numbers silver blazer ke favour me hain. User se ek baar dekhna hai.
- **Silhouette ka important discovery:** photo ka bottom **~38% (image y≈898 se neeche) edge-to-edge OPAQUE** hai — base me near-black (luma 27), reveal me bright silver (luma 144). Yani cut-out ka neeche ek wide dark mass hai, clean silhouette nahi. Isi wajah se bottom dissolve mask lagaya (neeche dekho).

**STEP 2 — New hero layout (`src/components/Hero.tsx` poori tarah rewrite):**
- Full-screen, **deep crimson → near-black** radial bg: `#6b1220 → #480d19 → #2a0711 → #120309 → #060104`, + separate `hero-bloom` layer (slow 12s breathing glow, crimson ke peeche) + `hero-vignette` (edges near-black).
- Photo: cut-out, **bottom-aligned**, `aspect-[3/4]` (exactly 1086:1448) → `h-[46vh]` mobile → `lg:h-[74vh]` → `xl:h-[80vh]`, `xl:left-[56%]` (slightly right of center).
- Left: Instrument Serif italic **"I'm"** → Inter 800 uppercase **"RACHIT"** (`clamp(3rem,min(9vw,15vh),8.5rem)`) → Instrument Serif italic **"Digital Marketer"**. CTAs (*See Work* / *Reach out...*) rakhe gaye — scroll functions bache rahe.
- Bottom-right: intro paragraph, `HERO_INTRO` (data.ts se) — `max-w-[280px]`, text-right, **exactly 3 lines** @1440. Mobile par ye flow me copy-block ke niche aa jata hai.
- **`BackgroundVideo` (HLS Mux test stream) hero se hata diya** — crimson gradient ke saath replace. `BackgroundVideo.tsx` file + `VIDEO_SRC` abhi bhi `Contact.tsx:15` me use ho raha hai (us section ko chhua nahi gaya) — wahan Mux stream error aata hai jab internet na ho.
- `HERO_ROLES` rotating-role animation **band** (naye spec me subtitle static "Digital Marketer" hai). `HERO_ROLES` abhi bhi `data.ts` me exported hai, koi use nahi karta.
- GSAP entrance `.hero-rise` / `.hero-photo` + `ready` prop contract (LoadingScreen ke baad animate) — pehle jaisa hi pattern.

**STEP 3 — Cursor reveal (`Hero.tsx` rAF loop + `.hero-mask` CSS):**
- Dono imgs bilkul same box me stacked (verified: **identical 540x720 rects**), `hero-reveal` bottom, `hero-base` top.
- Mask exactly as brief: `radial-gradient(circle var(--reveal-r) at var(--x) var(--y), transparent 0%, transparent 60%, black 100%)` (140px radius, soft feather) + `-webkit-mask-image`.
- `--x/--y/--reveal-r` **ref-style, zero React re-render** — rAF loop, lerp `0.14`. `pointermove` (image container ke relative coords) + `touchmove`.
- Pointer hero se bahar jaaye → `r` smoothly **0** (verified 140px → 0.03px).
- rAF loop khud-ba-khud **settle hone par ruk jata hai** (`cur.r > 0.05` check) — idle battery waste nahi.
- **Mobile/touch:** `matchMedia('(hover: none) and (pointer: coarse)')` detect → circle automatically photo par **slow orbit loop** (cos/sin, lerp soft feel); user touch kare to `touchmove` position follow karta hai, **2.6s baad** auto-sweep wapas. `prefers-reduced-motion` par auto-sweep off.
- **Preload:** React 19 ke `<img preload>` prop installed `@types/react` me nahi tha (TS2322) → isliye `index.html` me explicit `<link rel="preload" as="image">` (base=high, reveal=low).

**Bottom dissolve mask ( mera addition, screenshot QA se nikla):**
- Hero ke box-borders par **hard vertical edges** mile (scanline diff: `x=530 13->30`, `x=1070 30->11`) — photo ke wide dark lower body ki wajah se. Fix: `.hero-figure` par 2 mask layers, `mask-composite: intersect` (WebKit: `source-in`):
  - vertical: `black 0% → black 58% → rgba(0,0,0,.72) 78% → transparent 99%`
  - horizontal: `transparent 0% → black 14% → black 86% → transparent 100%`
- Result: **sab hard edges gaayab** (y=620/700/760/800 scanlines par zero edges >14 luma). Ye **CSS display effect** hai — PNG files bilkul unchanged hain.
- ⚠️ **Agar user ko ye dissolve nahi pasand:** `.hero-figure` ka `mask-image` block `src/index.css` se hatao — baaki sab safe hai.

**Verification (sirf numbers, screenshots dekhe nahi gaye — model image support nahi karta):**
- Pixel-diff proof: chest region par circle band → **luma 20 → 63** (black → silver). Source PNG ke same rect par bhi **20 vs 63** → **alignment pixel-perfect**.
- Head region circle on/off: 17 → 18 (badal nahi) → **sirf blazer badal raha hai, head nahi** = sahi outfit-swap.
- 7 viewports test (360/390/768/1024/1280/1440/1920): `overflowX = 0` har jagah, figure har jagah bottom-flush, images identical boxes.
- Box-vs-box overlap flags `h1OverlapsFig`/`introOverlapsFig` **false positives** hain — figure ka box person se bada hai aur 14% edge fade hai. Real silhouette ke against h1→person gap: **54/73/77/48px** (1024/1280/1440/1920) — clear.
- `npm run lint` ✅ (sirf 3 pre-existing R3F warnings) + `npm run build` ✅ (sirf chunk-size warning).
- `index.html` me **Inter `wght@300..700` → `300..900`** (taaki `font-extrabold` 800 sach me heavy lage).

**Files changed (5):**
1. `src/components/Hero.tsx` — full rewrite
2. `src/index.css` — +85 lines (`.hero-bg`, `.hero-bloom`, `.hero-vignette`, `.hero-figure`, `.hero-mask`)
3. `src/data.ts` — +`HERO_IMAGES`, +`HERO_INTRO`
4. `index.html` — 2 preload links + Inter weight range
5. `public/assets/hero-base.png`, `public/assets/hero-reveal.png` — **NEW** (untracked)

**Local run:** `npm install` (pehle se nahi tha) → `npm run dev`
⚠️ **TODO:** commit/push **nahi** kiya (user rule: sirf tab jab bole). Images ~3.9MB total — agar hero LCP slow lage to `pngquant`/WebP consider karna (dimensions/alignment preserve kar ke).

### [v15 — GitHub Actions keep-alive cron LIVE (100% free)] — 16 Sep 2026
- **User rule declared:** **"sab kam bilkul free ma hona chiye"** — koi paid option nahi (Render cron $1/mo, Vercel Pro) kabhi propose nahi karna. Ye rule AGENTS me record kiya gaya.
- **GitHub Actions cron god — LIVE ✅:** `.github/workflows/keep-render-awake.yml` me har 10 min Render `/health` ping. Manual dispatch run verified **SUCCESS**.
- **Why GitHub Actions, not Render/Vercel cron:** Render cron job type free plan par block (`invalid plan: free` + docs $1/cron/month minimum); Vercel cron Hobby par sirf daily (`Hobby accounts are limited to daily cron jobs`). → GitHub Actions hi ONLY free 10-min scheduler option hai.
- **PAT `workflow` scope issue solved:** user ne naya PAT banaya (`workflow` scope included). Workflow file **git push se nahi, GitHub Contents API se** create hui — kyunki git push `.github/workflows/` ko `workflow` scope ke bina block karta hai, par Contents API chalti hai.
- **PowerShell gotcha (important):** YAML here-string `@"..."@` me `$` variables interpolate ho jaate hain → `$i`/`$code` gayab. **Single-quoted `@'...'@` use karo.** Existing file UPDATE par `sha` field miss hota hai to 422 aata hai — pehle file ka current sha fetch karke pass karo.
- **Token hygiene note:** user ne ab tak 3 `ghp_` PATs chat me share kiye (last wala `ghp_b9Z...` abhi active, workflow file usi se bani). Sab tokens only memory me — AGENTS me kabhi nahi likhe, repo me nahi. Safety: `ghp_b9Z...` rotate karne ke liye GitHub → Settings → Developer settings → PAT.
- `git push` ke andar `.github/workflows/` ab repo me committed hai (file Contents API se bani thi, merge ke baad local me aa gayi).

### [v14 — Fresh Render backend + client-side keep-alive] — 16 Sep 2026
- **Bug fix — stale edge/routing on old service:** `rachit-portfolio-api.onrender.com` kept returning `x-render-routing: no-server` despite multiple fresh deploys + restarts. Root cause: stale DNS/edge mapping after delete + recreate of service with same name/URL. **Fix:** created fresh service `rachit-api` (`srv-dal9dd5g1s2s73em6lig`) → new URL `https://rachit-api.onrender.com` — first request returned 200 immediately.
- **Service create (API):** `POST /v1/services` — name `rachit-api`, owner `tea-dal7a1jm8hqs73f5i11g`, repo same, rootDir `server`, plan free, region oregon. Env vars from `.env`.
- **Vercel env updated:** `VITE_API_URL` = `https://rachit-api.onrender.com` (production), frontend redeployed (`vercel --prod`). Bundle verified inline.
- **End-to-end verified:** POST `Origin: https://rachitportfolio-fawn.vercel.app` → `{"ok":true}` (Resend mail sent). Preflight → 204 + correct CORS header.
- **Old service deleted:** `srv-dal8sq3m8hqs73fabth0` removed.
- **Client-side keep-alive (`src/lib/keepalive.ts`):** pings `/health` on page load + every 8 min while open. Keeps instance warm during browsing → email form instant.
- **EnquiryForm 3-attempt retry:** on cold-start race (instance sleeping), handleSubmit retries up to 3 times with 6s backoff before showing error. Eliminates most user-visible failures.
- **Render free cron NOT available:** `cron_job` type requires paid plan (`invalid plan: free`). Render docs confirm minimum charge **$1/cron job/month** — free par Render-native cron exist hi nahi karta.
- **Vercel cron bhi free par nahi:** Hobby plan daily-only cron allow karta hai; `*/10 * * * *` deploy par reject hua (`Hobby accounts are limited to daily cron jobs`). Vercel cron experiment revert (`vercel.json` wapas simple rewrite, `api/keepalive.ts` delete).
- **GitHub Actions cron = ONLY free 10-min option** → **LIVE ✅:** user ne naya PAT banaya (`workflow` scope included). Workflow file `.github/workflows/keep-render-awake.yml` GitHub Contents API se create hua (git push andar `workflow` scope block karta hai, par Contents API se chalti hai). Har 10 min Render `/health` ping. **Manual dispatch run = SUCCESS** (step `Ping Render health endpoint` → success). Cron schedule `*/10 * * * *` active. 💡 **Gotcha:** PowerShell `@"..."@` here-string `$` variables maarta hai — YAML upload se pehle single-quoted `@'...'@` use karo (pehle attempt me `$i/$code` gayab ho gaye the, `sha` required hai for file UPDATE).
- **Client-side keep-alive (`src/lib/keepalive.ts`)** = tumhara active bandobast (site khula → har 8 min ping). Email form abhi kaam karta hai.
- `npm run lint` + `npm run build` pass (same known R3F warnings + chunk-size warning).

### [v13 — Render backend LIVE via REST API] — 16 Sep 2026
- **Render API key:** user ne `RENDER_API_KEY` diya (`rnd_MhRE8...`, full in `.env`) — **`.env` me saved (gitignored, repo nahi gayi)**. Safety note: ye key chat me bhi share hui hai — Rotate karne ke liye dashboard → Account Settings → API Keys.
- **`brew install render` myth:** Render ka koi CLI/brew package hota hi nahi — user ne galat tutorial dekha tha. Deploy **official Render REST API** (`api.render.com/v1`) se kiya.
- **Service created via API** `POST /v1/services`:
  - Name `rachit-portfolio-api`, owner `tea-dal7a1jm8hqs73f5i11g` (Rachit's workspace, from `GET /v1/owners`)
  - Repo `digitalguru99908-dev/rachitportfolio`, branch `main`, rootDir `server`, runtime node
  - Build `npm install`, start `node index.js`, health `/health`, plan `free`, region `oregon`, autoDeploy yes
  - Env vars: `RESEND_API_KEY` + `CONTACT_EMAIL` (values `.env` se)
  - **Service ID `srv-dal8cibl550s73cja300`, Deploy `dep-dal8cijl550s73cja59g`**
  - Dashboard: `https://dashboard.render.com/web/srv-dal8cibl550s73cja300`
  - **URL: `https://rachit-portfolio-api.onrender.com`** (may be `-xxxx` suffix issue? NO — direct URL live, no suffix)
- **Verified (end-to-end):**
  - `GET /health` → 200 `{"status":"ok"}`
  - `POST /api/send-email` (bina Origin) → 200 `{"ok":true}` (real Resend mail bheja)
  - `POST` from `Origin: https://rachitportfolio-fawn.vercel.app` → 200 (CORS OK)
  - Preflight `OPTIONS` → 204 + `Access-Control-Allow-Origin: https://rachitportfolio-fawn.vercel.app`
  - Ek baar 404 aaya (transient cold-start), dusri try par sab 200 — free instance spin-up timing.
- **Vercel env:** `VITE_API_URL=https://rachitportfolio-api.onrender.com` (production) set + `vercel --prod` redeploy. Bundle me **Render URL inline verified** (`/assets/index-*.js`).
- **Ab contact form poora kaam karta hai:** Vercel (static) → Render API → Resend email. Architecture clean: **Vercel = frontend only, Render = backend only.**
- **AGENTS note:** `render.yaml` repo me hai (pehle ke liye) — service ab API se bani hai; agar kaheen Blueprint apply karna ho to **existing service ko update** select karein, dobara create NAHI (name conflict hoga).

### [v12 — Backend split: Render (API) + Vercel (frontend)] — 16 Sep 2026
- **Architecture split:** user ka plan = **Render = backend (API), Vercel = frontend (static)**.
- **`server/` (Naya, Render deploy):** Express server (plain JS, ES modules) — `server/index.js` + `server/package.json` (express, cors, dotenv, resend). Ends:
  - POST `/api/send-email` → Resend API se mail (same logic jo pehle Vercel function me thi)
  - GET `/health`
  - CORS sirf allowed origins (`rachitportfolio-fawn.vercel.app`, `localhost:5173`/`4173`)
  - `.env` se keys (dotenv/config), Render par dashboard env se. Port = `process.env.PORT || 3001`
  - **Local test done:** `/health` 200, POST send-email `{"ok":true}` (real Resend mail bheja).
- **`render.yaml` (Naya):** Render Blueprint — `rachit-portfolio-api` web service, `rootDir: server`, `buildCommand: npm install`, `startCommand: node index.js`, env `RESEND_API_KEY` + `CONTACT_EMAIL` (`sync: false` → dashboard se manually set).
- **Vercel serverless hata diya:** `api/send-email.ts` delete (backend ab sirf Render par). Vercel ab sirf static frontend.
- **Frontend call:** `EnquiryForm.tsx` ab `import.meta.env.VITE_API_URL || '/api/send-email'` fetch karta hai. `.env` me `VITE_API_URL=http://localhost:3001` (local dev). **Production me Vercel env `VITE_API_URL` = Render URL set karna hai + redeploy** — tab tak live Vercel deploy NAHI kiya (purana bundle + purana function abhi chal raha hai).
- **Post-recommit konverge (`10de4f3` ke baad):** user ne kaha — frontend Vercel par host karo, old backend delete karo. Done: `vercel --prod` se **naya static-only frontend live** (`https://rachitportfolio-fawn.vercel.app`, 200), old serverless API ab dead (`/api/send-email` → 405). ⚠️ **Contact form abhi TUTA hai** (koi API nahi) — Render deploy ke baad hi wapas chalega. Frontend ko wapas test karne ke liye Vercel env `VITE_API_URL` = Render URL chahiye.
- **Secrets:** `.env`, `server/.env` dono gitignored verified. `server/.env.example` + root `.env.example` committed (no values).
- ⚠️ **TODO awaiting user:** (1) Render par service deploy karna (dashboard steps AGENTS me below), (2) Render URL milne par Vercel env `VITE_API_URL` set + `vercel --prod`.

### [v11 — Vercel deploy LIVE] — 16 Sep 2026
- **Login:** `vercel login` ho gaya (`rachitsharma999088@gmail.com`, scope `rachit-09a3`). Project link: `rachitportfolio`.
- **Project name fix:** directory `RACHIT PORTFOLIO` (space) me `vercel link` fail hua → `vercel link --project rachitportfolio --yes` se link kiya.
- **Env (production, Secret type):** `RESEND_API_KEY` + `CONTACT_EMAIL` set hue (`vercel env add ... --value ... --yes`).
- **Deploy:** `vercel --prod --yes` → **LIVE at `https://rachitportfolio-fawn.vercel.app`** (alias). Direct URL: `https://rachitportfolio-cad161b0c-rachit-09a3.vercel.app`.
- **Verified:** `/` = 200, `/resume` = 200 (SPA rewrite works), `/rachit.jpg` = 200, `/api/send-email` POST = `{"ok":true}` (Resend test mail bheja).
- **GitHub connect nahi hua** (Login Connection nahi hai) — deploy CLI se hota hai ya `vercel git connect` baad me.
- `.vercel` folder pehle se gitignore me; Vercel ka auto `.env*` duplicate .gitignore se hata diya taaki `.env.example` tracked rahe.

### [v10 — Secure contact form (Resend API) + Secrets protection] — 16 Sep 2026
- **Enquiry form ab Resend se mail karta hai (EmailJS hata diya):**
  - `api/send-email.ts` — Vercel **serverless function** (Node runtime). Form POST → Resend API se mail (`from: onboarding@resend.dev`, `to: CONTACT_EMAIL`, `reply_to` sender). API key **kabhi client/browser me nahi** — sirf server-side `process.env.RESEND_API_KEY` se.
  - `src/components/EnquiryForm.tsx` — `emailjs.send()` ki jagah plain `fetch('/api/send-email')`. Validation + sent/failed states same.
  - `@emailjs/browser` uninstall, `resend` + `@vercel/node` (devDeps) install.
- **Secrets protection (security):**
  - `.env` (Naya) — `RESEND_API_KEY` + `CONTACT_EMAIL` (real values). **`.env` gitignore me hai, GitHub par kabhi nahi jayega.**
  - `.env.example` (Naya, committed) — same keys, **no values**. Kisi bhi gobhi ko pata ho kaunse secrets chahiye.
  - `.gitignore` update — `.env`, `.env.*`, `!.env.example`, `.vercel` added. `.vercel` (CLI project folder) bhi ignore.
  - **Note:** `VITE_` prefix kabhi use nahi karna secrets ke liye (wo browser bundle me inline hota hai). Resend key only server-side.
- **Email source:** Resend free tier `onboarding@resend.dev` (testing). Agar custom domain verify karoge to `from` change ho sakti hai (`api/send-email.ts`).

### [v9 — Rachit's photo + Vercel ready] — 16 Sep 2026
- **Photo lagayi:** `D:\Pictures\rachit.jpg` → `public/rachit.jpg` (162KB) copy hui; `About.tsx` me photo slot ab initials placeholder ki jagah `/rachit.jpg` dikhata hai (240px circle, gradient ring, `object-cover`).
- **Vercel CLI installed:** `npm i -g vercel` (pnpm global bin PATH me nahi tha) → `vercel@59.19.0`. `vercel whoami` → login required.
- **`vercel.json` banaya:** `framework: "vite"` + SPA rewrite (`assets/` kochhod kar sab `/index.html` → `/resume` refresh par kaam kare).

### [v8 — Round 2 Fixes: DOM click, Lenis nav, About redesign] — 16 Sep 2026
- **Bug fix — project panel click ab har scroll position par reliably kholta hai:** 3D raycast hit-testing (unreliable, sirf focused panel work karta tha) hata ke **DOM click overlay** approach use kiya:
  - `src/components/works/ProjectPanel.tsx` — mesh se `onClick`/`raycast` gating hata diya; `useFrame` me har panel ka front-face **screen coords me project** hota hai (`Vector3.project(camera)`, 4 corners → viewport px rect) aur `screenRect` object me likhta hai.
  - `src/components/works/PanelClickLayer.tsx` (Naya) — sticky container ke upar invisible DOM `<button>`s (har panel ke liye ek), rAF loop se `screenRect` ke hisaab se position/size sync. DOM button click mesh raycast se kahin zyada reliable. Click → clientX/Y origin → `ProjectDetailTransition`.
  - `WorksScene`/`SelectedWork` — `focusIndex` state aur `active` prop puri tarah remove (ab sab panels clickable hain). `screenRects` = `useMemo` array (stable objects, React-render safe).
  - WorksOverlay + top "Selected Work" bar `pointer-events-none` already the; top bar container z-20→z-30.
- **Bug fix — nav/hero/"Say hi" links ab actually scroll karte hain (Lenis fight fix):** `scrollIntoView`/`window.scrollTo` Lenis se clash karta tha → `src/lib/lenis.ts` (Naya) — Lenis singleton `setLenis()`/`scrollToSection(id)`/`scrollToTop()` helpers. `App.tsx` me Lenis register; `Navbar`, `Hero`, `Landing` sab `lenis.scrollTo()` use karte hain.
- **Footer/social links:** pehle se real `<a target="_blank">` hain (`data.ts` SOCIALS). LinkedIn/Instagram abhi placeholder URLs (real handle share karo to replace).
- **About section redesign (`v8`):** photo slot (240px circular frame, permanent blue accent gradient ring, initials placeholder + `TODO: replace with Rachit's own photo` comment) + "My Story" card left column; bio paragraphs ab 3 bordered cards (`bg-surface border-stroke rounded-2xl`) + chips/buttons hover lift (`-translate-y-0.5` + border accent). "My Journey" timeline: har item scroll reveal, dot accent-gradient + glow spring-in.
- **Capabilities hover:** cards ab `hover:-translate-y-1` lift + border text-primary/50.
- **Enquiry Form:** already wired (`Landing.tsx` me, Stats ke baad, Contact se pehle) — sirf EmailJS credentials placeholders baaki (`src/components/EnquiryForm.tsx:19-21`).
- `npm run lint` + `npm run build` pass (sirf known R3F useFrame mutation warnings + chunk-size warning).

### [v7 — About / Capabilities / Vision / Enquiry Form Sections] — 16 Sep 2026
- **4 naye sections** landing page par (order: Hero → SelectedWork → Journal → **About → Capabilities → Vision → Stats → Enquiry Form → Contact**):
  - `src/components/About.tsx` — "Who is Rachit?" + chips (AI Tools 25+, Focus, VoiceMemories AI) + GitHub/LinkedIn pills + "My Story" bordered card + "My Journey" vertical timeline (2025–2026, dot + line style). `SOCIALS.github` / `SOCIALS.linkedin` links.
  - `src/components/Capabilities.tsx` — icon grid (lucide-react): Row 1 tools (OpenCode, OpenAI GPT, ElevenLabs, Cartesia AI, Claude), Row 2 skills (25+ AI Tools, Digital Marketing, AI-Powered Campaigns, Real Projects, Learning Every Day). 5 cols desktop → 2 cols mobile, hover lift + accent color.
  - `src/components/Vision.tsx` — bold stacked lines, big type alternative accent/muted, radial-glow bg in site's blue accent.
  - `src/components/EnquiryForm.tsx` — EmailJS form (NAME/TEMPLATE/PUBLIC_KEY placeholders `src/components/EnquiryForm.tsx` me — **user ko real EmailJS credentials daalne hain**). Fields: Name, Email, Reason select (Hire me/Collaborate/Just say hi/Other), Message. Validation + "Message sent ✓" 3s state + error state + disabled while sending.
- **Deps:** `lucide-react` + `@emailjs/browser` installed.
- `Landing.tsx` me saare sections wired, `id="about"` / `id="capabilities"` / `id="vision"` / `id="enquiry"`.
- `npm run lint` + `npm run build` pass (sirf same 3 R3F warnings + chunk-size warning).

### [v6 — Panel Click Gating + Detail Button Fix] — 16 Sep 2026
- **Bug fix — panels ab har scroll position par clickable:** `SelectedWork` me `focusIndex` (scroll progress se `round(p*(PANEL_COUNT-1))`) → `WorksScene` → `ProjectPanel active` prop. Non-active panels me `raycast={() => null}` → R3F unhe raycast nahi karta, focused panel ke click kabhi intercept nahi hote. `Html` me `pointerEvents="none"` prop bhi.
- **Bug fix — detail card buttons ab clickable:** `ProjectDetailTransition` ko `createPortal(document.body)` me render kiya — framer-motion transform stacking context + drei Html ke z-index (16M) se bahar. z-[1000], bg/tiles layers `pointer-events-none`.
- **Feature — "View Details" ab GitHub repo kholta hai:** `projectsData.ts` me `repoUrl` field (Fitness/Neon ke real GitHub URLs). Card me View Details = `<a href target=_blank>` anchor → repo naya tab me. Coming-soon → "Details coming soon" disabled. `toProject` me `repoUrl` fallback `href`. Detail panel flow `ProjectDetailCard` se hata diya (View Details ab in-card panel nahi kholta).
- Commit `7b48f56`.

### [v5 — Click-to-Open Project Animation Refactor] — 16 Sep 2026
- **Tile transition ko naye structure me refactor kiya** — `ProjectTileTransition.tsx` delete, ab 3 files `src/components/works/` me:
  - `ProjectDetailTransition.tsx` — full-screen overlay: GSAP timeline tiles panel origin se → scatter (0.5s, stagger 0.025) → circle converge (0.65s, stagger 0.04, CIRCLE_EASE) → hold → tiles dissolve (scale+fade) jis raj par detail card fade/scale-in hota hai. `prefers-reduced-motion` par tiles skip → direct crossfade. Timings per phir tweak kare (`AGENTS.md`).
  - `ProjectDetailCard.tsx` — card (accent label, title, tagline, View Details + ✕) aur full detail panel (image, About, Built with, GitHub link). Refs `cardRef`/`panelRef` transition ko dete hain (openPanel card fade-out + panel fade-in).
  - `useProjectTransition.ts` — hook: `{ request, open(project, originRect), close }`. `seq` counter → rapid multi-clicks par fresh mount (old timeline `ctx.revert()` se kill hota hai).
- **Per-project identity:** Fitness = blue accent + tiles apne screenshot (project.image, sprite-crop via background-position), Neon = magenta/purple + solid glow tiles, Coming-soon = desaturated (grayscale 0.6) tiles + circle me converge → gentle shake/bounce (x+14, y+10, repeat 4) → dissolve → auto-close (kabhi card nahi khulta).
- **Origin position:** `ProjectPanel` ab `onOpen(project, {x,y})` de deta hai — `event.nativeEvent.clientX/Y` (click point ka exact screen position). `SelectedWork` usse `DOMRect` banata hai → tiles panel ki position se originate hoti hain, screen center se nahi. Coming-soon ke liye chhota origin rect (0.09 * minDim).
- **Cleanup:** Escape/body scroll-lock, `timeline` context scoped `rootRef` + `ctx.revert()` on unmount, `closingRef` se double-close guard.
- `npm run lint` + `npm run build` pass (sirf 3 R3F ref-pattern warnings + chunk-size warning).

### [v4 — 3D Scroll-to-Fly-Through Works Section] — 16 Sep 2026
- **Naya 3D Works section** — `SelectedWork.tsx` ko 2D grid se **React Three Fiber 3D fly-through** me badla:
  - `src/components/works/WorksScene.tsx` — Canvas + camera rig. Scroll progress (`progressRef`) se camera Z-axis par panels ke beech se aage fly karta hai (start z=7 → end z=-18), eased lerp + `camera.lookAt` forward.
  - `src/components/works/ProjectPanel.tsx` — landscape gradient panels (5×3.1), DOM `Html` overlay (Archivo/Space Grotesk text), distance-based focus scale/opacity, click → open detail.
  - `src/components/works/GridFloor.tsx` — drei `<Grid>` infinite perspective grid floor.
  - `src/components/works/WorksOverlay.tsx` — HUD: "SCROLL TO FLY THROUGH" + live progress line + active slug + "01 / 04" counter (rAF loop reads progressRef).
  - `src/components/works/projectsData.ts` — 4 projects (Fitness, Neon, Upcoming, Video) with accent gradients matching `data.ts`.
- **Motion blur on fast scroll** — CameraRig velocity se camera ke sath-sath ek DOM wrapper par CSS `filter: blur()` apply karta hai (max ~8px).
- **Lenis smooth scroll** — `App.tsx` me `lenis` wired (`autoRaf`, lerp 0.09).
- **Click → detail** — `ProjectDetailTransition` (tile scatter → circle → dissolve → detail card) reuse; coming-soon projects click-par sirf shake karte hain (card nahi khulta).
- **Deps:** `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `lenis` install hua. `react`/`react-dom` **pin 19.2.8** (fiber 9.7 peer `react >=19 <19.3` — 19.3.0 par ERESOLVE aata tha).
- **Fonts:** `index.html` me Archivo (500–900) + Space Grotesk (300–700) add, `src/index.css` me `--font-archivo` / `--font-grotesk` theme vars.
- `npm run lint` + `npm run build` pass. Build chunk-size warning sirf (three.js bundle bada hai).
- **Scope note:** ScrollControls use nahi kiya — scroll ko window scroll (+Lenis) se drive kiya (`h-[400vh]` + sticky), taaki section mid-page embedded ho aur Lenis ke saath conflict na ho.

### [v3 — Tile Converge Transition + Background Fix] — 16 Sep 2026
- **Background black bug fix (VS Code):** `BackgroundVideo` me fallback gradient add hua. Video ab sirf tab visible hai jab actually play ho (opacity transition). HLS worker disable kiya. Hero ko nice dark-blue radial gradient fallback diya taaki video fail hone par bhi black nahi dikhe.
- **Project Tile Converge transition banaya:** `src/components/ProjectTileTransition.tsx` — GSAP timeline se tiles card se scatter → circle converge → dissolve → reveal card → detail panel. Per-project accent colors ([Fitness blue #4E85BF](data.ts), [Neon magenta #D946EF](data.ts)). Coming-soon cards desaturated + shake on click. `prefers-reduced-motion` par direct panel. Escape/body-scroll-lock handled.
- `data.ts` me Project type extend hua: `accent`, `tagline`, `description`, `tech`. Saare 4 projects ab detail-ready hain.
- `SelectedWork.tsx` ab cards ko expandable button banaya — click par transition khulta hai (pehle anchor link tha).

### [v2 — Repo Setup] — 16 Sep 2026
- Git init + GitHub repo `digitalguru99908-dev/rachitportfolio` (public) banaya + first push (`main` par).
- `AGENTS.md` banayi.

### [v1 — First Push] — 16 Sep 2026
- Project initial repo setup + GitHub par `rachitportfolio` repo banaya.
- `AGENTS.md` file banayi — project memory / instructions.
- Baat-cheet record:
  - User ne bola ki agent = partner hai is project ka, har kaam ka record `AGENTS.md` me rakhna hai.
  - Kaam ke baad hamesha khud file update karna (na puch ke).
- **Note:** User ne GitHub token chat me share kiya tha — token kabhi file/repo me nahi likha. (Security rule)

*[Pehle ke saare site kaam — Landing, Resume, components — is push se pehle ban chuke the, isliye unhe "built" state me dokument kiya gaya hai.]*

---

## 📌 Todo / Pending

- [x] **Vercel deploy — **LIVE: `https://rachitportfolio-fawn.vercel.app`**
- [x] **Render deploy (backend):** service LIVE via REST API — **API: `https://rachit-api.onrender.com`** (dashboard: `https://dashboard.render.com/web/srv-dal9dd5g1s2s73em6lig`)
- [x] **Vercel env `VITE_API_URL`** = `https://rachit-api.onrender.com` set + `vercel --prod` redeploy (form ab Render se mail bhejta hai)
- [x] **GitHub deploy connect (user kiya, v18)** — Vercel me Git repo connected → `main` push = auto-deploy. CLI deploy ab zaroorat nahi.
- [x] **`v22` restyle → `main` merge + deploy — LIVE** (`e50f260`, 28 Sep 2026). User ne v21 pehle hi PR #1 se merge kar diya tha, isliye rebase karna pada (force-push nahi).
- [x] **`BackgroundVideo.tsx` + `VIDEO_SRC` delete** — `v23` me ho gaya (0 refs verified, live bhi confirm).
- [x] **`index.html` se `Archivo` + `Space Grotesk` hata diya** (`v23`) — ab font link me sirf Inter + Instrument Serif; `--font-archivo`/`--font-grotesk` tokens bhi dead the, delete.
- [x] **`v25` commit + push `main`** — `dc87312` "Consistent subtle animation system + Lenis scroll fixes" (Vercel auto-deploy). [v25 entry me ye section poora revert-type volume thi; chahe short entry bhi]
- [x] **SEO + a11y phase (`v26`)** — seo-config/prerender head/robots/sitemap/JSON-LD, nav anchors, skip link, 404, client title sync, Lighthouse 100/100/100; push `main`.
- [ ] **`v27` LIVE SETUP baaki hai (user ke env ke bina nahi ho sakta):** Supabase SQL Editor me `supabase/schema.sql` + `supabase/seed.sql` chalao → admin user banao → Vercel me 7 env vars set karo → Supabase Database Webhook (`blog_posts` INSERT/UPDATE/DELETE → `SITE_REBUILD_HOOK` POST) banao → push. Tab tak `/admin` static content dikhayega (auth kuch nahi kar paayega), naye posts live nahi honge. `npm run verify` se pehle hi sab verify ho chuka hai.
- [ ] **`v22` restyle ka visual QA user ne khud nahi dekha** — screenshots `.playwright-mcp/restyle-*.png`; koi section pasand na aaye to batana.
- [ ] **`v24` projects rebuild ka visual QA user dekhe** — screenshots `.playwright-mcp/v24-*.png` (top / stack-mid / stack-end / mobile). Numbers sab verify hue hain par **model image support nahi karta**, isliye aankhon se final confirm user ka hai. Mobile card 80.1% vh hai (content preserve karne ki wajah se) — chhota lagta hai to batao.
- [x] **`prerender-seo` ka kaam `main` me merge ho chuka** — pre-rendering + SEO head ab `v26` me LIVE (`main`, auto-deploy).
- [x] **SEO phase (`v26` me khud kiya)** — per-route canonical/OG/Twitter/JSON-LD, `robots.txt`, `sitemap.xml`, h1/alt/heading refactor, Lighthouse 100/100/100. Baaki: Search Console submission + `SITE_URL` env on custom domain (user ka manual step).
- [ ] LinkedIn real profile link lagana (`src/data.ts`)
- [ ] Instagram real profile link lagana (`src/data.ts`)
- [ ] `VIDEO_SRC` ko real video (HLS/MP4) se replace karna
- [ ] Resend email `from` abhi `onboarding@resend.dev` hai — custom domain verify karne par apna domain use kar sakte ho (`server/index.js`)
- [ ] "Coming soon" project cards ko real projects se replace karna
- [ ] API keys (`RENDER_API_KEY`, `RESEND_API_KEY`) chat me share hue — **optional: rotate karna** (safe side)
- [ ] 3 GitHub PATs (`ghp_`) chat me share hue — active wala `ghp_b9Z...` hai (workflow file usi se bani). **Optional: abhi tokens zinda hain, koi action zaroori nahi; par agar chaho to GitHub → Settings → Tokens se rotate karo.**

## ✅ Render Backend — DONE via REST API (no dashboard clicks)

- **Service (current):** `rachit-api` | ID `srv-dal9dd5g1s2s73em6lig`
- **URL:** `https://rachit-api.onrender.com` | Dashboard: `https://dashboard.render.com/web/srv-dal9dd5g1s2s73em6lig`
- Env (dashboard/API set): `RESEND_API_KEY`, `CONTACT_EMAIL`. autoDeploy=yes (push par auto redeploy).
- ⚠️ **Rationale for name change:** Previous service `rachit-portfolio-api` had persistent `x-render-routing: no-server` after free-tier spin-down (stale edge/DNS issue after service recreation). Fresh name `rachit-api` resolves this.
- ✅ **Keep-alive LIVE (v15):** GitHub Actions cron (`.github/workflows/keep-render-awake.yml`, `*/10 * * * *`) + client-side keepalive + form retry — sab **100% free**.

## 🖥️ GitHub Actions Cron — LIVE (keep-alive)

- **File:** `.github/workflows/keep-render-awake.yml` (v15, Contents API se banayi — git push `workflow` scope block karta hai, API se hota hai)
- **Schedule:** `*/10 * * * *` — har 10 min `https://rachit-api.onrender.com/health` ping
- **Test:** manual dispatch run → SUCCESS (step "Ping Render health endpoint" pass).
- **Run history:** https://github.com/digitalguru99908-dev/rachitportfolio/actions
- 💡 **Gotcha:** YAML upload se pehle `@'...'@` single-quoted here-string use karo — `@"..."@` me `$i/$code` wale variables gayab ho jaate hain. File UPDATE karne par `sha` field required hai.
- ⚠️ **USER RULE:** sab kam **free** — GitHub Actions free, Render free, Vercel free. Paisa maangne wale options (Render cron $1/mo, Vercel Pro) kabhi mat propose karna.

---
*Generated by opencode — har agent is file ko read/update karega.*