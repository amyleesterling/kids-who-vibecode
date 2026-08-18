# Child Privacy and Data Minimization

## Baseline

Treat the service as intentionally serving children under 13. This is an engineering baseline, not legal approval. Before broad promotion, auto-approval, new analytics/advertising integrations, or material information-practice changes, obtain qualified legal/privacy review and update notices/consent where required.

Current official reference points include the [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions), [FTC children’s privacy guidance](https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy), the [2025 amended COPPA Rule](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule), and [Massachusetts 201 CMR 17.00](https://www.mass.gov/regulations/201-CMR-1700-standards-for-the-protection-of-personal-information-of-residents-of-the-commonwealth). Current platform policies must be reviewed separately for each future connection.

## Data boundaries

| Class | Examples | Allowed consumers | Public/social |
|---|---|---|---|
| Public candidate | nickname, age band, country, title, description, approved links/image | private moderation until approval | only selected allowlisted fields after human approval |
| Parent/private | name, email, consent and legal version | intake/admin/legal operations only | never |
| Safety/private | flags, screenshots-in-process, source/network evidence, reviewer notes, policy/model/prompt versions | safety/playtest/approval/admin as needed | never |
| Editorial | challenge versions, packages, sources, approval state | curriculum/content/admin | challenge copy only after approval/schedule |
| Aggregate | program counts and adult campaign metrics above group floor | operations/admin | summaries only if approved |

Public and social code must never select from `submissions`, contacts, acceptance, evidence, or reviewer tables. Social content is built from challenge packages and an explicit approved-project allowlist, not object spreading.

## Minimize collection and transfer

- Never request a face, voice, real name, school, exact location, contact, social handle, private family story, camera, microphone, or geolocation for a challenge.
- Do not add third-party advertising or behavioral tracking to child-facing pages.
- Do not use child submission data for targeting, retargeting, lookalikes, profiling, or social audiences.
- Keep parent contact out of agent prompts unless a named task requires it.
- Use `store: false` for OpenAI Responses safety calls and send only the candidate fields necessary for that check.
- Store evidence references and findings, not screenshots, unless an approved retention policy explicitly requires the image.
- Secrets remain in Cloudflare/GitHub secret stores; never D1 content, source, logs, prompts, or social payloads.

## Retention and rights gate

No executable retention schedule is approved yet. Before production use, the Human Steward and counsel must set periods and deletion procedures for pending/rejected submissions, parent contacts, uploaded images, safety evidence, audit records, email deliveries, and provider logs. Procedures must support parent access, correction, deletion, and stopping further collection. Until then, adding new durable screenshot storage is prohibited.

## Known notice mismatches

Current public-sharing text does not enumerate title, country, and approved image consistently, while public projects may include them. The UI promises a parent status update that source does not implement. These require a deliberate product/legal reconciliation; this branch does not silently change effective terms. This branch did reconcile the owner alert to the documented minimal behavior: Resend receives only submission type, time, private record ID, and the Admin link—not child copy or grown-up contact.

## Required pre-activation checks

1. Qualified COPPA and Massachusetts review.
2. Direct parental notice and verifiable consent method approved for actual practices.
3. Public privacy notice matches fields, vendors, retention, rights, and automation.
4. Data-processing/provider retention checked for Cloudflare, R2, Resend, OpenAI, GitHub, and every social platform.
5. Server-side image validation/normalization or mandatory yellow treatment.
6. Access/correction/deletion runbook tested.
7. Production field/projection and secret checks completed.
