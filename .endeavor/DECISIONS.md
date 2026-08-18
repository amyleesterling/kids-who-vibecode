# Decision Log: Vibe Code Kids Year-Round Challenge and Agentic Operations

Material decisions are append-only. To change a decision, add a new entry that names the superseded entry.

## D-001 — Extend the existing architecture

- Date: 2026-08-18
- Status: in force
- Decision: preserve the React/Vite/Worker/D1/R2/Admin architecture and add versioned program/review/content records through incremental migrations and compatible endpoints.
- Context: the repository already implements core submissions, moderation, scheduling, galleries, reviews, emails, safety scans, and privacy boundaries.
- Options considered: replace with a new agent platform; create a parallel application; extend existing seams.
- Evidence: direct repository inspection at `6345f35`; user instruction not to discard working systems.
- Consequences: less architectural novelty, lower migration/regression risk, and explicit adapters around existing flows.
- Decision owner: Amy Sterling via launch prompt; implementation interpretation by primary integrator.
- Supersedes: none.
- Revisit trigger: evidence that an existing constraint makes a required safety invariant impossible.

## D-002 — Preserve history; keep 2027 drafts non-public

- Date: 2026-08-18
- Status: in force
- Decision: never delete or rewrite 2026 challenge records; store 2027 as versioned private draft data and expose it only to authenticated admin paths until reviewed/scheduled.
- Context: current public `/api/community` returns only the active challenge while admin returns the full schedule.
- Options considered: replace `challenges`; append future rows directly; add versioned private program records.
- Evidence: `db/schema.ts`, `db/challenges.ts`, `worker/index.ts` public/admin queries.
- Consequences: a deliberate promotion/scheduling step is required later. Repository source remains public, so “private” means application/API-private unless Amy moves source or content elsewhere.
- Decision owner: primary integrator within user constraints.
- Supersedes: none.
- Revisit trigger: clarified requirement that future copy must also be secret from public GitHub.

## D-003 — Shadow and dry-run defaults are hard off-switches

- Date: 2026-08-18
- Status: in force
- Decision: review mode defaults to `shadow`; auto-publication, live social publishing, live email expansion, campaign activation, and spending remain disabled in data and code.
- Context: user explicitly forbids immediate activation and requires phased evidence.
- Options considered: feature flags default on; environment-only flags; persisted controls default off plus code-path denial.
- Evidence: launch prompt approval boundaries.
- Consequences: code can propose decisions and publication payloads but cannot make public state changes without a future human-authorized policy transition.
- Decision owner: Amy Sterling.
- Supersedes: none.
- Revisit trigger: explicit future approval after predeclared evidence and legal gates.

## D-004 — Model confidence never supplies a green lane

- Date: 2026-08-18
- Status: in force
- Decision: use deterministic blockers and explicit evidence completeness to derive a proposed lane; generative Safety/Playtest reports are evidence inputs, not approval authority. Any missing/uncertain/discordant evidence is yellow or red, never green.
- Context: the existing playthrough `passed` state samples at most eight screens and is not equivalent to the requested green policy.
- Options considered: model-only approval; confidence threshold; versioned deterministic policy over separate reports.
- Evidence: `scripts/run-safety-scans.mjs` and user separation-of-duties rules.
- Consequences: the initial green proposal rate may be low; safety and auditability take priority.
- Decision owner: primary integrator within user policy.
- Supersedes: none.
- Revisit trigger: benchmark evidence demonstrates a narrower or broader rule is safer, followed by human policy approval.

## D-005 — Fix the Phase 3 evidence threshold before observation

- Date: 2026-08-18
- Status: in force
- Decision: require 300 consecutive proposed-green shadow cases across at least 12 weeks and 8 challenge/tool formats, 100% grown-up audit, zero critical false greens, at least 299/300 noncritical agreement, twice-clean benchmarks, staging control proof, legal/privacy review, and Amy’s exact approval.
- Context: choosing a threshold after seeing results would bias the pilot gate.
- Evidence: review-system red-team analysis and the rough rule-of-three upper-bound rationale.
- Consequences: Phase 3 is a separate future change and any critical miss or material policy/model/prompt change resets the window.
- Decision owner: primary integrator for proposal; Amy and qualified reviewers for future activation.
- Supersedes: none.
- Revisit trigger: only a separately reviewed policy version before a new observation window.

## D-006 — Human Steward scheduling is explicit and version-bound

- Date: 2026-08-18
- Status: in force
- Decision: editing always creates a new private version; only the exact latest primary with an approved dry-run content package can enter the legacy schedule through authenticated conflict-checked typed confirmation. Bonuses have no promotion route.
- Context: the existing scheduler is valuable, but inserting all 2027 drafts into the live table would expose operational state and bypass reviews.
- Evidence: existing `challenges` clock rollover, public future-field projection, version sidecar, and Admin action tests.
- Consequences: approved primaries can use the proven schedule/email/gallery flow without rewriting 2026; public copy remains withheld until active.
- Decision owner: Amy via future Clubhouse Human Steward action.
- Supersedes: none.
- Revisit trigger: a bonus-safe public surface or multi-primary scheduler is designed and approved.

## D-007 — Minimize owner-alert payloads

- Date: 2026-08-18
- Status: in force
- Decision: Resend owner alerts include only item type, receipt time, private record ID, and Admin link—not child copy, nickname/age, or grown-up contact.
- Context: source contradicted README and transferred more private data than the alert needed.
- Evidence: current Worker/README diff and public-boundary test.
- Consequences: the owner opens authenticated Admin for details; third-party email receives less child/family data.
- Decision owner: primary integrator under the user’s data-minimization requirement.
- Supersedes: none.
- Revisit trigger: a documented operational need plus privacy/legal approval.
