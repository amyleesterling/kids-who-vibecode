import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { primaryChallenges2027 } from '../db/program2027.mjs'

const worker = await readFile(new URL('../worker/index.ts', import.meta.url), 'utf8')

test('public project APIs do not select private submission columns', () => {
  const communitySource = worker.slice(worker.indexOf('async function community'), worker.indexOf('async function favorites'))
  const favoritesSource = worker.slice(worker.indexOf('async function favorites'), worker.indexOf('async function vote'))
  for (const source of [communitySource, favoritesSource]) {
    for (const forbidden of ['parent_email', 'parent_name', 'terms_version', 'public_sharing', 'safety_agent_report', 'reviewer_reviews']) {
      assert.equal(source.includes(forbidden), false, forbidden + ' must not enter a public projection')
    }
  }
})

test('editorial packages contain no child or parent record fields', () => {
  for (const challenge of primaryChallenges2027) {
    const serialized = JSON.stringify(challenge.socialContentPackage)
    for (const forbidden of ['parentEmail', 'parentName', 'childNickname', 'consentRecord', 'safetyAgentReport']) {
      assert.equal(serialized.includes(forbidden), false, challenge.id + ' contains ' + forbidden)
    }
  }
})

test('owner notification minimizes third-party email data', () => {
  const source = worker.slice(worker.indexOf('async function sendOwnerNotification'), worker.indexOf('const adminCookieName'))
  for (const forbidden of ['notification.title', 'notification.creator', 'notification.grownupEmail']) {
    assert.equal(source.includes(forbidden), false)
  }
  assert.match(source, /Child-facing copy and grown-up contact stay in Clubhouse Admin/)
})
