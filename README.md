# LegalShield Outreach CRM

Prospecting → qualification → follow-up → conversion system for **Josias, an independent LegalShield associate**.

This app is **not** LegalShield's website and is not operated by LegalShield corporate. It finds and works
prospects, then hands qualified people to the official associate site:
**https://josias.legalshieldassociate.com/**

```
FIND → QUALIFY → CONTACT → FOLLOW UP → BOOK → PRESENT → ENROLL
```

## What's built (Milestone 1 — Foundation)

| Screen | What it does |
|---|---|
| **Today** (`/`) | New prospects, outreach sent, replies, positive replies, follow-ups due, meetings booked — all for today (Eastern time). Follow-ups due list with a one-click **Call** button. |
| **Pipeline** (`/pipeline`) | Board with every stage: Prospect → Contacted → Replied → Qualified → Meeting booked → Presented → Enrollment link sent → Enrolled, plus Lost and Follow-up later. |
| **Prospects** (`/prospects`) | Searchable, filterable list (stage, business vs. group). |
| **Prospect record** (`/prospects/:id`) | Every field from the spec, conversation history, log-an-activity form, stage mover. |
| **Call script** (`/prospects/:id/call`) | Josias's gatekeeper → benefits-person phone play. Greeting changes by day (Happy Monday / Taco Tuesday / Hump Day / almost Friday / Friday). Shows last call's personal notes so the next call opens with them. Everything captured is saved to the record. |
| **Do not contact** (`/suppression`) | Suppression list (email, phone, or whole `@domain`). Any opt-out logged anywhere lands here automatically and flags the prospect. |

**Automatic stage rules** (`src/lib/pipeline.ts`): outreach → Contacted · reply → Replied · "Book meeting" → Meeting booked ·
"Not now" → Follow-up later · "Not interested" / opt-out → Lost. Stages never move backward automatically.

## Setup

Requirements: Node 20+, a Postgres database (Supabase recommended).

```bash
npm install
cp .env.example .env      # then fill in real values
npm run db:migrate        # creates the tables
npm run dev               # http://localhost:3000
```

### Environment variables (`.env.example`)

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection. On Supabase use the pooled string (port 6543, `?pgbouncer=true`). |
| `DIRECT_URL` | yes | Direct Postgres connection (port 5432) — used for migrations. Locally, same as `DATABASE_URL`. |
| `ADMIN_USER` / `ADMIN_PASSWORD` | yes in production | Login for the whole CRM. Without them, production returns 503 (the CRM holds contact data and must never be public). |
| `NEXT_PUBLIC_ASSOCIATE_URL` | no | Official enrollment destination. Defaults to Josias's associate site. |
| `APP_TIMEZONE` | no | What "today" means. Defaults to `America/New_York`. |
| `SENDER_POSTAL_ADDRESS` | before any email campaign | CAN-SPAM requires a valid physical postal address in every commercial email. |

### Deploy (Vercel + Supabase)

1. Create a Supabase project → copy both connection strings.
2. Import this repo in Vercel → add the env vars above.
3. Build command is `npm run build` (runs `prisma generate`). Run `npm run db:deploy` once against the production DB to apply migrations.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm test` | Unit tests (call-script greetings, stage rules, suppression keys, time zone) |
| `npm run typecheck` / `npm run lint` | Type and lint checks |
| `npm run db:migrate` | Create/apply a migration locally |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:studio` | Browse the database in a GUI |

## Code map

```
prisma/schema.prisma        Tables: Prospect, Activity (conversation history), Suppression
src/lib/actions.ts          Server actions: create/update prospect, log activity, save call, opt-out
src/lib/pipeline.ts         Stage rules + suppression normalization (pure, tested)
src/lib/callScript.ts       Phone script, day-of-week greeting (pure, tested)
src/lib/dashboard.ts        Today numbers, follow-ups due, stage counts
src/middleware.ts           Password lock on every page
src/app/…                   Screens
```

## Compliance guardrails (built in and to keep)

- Clearly identified as an **independent** associate on every page; never styled as LegalShield corporate.
- Opt-outs stop contact immediately and permanently (suppression list checked on prospect creation; outreach engine in Milestone 3 must check it before every send).
- Employee counts are flagged as estimates unless confirmed.
- "Why we contacted them" is for observable facts only — no manufactured pain.
- No plan pricing/coverage claims live in this app. Anything sent to prospects about plans must come from current official LegalShield material.
- SMS is intentionally not built (TCPA consent requirements).

## Roadmap

- [x] **M1 Foundation** — app, CRM, dashboard, pipeline, call script, suppression
- [ ] **M2 Targeting** — business vs. group qualification scoring (legal need, access, size, relevance, timing / member count, HR structure…)
- [ ] **M3 Outreach** — campaigns, sequences A–G (5 emails each), follow-up scheduling, CAN-SPAM footer + unsubscribe link
- [ ] **M4 Conversation** — reply classification + suggested responses
- [ ] **M5 Conversion** — tracked CTA handoff to the official associate site
- [ ] **M6 Analytics** — funnel rates by industry, message, subject line, segment
- [ ] **M7 First campaign** — controlled batch (e.g., 100 contractors vs. 100 realtors), measure, then scale
