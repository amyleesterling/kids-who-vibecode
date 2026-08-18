export const REVIEW_POLICY_VERSION = 'vck-shadow-2027.1'

export const REQUIRED_GREEN_CHECKS = [
  'grownUpSubmissionPresent',
  'currentLegalAcceptancePresent',
  'publicFieldsNoPersonalInformation',
  'nicknameAndAgeBandSafe',
  'descriptionModerationPassed',
  'imageAbsentOrModerationPassed',
  'imageAbsentOrNoIdentifiableChild',
  'imageAbsentOrMetadataRemovedServerSide',
  'playableUrlHttps',
  'destinationReachable',
  'noLoginOrAccountCreation',
  'noPaymentAdvertisingAffiliateOrCommerce',
  'noSensitivePermissionRequests',
  'noFormsChatMessagingOrDataCollection',
  'noFileDownload',
  'noUncontrolledExternalNavigation',
  'noUnreviewedIframeOrThirdPartyEmbed',
  'noSuspiciousTrackerOrAnalytics',
  'noExposedSecretOrCredential',
  'minimumPlaytestCoverageMet',
  'visibleTextAndScreensModerationPassed',
  'sourceAvailableAndPassedOrControlledArtifact',
  'deterministicSafetyAndPlaytestAgree',
  'noCriticalUncertainty',
]

export const REQUIRED_EVIDENCE_KINDS = [
  'deterministic',
  'text_moderation',
  'image_moderation',
  'source_scan',
  'safety_agent',
  'technical_playtest',
]

export const RED_SIGNALS = [
  'personal_information',
  'harmful_or_exploitative_content',
  'credential_theft',
  'malware_or_deceptive_download',
  'hidden_tracking',
  'unauthorized_advertising',
  'payment_solicitation',
  'direct_child_communication',
  'review_environment_bypass',
  'dangerous_external_link',
  'deliberate_misrepresentation',
]

const RED_IF_FALSE = new Map([
  ['publicFieldsNoPersonalInformation', 'personal_information'],
  ['noPaymentAdvertisingAffiliateOrCommerce', 'payment_solicitation'],
  ['noFileDownload', 'malware_or_deceptive_download'],
  ['noSuspiciousTrackerOrAnalytics', 'hidden_tracking'],
  ['noExposedSecretOrCredential', 'credential_theft'],
])

export const PHASE_THREE_EVIDENCE_THRESHOLD = Object.freeze({
  minimumConsecutiveProposedGreens: 300,
  minimumObservationWeeks: 12,
  minimumChallengeOrToolFormats: 8,
  grownUpAuditPercent: 100,
  maximumCriticalFalseGreens: 0,
  minimumNoncriticalGreenAgreement: '299/300',
  cleanEnvironmentBenchmarkPasses: 2,
  additionalRequirements: [
    'pilot limited to a reviewed immutable or controlled-origin static artifact',
    'kill switch, immediate takedown, rollback, and forced return to shadow proven in staging',
    'qualified legal and privacy review recorded',
    'Amy explicitly approves the exact pilot category, versions, and dates',
    'any critical miss or material policy, model, or prompt change resets the evidence window',
  ],
})

export const REVIEW_POLICY_DOCUMENT = Object.freeze({
  policyVersion: REVIEW_POLICY_VERSION,
  mode: 'shadow',
  requiredGreenChecks: REQUIRED_GREEN_CHECKS,
  requiredEvidenceKinds: REQUIRED_EVIDENCE_KINDS,
  redSignals: RED_SIGNALS,
  phaseThreeEvidenceThreshold: PHASE_THREE_EVIDENCE_THRESHOLD,
  invariant: 'A shadow decision can never publish or update an approved project.',
})

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

export function evaluateShadowReview(input = {}) {
  const checks = input.checks && typeof input.checks === 'object' ? input.checks : {}
  const evidenceKinds = Array.isArray(input.evidenceKinds) ? input.evidenceKinds : []
  const suppliedRedSignals = Array.isArray(input.redSignals) ? input.redSignals.filter((signal) => RED_SIGNALS.includes(signal)) : []
  const derivedRedSignals = REQUIRED_GREEN_CHECKS.flatMap((key) => checks[key] === false && RED_IF_FALSE.has(key) ? [RED_IF_FALSE.get(key)] : [])
  const redSignals = unique([...suppliedRedSignals, ...derivedRedSignals])
  const missingChecks = REQUIRED_GREEN_CHECKS.filter((key) => checks[key] !== true && checks[key] !== false)
  const failedChecks = REQUIRED_GREEN_CHECKS.filter((key) => checks[key] === false)
  const missingEvidence = REQUIRED_EVIDENCE_KINDS.filter((kind) => !evidenceKinds.includes(kind))
  const safetyClassification = input.safetyAgent?.classification
  const playtestClassification = input.technicalPlaytest?.classification
  const limitations = unique([
    ...(Array.isArray(input.limitations) ? input.limitations : []),
    ...(Array.isArray(input.safetyAgent?.limitations) ? input.safetyAgent.limitations : []),
    ...(Array.isArray(input.technicalPlaytest?.limitations) ? input.technicalPlaytest.limitations : []),
  ])

  let proposedLane = 'yellow'
  const reasonCodes = []
  if (redSignals.length) {
    proposedLane = 'red'
    reasonCodes.push(...redSignals.map((signal) => 'red:' + signal))
  } else if (
    missingChecks.length === 0 && failedChecks.length === 0 && missingEvidence.length === 0 &&
    safetyClassification === 'green' && playtestClassification === 'green' && limitations.length === 0
  ) {
    proposedLane = 'green'
    reasonCodes.push('all_versioned_green_requirements_satisfied')
  } else {
    if (missingChecks.length) reasonCodes.push('missing_required_checks')
    if (failedChecks.length) reasonCodes.push('one_or_more_checks_failed')
    if (missingEvidence.length) reasonCodes.push('missing_required_evidence')
    if (safetyClassification !== 'green') reasonCodes.push('safety_agent_not_green')
    if (playtestClassification !== 'green') reasonCodes.push('technical_playtest_not_green')
    if (limitations.length) reasonCodes.push('critical_or_material_uncertainty')
  }

  return {
    policyVersion: REVIEW_POLICY_VERSION,
    mode: 'shadow',
    proposedLane,
    publicationAllowed: false,
    reasonCodes: unique(reasonCodes),
    missingChecks,
    failedChecks,
    missingEvidence,
    redSignals,
    limitations,
    confidenceIsEvidence: false,
  }
}
