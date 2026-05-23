# Push

> An AI that interrupts your thinking with uncomfortable questions instead of finishing your sentences.

A thinking depth trainer built on Next.js + Gemini + Supabase. Detects surface-level thinking and pushes back with framework-based challenges (5 Whys, steelman, origin check, etc.).

## What's in this repo
app/page.jsx                 — the UI (textarea + pushback panel)
app/api/push/route.js        — server route, calls Gemini, logs to Supabase
lib/prompt.js                — THE system prompt. This is the actual product. Iterate here.
lib/gemini.js                — Gemini API wrapper with structured JSON output
lib/supabase.js              — server-side Supabase client
supabase/schema.sql          — paste into Supabase SQL editor
evals/test-entries.js        — your eval dataset
evals/eval-checks.js         — programmatic failure detection
evals/run-evals.js           — eval runne
## Setup (15 minutes)

### 1. Install
```bash
npm install
cp .env.local.example .env.local
```

### 2. Get a Gemini API key
https://aistudio.google.com/apikey → paste into `.env.local` as `GEMINI_API_KEY`.

### 3. Set up Supabase
1. Free project at https://supabase.com
2. Settings → API → copy URL and service_role key into `.env.local`
3. SQL Editor → paste `supabase/schema.sql` → Run

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy
Push to GitHub → import on Vercel → add 3 env vars → deploy. Vercel Web Analytics is wired in via `@vercel/analytics`.

## The IP: `lib/prompt.js`

This file IS the product. When you change it, bump `PROMPT_VERSION`. Version gets logged with every push so you can compare across iterations.

## Evals

```bash
npm run evals
```

Catches three failure modes per challenge: quote hallucination (targetPhrase not in entry), sycophancy (validation keywords), and genericness (low content overlap with the entry). Reports written to `evals/results/`.

## Analytics

- **Vercel Web Analytics** (page-level): unique visitors, page views, countries, referrers — automatic, free.
- **Supabase** (event-level): every push logged with visitor ID, prompt version, word count, response. Pre-built views: `daily_stats` and `retention`.

The two queries that actually matter:
```sql
-- Day-2 return rate
select count(distinct visitor_id) from pushes 
where created_at::date = current_date - 1 
  and visitor_id in (select visitor_id from pushes where created_at::date = current_date - 2);

-- Median engagement
select percentile_cont(0.5) within group (order by entry_word_count) as median_words from pushes;
```

## Cost
Free tier across all three (Gemini, Supabase, Vercel). Total cost to launch: $0.
