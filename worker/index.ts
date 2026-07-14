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

type Env = {
  DB: ClubDatabase
  RESEND_API_KEY?: string
  NEWSLETTER_CRON_SECRET?: string
  NEWSLETTER_FROM_EMAIL?: string
}

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
const validEmail = (value: unknown) => {
  const result = text(value).toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) && result.length <= 160 ? result : null
}
const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

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
      scene, accent,
      CASE WHEN id IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco') THEN 1 ELSE 0 END AS isSample
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
    projects: projects.map((project) => ({ ...project, isSample: Boolean(project.isSample) })),
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
    SELECT id FROM projects
    WHERE id = ? AND challenge_id = ? AND status = 'approved'
      AND id NOT IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco')
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

async function submitChallengeIdea(db: ClubDatabase, request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || text(body.website)) return json({ error: 'Invalid submission' }, 400)

  const ideaTitle = validText(body.ideaTitle, 80)
  const ideaPrompt = validText(body.ideaPrompt, 400, 10)
  const starterSpark = text(body.starterSpark)
  const creatorNickname = validText(body.creatorNickname, 24)
  const creatorGroup = ['5–6', '7–9', '10–12', '13–15', 'Grown-up'].includes(text(body.creatorGroup)) ? text(body.creatorGroup) : null
  const grownupEmail = validText(body.grownupEmail, 160)
  const consent = body.consent === true

  if (!ideaTitle || !ideaPrompt || starterSpark.length > 180 || !creatorNickname || !creatorGroup || !grownupEmail || !grownupEmail.includes('@') || !consent) {
    return json({ error: 'Please complete every required field and the grown-up permission box.' }, 400)
  }

  await db.prepare(`
    INSERT INTO challenge_ideas (
      id, idea_title, idea_prompt, starter_spark, creator_nickname,
      creator_group, grownup_email, consent, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pending', ?)
  `).bind(
    crypto.randomUUID(), ideaTitle, ideaPrompt, starterSpark, creatorNickname,
    creatorGroup, grownupEmail.toLowerCase(), new Date().toISOString(),
  ).run()
  return json({ ok: true }, 201)
}

async function subscribe(db: ClubDatabase, request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || text(body.website)) return json({ error: 'Invalid signup' }, 400)

  const email = validEmail(body.email)
  const adultConsent = body.adultConsent === true
  if (!email || !adultConsent) {
    return json({ error: 'Please enter a valid grown-up email and confirm the permission box.' }, 400)
  }

  const now = new Date().toISOString()
  const existing = await db.prepare(`SELECT id FROM subscribers WHERE email = ?`).bind(email).first<{ id: string }>()
  if (existing) {
    await db.prepare(`
      UPDATE subscribers
      SET status = 'active', adult_consent = 1, updated_at = ?
      WHERE email = ?
    `).bind(now, email).run()
  } else {
    await db.prepare(`
      INSERT INTO subscribers (
        id, email, adult_consent, status, unsubscribe_token, source, created_at, updated_at
      ) VALUES (?, ?, 1, 'active', ?, 'website', ?, ?)
    `).bind(crypto.randomUUID(), email, crypto.randomUUID(), now, now).run()
  }

  return json({ ok: true }, 201)
}

async function unsubscribe(db: ClubDatabase, request: Request) {
  const token = new URL(request.url).searchParams.get('token') || ''
  if (token.length < 20 || token.length > 100) return new Response('That unsubscribe link is not valid.', { status: 400 })
  await db.prepare(`UPDATE subscribers SET status = 'unsubscribed', updated_at = ? WHERE unsubscribe_token = ?`)
    .bind(new Date().toISOString(), token).run()

  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Unsubscribed · Vibe Code Club</title><body style="font-family:system-ui;background:#fffaf0;color:#211d38;padding:48px"><main style="max-width:620px;margin:auto"><h1>You’re unsubscribed.</h1><p>No more weekly challenge emails will be sent to this address. You can always join again at <a href="https://vibecodeclub.org/#subscribe">vibecodeclub.org</a>.</p></main></body></html>`, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

async function sendWeeklyChallenge(db: ClubDatabase, request: Request, env: Env) {
  const authorization = request.headers.get('authorization') || ''
  if (!env.NEWSLETTER_CRON_SECRET || authorization !== `Bearer ${env.NEWSLETTER_CRON_SECRET}`) {
    return json({ error: 'Unauthorized' }, 401)
  }
  if (!env.RESEND_API_KEY || !env.NEWSLETTER_FROM_EMAIL) {
    return json({ error: 'Email delivery is not configured' }, 503)
  }

  const challenge = await db.prepare(`
    SELECT id, week_label AS weekLabel, title, prompt, brief
    FROM challenges WHERE status = 'active' LIMIT 1
  `).first<{ id: string; weekLabel: string; title: string; prompt: string; brief: string }>()
  if (!challenge) return json({ error: 'No active challenge' }, 404)

  const { results: subscribers } = await db.prepare(`
    SELECT s.email, s.unsubscribe_token AS unsubscribeToken
    FROM subscribers s
    LEFT JOIN newsletter_deliveries d ON d.challenge_id = ? AND d.email = s.email
    WHERE s.status = 'active' AND d.email IS NULL
    ORDER BY s.created_at ASC
    LIMIT 500
  `).bind(challenge.id).all<{ email: string; unsubscribeToken: string }>()

  let sent = 0
  const failures: string[] = []
  for (let offset = 0; offset < subscribers.length; offset += 10) {
    const group = subscribers.slice(offset, offset + 10)
    await Promise.all(group.map(async (subscriber) => {
      const unsubscribeUrl = `https://vibecodeclub.org/api/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json',
          'idempotency-key': `weekly-${challenge.id}-${subscriber.unsubscribeToken}`,
        },
        body: JSON.stringify({
          from: env.NEWSLETTER_FROM_EMAIL,
          to: [subscriber.email],
          subject: `${challenge.title} — this week at Vibe Code Club`,
          html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#211d38"><p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#ff5b55">${escapeHtml(challenge.weekLabel)}</p><h1 style="font-size:36px;line-height:1.05">${escapeHtml(challenge.title)}</h1><p style="font-size:19px"><strong>${escapeHtml(challenge.prompt)}</strong></p><p style="font-size:16px;line-height:1.6">${escapeHtml(challenge.brief)}</p><p style="margin:32px 0"><a href="https://vibecodeclub.org/#challenge" style="background:#211d38;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Open this week’s challenge →</a></p><hr style="border:0;border-top:1px solid #ddd"><p style="font-size:12px;color:#666">You’re receiving this grown-up newsletter because this address subscribed at Vibe Code Club. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p></div>`,
          text: `${challenge.title}\n\n${challenge.prompt}\n\n${challenge.brief}\n\nOpen the challenge: https://vibecodeclub.org/#challenge\n\nUnsubscribe: ${unsubscribeUrl}`,
        }),
      })
      if (!response.ok) {
        failures.push(subscriber.email)
        return
      }
      const result = await response.json().catch(() => ({})) as { id?: string }
      await db.prepare(`
        INSERT OR IGNORE INTO newsletter_deliveries (challenge_id, email, provider_id, sent_at)
        VALUES (?, ?, ?, ?)
      `).bind(challenge.id, subscriber.email, result.id || '', new Date().toISOString()).run()
      sent += 1
    }))
  }

  return json({ ok: failures.length === 0, sent, failed: failures.length, remaining: subscribers.length - sent })
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
      if (request.method === 'POST' && url.pathname === '/api/challenge-ideas') return submitChallengeIdea(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/subscribers') return subscribe(env.DB, request)
      if (request.method === 'GET' && url.pathname === '/api/unsubscribe') return unsubscribe(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/newsletter/send-weekly') return sendWeeklyChallenge(env.DB, request, env)
      return json({ error: 'Not found' }, 404)
    } catch (error) {
      console.error('Community API error', error)
      return json({ error: 'The clubhouse database is taking a break. Please try again.' }, 500)
    }
  },
}
