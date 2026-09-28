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

- Landing page complete with: LoadingScreen, Grain overlay, CursorGlow, Navbar, Hero (cut-out photo + cursor-reveal outfit swap), SelectedWork, Journal, About, Capabilities, Vision, Stats, EnquiryForm, Contact.
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
| `src/App.tsx` | Router + loading screen + page transitions |
| `src/data.ts` | Saara content ek jagah (info, socials, projects, stats) |
| `src/pages/Landing.tsx` | Home page |
| `src/pages/Resume.tsx` | Resume page |
| `src/components/` | Saare UI sections (Hero, Navbar, Contact, ...) |
| `public/assets/` | Hero cut-out photos, **WebP** (`hero-base.webp` = black blazer, `hero-reveal.webp` = silver). Source PNGs `D:\Pictures\photo 1.png` + `photo 2.png` me safe hain |
| `index.html` | SEO meta + fonts (Inter, Instrument Serif) + hero image preloads |

---

## 📝 Changelog (History of Work)

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

- [x] Vercel deploy — **LIVE: `https://rachitportfolio-fawn.vercel.app`**
- [x] **Render deploy (backend):** service LIVE via REST API — **API: `https://rachit-api.onrender.com`** (dashboard: `https://dashboard.render.com/web/srv-dal9dd5g1s2s73em6lig`)
- [x] **Vercel env `VITE_API_URL`** = `https://rachit-api.onrender.com` set + `vercel --prod` redeploy (form ab Render se mail bhejta hai)
- [x] **GitHub deploy connect (user kiya, v18)** — Vercel me Git repo connected → `main` push = auto-deploy. CLI deploy ab zaroorat nahi.
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