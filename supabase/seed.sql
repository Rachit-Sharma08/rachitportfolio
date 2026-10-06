-- ============================================================================
--  Rachit Sharma — Portfolio  |  Seed content
--  Run supabase/schema.sql FIRST, then this file.
--  Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--  Re-running is safe: posts upsert on slug, everything else is wiped first.
-- ============================================================================

-- Clear the tables that get re-seeded so ids/orders stay predictable.
delete from public.blog_posts;
delete from public.projects;
delete from public.site_story;
delete from public.site_settings;


-- ---------------------------------------------------------------------------
--  1.  SITE SETTINGS
--  Points at the images that already ship in /public/assets. Change these from
--  Admin -> Images once Supabase Storage is live; "Restore default" puts these
--  exact values back.
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('hero_base_url',    '/assets/hero-base.webp'),
  ('hero_reveal_url',  '/assets/hero-reveal.webp'),
  ('og_image_url',     '/og-image.png');


-- ---------------------------------------------------------------------------
--  2.  MY STORY
--  Markdown. Blank line = new paragraph. The live About page renders this with
--  the exact same card + font treatment as before, links and bold included.
-- ---------------------------------------------------------------------------
insert into public.site_story (section_key, content) values
(
  'my_story_card',
  E'I''m not from a big city or a coding background — I''m studying digital marketing at an institute and I learn by building with AI tools hands-on. I chose to follow what actually interests me, even when the easier path was right there. I got into AI in 2025, and once I started, I didn''t stop. Today I work with 25+ AI tools, I''m doing Digital Marketing with AI, and I''m building my own AI products on the side.'
),
(
  'my_story',
  E'I got interested in AI in 2025, and that''s when I started exploring it seriously.

I wanted to do a "Digital Marketing with AI" course early on, but I couldn''t start right away — I had my 12th CBSE boards going on, and some family situations made it hard to begin. After I finished 12th, my family wanted me to take a different course. But I decided to follow what I was actually interested in, so I went ahead and completed the Digital Marketing with AI course anyway.

Now I''m working on real projects — you can check them out on my [GitHub](https://github.com/rachithunyawrr) and [LinkedIn](https://www.linkedin.com/in/rachit-sharma-ab199443a/).

I currently know how to use 25+ AI tools. The ones I use the most are OpenCode (a coding agent), OpenAI''s GPT, ElevenLabs, Cartesia AI, and Claude.

I''m also starting to build my own AI products. One of them is called **VoiceMemories AI** — the idea is that someone can clone a loved one''s voice (if they have a voice sample) and have a real, emotionally supportive conversation with that voice — even live calls, not just text. It''s meant for people who''ve lost someone and want a way to feel close to them again. The project isn''t finished yet — I''ve paused it for now because of funding — but it''s something I really care about and plan to come back to.'
);


-- ---------------------------------------------------------------------------
--  3.  PROJECTS
--  Mirrored from src/data.ts, which is itself the fallback for the CMS.
--  display_order 1-3 = the order they stack in. No project_url = Coming soon.
-- ---------------------------------------------------------------------------
insert into public.projects
  (title, category, tagline, description, tech, image_url, project_url, accent, display_order)
values
(
  'Fitness Website',
  'Web · Fitness',
  'A fitness-focused site built to practice clean UI and real brand messaging.',
  'A fitness-focused website built to practice clean UI, responsive layout, and brand messaging. Designed to feel energetic, trustworthy, and conversion-friendly across every screen size.',
  array['UI Design', 'Responsive', 'Branding'],
  'https://socialify.git.ci/rachithunyawrr/Fitness-website/png?theme=Dark&font=Rokkitt&pattern=Circuit%20Board',
  'https://github.com/rachithunyawrr/Fitness-website',
  '#d62e4a',
  1
),
(
  'Neon Car Racing',
  'Web · Game',
  'A neon-soaked browser racer — built for fun, kept for the speed.',
  'A browser racing game built for fun and practice with JavaScript game loops. Fast, flashy, and built to feel arcade-smooth under the hood.',
  array['JavaScript', 'Game Loops', 'Canvas'],
  'https://socialify.git.ci/rachithunyawrr/neon-car-racing-game-/png?theme=Dark&font=Rokkitt&pattern=Floating%20Cogs',
  'https://github.com/rachithunyawrr/neon-car-racing-game-',
  '#a11f3c',
  2
),
(
  'AI Assistant Chatbot',
  'AI · Chatbot',
  'A chatbot that answers questions and helps users get things done',
  'An AI assistant chatbot designed to be added to any business website. It greets visitors, answers common questions about the business, and helps them find what they need without waiting for a human reply. I built it with OpenCode and Replit, handling the idea, prompts and testing myself.',
  array['OpenCode', 'replit'],
  'https://rynizhsmvxmvwqvldwkt.supabase.co/storage/v1/object/public/site-media/projects/Cinematic%20Laptop%20AI%20Assistant%20Showcase.webp',
  'https://github.com/rachithunyawrr/ai-assistant',
  '#d62e4a',
  3
);


-- ---------------------------------------------------------------------------
--  4.  BLOG POSTS — 4 published, 0 drafts
-- ---------------------------------------------------------------------------
insert into public.blog_posts
  (title, slug, category, excerpt, content, published, published_at, cover_image_url)
values
(
  'One Brief, One Campaign Sprint: What Changed When I Started Prompting Instead of Planning',
  'one-brief-one-campaign-sprint',
  'AI · Prompting',
  'A single sharp brief and the right prompts can move a campaign from idea to draft in an afternoon — here''s what that process actually looks like.',
  E'For a long time, campaign planning meant hours of staring at a blank doc: audience notes, tone guidelines, channel breakdowns, all written from scratch before a single ad or caption existed. What changed for me wasn''t a new tool — it was a new starting point: one sharp brief.

A brief here isn''t a paragraph. It''s four or five lines: who this is for, what they already believe, what we want them to feel after, and the one constraint that matters (budget, platform, deadline). Once that''s tight, I hand it to an AI assistant — usually GPT or Claude — as a starting prompt, and ask it to draft the full sprint: hook variations, a content calendar skeleton, ad copy in three tones, and a short list of what to track.

The AI doesn''t replace the strategy. It removes the blank-page tax. What used to take a full day of drafting now takes an hour of drafting and the rest of the day refining — cutting weak lines, tightening the hook, matching the brand''s actual voice instead of a generic one. That''s the part no tool does for you, and it''s the part that decides whether a campaign lands or blends in.

I''ve started treating every campaign the same way now: brief first, AI draft second, human judgment last — and always last. The order matters. Skip the brief and the AI gives you something generic. Skip the human pass and it reads like everyone else''s AI-generated content, because in a way, it is.

This is one of the small shifts I''m documenting as I go through digital marketing with AI tools — not big frameworks, just the actual workflow that ends up on a client''s calendar.',
  true,
  now(),
  null
),
(
  'SEO Isn''t Dead. It''s Learning to Speak AI',
  'seo-isnt-dead-its-learning-to-speak-ai',
  'SEO',
  'Search didn''t disappear when AI assistants showed up — it just added a second audience, the AI reading the page before the person does.',
  E'Every few months someone declares SEO dead, and every few months it just changes shape instead. The latest shift isn''t only about ranking higher on a results page — it''s about being the source an AI assistant reaches for when someone asks it a question instead of typing a search.

That means the page still needs the basics: a clear heading structure, one real topic per page, fast loading, a mobile-friendly layout. Nothing about that has gone away. What''s new is who else is reading it. Tools that summarize or answer questions tend to favor pages that are unambiguous — a clear answer near the top, natural language instead of forced phrases, and structured data that spells out who wrote it and what it''s about.

Practically, this has changed how I write anything meant to be found: fewer repeated phrases, more direct answers to the actual question a visitor — or an AI reading on their behalf — is asking. A meta description that reads like a sentence, not a keyword dump. Image text that describes the picture, not stuffs a phrase into it.

None of this is exotic. It''s closer to writing clearly and being specific than to any trick. The pages that struggle now are the ones optimized for an approach that no longer works the way it used to — and the ones that do fine are, unsurprisingly, the ones that were just clear to begin with.

SEO didn''t die. It just got another reader.',
  true,
  now(),
  null
),
(
  'Two Rebuilds Before It Felt Like a Brand',
  'two-rebuilds-before-it-felt-like-a-brand',
  'Branding',
  'The first landing page was fine. The second was better. The third finally felt like it belonged to someone.',
  E'The first version of a landing page I built was, by most checklists, correct: clear headline, a button above the fold, some proof lower down. It also felt like it could belong to almost anyone. Nothing about it was wrong, and nothing about it was mine.

The second pass fixed the obvious gaps — better contrast, tighter copy, an actual value line instead of a slogan. Still generic. It read like a template that had been filled in carefully, which is exactly what it was.

The third rebuild is the one that stuck, and the difference wasn''t a new layout. It was smaller decisions repeated on purpose: the same handful of words showing up across the headline, the button and the follow-up message, so it stopped feeling like three different people wrote three different parts of the page. One accent color used consistently instead of wherever it looked good. A tone that matched how the person behind the brand actually talks, not how brands are supposed to talk.

Branding, at the scale I''m working at, isn''t a logo or a palette decided in one sitting. It''s what survives being rebuilt twice — the handful of choices that keep showing up because they were the right ones, not because nobody got around to changing them.

If the first version of something you''re building feels correct but forgettable, that''s normal. The version that feels like a brand is usually the one you were willing to throw away and rebuild until it stopped feeling borrowed.',
  true,
  now(),
  null
),
(
  'The One-Hook Rule: Why Most Content Doesn''t Convert',
  'the-one-hook-rule',
  'Copywriting',
  'Most content doesn''t fail because it''s badly written. It fails because it asks for attention before it''s earned any.',
  E'Most content that doesn''t convert isn''t badly written — it''s badly ordered. The offer, the credibility, the details all show up before the reader has decided whether they care in the first place. By the time the actual point arrives, the wall of text has already done its job of losing them.

The fix I keep coming back to is what I think of as the one-hook rule: earn the next sentence before you earn anything else. Not a clever line for its own sake — a specific, honest claim or question that only makes sense to someone who actually has the problem you''re solving. Everything else — the proof, the offer, the call to action — only works after that line has done its job.

This shows up the same way across formats. A caption, an ad, an email subject line, even the first sentence of a landing page — each one only gets one shot at the hook, and padding it with a warm-up sentence just delays the moment someone decides to keep reading or scroll past.

Writing tighter hooks isn''t really a writing skill first. It''s a listening skill — knowing exactly what the person on the other end is already frustrated by, bored of, or hoping for, and starting there instead of starting with your brand.

The wall of text isn''t the problem. It''s usually just a hook that never showed up.',
  true,
  now(),
  null
);
