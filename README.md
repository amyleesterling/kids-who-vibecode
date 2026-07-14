# Vibe Code Club

A playful, parent-supervised community for young creative coders. Every week brings a new open-ended challenge; kids can build with any tool, submit through a grown-up, explore approved projects, and vote for one favorite.

## What is included

- A responsive weekly challenge landing page
- Project gallery with one favorite vote per browser and shared weekly totals
- Parent-supervised submission form with a moderation queue
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

The API never returns the submissions table publicly. Approving a submission means reviewing its links, copying only the public child nickname, age band, description, and project links into `projects`, and leaving parent details private.

## Build

```bash
npm run lint
npm run build
```

The build produces a Cloudflare Worker entrypoint, static client assets, hosting metadata, and the checked-in D1 migration.
