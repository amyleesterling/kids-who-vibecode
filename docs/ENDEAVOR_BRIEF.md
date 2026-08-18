# Endeavor Brief — Year-Round Challenges and Agent Operations

Date: 2026-08-18
Branch: `agent/year-round-challenges-and-agent-operations`
Baseline: `6345f351fea58a40648ec35520c8cecb5068e488`

## Outcome

Extend the working Vibe Code Club architecture with a complete 2027 program for ages 8–10, an editable private-application calendar, versioned content packages, append-only review evidence in shadow mode, and an adult-facing social queue that cannot publish. Preserve every 2026 record and keep Clubhouse Admin’s grown-up moderation action as the only publication path.

## Current state checked

The repository is a React 19/Vite application backed by one Cloudflare Worker, D1, R2, GitHub Actions, Resend, Playwright, and OpenAI. Existing strengths include a private `submissions` table, an allowlisted `projects` public projection, parent-reviewer invitations, safety scans, scheduled challenges and newsletters, delayed voting, favorites, legal acceptance fields, and aggregate visit counts.

Direct inspection also found important limits:

- one active primary challenge and one voting gallery are assumed;
- future copy is hidden by public APIs but visible in this public source repository;
- the current safety scan is advisory, mutable, samples at most eight states, and is not a green-lane decision;
- uploaded-image metadata stripping is a browser behavior, not a server invariant;
- current notice/checkbox wording does not enumerate every published field;
- current owner-alert documentation understates data sent through Resend;
- the fixed 13:00 UTC email cron is not 09:00 Eastern during standard time.

## Profiles and capability mode

Discovery, Delivery, Audit, Communications, Operations, and Synthesis are active. Auto mode selected Delegated for three bounded read-only work packages: source audit, date/inclusion research, and review red-team. The primary integrator remains the single repository writer. Orchestrated mode is a future operating design, not active authority.

## Decisions

1. Extend the existing system through additive companion tables and compatible Admin views.
2. Keep 2027 records out of public application APIs until a later approved promotion step; do not claim source-level secrecy in a public GitHub repository.
3. Constrain automated decisions to `shadow`, publication permission to zero, social publication to `dry_run`, campaign activation to zero, and global social pause to true.
4. Treat missing evidence, uncertainty, or agent disagreement as yellow. Model confidence is never evidence.
5. Keep automatic publication structurally absent from this milestone.

## Approval boundaries

Amy retains merge, deployment, cultural/religious challenge approval, policy changes, takedown, auto-approval activation, live account connections, posts, email, campaigns, budgets, and spending. Qualified legal/privacy review remains required before material information-practice changes, broad promotion, or any Phase 3 pilot.

## Validation contract

Branch closure requires E2 source/diff inspection and E3 local calendar, policy, adversarial, migration, permission, lint, type, and build checks. No E4 production claim is available because deployment and production access are outside authority. Every closure statement must name what ran, where, what remains unverified, and the withheld approval.

## Stop conditions

Stop if a change would expose private intake fields, make a destructive migration, bypass human moderation, connect a live provider, change legal terms, publish or email, spend money, or represent cultural/legal review as complete.
