# Agent Roles and Permissions

## Institutional rule

Agents receive the least data and authority needed for a bounded work package. Reports name sources, model/prompt/policy versions, limitations, and contradictions. No agent can generate and approve the same artifact. Coordination is not authorization; model confidence is not evidence.

## Separation of duties

| Role | May | May not |
|---|---|---|
| Program Orchestrator | Assign bounded packages, monitor dependencies, reconcile reports, preserve dissent, update handoff, stop at gates | Override safety, publish child content, spend, activate integrations, authorize its own conclusion |
| Challenge Director | Draft calendar, challenge copy, paths, parent/AI guidance, editorial inputs, diversity revisions | Approve its own launch or culturally sensitive copy |
| Curriculum and Age-Fit | Evaluate reading load, time, accessibility, free-tool access, child agency, Spark/Build/Glow-Up | Publish, change safety policy, or treat complexity as quality |
| Holiday, Culture, and Inclusion | Research dates/context, identify stereotypes, require neutral alternatives, record disagreement | Grant final public approval for culturally/religiously specific work |
| Submission Safety | Inspect allowed kid-facing content, images, links/source/network in isolation; classify green/yellow/red with uncertainty | Publish, approve, use parent contact by default, or alter evidence after writing |
| Technical Playtest | Exercise bounded desktop/mobile states, record coverage, console/network/navigation/controls | Claim complete coverage, publish, approve, submit forms, grant permissions, or follow risky links |
| Approval | Apply the immutable versioned policy to complete reports | Modify reports, override blockers, use confidence as evidence, approve its own generated project, or publish in shadow mode |
| Human Steward | Pause, inspect, decide yellow, override with reason, remove work, change policy, approve campaigns and spending | Lose authority to an automated recommendation |
| Content and Editorial | Produce website, email, educator, social, visual, alt-text, and link packages | Approve its own public copy or include private intake fields |
| Social and Growth | Prepare approved adult-facing organic queue, record provider outcomes, aggregate performance, draft paid proposals | Target children, profile families, contact suspected minors, expose identity/contact, spend, activate campaigns, or claim an unverified post |

## Data scopes

- Curriculum/content agents: challenge version and approved editorial sources; no submission or parent data.
- Safety/playtest agents: submission ID, challenge ID, kid-facing candidate fields, target/image/source references, and the evidence needed for that run; parent contact and consent details are withheld unless a specific legal-operation task requires them.
- Approval Agent: immutable evidence references and policy, not parent contacts.
- Social agent: challenge packages and explicitly allowlisted approved public project fields only. It cannot query `submissions`, legal acceptance, contacts, reviews, or raw evidence.
- Aggregate analytics: counts and dimensions meeting the approved minimum group size; no child profile or cross-platform audience export.

## Operating states

`operation_controls` starts with review shadow, auto-approval false, auto-publication false, social dry-run, social global pause true, paid activation false, and public-email expansion false. Database constraints reject non-shadow decisions, publication permission, live social publication, and campaign activation even if an application bug tries to write them.

## Human approvals

Amy approves merge, deploy, cultural items, channel playbook, account connection, templates, cadence, emergency controls, policy changes, pilot activation, every paid campaign, targeting, and budget. Qualified counsel/privacy reviewers approve legal sufficiency; an agent cannot substitute for that review.
