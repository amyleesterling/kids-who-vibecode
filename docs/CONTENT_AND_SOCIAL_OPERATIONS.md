# Content and Social Operations

## Pipeline

`draft → curriculum reviewed → safety/accuracy reviewed → approved → scheduled → published → verified → archived`

Each challenge version has a content package containing website copy, parent newsletter, educator/library version, launch, midweek, submission reminder, voting, gallery, and favorites posts, parent tip, short/long variants, visual brief, alt text, and privacy-safe campaign link. All current records are `draft` and `dry_run`.

## Audience and voice

Address parents, guardians, educators, librarians, camps, after-school programs, community organizations, and adults interested in creative learning. Be specific, warm, and calm. Never manufacture urgency, guilt, streak anxiety, exclusivity, or pressure to submit/vote. Never imply that a favorite is objectively the best child.

## Dry-run guarantees

- No platform SDK, token, webhook, or account connection is present.
- `social_publications.mode` accepts only `dry_run`; statuses are previewed/simulated/failed/cancelled.
- `social_global_pause` starts true.
- Content rows contain challenge editorial data, not child/parent intake.
- An approval record is separate from the agent-created copy.
- A provider post ID and response will be mandatory before any future system may claim a post was published.

## Future organic boundary

Only after Amy approves the channel playbook, connections, reusable templates, cadence, and emergency controls may an adapter publish an approved template-bound organic post. Copy outside the approved template, a changed link/claim/date, or a missing platform response returns to human review. Suspected-minor comments and direct messages never receive automatic replies; the agent may classify, hide obvious spam where policy allows, draft a grown-up response, or escalate a safety concern.

## Public-project promotions

Any future gallery promotion uses an explicit public allowlist from an already approved `projects` row. A child’s face, voice, real name, school, location, or identifying details require a separately verified and documented grown-up release and a policy not implemented here. Parent contacts and review data are never social inputs.

## Aggregate learning

Permitted program measures include submissions per challenge, lane mix/reasons, human-agent disagreement, review turnaround, format diversity, seasonal participation, adult newsletter/social engagement, launch success, and demos that load. Repeat-family measures require a privacy-preserving approved method and must not become a child profile.

Do not optimize child screen time, compulsive return, streaks, emotional pressure, or targeted child advertising. Optimize safety, accessibility, variety, successful publishing, parent confidence, creative participation, and delight.

## Failure operations

Future adapters need idempotency, retry ceilings, failure visibility, provider response storage, post verification, global pause, per-channel pause, and immediate takedown/escalation. Retry never changes copy or audience. An absent provider response is “unverified,” not “published.”
