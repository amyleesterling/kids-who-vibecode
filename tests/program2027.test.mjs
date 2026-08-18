import test from 'node:test'
import assert from 'node:assert/strict'
import { bonusChallenges2027, primaryChallenges2027 } from '../db/program2027.mjs'

test('annual program has four complete 13-week arcs', () => {
  assert.equal(primaryChallenges2027.length, 52)
  for (const arc of ['winter', 'spring', 'summer', 'autumn']) {
    assert.equal(primaryChallenges2027.filter((challenge) => challenge.seasonalArc === arc).length, 13)
  }
})

test('primary mechanics, prompts, titles, and IDs do not repeat', () => {
  for (const field of ['id', 'title', 'prompt', 'eyebrow']) {
    const values = primaryChallenges2027.map((challenge) => challenge[field])
    assert.equal(new Set(values).size, values.length, field + ' must be unique')
  }
})

test('every primary keeps the child in charge and supplies all three paths', () => {
  for (const challenge of primaryChallenges2027) {
    assert.deepEqual(Object.keys(challenge.pathways), ['spark', 'build', 'glowUp'])
    assert.match(challenge.aiAssistanceGuidance.principle, /child chooses/i)
    assert.match(challenge.aiAssistanceGuidance.parentSupervisedPrompt, /Ask one short question at a time/i)
    assert.match(challenge.prePublishSafetyCheck, /grown-up/i)
    assert.ok(challenge.noOrLowCodeRoute.length > 50)
    assert.ok(challenge.reflectionQuestion.endsWith('?'))
  }
})

test('bonus challenges are optional, sourced, neutral, and human-gated', () => {
  assert.equal(bonusChallenges2027.length, 12)
  for (const challenge of bonusChallenges2027) {
    assert.equal(challenge.votingEnabled, false)
    assert.equal(challenge.votingOpenDate, null)
    assert.equal(challenge.inclusionReview, 'pending_human')
    assert.ok(challenge.sourceUrl.startsWith('https://'))
    assert.ok(challenge.neutralAlternative.length > 20)
    assert.equal(challenge.socialContentPackage.blockedUntilHumanApproval, true)
  }
})

test('future draft source has no collision with legacy ambiguous ID', () => {
  assert.equal(primaryChallenges2027.some(({ id }) => id === 'invent-a-creature'), false)
  assert.equal(bonusChallenges2027.some(({ id }) => id === 'invent-a-creature'), false)
})
