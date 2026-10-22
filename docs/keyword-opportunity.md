# Keyword opportunity — rachitportfolio-rouge.vercel.app

Report-only analysis. No claims about current rankings (Search Console data not
available). Difficulty bands are judgement calls based on the live SERP for the
local queries, not measured volume.

## Page → keyword map

### `/` (home)
- **Branded** — `rachit sharma`, `rachit sharma digital marketer`, `rachit sharma kaithal` — **easy**, should take top-1 within days of indexing.
- **Role + location** — `digital marketer rachit`, `marketer rachit` — **easy**, low competition, entity is unique.

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
- `digital marketer` (head) — SERP is agencies with DA 50+.
- `digital marketing agency in kaithal` — the site is a personal portfolio, not an agency; claiming agency would be a lie and would conflict with the site copy.

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
- Search Console property for the rouge host (v58 note: pending user).
- One external mention with consistent name+role (LinkedIn post, local directory) — AI engines weigh off-site entity corroboration heavily.
