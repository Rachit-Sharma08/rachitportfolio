# BRIEF — Phase 2 (AEO/GEO hardening)

> Saved verbatim from the user's brief. Not served by the site (docs/ is not under public/).
> If context is lost, re-read this file.

SAFETY FIRST: the live site must not break. Read AGENTS.md first.

HARD RULES
1. Work on a new git branch `phase2-aeo-geo` (git checkout -b). Do NOT push anything until every task below is done and every gate passes. Then fast-forward merge into main and push ONCE. No force push, no history rewrite. Do not touch .gitignore, Vercel settings, env files or Supabase.
2. Never write any token, password, API key or secret into any file. My phone number must never appear in the repo (site, JSON-LD, llms files, seed, docs, this brief); it exists only inside the resume PDF.
3. Use only the exact texts in this message. If any text is missing or unclear, STOP and ask me. Do not improvise or rewrite copy, not even to "improve" it. No keyword stuffing, no hidden text, no visual or design change except what is listed.
4. After every task run npm run lint, npm run build, npm run verify, npm run secrets:check. If anything fails, stop, fix the cause in the code and tell me. Never weaken, delete or skip a verify assertion to make it pass; if you think an assertion is wrong, stop and tell me why.
5. These words must not appear anywhere in site output, JSON-LD, llms files, seed.sql or data files: training, trainee, fresher, intern, internship. Report any use of "course" but do not change it.
6. Commit each task separately on the branch with a clear message.
7. First action: save this whole brief as docs/BRIEF-phase2.md (not under public/, not served by the site). If you ever lose context, re-read that file.

TASKS (in order)
T0) AGENTS.md: remove every stale note saying git auto-deploy is broken or that "vercel git connect" must be re-checked. Replace with: "Git push to main DOES auto-deploy on Vercel (commit f2af4aa deployed automatically). After pushing, wait up to 5 minutes and check the live site. Never run vercel --prod yourself; if nothing is live after 5 minutes, report to the user. A separate Vercel project called fitness-website was wrongly linked to this repo and caused a red X on GitHub commits; the user disconnected it in the Vercel dashboard. After that only one Vercel check (Vercel – rachitportfolio) should appear. If a second Vercel check ever shows up again, report it to the user; do not try to fix it yourself."

T1) Quick facts. Plain text, no FAQPage schema, no layout change, same card style. There must be exactly 7 items, in this order. Use these exact questions and answers (each answer is a complete sentence that names Rachit Sharma, do not shorten or merge them):
 1. Q: Who is Rachit Sharma?
    A: Rachit Sharma is a digital marketer who uses AI tools to build brands, campaigns and creative projects.
 2. Q: What does Rachit Sharma do?
    A: Rachit Sharma works in digital marketing with AI: Google Ads, Meta Ads, SEO, AEO and GEO (getting found on Google and in AI answers), plus web development. He uses 25+ AI tools, including OpenCode, OpenAI's GPT, ElevenLabs, Cartesia AI and Claude.
 3. Q: Where is Rachit Sharma based?
    A: Rachit Sharma is based in Kaithal, Haryana, India.
 4. Q: What is Rachit Sharma studying?
    A: Rachit Sharma is doing a BBA at RKSD College (Kurukshetra University) and is building his career in digital marketing with AI. He learns by building real projects with AI tools.
 5. Q: What is Rachit Sharma building?
    A: Rachit Sharma is building his own AI products, including VoiceMemories AI, which is designed to let a person have a warm, supportive conversation with a loved one's cloned voice, even on live calls. It is paused for now.
 6. Q: Does Rachit Sharma have a resume?
    A: Yes. Rachit Sharma's resume is available to read on the Resume page and to download as a PDF.
    (the words "Resume page" link to /resume)
 7. Q: How can I contact Rachit Sharma?
    A: Rachit Sharma can be contacted by email at rachitsharma9990888@gmail.com or through the Contact section of this website.
 If any of these texts live in a Supabase/admin field, update the code and seed.sql fallbacks and give me the exact admin field and exact text to paste; do not touch the live DB. Do not add or remove the word "Kaithal" anywhere else on the site in this task.

T2) Resume skills + PDF:
 a) In the single resume data source and in seed.sql, change the Digital Marketing skills line to exactly: "AI-powered digital marketing, Google Ads, Meta Ads, brand building, campaign building, creative content creation with AI". Update the "last updated" value to October 2026, in the same format the field already uses.
 b) PDF: look in D:\Downloads for the most recently modified PDF whose name contains "Rachit Sharma" and "Resume". Do not open or touch any other file there. Read its text. ONLY if the text contains "Google Ads" and "Meta Ads", has at most 2 pages, is text-selectable, contains the sections Professional Summary, Skills, Projects, Education, and contains none of the forbidden words, COPY (do not move) it over public/Rachit-Sharma-Resume.pdf. If any of these checks fails, do NOT copy it; skip this step, continue with the other tasks, and tell me exactly what failed. In the final report give file name, size and modified time of the file you used.

T3) Person JSON-LD knowsAbout: add "Google Ads" and "Meta Ads". In llms.txt "## About" add one line: "Works with Google Ads, Meta Ads, SEO, AEO, GEO and web development." Add these skills nowhere else.

T4) Schema:
 a) ProfilePage JSON-LD on the home page with mainEntity pointing to the Person @id (https://rachitportfolio-rouge.vercel.app/#person).
 b) BreadcrumbList JSON-LD on /resume and /blog.
 c) Blog post pages: Article JSON-LD with headline, datePublished, dateModified, author = the Person @id, image only if the post has one.
 d) Write these rules for future blog posts into AGENTS.md: question-style h2; a direct 1-2 sentence answer first, written as a complete sentence that names its subject; then detail; no keyword repeated unnaturally.

T5) robots.txt: keep "User-agent: *" with "Allow: /", "Disallow: /admin", "Disallow: /api", and keep the existing Sitemap line. Add one group for each of these crawlers, and EVERY group must repeat the same three lines (Allow: / , Disallow: /admin , Disallow: /api), because a bot with its own group ignores the * group: OAI-SearchBot, ChatGPT-User, GPTBot, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended. Check each name against the vendor's official documentation if you can browse; if you cannot verify a name, leave it out and tell me.

T6) /llms-full.txt. Plain text, generated at build. Use exactly this skeleton; every part marked [from data] must be generated from the site's existing data source (Quick facts data, resume data, projects data, contact data) and NOT retyped, so nothing can drift:
 # Rachit Sharma
 > Rachit Sharma is a digital marketer from Kaithal, Haryana, India who uses AI tools to build brands, campaigns and creative projects.
 ## Quick facts
 [from data: the 7 Q&A of T1, as "Q: ..." and "A: ..."]
 ## Skills
 [from data: resume skills]
 ## Projects
 [from data: resume/site projects with their links]
 ## Education
 [from data: resume education]
 ## Contact
 [from data: contact email, LinkedIn URL, GitHub URL, site URL. NO phone number.]
 Last updated: [from data: same real date as the resume "last updated"]
 Link /llms-full.txt from llms.txt. Only facts already on the site.

T7) Report only (no code change unless it is a safe fix for existing content missing from the prerendered HTML, and then tell me): list any key content that is only visible after JavaScript runs or only fetched from Supabase at runtime in the prerendered HTML of /, /resume and /blog.

T8) dateModified in the home, resume and blog JSON-LD from real dates only: resume uses the resume "last updated" value; blog posts use the post's updated or published date; home uses the newest of those. Never a future date, never invented.

T9) Verify additions: robots.txt has every group above with the three lines and the Sitemap line; /llms-full.txt exists, has no phone number and no forbidden words, and contains all 7 Quick facts questions; home page has exactly 7 Quick facts items and every answer is at most 2 sentences; every JSON-LD block parses with @context and @type; Person @id is identical on every page; no FAQPage anywhere. Keep all existing assertions.

T10) Final:
 a) Run all four gates on the branch. If green, git checkout main, git merge --ff-only phase2-aeo-geo, git push origin main (one push).
 b) Poll https://rachitportfolio-rouge.vercel.app/llms-full.txt every 30 seconds for up to 5 minutes until it returns 200. If it does not, do NOT use the Vercel CLI; report to me.
 c) Once live, check: /, /resume, /blog, /robots.txt, /sitemap.xml and /Rachit-Sharma-Resume.pdf return 200; the phone number is absent from every page and text file; the home page has Quick facts with 7 items.
 d) Print Lighthouse numbers for / and /resume as plain lines (performance, LCP, CLS, TBT). Report only.
 e) Final report: what changed per task, the PDF details, any forbidden-word hits, whether the push auto-deployed, and the list of things I must do by hand: Admin → Resume (paste the new Digital Marketing skills line), Admin → Blog (shorten the 89-character post title below 60), any Quick facts admin fields, Search Console, Bing Webmaster Tools, GitHub profile README, LinkedIn and Instagram bio.
