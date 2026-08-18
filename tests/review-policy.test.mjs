import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  evaluateShadowReview, PHASE_THREE_EVIDENCE_THRESHOLD, REQUIRED_EVIDENCE_KINDS,
  REQUIRED_GREEN_CHECKS, REVIEW_POLICY_DOCUMENT,
} from '../scripts/review-policy.mjs'

const fixtures = JSON.parse(await readFile(new URL('./fixtures/review-adversarial.json', import.meta.url), 'utf8'))

function fullInput() {
  return {
    checks: Object.fromEntries(REQUIRED_GREEN_CHECKS.map((key) => [key, true])),
    evidenceKinds: [...REQUIRED_EVIDENCE_KINDS],
    safetyAgent: { classification: 'green', limitations: [] },
    technicalPlaytest: { classification: 'green', limitations: [] },
    limitations: [],
  }
}

test('a complete green proposal remains incapable of publication', () => {
  const decision = evaluateShadowReview(fullInput())
  assert.equal(decision.proposedLane, 'green')
  assert.equal(decision.mode, 'shadow')
  assert.equal(decision.publicationAllowed, false)
  assert.equal(decision.confidenceIsEvidence, false)
})

test('missing evidence and uncertainty are always yellow', () => {
  const input = fullInput()
  input.evidenceKinds = input.evidenceKinds.filter((kind) => kind !== 'source_scan')
  input.limitations = ['Only eight states were sampled.']
  const decision = evaluateShadowReview(input)
  assert.equal(decision.proposedLane, 'yellow')
  assert.ok(decision.missingEvidence.includes('source_scan'))
})

test('adversarial fixtures take the expected lane', () => {
  for (const fixture of fixtures) {
    const input = fixture.allChecks ? fullInput() : fullInput()
    if (!fixture.allEvidence) input.evidenceKinds = fixture.allChecks ? input.evidenceKinds : []
    if (fixture.falseCheck) input.checks[fixture.falseCheck] = false
    if (fixture.safety) input.safetyAgent.classification = fixture.safety
    if (fixture.playtest) input.technicalPlaytest.classification = fixture.playtest
    if (fixture.limitation) input.limitations.push(fixture.limitation)
    if (fixture.redSignal) input.redSignals = [fixture.redSignal]
    assert.equal(evaluateShadowReview(input).proposedLane, fixture.expected, fixture.name)
  }
})

test('phase three threshold is fixed before observation', () => {
  assert.equal(PHASE_THREE_EVIDENCE_THRESHOLD.minimumConsecutiveProposedGreens, 300)
  assert.equal(PHASE_THREE_EVIDENCE_THRESHOLD.maximumCriticalFalseGreens, 0)
  assert.match(REVIEW_POLICY_DOCUMENT.invariant, /never publish/i)
})
