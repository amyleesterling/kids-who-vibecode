# Work Plan: Vibe Code Kids Year-Round Challenge and Agentic Operations

Last updated: 2026-08-18

## Phases

| Phase | Outcome | Owner | Dependencies | Required closure | Status |
|---|---|---|---|---|---|
| VK1 | Inspect and institute Endeavor; freeze current-state and approval map | Primary integrator + delegated investigators | repository + protocol | C2 / E2 | completed |
| VK2 | Draft and validate 52 primary + optional 2027 bonus challenges | Primary integrator; curriculum/inclusion critics | VK1 + authoritative dates | C2 / E1–E3 | completed as private drafts |
| VK3 | Add reversible versioned challenge data and Year Calendar/Studio slice | Primary integrator | VK1–VK2 | C2 / E2–E3 | completed for first additive slice |
| VK4 | Add auditable three-lane review in shadow mode with fixtures | Primary integrator; review critic | VK1 | C2 / E2–E3 | completed in shadow mode |
| VK5 | Define but do not activate limited auto-approval evidence gate | Human Steward + future operator | VK4 benchmarks + legal review | CB / E4 | blocked by design |
| VK6 | Add editorial packages and dry-run content/social queue | Primary integrator | VK2–VK3 | C2 / E2–E3 | completed in dry-run mode |
| VK7 | Document adult-facing promotion and paid approval gates | Human Steward + qualified reviewers | legal/platform review | CX | policy documented; activation deferred |
| VK8 | Define annual operating cadence, audits, handoff, and escalation | Primary integrator | VK2–VK6 | C2 / E2–E3 | completed for branch handoff |

## Work packages

### WP-VK1-A — Current-state audit

- Objective: map current architecture, schemas, APIs, workflows, and public/private fields.
- In scope: repository inspection at baseline commit.
- Out of scope: edits, production calls, redesign.
- Authoritative inputs: source, migrations, workflows, git state.
- Method: direct inspection with path/function/table citations.
- Required output: structured audit and preservation seams.
- Evidence standard: E2.
- Stop conditions: ambiguity or inaccessible source.
- Prohibited actions: writes or target-validation claims.
- Dependencies: none.
- Owner: delegated current-state investigator.

### WP-VK2-R — Calendar and inclusion research

- Objective: verify exact 2027 dates and inclusion gates for optional events.
- In scope: official sources and existing challenge data.
- Out of scope: full curriculum edits or cultural approval.
- Authoritative inputs: primary/official observance and astronomical sources.
- Method: source-backed date/context table with neutral alternatives.
- Required output: structured return and human-review flags.
- Evidence standard: E1–E2.
- Stop conditions: conflicting official dates or context ambiguity.
- Prohibited actions: unsupported dates, stereotypes, or publication.
- Dependencies: none.
- Owner: delegated date/inclusion investigator.

### WP-VK4-A — Review-system red team

- Objective: identify current safety-review trust boundaries and minimal shadow-mode seam.
- In scope: Worker, runner, schema, workflows, admin/reviewer UI.
- Out of scope: edits, production scans, auto-publication.
- Authoritative inputs: repository source.
- Method: failure-mode analysis and deterministic/model separation.
- Required output: ranked findings, minimal schema/API/UI/test slice, fixture set.
- Evidence standard: E2.
- Stop conditions: missing source or scope collision.
- Prohibited actions: secrets, writes, or comprehensive-coverage claims.
- Dependencies: none.
- Owner: delegated critic.

### WP-INTEGRATE — Single-writer implementation

- Objective: integrate verified findings into reversible source, data, docs, and tests.
- In scope: branch-only changes authorized by the user.
- Out of scope: deployment, merge, live operations, legal changes.
- Authoritative inputs: user acceptance criteria plus checked evidence.
- Method: small compatible migrations and additive admin/API slices; freeze and red-team before closure.
- Required output: intentional commit, pushed branch, draft PR, current handoff.
- Evidence standard: E2–E3 locally; E4 explicitly unavailable.
- Stop conditions: privacy/approval boundary, destructive migration, or unreconciled blocker.
- Prohibited actions: production or third-party actions.
- Dependencies: WP-VK1-A, WP-VK2-R, WP-VK4-A.
- Owner: primary integrator.

## Integration rule

The primary agent is the sole writer for repository source, curriculum data, documentation, and `.endeavor/`. Delegated agents return read-only structured findings and never edit shared artifacts.
