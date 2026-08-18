# Handoff: Vibe Code Kids Year-Round Challenge and Agentic Operations

Updated: 2026-08-18

## Intended outcome

Build the complete private-draft 2027 challenge program and the first reversible versioned calendar, shadow-review, and dry-run editorial operations machinery while preserving 2026 and every human approval boundary.

## Current truthful state

Implementation is checked and published for review on `agent/year-round-challenges-and-agent-operations` from baseline `6345f35`. Draft PR [#1](https://github.com/amyleesterling/kids-who-vibecode/pull/1) is open; implementation commit `079884f` is followed only by handoff-state updates (the content-equivalent local implementation commit is `8f64689`). The branch contains the complete 2027 private-application draft curriculum, additive operational sidecar, versioned Admin workflow, review shadow mode, dry-run editorial queue, tests, policies, and handoff. No production state, deployment, live account, public post/email, automatic publication, campaign, spending, legal terms, or private/production data changed.

## What changed most recently

Added the Human Steward version-bound primary scheduling seam after content approval, retained bonus scheduling as unsupported, minimized owner-alert payloads, completed the final local gate, pushed the authorized branch, and opened draft PR #1.

## Challenge-calendar progress

52/52 primaries and 12/12 optional bonuses exist as version-1 private-application drafts. Four arcs contain 13 weeks each; openings run January 4–December 27, 2027; week 52 voting closes January 10, 2028. Structural, duplication, inclusion-gate, and DST schedule checks pass. Culturally specific suitability is not human-approved.

## Code and schema changes

Migration `0018` adds private program/version/review/content, append-only shadow evidence/decision/audit, hard operation controls, dry-run social/campaign, aggregate metrics, and agent-run tables. Admin adds Year Calendar, versioned Challenge Studio, Human Steward scheduling, Review Center, red quarantine, and Content/Social Queue. Existing 2026 tables and human publication path are preserved.

## Review-system performance

All policy and adversarial fixtures pass, including green/yellow/red, missing evidence, PII, trackers, downloads, payments, secrets, disagreement, stale targets, and review bypass. This is synthetic E3 evidence only. No real submissions were processed, so agreement, misses, and escalation rates are unknown; the 300-case window is at zero.

## Agent disagreements

No unresolved disagreement on the branch seam. The review critic explicitly rejects calling the current browser context fully isolated or treating a legacy pass as green; that dissent is encoded as limitations/forced yellow. The inclusion investigator treats sourced bonus prompts as proposals, not cultural approval.

## Evidence and validation

E2 source/schema/workflow review plus E3 execution: program validator; 18 Node tests; all 19 migrations replayed with 2026 rows preserved; idempotent 64-record seed test; ESLint; TypeScript; full Vite Worker/client/Sites build. Official dates/privacy/API sources are linked in docs. No E4 target or E5 independent validation is claimed.

## Decisions in force

Extend rather than replace; preserve 2026; application/API-private is not source-secret; hard-disable live authority; model confidence is not evidence; fix the 300-case threshold before observation; bind scheduling to an exact approved version; minimize owner emails.

## Open questions and dissent

See `OPEN_QUESTIONS.md`: public-source secrecy, verifiable parental consent, retention, age scope, social channels, final rollover approval, production D1 state, server-side image handling, and a controlled-artifact green category.

## Risks and blockers

No branch/PR blocker. GitHub reports the new draft PR open, but returned no workflow runs or commit statuses for the head at the final check; CI coverage and independent review therefore remain unverified. Production activation remains blocked by target migration/staging evidence, legal/privacy review, Human Steward decisions, cultural approvals, and provider/channel policies. Ordinary external demos and images cannot satisfy the current green evidence requirements.

## Next justified action

Obtain independent review of draft PR #1 and determine whether repository CI should be configured for the existing `npm run check` gate. Before any deploy, capture a read-only production D1 schema/migration inventory and exercise migrations plus Admin/submission/reviewer flows in staging with synthetic/adversarial fixtures.

## Human approval needed

None for continued draft-PR review. Amy/counsel/specialist approval remains required for merge, deploy, D1 migration, cultural bonuses, legal/notice decisions, Phase 3, live organic posts/emails/accounts, every paid campaign, targeting, and spending.

## Resume here

Read `.endeavor/AGENT_ENTRY.md`, this handoff, `docs/ENDEAVOR_BRIEF.md`, migration `0018`, `db/program2027.mjs`, `scripts/review-policy.mjs`, `worker/index.ts`, and `tests/`. Run `npm run check`. Do not interpret legacy `safety_scans.status = passed` as a green-lane decision.
