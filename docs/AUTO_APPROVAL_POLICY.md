# Automatic Approval Policy

Policy version: `vck-shadow-2027.1`
Current mode: `shadow`
Automatic publication: structurally unavailable

The executable source is `scripts/review-policy.mjs`. This document is the human-readable policy; if they disagree, operation stops until the mismatch is resolved and versioned.

## Green requirements

Every one must be explicit true:

- grown-up submission and current legal acceptance present;
- public fields contain no personal information; nickname/age and description pass review;
- an image is absent or passes content/identifiability review and server-side metadata removal;
- HTTPS destination is reachable with no login/account creation;
- no payment, ads, affiliate/commerce, sensitive permissions, form/chat/message/data collection, download, uncontrolled navigation, unreviewed iframe/embed, suspicious tracker/analytics, or exposed secret;
- minimum declared playtest coverage is met;
- visible text/screens pass moderation;
- source is available and passes or the artifact is immutable and controlled;
- deterministic checks, Safety Agent, Technical Playtest, and policy agree;
- no critical uncertainty remains;
- deterministic, text, image, source, safety, and technical evidence records are present.

Confidence never fills a missing check. Cheerfulness never fills a missing check.

## Yellow

Any missing evidence, uncertainty, inaccessible source, mutable/unmatched target, external API, unusual network request, input, audio/video, embed, personal photo/voice, ambiguous text, incomplete coverage, culturally sensitive material, or disagreement is yellow for grown-up review.

## Red

Personal information; harmful, sexual, hateful, threatening, or exploitative material; credentials; malware/deceptive downloads; hidden tracking; unauthorized advertising/payments; direct child communication; review-environment bypass; dangerous external links; or deliberate misrepresentation is red and quarantined/rejected.

## Predeclared Phase 3 threshold

The threshold was fixed before any shadow observations:

- pilot category restricted to reviewed immutable or controlled-origin static artifacts;
- 300 consecutive proposed-green cases across at least 12 weeks and 8 challenge/tool formats;
- 100% grown-up audit;
- zero critical false greens;
- at least 299/300 human agreement on noncritical green decisions;
- exact policy/model/prompt versions pass the complete adversarial suite twice in clean environments;
- staging proves kill switch, immediate takedown, rollback, and forced return to shadow;
- no unresolved high-severity defect;
- qualified legal/privacy approval and approved notices;
- Amy explicitly approves the exact category, versions, dates, and controls.

Three hundred zero-event observations place a rough 95% upper bound below one percent; that is a monitoring threshold, never proof of safety. A critical miss or material policy/model/prompt change resets the window and returns operation to shadow.

## Phase 3 is a separate change

This branch intentionally contains no decision-to-publication path and no enable-auto-approval Admin control. A future separately reviewed PR must add the narrow pilot, one-click kill switch, immediate takedown, 100% pilot audits, target-environment tests, and explicit approvals.
