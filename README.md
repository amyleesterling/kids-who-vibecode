# Vibe Code Club

A playful, parent-supervised community for young creative coders. Every week brings a new open-ended challenge; kids can build with any tool, submit through a grown-up, explore approved projects, and vote for one favorite.

## Live site

**[Open Vibe Code Club](https://vibecodeclub.org)**

Jump straight to **[this week's challenge](https://vibecodeclub.org/#challenge)**.

The site is also available through `vibecodekids.com` and `www.vibecodekids.com`; `vibecodeclub.org` is the canonical public address.

## What is included

- A responsive weekly challenge landing page
- Project gallery with one favorite vote per browser and shared weekly totals
- Parent-supervised submission form with a moderation queue
- A visitor challenge-idea form with a grown-up permission checkpoint
- A parent-only weekly challenge email signup with one-click unsubscribe
- Kid-safety defaults: nicknames, age bands, no comments or direct messages
- Hosted D1 database for challenges, approved projects, votes, and private submissions
- Offline demo fallback when the community API cannot be reached

## Run locally

```bash
npm install
npm run dev
```

The Cloudflare development adapter provides the same Worker API used in production. The hosted Sites deployment provisions the D1 binding declared in `.openai/hosting.json`.

## Data and moderation

- `challenges` contains the active and upcoming weekly prompts.
- `projects` contains public gallery entries; only rows with `status: approved` are returned.
- `votes` stores one project choice per browser identifier and challenge.
- `submissions` is a private moderation queue containing parent contact details and consent records.
- `challenge_ideas` is a private idea queue containing proposed prompts and a grown-up contact email.
- `subscribers` is the private, deduplicated grown-up newsletter list.
- `newsletter_deliveries` prevents the same weekly challenge being sent twice to one address.

The API never returns either private queue publicly. There is not yet an admin dashboard, so reviewing or approving either queue currently requires direct database access. Approving a project submission means reviewing its links, copying only the public child nickname, age band, description, and project links into `projects`, and leaving parent details private.

The four illustrated projects included at launch are clearly marked clubhouse samples. They are not votable and do not link to fictional repositories; real approved submissions receive working project links and voting controls.

## Weekly email delivery

Signups are stored immediately in D1. Delivery runs every Monday at 9:00 a.m. Eastern during daylight saving time through `.github/workflows/weekly-challenge-email.yml`. The workflow is intentionally dormant until `NEWSLETTER_CRON_SECRET` is added to GitHub. The deployed site also needs these production values:

- `NEWSLETTER_CRON_SECRET` — the same long random secret used by GitHub Actions
- `RESEND_API_KEY` — a Resend API key for the verified sending domain
- `NEWSLETTER_FROM_EMAIL` — for example `Vibe Code Club <challenges@updates.vibecodeclub.org>`

The sender reads the active challenge directly from D1, uses idempotency protection, and includes a private unsubscribe link in every message.

## Build

```bash
npm run lint
npm run build
```

The build produces a Cloudflare Worker entrypoint, static client assets, hosting metadata, and the checked-in D1 migration.
