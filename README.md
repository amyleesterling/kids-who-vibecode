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
- Optional project-image upload, resized and re-encoded in the browser to remove photo metadata
- A visitor challenge-idea form with a grown-up permission checkpoint
- A parent-only weekly challenge email signup with one-click unsubscribe
- A password-protected Clubhouse Admin for reviewing projects, images, links, ideas, and subscribers
- Kid-safety defaults: nicknames, age bands, no comments or direct messages
- Hosted D1 database for challenges, approved projects, votes, and private submissions
- Hosted R2 object storage for private submission images and approved gallery images
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

The API never returns either private queue publicly. Review happens in the authenticated Clubhouse Admin. Approving a project publishes only the kid-safe nickname, age band, description, project links, and approved image; parent details remain private.

The four illustrated projects included at launch are clearly marked clubhouse samples. They are not votable and do not link to fictional repositories; real approved submissions receive working project links and voting controls.

## Clubhouse Admin

Open **[Clubhouse Admin](https://vibecodeclub.org/clubhouse-admin)** to review the private queues. The temporary admin password is stored locally in the ignored `.env.local` file; it is never committed to GitHub. Production stores `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as secret environment values.

Approving a project publishes its kid-safe fields and approved image into the gallery. Rejecting it keeps it out of the gallery. The dashboard also supports selecting or archiving challenge ideas and activating or unsubscribing grown-up newsletter addresses.

## Weekly email delivery

Signups are stored immediately in D1. The Monday 9:00 a.m. Eastern delivery schedule is enabled through `.github/workflows/weekly-challenge-email.yml` and authenticated with `NEWSLETTER_CRON_SECRET`. Actual email delivery begins after the sending domain is verified and these production values are added:

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
