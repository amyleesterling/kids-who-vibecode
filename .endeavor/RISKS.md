# Risks: Vibe Code Kids Year-Round Challenge and Agentic Operations

| ID | Risk | Likelihood | Consequence | Trigger | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-001 | Private parent/consent/review fields leak into public or social projections | medium | critical child-privacy harm | broad SELECT, object spread, or reused admin payload | explicit allowlisted public projections; contract tests; no social adapter access to private tables | Primary integrator | mitigated locally; target unverified |
| R-002 | A sampled AI playthrough is mistaken for complete safety coverage | high | unsafe auto-publication | `passed` reused as green without required evidence | separate reports; coverage flags; deterministic policy; shadow-only DB constraint; human authority | Primary integrator + Human Steward | mitigated by forced yellow/limits |
| R-003 | Incremental migration conflicts with live D1 history | medium | outage or corrupted records | destructive SQL, altered CHECK constraints, non-idempotent seed | additive tables; 19-file replay; idempotent 64-record seed; preserve legacy row counts | Primary integrator | locally mitigated; E4 blocked |
| R-004 | Future challenge content becomes public too early | medium | spoiled program/editorial risk | public endpoint queries draft/version tables | admin-only sidecar; projection tests; explicit version-bound scheduling | Primary integrator | API mitigated; source remains public |
| R-005 | Cultural observance challenge stereotypes, combines sacred symbols, or pressures participation | medium | exclusion and reputational harm | decorative generic prompt or automatic scheduling | official sources, neutral alternative, inclusion review, mandatory human approval | Inclusion reviewer + Human Steward | open |
| R-006 | Current legal/consent flow is treated as qualified COPPA compliance | high | legal/privacy exposure | broad promotion or changed information practice without counsel | documented legal gate; no terms changes; no activation | Human Steward + counsel | blocked |
| R-007 | Live social/email/paid actions escape dry-run boundary | low in branch; high consequence | unauthorized publication/spend/data transfer | adapter or flag enables external call | no live adapters; persisted off controls; database CHECK constraints; explicit future approval | Primary integrator + Human Steward | mitigated locally |
| R-008 | Time-zone drift changes launch cadence | high | missed/early challenges and emails | fixed UTC schedule across DST | validate America/New_York schedule; future timezone-aware scheduler | Operations owner | open |
| R-009 | OpenAI Responses retain child-related safety inputs by default | medium | unnecessary third-party retention | Responses calls omit `store: false` | both generative calls set `store: false`; document provider review and minimal prompt fields | Primary integrator | code mitigated; provider unverified |
| R-010 | Uploaded images retain EXIF/GPS or contain an identifiable child | medium | critical privacy exposure | direct API bypasses client normalization | image submissions never reach shadow green; red media collapsed; server normalization/moderation remains required | Human Steward + safety reviewer | open blocker for image green lane |
| R-011 | Approved external demo changes after review | high | public content differs from evidence | mutable URL or deployment drift | no current green pilot for ordinary external demos; require controlled artifact/source binding | Human Steward + technical reviewer | blocked by design |

## Escalation rules

Pause and seek direction when a risk crosses a human approval boundary, exceeds the agreed budget, threatens safety or privacy, or invalidates the intended closure.
