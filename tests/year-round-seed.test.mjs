import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readdir, readFile } from 'node:fs/promises'
import { seedYearRoundOperations, REVIEW_POLICY_HASH } from '../db/yearRoundSeeds.mjs'

class D1BoundStatement {
  constructor(statement, values) {
    this.statement = statement
    this.values = values
  }
  bind(...values) { return new D1BoundStatement(this.statement, values) }
  async first() { return this.statement.get(...this.values) || null }
  async all() { return { results: this.statement.all(...this.values) } }
  async run() { return this.statement.run(...this.values) }
}

async function database() {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec('PRAGMA foreign_keys = ON')
  const directory = new URL('../drizzle/', import.meta.url)
  const migrations = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort()
  for (const name of migrations) sqlite.exec(await readFile(new URL(name, directory), 'utf8'))
  return {
    sqlite,
    prepare(sql) { return new D1BoundStatement(sqlite.prepare(sql), []) },
    async batch(statements) {
      const results = []
      for (const statement of statements) results.push(await statement.run())
      return results
    },
  }
}

test('year-round seed is complete, private-sidecar-only, and idempotent', async () => {
  const db = await database()
  await seedYearRoundOperations(db)
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM challenge_versions').get().count, 64)
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS count FROM challenge_versions WHERE kind = 'primary'").get().count, 52)
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS count FROM challenge_versions WHERE kind = 'bonus'").get().count, 12)
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM challenge_content_packages').get().count, 64)
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM social_content').get().count, 64)
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS count FROM challenges WHERE id LIKE '2027-%'").get().count, 0, '2027 drafts must not enter the live challenge table')
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS count FROM operation_controls WHERE control_value IN ('false','shadow','dry_run','true')").get().count, 7)
  const policy = db.sqlite.prepare('SELECT mode, policy_hash AS policyHash FROM review_policy_versions').get()
  assert.equal(policy.mode, 'shadow')
  assert.equal(policy.policyHash, REVIEW_POLICY_HASH)
  await seedYearRoundOperations(db)
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM challenge_versions').get().count, 64)
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM challenge_reviews').get().count, 256)
  db.sqlite.exec(`
    INSERT INTO challenge_versions (
      id, program_id, challenge_id, version, kind, week_number, seasonal_arc, title,
      opening_date, submission_close_date, voting_open_date, voting_close_date,
      status, approval_gate, content_json, created_at
    )
    SELECT challenge_id || '-v2', program_id, challenge_id, 2, kind, week_number,
      seasonal_arc, title, opening_date, submission_close_date, voting_open_date,
      voting_close_date, 'draft', approval_gate, content_json, created_at
    FROM challenge_versions WHERE week_number = 1
  `)
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS count FROM challenge_versions WHERE challenge_id LIKE '2027-w01-%'").get().count, 2, 'version history must preserve the prior draft')
  db.sqlite.close()
})
