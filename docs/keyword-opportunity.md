# Keyword opportunity — rachitportfolio-rouge.vercel.app

Report-only analysis. No claims about current rankings (Search Console data not
available). Difficulty bands are judgement calls based on the live SERP for the
local queries, not measured volume.

## Page → keyword map

### `/` (home)
- **Branded + qualifier** — `rachit sharma digital marketer`, `rachit sharma kaithal` — **easy**, should take top-1 within days of indexing.
- ⚠️ **Bare `rachit sharma` is NOT easy.** Measured 23 Oct 2026: the site does not appear at all, because the SERP is owned by namesakes (a LinkedIn physician, a UC Berkeley researcher, an INSPIRE physicist, an IMDb entry). A bare-name result needs entity authority, not on-page work — see "Bare-name reality" below.
- ⚠️ `digital marketer rachit` / `marketer rachit` — measured 23 Oct 2026, site does not appear (`digitalrachit.com` owns it). Not winnable now.

### `/digital-marketer-kaithal` (v57)
- `digital marketer in kaithal` — **medium-easy**. SERP checked 23 Oct: dominated by JustDial-style directories + 3-4 weak local agency pages (easywebplans, digilinkservices, digivridhi, businexperts). A dedicated page with Person schema + real About/Journey copy can realistically reach page 1 in weeks–months.
- `digital marketing services in kaithal` — **medium-easy**, same SERP shape.
- `best digital marketer kaithal` — **easy**, almost no direct competitor page.

### `/resume`
- `rachit sharma resume`, `rachit sharma digital marketing resume` — **easy**, branded.
- `digital marketing fresher resume kaithal` — **hard**, no dedicated page; not worth targeting yet.

### `/blog` + posts
- `seo aeo geo explained`, `one brief one campaign sprint`, `why content doesn't convert` — **easy**, long-tail informational. Blog posts are the only realistic route to non-branded head terms.

## Not winnable yet (do not chase)
- **Bare `rachit sharma`** — see "Bare-name reality".
- `digital marketer` (head) — SERP is agencies with DA 50+.
- `digital marketing agency in kaithal` — the site is a personal portfolio, not an agency; claiming agency would be a lie and would conflict with the site copy.

## Bare-name reality (measured 23 Oct 2026)

Searched live, three times, with the same result: `Rachit Sharma` on its own does
not surface the site anywhere in the top results. Every slot belongs to a
different Rachit Sharma with real third-party corroboration. `Rachit Sharma
digital marketer Kaithal` returns the site at **#1** and the GitHub profile at
**#2**, and a `site:` query shows the pages indexed.

What that means, honestly: **there is no short-term fix for the bare name.**
Ranking for a name that six other people share is an authority contest, not an
on-page one, and the site already answers "who is Rachit Sharma" about as
cleanly as a single-page portfolio can (one definition sentence, Person schema
with `@id` / `address` / `sameAs` / `disambiguatingDescription`, Quick facts,
`llms.txt` + `llms-full.txt`).

The levers that actually move a bare-name result, in order of weight:

1. **Off-site corroboration (the real one).** Profiles that state the same
   name + role + city and link back: LinkedIn, GitHub, Instagram, plus any
   directory/professional listing. Two or three consistent, linked mentions do
   more than any schema edit. These are user actions; the site side is done.
2. **Time + indexed pages.** Every new answer-shaped page is one more URL that
   can be returned for `who is rachit sharma`, and entity recognition is
   cumulative.
3. **Schema disambiguation (done, low weight).** `disambiguatingDescription` on
   the Person node tells machines which Rachit Sharma this is. Google does not
   rank on it directly; it helps entity resolution, not ranking.

So: keep the winnable set (name + Kaithal / name + digital marketer), and let
off-site consistency and time handle the rest. Any promise of a fast bare-name
fix would be false.

## AI-citation queries (Google AI Overviews / ChatGPT / Perplexity)

AI answers retrieve by **entity + intent**, not by matching a keyword string. So
the realistic citation set is queries where "Rachit Sharma" is the subject or
where the answer is a definition the site states in one consistent sentence
(v40/v51 hardening).

Likely citation queries:
- `who is rachit sharma` / `rachit sharma digital marketer` — the `DEFINITION` sentence is byte-identical in About, Person schema and llms.txt; `llms-full.txt` + GitHub/LinkedIn/Instagram `sameAs` give the crawlers entity corroboration.
- `digital marketer in kaithal` — the `/digital-marketer-kaithal` page + city-level `PostalAddress` in Person schema.
- `what is AEO / GEO in digital marketing` — Quick facts + blog posts answer in complete sentences, per the v51 AEO structure.
- `does rachit sharma have a resume` — Quick fact + `/resume` ProfilePage schema.

What raises citation odds further (not done, optional):
- Search Console property for the rouge host — the verification file is already
  served live (`/google8296cc44e5c4188b.html`, 200). Adding the property is a
  one-time dashboard step; once it shows **Verified**, the sitemap stays
  submitted and needs no repeat. Checked live 23 Oct 2026.
- One external mention with consistent name+role (LinkedIn post, local directory) — AI engines weigh off-site entity corroboration heavily.
