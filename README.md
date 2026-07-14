# Vibe Code Club

A playful, parent-supervised community for young creative coders. Every week brings a new open-ended challenge; kids can build with any tool, submit through a grown-up, explore approved projects, and vote for one favorite.

## Live site

**[Open Vibe Code Club](https://vibecodekids.com)**

Jump straight to **[this week's challenge](https://vibecodekids.com/#challenge)**.

Read the public **[Terms, Safety & Privacy Notice](https://vibecodekids.com/legal)**.

`vibecodekids.com` is the canonical public address. The `www` address and both `vibecodeclub.org` addresses remain connected and send visitors to the primary domain.

## What is included

- A responsive weekly challenge landing page
- Project gallery with clickable playable previews, one favorite vote per browser, and shared weekly totals
- A public Clubhouse Favorites page with each finished week’s winner and two runners-up
- Parent-supervised submission form with a moderation queue
- Optional project-image upload, resized and re-encoded in the browser to remove photo metadata
- A visitor challenge-idea form with a grown-up permission checkpoint
- A parent-only weekly challenge email signup with one-click unsubscribe
- A password-protected Clubhouse Admin for reviewing projects, images, links, ideas, and subscribers
- Privacy-preserving suspicious-vote alerts in Clubhouse Admin; alerts never expose raw IP addresses or automatically remove votes
- An optional AI-assisted playthrough that samples playable experiences before a grown-up publishes them
- Kid-safety defaults: nicknames, age bands, no comments or direct messages
- A grown-up-only legal acceptance recorded with each new project and challenge idea
- A public Terms, Safety & Privacy Notice covering supervision, community content, external links, and parent privacy choices
- Hosted D1 database for challenges, approved projects, votes, and private submissions
- Hosted R2 object storage for private submission images and approved gallery images
- Empty offline fallback when the community API cannot be reached

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
- `vote_alerts` stores private, reviewable integrity signals when three browser IDs share one hashed network/browser signature or one project receives at least twelve vote updates in ten minutes.
- `submissions` is a private moderation queue containing parent contact details and consent records.
- `challenge_ideas` is a private idea queue containing proposed prompts and a grown-up contact email.
- `subscribers` is the private, deduplicated grown-up newsletter list.
- `newsletter_deliveries` prevents the same weekly challenge being sent twice to one address.
- `safety_scans` stores automated playthrough status, findings, coverage flags, and the action log; screenshots are not retained.

The API never returns either private queue publicly. Review happens in the authenticated Clubhouse Admin. Approving a project publishes only the kid-safe nickname, age band, description, project links, and approved image; parent details remain private.

Every new project submission also requires a grown-up to attest that the project was led by the child rather than built for them by an adult. Teaching, brainstorming, AI assistance, and troubleshooting are welcome; the child must make the creative decisions and lead the build.

New project and challenge-idea records store acceptance of the dated legal terms. The public page is written as a practical baseline and should be reviewed by a qualified lawyer for the operator's identity, jurisdiction, and specific COPPA obligations before broader promotion.

## AI safety playthrough runner

Playable submissions can be reviewed in an isolated Playwright browser before publication. The runner samples up to eight states, asks an OpenAI vision-capable model to choose limited safe interactions, checks screenshots and visible text with OpenAI moderation, and reports its findings to the private Clubhouse Admin. Audio, video, embedded frames, text inputs, downloads, external navigation, incomplete coverage, or questionable content always send the project to grown-up review. Repository-only submissions cannot be played automatically.

The AI result is advisory and does not guarantee that an experience is safe. A club grown-up remains responsible for opening the project, reviewing the code and links, and making the final publication decision. The admin records any explicit grown-up override of a non-passing result.

The scheduled runner lives in `.github/workflows/experience-safety-scan.yml`. To enable it, add the same long random `SAFETY_SCAN_SECRET` to both the production site environment and GitHub Actions, then add `OPENAI_API_KEY` to GitHub Actions. `OPENAI_PLAYTHROUGH_MODEL` is optional and defaults to `gpt-5.6-luna`. Until the shared secret exists in production, the dashboard labels the runner as not configured and preserves the normal manual-review flow.

## Clubhouse Admin

Open **[Clubhouse Admin](https://vibecodekids.com/clubhouse-admin)** to review the private queues. The temporary admin password is stored locally in the ignored `.env.local` file; it is never committed to GitHub. Production stores `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as secret environment values.

Approving a project makes its kid-safe fields and approved image visible as a reviewed gallery preview. Favorite buttons remain locked until that challenge’s scheduled voting week. If a family did not include an image, a club grown-up can add one from the submission card; existing images can also be replaced. Rejecting a project keeps it out of the gallery. The dashboard also supports selecting or archiving challenge ideas and activating or unsubscribing grown-up newsletter addresses.

The Challenges tab shows the active build window, delayed voting window, and next automatic launch. Eight summer challenges run from July 13 through Labor Day weekend. New prompts launch Monday at 9:00 a.m. Eastern; submissions close Sunday at midnight, and the previous challenge’s gallery opens when the new prompt launches. Future prompt titles and copy stay private in the public API and are visible only in Clubhouse Admin before launch.

Every calendar row is clickable. Club grown-ups can view and edit the complete title, tagline, prompt, brief, starter ideas, and tools for any challenge; dates stay editable until that challenge begins. A private idea bank contains ten additional fully written, editable challenge concepts. “Open a secret door” is scheduled for Week 2, and “Make a chain reaction” fills Week 7.

Once voting closes, **[Clubhouse Favorites](https://vibecodekids.com/favorites)** automatically publishes one winner and up to two runners-up for that challenge. No sample winners are shown before the first real result.

Project screenshots and titles open the playable experience in a new tab whenever an approved demo link exists. Vote-integrity alerts are advisory: they appear only in Clubhouse Admin, store challenge-specific hashes rather than raw network addresses, and leave every vote in place until a grown-up reviews the pattern.

## Roadmap

See **[TODO.md](TODO.md)** for launch follow-ups, including verified adult email before voting if public participation grows beyond what browser-only voting can reasonably protect.

## Weekly email delivery

Signups are stored immediately in D1. The Monday 9:00 a.m. Eastern delivery schedule is enabled through `.github/workflows/weekly-challenge-email.yml` and authenticated with `NEWSLETTER_CRON_SECRET`. Actual email delivery begins after the sending domain is verified and these production values are added:

- `NEWSLETTER_CRON_SECRET` — the same long random secret used by GitHub Actions
- `RESEND_API_KEY` — a Resend API key for the verified sending domain
- `NEWSLETTER_FROM_EMAIL` — for example `Vibe Code Club <challenges@updates.vibecodekids.com>`

The sender reads the active challenge directly from D1, uses idempotency protection, and includes a private unsubscribe link in every message.

## Build

```bash
npm run lint
npm run build
```

The build produces a Cloudflare Worker entrypoint, static client assets, hosting metadata, and the checked-in D1 migration.
