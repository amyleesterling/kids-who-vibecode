# Evidence and Closure: Vibe Code Kids Year-Round Challenge and Agentic Operations

## Claim ledger

| Claim ID | Claim | Evidence class | Source or method | Checker | Status | Limitations | Next validation |
|---|---|---|---|---|---|---|---|
| CL-001 | Baseline branch is clean at `6345f35` and existing architecture is React/Vite/Worker/D1/R2/Sites | E2 | git status/log, `package.json`, `.openai/hosting.json`, `wrangler.jsonc`, source inspection | Primary integrator | supported | Production bindings/data not inspected | Preserve in current-state doc and verify diff against baseline |
| CL-002 | Public community/favorites APIs use approved project rows and omit parent contact/consent/safety/reviewer fields | E2 | `worker/index.ts` public SELECT projections | Primary integrator | supported | Contract tests not yet added; future changes could regress | Add public-projection tests |
| CL-003 | Existing AI playthrough is advisory, samples at most eight interaction states, and manual admin approval publishes | E2 | `scripts/run-safety-scans.mjs`, `adminModerate`, `AdminApp.tsx` | Primary integrator | supported | Runner behavior not executed against production | Preserve advisory status; add shadow evidence model |
| CL-004 | Baseline lint/type/build pipeline completes locally | E3 | direct ESLint, TypeScript, Vite, Sites preparation on 2026-08-18 | Primary integrator | partially supported | Wrangler attempted to log under an unwritable root config; Vite build still exited 0 | Rerun final gate with writable `XDG_CONFIG_HOME` |
| CL-005 | OpenAI Responses store results by default unless `store: false`; the runner now explicitly disables storage for both generative calls | E1+E2+E3 | official OpenAI migration docs, runner inspection, integrity test | Primary integrator | supported locally | Provider account controls/retention not inspected | Verify provider configuration before target operation |
| CL-006 | 2027 has exactly 52 Monday openings; four 13-week arcs run Jan 4–Dec 27 and final voting closes Jan 10, 2028 | E1–E3 | official USNO/OPM/HKO/UN/UNESCO/LOC/NPS sources; timezone arithmetic; program validator | Inclusion investigator + primary integrator | supported | Human cultural approval remains pending | Approve exact schedule before production |
| CL-007 | Additive schema and idempotent seed create 52 primary + 12 bonus versions, 64 content packages, 64 dry-run social rows, controls, and policy without altering live challenges | E2–E3 | migration replay + Node SQLite seed test | Primary integrator | supported locally | Production D1 history/schema not inspected | Read-only target schema inventory before deploy |
| CL-008 | Every new submission receives a yellow initial shadow proposal; completed attempt-bound scans append separate reports/evidence/decision and cannot publish | E2–E3 | source inspection, policy/adversarial/integrity tests, DB CHECK constraints | Primary integrator | supported locally | Runner not executed against hostile targets; source/image/mobile coverage remains incomplete | Stage with controlled fixtures; keep all human review |
| CL-009 | Clubhouse Admin exposes latest 2027 calendar, structured versioned editing, review history, Human Steward conflict-checked scheduling, shadow center, red collapse, and queue controls | E2–E3 | React/Worker diff, ESLint, TypeScript, Vite Worker/client build | Primary integrator | supported locally | No authenticated browser or production validation | Exercise full Admin flows in staging |
| CL-010 | Editorial/social packages are dry-run-only and require separate curriculum, safety/accuracy, and human approval; campaign activation is zero | E2–E3 | seed/migration, content transition code, schema invariant tests | Primary integrator | supported locally | No provider adapters/accounts or platform policy validation | Approve channel playbook before adapters |
| CL-011 | Owner alerts no longer send child-facing copy or grown-up contact through Resend | E2–E3 | Worker/README diff and public-boundary test | Primary integrator | supported locally | Delivery not target-tested | Confirm provider payload in staging without real family data |
| CL-012 | Final local lint, typecheck, 18 tests, 19-migration replay, calendar validator, and production build pass | E3 | 2026-08-18 local commands in Node 24/Python 3/Vite | Primary integrator | supported | Build retains existing >500 kB model-viewer chunk warning; no E4 | Let draft PR CI rerun |

## Closure matrix

| Item | Required closure | Current closure | Evidence | Contradictions | Blocker | Next action | Approval |
|---|---|---|---|---|---|---|---|
| VK1 current-state map | C2 | C2 | Direct source/schema/workflow inspection plus delegated audit | Production bindings/data remain unknown | E4 unavailable | Attach source map to PR/handoff | no branch approval needed |
| VK2 annual curriculum | C2 | C2 | 52 + 12 source data, official dates, structural/schedule tests | Cultural suitability remains human-pending | named inclusion gates | Amy/specialist review bonuses | public schedule withheld |
| VK3 data/admin | C2 | C2 | additive migration, idempotent seed, version Studio, conflict-checked schedule action, build | Production migration state unknown | target schema inventory | stage migration and Admin flows | merge/deploy withheld |
| VK4 shadow review | C2 | C2 | versioned deterministic policy, append-only evidence, runner reports, adversarial/invariant tests | ordinary external demos cannot meet current green evidence | image/source/isolation gaps | stage controlled fixtures | auto-publication withheld |
| VK6 dry-run content/social | C2 | C2 | 64 packages/queue records, approval states, hard dry-run constraints, Admin queue | exact channel policies/accounts unavailable | channel playbook not approved | future platform-specific review | live accounts/posts withheld |
| Branch/PR handoff | C2 | C2 | branch diff, complete docs/state, full local gate | GitHub CI not yet observed | remote PR pending | commit, push, open draft PR | no merge/deploy |

## Evidence classes

- E0: assertion
- E1: sourced
- E2: reproduced or inspected
- E3: executed test
- E4: target-environment validation
- E5: independent verification

## Closure states

- C0: proposed
- C1: implemented
- C2: checked
- C3: target-validated
- C4: independently verified
- CX: deferred
- CB: blocked
