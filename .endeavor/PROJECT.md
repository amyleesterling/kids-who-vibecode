# Project: Vibe Code Kids Year-Round Challenge and Agentic Operations

Created: 2026-08-18
Protocol version: 0.1.0-alpha.1

## Intended outcome

Extend Vibe Code Club into a safe, joyful, year-round creative coding program for ages 8–10. The first program covers 2027 with 52 private primary challenge drafts, optional inclusive bonus challenges, versioned editorial content, reversible Clubhouse Admin support, auditable submission-review shadow mode, and a dry-run adult-facing content/social queue. Existing 2026 history and public/private data boundaries remain intact.

## Current reality

The source of truth is `main` at `6345f35` in `amyleesterling/kids-who-vibecode`. The deployed system is React 19 + Vite with a Cloudflare Worker, D1, R2, Sites hosting, GitHub Actions, OpenAI-assisted Playwright safety scans, a manual Clubhouse Admin moderation queue, scoped parent-reviewer links, scheduled challenge/email workflows, and public legal pages. Eight 2026 challenges and seven future idea seeds exist. Safety scans are advisory and manual approval is authoritative.

## Active profiles

- Discovery: inspect actual code, migrations, production-facing workflows, current official dates, and current official privacy/platform requirements before design.
- Delivery: implement only reversible, tested slices against the acceptance criteria.
- Audit: challenge public/private projections, migration safety, permissions, review evidence, and closure language.
- Communications: produce age-fit challenge and adult-facing editorial packages with factual/inclusion review gates.
- Operations: define schedules, queues, stop controls, retention, audit cadence, and durable handoff.
- Synthesis: integrate delegated findings without flattening contradictions or dissent.

## Capability mode

Requested: `auto`

Selected: `delegated` for bounded read-only investigation during this work session; `orchestrated` is the implemented role/permission target architecture, not activated recurring authority.
Rationale: current-state inspection, observance research, and review-system red-teaming are separable read-only workstreams. The primary agent is the sole integrator and source editor. Persistent agents, live publishing, and recurring automated authority are not activated.

## Stakeholders and decision owner

- Decision owner: Amy Sterling (Human Steward)
- Contributors: primary implementation agent; bounded investigator, inclusion/date researcher, and review-system critic agents
- Affected people: participating children ages 8–10, parents/guardians, educators, librarians, camps, reviewers, and site operators

## Authoritative sources

- `https://github.com/amyleesterling/kids-who-vibecode` and the checked-out commit/branch
- `https://github.com/amyleesterling/endeavor-protocol` version `0.1.0-alpha.1`
- Existing D1 migrations, Worker endpoints, GitHub Actions workflows, safety runner, admin/reviewer clients, and public legal page
- Current official FTC/Federal Register sources for COPPA; current Massachusetts official sources; current official platform policies before connection or launch
- Authoritative observance bodies and astronomical sources for 2027 dates

## Constraints

- Time: no claim that all production operations are launched in one session; advance through justified reversible milestones.
- Budget: no spending; paid campaigns remain proposal-only.
- Technical: preserve React/Vite/Worker/D1/R2/Sites architecture, existing binding names, migration order, and 2026 records.
- Policy: child-facing public APIs receive approved kid-safe fields only; parent contact, consent, safety findings, reviewer notes, and internal evidence remain private.
- Accessibility: every challenge needs a low/no-code route, non-audio alternative, keyboard/touch consideration, and no required camera, microphone, precise location, or personal story.
- Other: no secrets in source or state; no production data access; no future challenge is exposed by the public community API before launch.

## Out of scope

- Merge or deploy changes.
- Change effective legal terms or represent legal review as complete.
- Enable automatic publication, live social posting, live email, account connections, advertising, targeting, or spending.
- Delete or rewrite 2026 history or production/private data.
- Contact children, parents, reviewers, platforms, or other third parties.

## Consequence of error

An unsafe approval could expose a child, personal information, harmful content, tracking, commerce, or deceptive behavior. A faulty migration could disrupt the live club or alter historical records. Premature content/social automation could publish unreviewed child material or leak private fields. Cultural errors could stereotype or exclude families. Overclaiming local or model-based checks as production/legal validation could create false confidence.

## Human approval boundaries

- Amy must approve merge, deployment, public challenge scheduling, all culturally/religiously specific challenges, legal/privacy notice changes, policy expansion, public auto-approval, live organic posting, account connections, public email, and every paid campaign or budget change.
- Human Steward retains yellow-lane adjudication, takedown, overrides with reasons, policy changes, kill switches, and emergency pause.
- The agent may commit, push, and open a draft PR, but may not merge or deploy.

## Definition of success

- All 52 2027 primary drafts and the optional bonus set have coherent dates, complete required fields, Spark/Build/Glow-Up paths, and machine-checked schedule/content invariants.
- Future content is private from public application APIs until an explicit reviewed/scheduled transition.
- Existing submission/gallery/voting behavior remains compatible.
- Shadow review records deterministic, Safety Agent, Technical Playtest, and policy decision evidence without publishing.
- Auto-publication and live social/email/spending controls default off and have explicit kill switches.
- Clubhouse Admin can inspect the first reversible calendar/review/content slices.
- Local lint, build, migration, calendar, policy, public-projection, and adversarial fixture checks pass.
- `.endeavor/HANDOFF.md` allows another instance to resume truthfully.

## Required closure

- Current-state map: C2 with E2 direct source/schema inspection and delegated audit.
- 2027 curriculum drafts: C2 with E2 content inspection plus E3 calendar/content validators; culturally specific items remain human-approval blocked.
- Schema/admin/shadow/content implementation: C2 with E2 diff inspection and E3 local build/tests/migration replay.
- Production operation, public auto-approval, live publishing, and legal compliance: C3/E4 plus qualified human approval; intentionally not available in this branch session.
