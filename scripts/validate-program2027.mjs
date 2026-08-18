import { bonusChallenges2027, primaryChallenges2027, seasonalArcs2027 } from '../db/program2027.mjs'

const errors = []
const required = [
  'id', 'year', 'weekNumber', 'seasonalArc', 'title', 'eyebrow', 'prompt', 'fullBrief',
  'openingDate', 'submissionCloseDate', 'votingOpenDate', 'votingCloseDate', 'ageBand',
  'estimatedTime', 'creativeSkills', 'codingConcepts', 'pathways', 'starterIdeas',
  'recommendedTools', 'freeToolAlternatives', 'parentNote', 'safetyNotes', 'accessibilityNotes',
  'aiAssistanceGuidance', 'projectExamples', 'submissionRequirements', 'reviewRiskFlags',
  'socialContentPackage', 'newsletterPackage', 'visualBrief', 'status', 'version',
  'noOrLowCodeRoute', 'makeItYoursQuestion', 'prePublishSafetyCheck', 'reflectionQuestion',
]

function check(condition, message) {
  if (!condition) errors.push(message)
}

function easternParts(iso) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]))
}

check(primaryChallenges2027.length === 52, 'Expected exactly 52 primary challenges.')
check(bonusChallenges2027.length === 12, 'Expected exactly 12 optional bonus challenges.')
check(new Set(primaryChallenges2027.map(({ id }) => id)).size === 52, 'Primary IDs must be unique.')
check(new Set(primaryChallenges2027.map(({ title }) => title)).size === 52, 'Primary titles must be unique.')
check(new Set(primaryChallenges2027.map(({ prompt }) => prompt)).size === 52, 'Primary prompts must be unique.')

for (const arc of seasonalArcs2027) {
  check(primaryChallenges2027.filter(({ seasonalArc }) => seasonalArc === arc.id).length === 13, arc.id + ' must contain 13 primaries.')
}

for (const [index, challenge] of primaryChallenges2027.entries()) {
  for (const field of required) check(challenge[field] !== undefined && challenge[field] !== null, challenge.id + ' is missing ' + field + '.')
  check(challenge.id.startsWith('2027-w' + String(index + 1).padStart(2, '0') + '-'), challenge.id + ' must use an immutable year/week prefix.')
  check(challenge.weekNumber === index + 1, challenge.id + ' has the wrong week number.')
  check(challenge.status === 'draft' && challenge.version === 1, challenge.id + ' must begin as version 1 draft.')
  check(Object.keys(challenge.pathways).join(',') === 'spark,build,glowUp', challenge.id + ' needs Spark, Build, and Glow-Up.')
  check(challenge.aiAssistanceGuidance.parentSupervisedPrompt.includes('Grown-up supervising'), challenge.id + ' needs a copyable supervised AI prompt.')
  check(challenge.aiAssistanceGuidance.parentSupervisedPrompt.includes('Do not ask for'), challenge.id + ' AI prompt needs a privacy boundary.')
  check(challenge.recommendedTools.length > 1 && challenge.freeToolAlternatives.length > 1, challenge.id + ' needs visible free tool paths.')
  check(challenge.socialContentPackage.publicationMode === 'dry_run', challenge.id + ' social package must remain dry-run.')
  for (const field of ['launchPost', 'midweekPost', 'submissionReminder', 'votingPost', 'galleryPost', 'favoritesPost', 'parentTip', 'shortVariant', 'longVariant', 'altText', 'campaignLink']) {
    check(Boolean(challenge.socialContentPackage[field]), challenge.id + ' social package is missing ' + field + '.')
  }
  const open = easternParts(challenge.openingDate)
  const close = easternParts(challenge.submissionCloseDate)
  const voteOpen = easternParts(challenge.votingOpenDate)
  const voteClose = easternParts(challenge.votingCloseDate)
  check(open.weekday === 'Mon' && open.hour === '09' && open.minute === '00', challenge.id + ' must open Monday 09:00 America/New_York.')
  check(close.weekday === 'Mon' && close.hour === '00' && close.minute === '00', challenge.id + ' must close submissions Monday 00:00 America/New_York.')
  check(voteOpen.weekday === 'Mon' && voteOpen.hour === '09' && voteOpen.minute === '00', challenge.id + ' voting must open Monday 09:00 America/New_York.')
  check(voteClose.weekday === 'Mon' && voteClose.hour === '09' && voteClose.minute === '00', challenge.id + ' voting must close Monday 09:00 America/New_York.')
  check(Date.parse(challenge.openingDate) < Date.parse(challenge.submissionCloseDate), challenge.id + ' has invalid date ordering.')
  check(Date.parse(challenge.submissionCloseDate) < Date.parse(challenge.votingOpenDate), challenge.id + ' voting needs the delayed window.')
  check(Date.parse(challenge.votingOpenDate) < Date.parse(challenge.votingCloseDate), challenge.id + ' voting close must follow voting open.')
}

for (const bonus of bonusChallenges2027) {
  check(bonus.id.startsWith('2027-bonus-'), bonus.id + ' must use an immutable year prefix.')
  check(bonus.kind === 'bonus' && bonus.votingEnabled === false, bonus.id + ' must be optional and noncompetitive.')
  check(bonus.votingOpenDate === null && bonus.votingCloseDate === null, bonus.id + ' must not have a voting window.')
  check(Boolean(bonus.sourceUrl) && Boolean(bonus.neutralAlternative), bonus.id + ' needs a source and neutral alternative.')
  check(bonus.humanApprovalRequired && bonus.inclusionReview === 'pending_human', bonus.id + ' must remain human-gated.')
  check(bonus.socialContentPackage.publicationMode === 'dry_run' && bonus.socialContentPackage.blockedUntilHumanApproval, bonus.id + ' publication must be blocked.')
}

check(primaryChallenges2027[0].openingDate === '2027-01-04T14:00:00.000Z', 'Week 1 must open January 4 at 09:00 EST.')
check(primaryChallenges2027.at(-1).openingDate === '2027-12-27T14:00:00.000Z', 'Week 52 must open December 27 at 09:00 EST.')
check(primaryChallenges2027.at(-1).votingCloseDate === '2028-01-10T14:00:00.000Z', 'Week 52 voting must close January 10, 2028.')

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('2027 program valid: 52 primaries, 4×13 arcs, 12 optional bonuses, complete fields, and conflict-free America/New_York cadence.')
}
