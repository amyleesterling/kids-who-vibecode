import { ensureDatabase, seedDatabase } from '../db/schema'

type D1Statement = {
  bind(...values: unknown[]): D1Statement
  first<T>(): Promise<T | null>
  all<T>(): Promise<{ results: T[] }>
  run(): Promise<unknown>
}

export type ClubDatabase = {
  prepare(sql: string): D1Statement
  batch(statements: D1Statement[]): Promise<unknown[]>
}

type Env = { DB: ClubDatabase }

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const validText = (value: unknown, max: number, min = 1) => {
  const result = text(value)
  return result.length >= min && result.length <= max ? result : null
}
const validUrl = (value: unknown, required = true) => {
  const result = text(value)
  if (!result && !required) return ''
  try {
    const url = new URL(result)
    return url.protocol === 'https:' ? url.toString() : null
  } catch { return null }
}

async function initialize(db: ClubDatabase) {
  await ensureDatabase(db)
  await seedDatabase(db)
}

async function community(db: ClubDatabase, request: Request) {
  const voterId = new URL(request.url).searchParams.get('voterId') || ''
  const challenge = await db.prepare(`
    SELECT id, week_label AS weekLabel, title, eyebrow, prompt, brief,
      closes_at AS closesAt, status, starter_ideas AS starterIdeas, tools
    FROM challenges WHERE status = 'active' LIMIT 1
  `).first<Record<string, unknown>>()
  if (!challenge) return json({ error: 'No active challenge' }, 404)

  const { results: projects } = await db.prepare(`
    SELECT id, challenge_id AS challengeId, title, builder, age_band AS ageBand,
      description, repo_url AS repoUrl, demo_url AS demoUrl, base_votes AS baseVotes,
      scene, accent
    FROM projects WHERE challenge_id = ? AND status = 'approved'
  `).bind(challenge.id).all<Record<string, unknown>>()
  const { results: counts } = await db.prepare(`
    SELECT project_id AS projectId, COUNT(*) AS count
    FROM votes WHERE challenge_id = ? GROUP BY project_id
  `).bind(challenge.id).all<{ projectId: string; count: number }>()
  const currentVote = voterId ? await db.prepare(`
    SELECT project_id AS projectId FROM votes WHERE challenge_id = ? AND voter_id = ?
  `).bind(challenge.id, voterId).first<{ projectId: string }>() : null

  return json({
    challenge: {
      ...challenge,
      starterIdeas: JSON.parse(String(challenge.starterIdeas || '[]')),
      tools: JSON.parse(String(challenge.tools || '[]')),
    },
    projects,
    voteCounts: Object.fromEntries(counts.map((item) => [item.projectId, Number(item.count)])),
    myVote: currentVote?.projectId || null,
    source: 'database',
  })
}

async function vote(db: ClubDatabase, request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const challengeId = validText(body?.challengeId, 80)
  const projectId = validText(body?.projectId, 80)
  const voterId = validText(body?.voterId, 80)
  if (!challengeId || !projectId || !voterId) return json({ error: 'Invalid vote' }, 400)

  const project = await db.prepare(`
    SELECT id FROM projects WHERE id = ? AND challenge_id = ? AND status = 'approved'
  `).bind(projectId, challengeId).first<{ id: string }>()
  if (!project) return json({ error: 'Project not found' }, 404)

  await db.prepare(`
    INSERT INTO votes (challenge_id, voter_id, project_id, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(challenge_id, voter_id)
    DO UPDATE SET project_id = excluded.project_id, updated_at = excluded.updated_at
  `).bind(challengeId, voterId, projectId, new Date().toISOString()).run()
  return json({ ok: true })
}

async function submit(db: ClubDatabase, request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || text(body.website)) return json({ error: 'Invalid submission' }, 400)

  const challengeId = validText(body.challengeId, 80)
  const childNickname = validText(body.childNickname, 24)
  const ageBand = ['5–6', '7–9', '10–12', '13–15'].includes(text(body.ageBand)) ? text(body.ageBand) : null
  const projectTitle = validText(body.projectTitle, 60)
  const description = validText(body.description, 280, 10)
  const repoUrl = validUrl(body.repoUrl)
  const demoUrl = validUrl(body.demoUrl, false)
  const parentName = validText(body.parentName, 80)
  const parentEmail = validText(body.parentEmail, 160)
  const consent = body.consent === true
  const publicSharing = body.publicSharing === true

  if (!challengeId || !childNickname || !ageBand || !projectTitle || !description || !repoUrl || demoUrl === null || !parentName || !parentEmail || !consent || !publicSharing || !parentEmail.includes('@')) {
    return json({ error: 'Please complete every required field and permission box.' }, 400)
  }

  const challenge = await db.prepare(`SELECT id FROM challenges WHERE id = ? AND status = 'active'`).bind(challengeId).first<{ id: string }>()
  if (!challenge) return json({ error: 'That challenge is no longer accepting submissions.' }, 400)

  await db.prepare(`
    INSERT INTO submissions (
      id, challenge_id, child_nickname, age_band, project_title, description,
      repo_url, demo_url, parent_name, parent_email, consent, public_sharing,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'pending', ?)
  `).bind(
    crypto.randomUUID(), challengeId, childNickname, ageBand, projectTitle, description,
    repoUrl, demoUrl, parentName, parentEmail.toLowerCase(), new Date().toISOString(),
  ).run()
  return json({ ok: true }, 201)
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 })

    try {
      await initialize(env.DB)
      if (request.method === 'GET' && url.pathname === '/api/community') return community(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/vote') return vote(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/submissions') return submit(env.DB, request)
      return json({ error: 'Not found' }, 404)
    } catch (error) {
      console.error('Community API error', error)
      return json({ error: 'The clubhouse database is taking a break. Please try again.' }, 500)
    }
  },
}
