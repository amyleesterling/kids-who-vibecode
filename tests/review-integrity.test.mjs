import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const worker = await readFile(new URL('../worker/index.ts', import.meta.url), 'utf8')
const runner = await readFile(new URL('../scripts/run-safety-scans.mjs', import.meta.url), 'utf8')
const migration = await readFile(new URL('../drizzle/0018_year_round_program_and_shadow_ops.sql', import.meta.url), 'utf8')

test('shadow coordinator has no project publication statement', () => {
  const source = worker.slice(worker.indexOf('async function initialShadowReviewStatements'), worker.indexOf('async function serveUpload'))
  assert.equal(/(?:INSERT|UPDATE)\s+(?:INTO\s+)?projects\b/i.test(source), false)
  assert.match(source, /publication_allowed[^]*0/i)
})

test('runner results are attempt-bound and red rows are withheld from parent reviewers', () => {
  const resultHandler = worker.slice(worker.indexOf('async function recordSafetyScanResult'), worker.indexOf('async function serveUpload'))
  assert.match(resultHandler, /sc\.status = 'running' AND sc\.attempt = \?/)
  const reviewerHandler = worker.slice(worker.indexOf('async function reviewerSubmissions'), worker.indexOf('async function adminDashboard'))
  assert.match(reviewerHandler, /proposed_lane[^]*!= 'red'/)
})

test('OpenAI generative safety calls disable response storage', () => {
  const calls = runner.split('openai.responses.create({').slice(1)
  assert.equal(calls.length, 2)
  for (const call of calls) assert.match(call.slice(0, 180), /store: false/)
})

test('database rejects live authority in the first sidecar migration', () => {
  assert.match(migration, /CHECK \(mode = 'shadow'\)/)
  assert.match(migration, /CHECK \(publication_allowed = 0\)/)
  assert.match(migration, /CHECK \(mode = 'dry_run'\)/)
  assert.match(migration, /CHECK \(activation_allowed = 0\)/)
})

test('year scheduling is an authenticated, conflict-checked Human Steward action', () => {
  const source = worker.slice(worker.indexOf('async function adminScheduleYearChallenge'), worker.indexOf('async function adminQueueSafetyScan'))
  assert.match(source, /isAdmin/)
  assert.match(source, /source\.kind !== 'primary'/)
  assert.match(source, /source\.editorialState !== 'approved'/)
  assert.match(source, /Schedule conflict/)
  assert.match(source, /'human_steward', 'approved'/)
  assert.match(source, /status = 'scheduled'/)
})
