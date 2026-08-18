import { allChallengeDrafts2027, challengeProgram2027, PROGRAM_2027_ID } from './program2027.mjs'
import { REVIEW_POLICY_DOCUMENT, REVIEW_POLICY_VERSION } from '../scripts/review-policy.mjs'

export const REVIEW_POLICY_HASH = '75a253cd9a31a6159c3e515fb208a8ebea3746e9b1957f5f2df863b85583f5fc'
const seededAt = '2026-08-18T00:00:00.000Z'

async function runBatches(db, statements, size = 40) {
  for (let index = 0; index < statements.length; index += size) {
    await db.batch(statements.slice(index, index + size))
  }
}

export async function seedYearRoundOperations(db) {
  const controls = [
    ['review_mode', 'shadow', 'All automated decisions are advisory; grown-up moderation remains authoritative.'],
    ['auto_approval_enabled', 'false', 'No code path may convert a shadow proposal into approval.'],
    ['auto_publication_enabled', 'false', 'Publication remains an explicit Clubhouse Admin action.'],
    ['social_mode', 'dry_run', 'Social records are previews only; no platform adapter is connected.'],
    ['social_global_pause', 'true', 'Global pause defaults on until Amy approves channels and controls.'],
    ['paid_campaign_activation_enabled', 'false', 'Campaign activation and spending require Amy approval.'],
    ['public_email_expansion_enabled', 'false', 'This branch does not send or expand public email operations.'],
  ]
  const state = await db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM review_policy_versions WHERE policy_version = ?) AS policyCount,
      (SELECT COUNT(*) FROM operation_controls) AS controlCount,
      (SELECT COUNT(DISTINCT challenge_id) FROM challenge_versions WHERE program_id = ?) AS versionCount
  `).bind(REVIEW_POLICY_VERSION, PROGRAM_2027_ID).first()
  if (Number(state?.policyCount || 0) === 0) {
    await db.prepare(`
      INSERT OR IGNORE INTO review_policy_versions (
        id, policy_version, mode, policy_json, policy_hash, approved_by, effective_at, created_at
      ) VALUES (?, ?, 'shadow', ?, ?, NULL, ?, ?)
    `).bind(
      'policy-' + REVIEW_POLICY_VERSION,
      REVIEW_POLICY_VERSION,
      JSON.stringify(REVIEW_POLICY_DOCUMENT),
      REVIEW_POLICY_HASH,
      seededAt,
      seededAt,
    ).run()
  }
  if (Number(state?.controlCount || 0) < controls.length) {
    await runBatches(db, controls.map(([key, value, reason]) => db.prepare(`
      INSERT OR IGNORE INTO operation_controls (control_key, control_value, reason, changed_by, changed_at)
      VALUES (?, ?, ?, 'system_seed', ?)
    `).bind(key, value, reason, seededAt)))
  }
  if (Number(state?.versionCount || 0) >= allChallengeDrafts2027.length) return

  await db.prepare(`
    INSERT OR IGNORE INTO challenge_programs (
      id, year, title, age_band, editorial_timezone, status, version, policy_version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'private_draft', ?, ?, ?, ?)
  `).bind(
    challengeProgram2027.id,
    challengeProgram2027.year,
    challengeProgram2027.title,
    challengeProgram2027.ageBand,
    challengeProgram2027.editorialTimezone,
    challengeProgram2027.version,
    challengeProgram2027.policyVersion,
    seededAt,
    seededAt,
  ).run()

  const versionStatements = allChallengeDrafts2027.map((challenge) => db.prepare(`
    INSERT OR IGNORE INTO challenge_versions (
      id, program_id, challenge_id, version, kind, week_number, seasonal_arc, title,
      opening_date, submission_close_date, voting_open_date, voting_close_date,
      status, approval_gate, content_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
  `).bind(
    challenge.id + '-v' + challenge.version,
    PROGRAM_2027_ID,
    challenge.id,
    challenge.version,
    challenge.kind,
    challenge.weekNumber,
    challenge.seasonalArc,
    challenge.title,
    challenge.openingDate,
    challenge.submissionCloseDate,
    challenge.votingOpenDate,
    challenge.votingCloseDate,
    challenge.approvalGate || 'amy_program_approval',
    JSON.stringify(challenge),
    seededAt,
  ))
  await runBatches(db, versionStatements)

  const reviewStatements = allChallengeDrafts2027.flatMap((challenge) => {
    const versionId = challenge.id + '-v' + challenge.version
    const shared = [
      ['curriculum', 'reviewed', 'Challenge Director + curriculum validator', 'Machine-checked for required fields, diverse mechanic, and all three paths.'],
      ['age_fit', 'reviewed', 'Curriculum and Age-Fit Agent', 'Drafted for ages 8–10 with a 15–30 minute entry and optional stretch.'],
      ['accessibility', 'reviewed', 'Curriculum and Age-Fit Agent', 'Includes non-audio, non-color-only, keyboard/touch, and reduced-motion guidance.'],
    ]
    const inclusion = challenge.kind === 'bonus'
      ? ['inclusion', 'pending', 'Holiday, Culture, and Inclusion Agent', 'Context/date research is sourced; suitability and public scheduling still require the named human gate.']
      : ['inclusion', 'reviewed', 'Holiday, Culture, and Inclusion Agent', 'General draft avoids required identity disclosure, family stories, and cultural tokenism.']
    return [...shared, inclusion].map(([type, verdict, reviewer, notes]) => db.prepare(`
      INSERT OR IGNORE INTO challenge_reviews (
        id, challenge_version_id, review_type, verdict, reviewer_kind, reviewer_label, notes, evidence_json, created_at
      ) VALUES (?, ?, ?, ?, 'agent', ?, ?, '[]', ?)
    `).bind(versionId + '-' + type, versionId, type, verdict, reviewer, notes, seededAt))
  })
  await runBatches(db, reviewStatements)

  const contentStatements = allChallengeDrafts2027.flatMap((challenge) => {
    const versionId = challenge.id + '-v' + challenge.version
    const packageJson = {
      website: challenge.fullBrief,
      newsletter: challenge.newsletterPackage,
      educatorLibrary: challenge.socialContentPackage?.educatorLibraryVersion || null,
      social: challenge.socialContentPackage,
      visualBrief: challenge.visualBrief,
      accessibilityAltText: challenge.socialContentPackage?.altText || null,
      privacy: { publicFieldsOnly: true, childSubmissionDataIncluded: false, parentContactIncluded: false },
    }
    return [
      db.prepare(`
        INSERT OR IGNORE INTO challenge_content_packages (
          id, challenge_version_id, version, editorial_state, publication_mode, package_json,
          approved_by, scheduled_for, published_at, verified_at, created_at, updated_at
        ) VALUES (?, ?, 1, 'draft', 'dry_run', ?, NULL, NULL, NULL, NULL, ?, ?)
      `).bind('content-' + challenge.id + '-v1', versionId, JSON.stringify(packageJson), seededAt, seededAt),
      db.prepare(`
        INSERT OR IGNORE INTO social_content (
          id, challenge_version_id, channel, content_type, content_json, approval_state,
          publication_mode, scheduled_for, created_at, updated_at
        ) VALUES (?, ?, 'adult-organic', 'weekly-package', ?, 'draft', 'dry_run', NULL, ?, ?)
      `).bind('social-' + challenge.id + '-v1', versionId, JSON.stringify(packageJson.social), seededAt, seededAt),
    ]
  })
  await runBatches(db, contentStatements)
}
