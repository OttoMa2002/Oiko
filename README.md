# Oiko

AI-powered web builder. Describe a site in natural language; multiple agents
(research → architecture → code) collaborate to build it, with you in the loop.
Plus an audit agent that reviews any URL against structure/content/UX/SEO.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic SDK (`claude-sonnet-4-6`)
- Supabase (Postgres + Auth) — wired in a later step

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in ANTHROPIC_API_KEY when ready
pnpm dev
```

Open http://localhost:3000.

## Current status

Scaffold only. Routes exist and render text placeholders; API endpoints return 501.
Auth, persistence, and the agent runtime are not yet wired up.

## Project layout

```
app/
  page.tsx                landing
  (auth)/login            sign in
  (auth)/signup           sign up
  dashboard/              project + review list
  workspace/[id]/         agent chat + preview workbench
  api/chat                agent dialogue (501 stub)
  api/scrape              URL fetch for review (501 stub)
  api/review              audit agent (501 stub)
lib/
  anthropic.ts            server-side Claude client
  agents.ts               agent system prompts + token budgets
  types.ts                project / review types
```

See `CLAUDE.md` for the full product spec.