import { ensureDatabase, seedDatabase } from '../db/schema'
import { evaluateShadowReview, REQUIRED_GREEN_CHECKS, REVIEW_POLICY_VERSION } from '../scripts/review-policy.mjs'

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

type R2ObjectBody = {
  body: ReadableStream
  httpMetadata?: { contentType?: string }
}

type ClubUploads = {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }): Promise<unknown>
  get(key: string): Promise<R2ObjectBody | null>
  delete(key: string): Promise<void>
}

type Env = {
  DB: ClubDatabase
  UPLOADS: ClubUploads
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  OWNER_NOTIFICATION_EMAIL?: string
  RESEND_API_KEY?: string
  NEWSLETTER_CRON_SECRET?: string
  NEWSLETTER_FROM_EMAIL?: string
  SAFETY_SCAN_SECRET?: string
}

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void
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
const validCountryCode = (value: unknown) => {
  const result = text(value).toUpperCase()
  return /^[A-Z]{2}$/.test(result) ? result : null
}
const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

type OwnerNotification = {
  kind: 'project' | 'idea'
  id: string
}

async function sendOwnerNotification(env: Env, notification: OwnerNotification) {
  const recipient = validEmail(env.OWNER_NOTIFICATION_EMAIL)
  if (!recipient || !env.RESEND_API_KEY || !env.NEWSLETTER_FROM_EMAIL) {
    console.error('Owner notification email is not configured')
    return false
  }

  const project = notification.kind === 'project'
  const label = project ? 'project submission' : 'challenge idea'
  const subject = project ? 'New project submission' : 'New challenge idea'
  const clubhouseUrl = `https://vibecodekids.com/clubhouse-admin?tab=${project ? 'submissions' : 'ideas'}`
  const receivedAt = new Date().toISOString()
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
      'idempotency-key': `owner-${notification.kind}-${notification.id}`,
    },
    body: JSON.stringify({
      from: env.NEWSLETTER_FROM_EMAIL,
      to: [recipient],
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#211d38"><p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#ff5b55">New ${label}</p><h1 style="font-size:32px;line-height:1.1">A private clubhouse item is waiting</h1><p style="font-size:16px;line-height:1.6"><strong>Received:</strong> ${escapeHtml(receivedAt)}<br><strong>Private record:</strong> ${escapeHtml(notification.id)}</p><p style="margin:30px 0"><a href="${clubhouseUrl}" style="background:#211d38;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Review in the Clubhouse →</a></p><p style="font-size:12px;color:#666">Child-facing copy and grown-up contact stay in Clubhouse Admin and are not included in this email.</p></div>`,
      text: `New ${label}\n\nReceived: ${receivedAt}\nPrivate record: ${notification.id}\n\nReview it in the Clubhouse: ${clubhouseUrl}\n\nChild-facing copy and grown-up contact are not included in this email.`,
    }),
  })
  if (!response.ok) {
    console.error('Owner notification delivery failed', response.status, await response.text())
    return false
  }
  return true
}

const adminCookieName = 'clubhouse_admin'
const legalTermsVersion = '2026-07-14'
const encoder = new TextEncoder()

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function adminSessionValue(secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode('vibe-code-club-admin'))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function cookie(request: Request, name: string) {
  const source = request.headers.get('cookie') || ''
  for (const part of source.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return ''
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return mismatch === 0
}

async function isAdmin(request: Request, env: Env) {
  if (!env.ADMIN_SESSION_SECRET) return false
  const actual = cookie(request, adminCookieName)
  if (!actual) return false
  const expected = await adminSessionValue(env.ADMIN_SESSION_SECRET)
  return constantTimeEqual(actual, expected)
}

function bearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || ''
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
}

async function reviewerAccess(db: ClubDatabase, request: Request, touch = true) {
  const token = bearerToken(request)
  if (token.length < 40 || token.length > 160) return null
  const tokenHash = await sha256Hex(token)
  const now = new Date().toISOString()
  const invite = await db.prepare(`
    SELECT id, label, expires_at AS expiresAt
    FROM reviewer_invites
    WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?
  `).bind(tokenHash, now).first<{ id: string; label: string; expiresAt: string }>()
  if (invite && touch) await db.prepare(`UPDATE reviewer_invites SET last_used_at = ? WHERE id = ?`).bind(now, invite.id).run()
  return invite
}

async function initialize(db: ClubDatabase) {
  await ensureDatabase(db)
  await seedDatabase(db)
}

async function recordAnonymousVisit(db: ClubDatabase, request: Request) {
  const now = new Date().toISOString()
  const countryCode = text((request as Request & { cf?: { country?: string } }).cf?.country).toUpperCase()
  const statements = [db.prepare(`
    INSERT INTO site_metrics (metric, value, updated_at)
    VALUES ('anonymous_visits', 1, ?)
    ON CONFLICT(metric) DO UPDATE SET
      value = value + 1,
      updated_at = excluded.updated_at
  `).bind(now)]
  if (/^[A-Z]{2}$/.test(countryCode) && countryCode !== 'XX') {
    statements.push(db.prepare(`
      INSERT INTO site_metrics (metric, value, updated_at)
      VALUES (?, 1, ?)
      ON CONFLICT(metric) DO UPDATE SET
        value = value + 1,
        updated_at = excluded.updated_at
    `).bind(`country:${countryCode}`, now))
  }
  await db.batch(statements)
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } })
}

async function community(db: ClubDatabase, request: Request) {
  const voterId = new URL(request.url).searchParams.get('voterId') || ''
  const now = new Date().toISOString()
  const challenge = await db.prepare(`
    SELECT id, week_label AS weekLabel, title, eyebrow, prompt, brief,
      opens_at AS opensAt, closes_at AS closesAt, voting_opens_at AS votingOpensAt,
      voting_closes_at AS votingClosesAt, status, starter_ideas AS starterIdeas, tools
    FROM challenges WHERE status = 'active' LIMIT 1
  `).first<Record<string, unknown>>()
  if (!challenge) return json({ error: 'No active challenge' }, 404)

  const galleryChallenge = await db.prepare(`
    SELECT id, week_label AS weekLabel, title, voting_opens_at AS votingOpensAt,
      voting_closes_at AS votingClosesAt
    FROM challenges
    WHERE voting_opens_at <= ? AND voting_closes_at > ?
    ORDER BY voting_opens_at DESC LIMIT 1
  `).bind(now, now).first<Record<string, unknown>>()
  const galleryId = galleryChallenge ? String(galleryChallenge.id) : String(challenge.id)
  const projectsStatement = db.prepare(`
    SELECT id, challenge_id AS challengeId, title, builder, age_band AS ageBand,
      country_code AS countryCode, description, repo_url AS repoUrl, demo_url AS demoUrl, base_votes AS baseVotes,
      scene, accent, image_key AS imageKey
    FROM projects WHERE challenge_id = ? AND status = 'approved'
  `).bind(galleryId)
  const { results: projects } = await projectsStatement.all<Record<string, unknown>>()
  const { results: counts } = galleryChallenge ? await db.prepare(`
    SELECT project_id AS projectId, COUNT(*) AS count
    FROM votes WHERE challenge_id = ? GROUP BY project_id
  `).bind(galleryId).all<{ projectId: string; count: number }>() : { results: [] as Array<{ projectId: string; count: number }> }
  const currentVote = voterId && galleryChallenge ? await db.prepare(`
    SELECT project_id AS projectId FROM votes WHERE challenge_id = ? AND voter_id = ?
  `).bind(galleryId, voterId).first<{ projectId: string }>() : null
  const { results: upcomingChallenges } = await db.prepare(`
    SELECT week_label AS weekLabel, opens_at AS opensAt
    FROM challenges WHERE opens_at > ? ORDER BY opens_at LIMIT 3
  `).bind(now).all<Record<string, unknown>>()

  return json({
    challenge: {
      ...challenge,
      starterIdeas: JSON.parse(String(challenge.starterIdeas || '[]')),
      tools: JSON.parse(String(challenge.tools || '[]')),
    },
    projects: projects.map(({ imageKey, ...project }) => ({
      ...project,
      imageUrl: imageKey ? `/api/project-images/${project.id}` : null,
    })),
    voteCounts: Object.fromEntries(counts.map((item) => [item.projectId, Number(item.count)])),
    myVote: currentVote?.projectId || null,
    galleryChallenge,
    votingOpen: Boolean(galleryChallenge),
    acceptingSubmissions: String(challenge.closesAt) > now,
    upcomingChallenges,
    source: 'database',
  })
}

async function favorites(db: ClubDatabase) {
  const now = new Date().toISOString()
  const { results } = await db.prepare(`
    WITH totals AS (
      SELECT c.id AS challengeId, c.week_label AS weekLabel, c.title AS challengeTitle,
        c.voting_closes_at AS votingClosedAt, p.id AS projectId, p.title,
        p.builder, p.age_band AS ageBand, p.country_code AS countryCode, p.description, p.repo_url AS repoUrl,
        p.demo_url AS demoUrl, p.image_key AS imageKey,
        p.base_votes + COUNT(v.project_id) AS votes
      FROM challenges c
      JOIN projects p ON p.challenge_id = c.id AND p.status = 'approved'
      LEFT JOIN votes v ON v.project_id = p.id AND v.challenge_id = c.id
      WHERE c.voting_closes_at <= ?
      GROUP BY c.id, c.week_label, c.title, c.voting_closes_at, p.id, p.title,
        p.builder, p.age_band, p.country_code, p.description, p.repo_url, p.demo_url, p.image_key, p.base_votes
    ), ranked AS (
      SELECT *, ROW_NUMBER() OVER (
        PARTITION BY challengeId ORDER BY votes DESC, title COLLATE NOCASE
      ) AS podiumRank
      FROM totals WHERE votes > 0
    )
    SELECT * FROM ranked WHERE podiumRank <= 3
    ORDER BY votingClosedAt DESC, podiumRank
  `).bind(now).all<Record<string, unknown>>()
  const nextReveal = await db.prepare(`
    SELECT MIN(voting_closes_at) AS nextRevealAt FROM challenges WHERE voting_closes_at > ?
  `).bind(now).first<{ nextRevealAt: string | null }>()

  const grouped = new Map<string, Record<string, unknown> & { podium: Record<string, unknown>[] }>()
  for (const item of results) {
    const challengeId = String(item.challengeId)
    if (!grouped.has(challengeId)) {
      grouped.set(challengeId, {
        challengeId,
        weekLabel: item.weekLabel,
        challengeTitle: item.challengeTitle,
        votingClosedAt: item.votingClosedAt,
        podium: [],
      })
    }
    grouped.get(challengeId)!.podium.push({
      projectId: item.projectId,
      rank: Number(item.podiumRank),
      title: item.title,
      builder: item.builder,
      ageBand: item.ageBand,
      countryCode: item.countryCode,
      description: item.description,
      repoUrl: item.repoUrl,
      demoUrl: item.demoUrl,
      imageUrl: item.imageKey ? `/api/project-images/${item.projectId}` : null,
      votes: Number(item.votes),
    })
  }

  return json({ challenges: [...grouped.values()], nextRevealAt: nextReveal?.nextRevealAt || null })
}

async function vote(db: ClubDatabase, request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const challengeId = validText(body?.challengeId, 80)
  const projectId = validText(body?.projectId, 80)
  const voterId = validText(body?.voterId, 80)
  if (!challengeId || !projectId || !voterId) return json({ error: 'Invalid vote' }, 400)

  const now = new Date().toISOString()
  const project = await db.prepare(`
    SELECT p.id FROM projects p
    JOIN challenges c ON c.id = p.challenge_id
    WHERE p.id = ? AND p.challenge_id = ? AND p.status = 'approved'
      AND c.voting_opens_at <= ? AND c.voting_closes_at > ?
  `).bind(projectId, challengeId, now, now).first<{ id: string }>()
  if (!project) return json({ error: 'Project not found' }, 404)

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
  const userAgent = (request.headers.get('user-agent') || 'unknown').slice(0, 200)
  const fingerprintHash = ip ? await sha256Hex(`vote-integrity:${challengeId}:${ip}:${userAgent}`) : null
  const existingVote = await db.prepare(`
    SELECT created_at AS createdAt FROM votes WHERE challenge_id = ? AND voter_id = ?
  `).bind(challengeId, voterId).first<{ createdAt: string | null }>()

  await db.prepare(`
    INSERT INTO votes (challenge_id, voter_id, project_id, fingerprint_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(challenge_id, voter_id)
    DO UPDATE SET project_id = excluded.project_id, fingerprint_hash = excluded.fingerprint_hash, updated_at = excluded.updated_at
  `).bind(challengeId, voterId, projectId, fingerprintHash, existingVote?.createdAt || now, now).run()

  const alertStatements: D1Statement[] = []
  if (fingerprintHash) {
    const shared = await db.prepare(`
      SELECT COUNT(*) AS count FROM votes WHERE challenge_id = ? AND fingerprint_hash = ?
    `).bind(challengeId, fingerprintHash).first<{ count: number }>()
    const sharedCount = Number(shared?.count || 0)
    if (sharedCount >= 3) {
      alertStatements.push(db.prepare(`
        INSERT INTO vote_alerts (
          id, challenge_id, project_id, signal, signal_key, observed_count,
          status, first_seen_at, last_seen_at
        ) VALUES (?, ?, ?, 'shared_fingerprint', ?, ?, 'open', ?, ?)
        ON CONFLICT(challenge_id, signal, signal_key) DO UPDATE SET
          project_id = excluded.project_id, observed_count = excluded.observed_count,
          status = 'open', last_seen_at = excluded.last_seen_at
      `).bind(crypto.randomUUID(), challengeId, projectId, fingerprintHash, sharedCount, now, now))
    }
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString()
  const recent = await db.prepare(`
    SELECT COUNT(*) AS count FROM votes
    WHERE challenge_id = ? AND project_id = ? AND updated_at >= ?
  `).bind(challengeId, projectId, tenMinutesAgo).first<{ count: number }>()
  const recentCount = Number(recent?.count || 0)
  if (recentCount >= 12) {
    alertStatements.push(db.prepare(`
      INSERT INTO vote_alerts (
        id, challenge_id, project_id, signal, signal_key, observed_count,
        status, first_seen_at, last_seen_at
      ) VALUES (?, ?, ?, 'rapid_project_spike', ?, ?, 'open', ?, ?)
      ON CONFLICT(challenge_id, signal, signal_key) DO UPDATE SET
        observed_count = excluded.observed_count, status = 'open', last_seen_at = excluded.last_seen_at
    `).bind(crypto.randomUUID(), challengeId, projectId, projectId, recentCount, now, now))
  }
  if (alertStatements.length) await db.batch(alertStatements)
  return json({ ok: true })
}

async function submit(db: ClubDatabase, uploads: ClubUploads, request: Request, env: Env, context: WorkerExecutionContext) {
  const body = await request.formData().catch(() => null)
  if (!body || text(body.get('website'))) return json({ error: 'Invalid submission' }, 400)

  const challengeId = validText(body.get('challengeId'), 80)
  const childNickname = validText(body.get('childNickname'), 24)
  const ageBand = ['5–6', '7–9', '10–12', '13–15', '16–18'].includes(text(body.get('ageBand'))) ? text(body.get('ageBand')) : null
  const countryCode = validCountryCode(body.get('countryCode'))
  const projectTitle = validText(body.get('projectTitle'), 60)
  const description = validText(body.get('description'), 280, 10)
  const repoUrl = validUrl(body.get('repoUrl'))
  const demoUrl = validUrl(body.get('demoUrl'), false)
  const parentName = validText(body.get('parentName'), 80)
  const parentEmail = validEmail(body.get('parentEmail'))
  const consent = body.get('consent') === 'true'
  const publicSharing = body.get('publicSharing') === 'true'
  const childLed = body.get('childLed') === 'true'
  const termsAccepted = body.get('termsAccepted') === 'true'
  const image = body.get('image')
  const hasImage = image instanceof File && image.size > 0

  if (!challengeId || !childNickname || !ageBand || !countryCode || !projectTitle || !description || !repoUrl || demoUrl === null || !parentName || !parentEmail || !consent || !publicSharing || !childLed || !termsAccepted) {
    return json({ error: 'Please complete every required field and permission box.' }, 400)
  }
  if (hasImage && (!['image/webp', 'image/jpeg', 'image/png'].includes(image.type) || image.size > 5_000_000)) {
    return json({ error: 'Project images must be a WebP, JPEG, or PNG under 5 MB.' }, 400)
  }

  const challenge = await db.prepare(`
    SELECT id FROM challenges WHERE id = ? AND status = 'active' AND closes_at > ?
  `).bind(challengeId, new Date().toISOString()).first<{ id: string }>()
  if (!challenge) return json({ error: 'That challenge is no longer accepting submissions.' }, 400)

  const id = crypto.randomUUID()
  const extension = hasImage ? ({ 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }[image.type] || 'bin') : ''
  const imageKey = hasImage ? `submissions/${id}/${crypto.randomUUID()}.${extension}` : ''
  if (hasImage) {
    await uploads.put(imageKey, await image.arrayBuffer(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { submissionId: id, originalName: image.name.slice(0, 120) },
    })
  }

  try {
    const now = new Date().toISOString()
    const scanId = crypto.randomUUID()
    const shadowStatements = await initialShadowReviewStatements(db, {
      submissionId: id,
      scanId,
      targetUrl: demoUrl || repoUrl,
      hasImage,
      now,
    })
    await db.batch([db.prepare(`
      INSERT INTO submissions (
        id, challenge_id, child_nickname, age_band, country_code, project_title, description,
        repo_url, demo_url, parent_name, parent_email, consent, public_sharing, child_led,
        terms_accepted, terms_version,
        image_key, image_name, image_content_type, image_size, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, 1, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      id, challengeId, childNickname, ageBand, countryCode, projectTitle, description,
      repoUrl, demoUrl, parentName, parentEmail, legalTermsVersion, imageKey || null,
      hasImage ? image.name.slice(0, 120) : null, hasImage ? image.type : null,
        hasImage ? image.size : null, now,
    ), db.prepare(`
      INSERT INTO safety_scans (
        id, submission_id, target_url, target_kind, status, categories, actions,
        technical_flags, screenshots_reviewed, attempt, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, '[]', '[]', '[]', 0, 0, ?, ?)
    `).bind(
      scanId, id, demoUrl || repoUrl, demoUrl ? 'playable' : 'repository',
      demoUrl ? 'queued' : 'manual', now, now,
    ), ...shadowStatements])
  } catch (error) {
    if (imageKey) await uploads.delete(imageKey).catch(() => undefined)
    throw error
  }
  context.waitUntil(sendOwnerNotification(env, {
    kind: 'project',
    id,
  }).catch((error) => console.error('Owner notification failed', error)))
  return json({ ok: true }, 201)
}

async function submitChallengeIdea(db: ClubDatabase, request: Request, env: Env, context: WorkerExecutionContext) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || text(body.website)) return json({ error: 'Invalid submission' }, 400)

  const ideaTitle = validText(body.ideaTitle, 80)
  const ideaPrompt = validText(body.ideaPrompt, 400, 10)
  const starterSpark = text(body.starterSpark)
  const creatorNickname = validText(body.creatorNickname, 24)
  const creatorGroup = ['5–6', '7–9', '10–12', '13–15', '16–18', 'Grown-up'].includes(text(body.creatorGroup)) ? text(body.creatorGroup) : null
  const grownupEmail = validText(body.grownupEmail, 160)
  const consent = body.consent === true
  const termsAccepted = body.termsAccepted === true

  if (!ideaTitle || !ideaPrompt || starterSpark.length > 180 || !creatorNickname || !creatorGroup || !grownupEmail || !grownupEmail.includes('@') || !consent || !termsAccepted) {
    return json({ error: 'Please complete every required field, permission box, and terms box.' }, 400)
  }

  const id = crypto.randomUUID()
  await db.prepare(`
    INSERT INTO challenge_ideas (
      id, idea_title, idea_prompt, starter_spark, creator_nickname,
      creator_group, grownup_email, consent, terms_accepted, terms_version, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, 'pending', ?)
  `).bind(
    id, ideaTitle, ideaPrompt, starterSpark, creatorNickname,
    creatorGroup, grownupEmail.toLowerCase(), legalTermsVersion, new Date().toISOString(),
  ).run()
  context.waitUntil(sendOwnerNotification(env, {
    kind: 'idea',
    id,
  }).catch((error) => console.error('Owner notification failed', error)))
  return json({ ok: true }, 201)
}

async function sendWelcomeEmail(email: string, unsubscribeToken: string, env: Env) {
  if (!env.RESEND_API_KEY || !env.NEWSLETTER_FROM_EMAIL) return false

  const unsubscribeUrl = `https://vibecodekids.com/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
      'idempotency-key': `welcome-${unsubscribeToken}`,
    },
    body: JSON.stringify({
      from: env.NEWSLETTER_FROM_EMAIL,
      to: [email],
      subject: 'Welcome to Vibe Code Club',
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#211d38"><p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#ff5b55">You’re on the grown-up list</p><h1 style="font-size:36px;line-height:1.05">Welcome to Vibe Code Club.</h1><p style="font-size:17px;line-height:1.6">Every Monday, we’ll send you one playful coding challenge to explore with your kid.</p><p style="font-size:17px;line-height:1.6">New here? The Parent Guide walks you through getting started, keeping your child in the director’s chair, and building one small thing together.</p><p style="margin:32px 0"><a href="https://vibecodekids.com/getting-started" style="background:#211d38;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Open the Parent Guide →</a></p><hr style="border:0;border-top:1px solid #ddd"><p style="font-size:12px;color:#666">You’re receiving this grown-up newsletter because this address subscribed at Vibe Code Club. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p></div>`,
      text: `Welcome to Vibe Code Club.\n\nEvery Monday, we’ll send you one playful coding challenge to explore with your kid.\n\nStart with the Parent Guide: https://vibecodekids.com/getting-started\n\nUnsubscribe: ${unsubscribeUrl}`,
    }),
  })

  if (!response.ok) {
    console.error('Welcome email failed', response.status, await response.text())
    return false
  }
  return true
}

async function subscribe(db: ClubDatabase, request: Request, env: Env) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || text(body.website)) return json({ error: 'Invalid signup' }, 400)

  const email = validEmail(body.email)
  const adultConsent = body.adultConsent === true
  if (!email || !adultConsent) {
    return json({ error: 'Please enter a valid grown-up email and confirm the permission box.' }, 400)
  }

  const now = new Date().toISOString()
  const existing = await db.prepare(`SELECT id, unsubscribe_token AS unsubscribeToken FROM subscribers WHERE email = ?`).bind(email).first<{ id: string; unsubscribeToken: string }>()
  const unsubscribeToken = existing?.unsubscribeToken || crypto.randomUUID()
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
    `).bind(crypto.randomUUID(), email, unsubscribeToken, now, now).run()
  }

  const confirmationSent = await sendWelcomeEmail(email, unsubscribeToken, env).catch((error) => {
    console.error('Welcome email failed', error)
    return false
  })
  return json({ ok: true, confirmationSent }, 201)
}

async function unsubscribe(db: ClubDatabase, request: Request) {
  const token = new URL(request.url).searchParams.get('token') || ''
  if (token.length < 20 || token.length > 100) return new Response('That unsubscribe link is not valid.', { status: 400 })
  await db.prepare(`UPDATE subscribers SET status = 'unsubscribed', updated_at = ? WHERE unsubscribe_token = ?`)
    .bind(new Date().toISOString(), token).run()

  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Unsubscribed · Vibe Code Club</title><body style="font-family:system-ui;background:#fffaf0;color:#211d38;padding:48px"><main style="max-width:620px;margin:auto"><h1>You’re unsubscribed.</h1><p>No more weekly challenge emails will be sent to this address. You can always join again at <a href="https://vibecodekids.com/#subscribe">vibecodekids.com</a>.</p></main></body></html>`, {
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
      const unsubscribeUrl = `https://vibecodekids.com/api/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`
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
          html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#211d38"><p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#ff5b55">${escapeHtml(challenge.weekLabel)}</p><h1 style="font-size:36px;line-height:1.05">${escapeHtml(challenge.title)}</h1><p style="font-size:19px"><strong>${escapeHtml(challenge.prompt)}</strong></p><p style="font-size:16px;line-height:1.6">${escapeHtml(challenge.brief)}</p><p style="margin:32px 0"><a href="https://vibecodekids.com/#challenge" style="background:#211d38;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Open this week’s challenge →</a></p><hr style="border:0;border-top:1px solid #ddd"><p style="font-size:12px;color:#666">You’re receiving this grown-up newsletter because this address subscribed at Vibe Code Club. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p></div>`,
          text: `${challenge.title}\n\n${challenge.prompt}\n\n${challenge.brief}\n\nOpen the challenge: https://vibecodekids.com/#challenge\n\nUnsubscribe: ${unsubscribeUrl}`,
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

function isSafetyRunner(request: Request, env: Env) {
  if (!env.SAFETY_SCAN_SECRET) return false
  const authorization = request.headers.get('authorization') || ''
  const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  return Boolean(supplied) && constantTimeEqual(supplied, env.SAFETY_SCAN_SECRET)
}

function safeJsonArray(value: unknown, maxLength: number) {
  if (!Array.isArray(value)) return '[]'
  const serialized = JSON.stringify(value)
  return serialized.length <= maxLength ? serialized : '[]'
}

function safeRecord(value: unknown, maxLength = 40_000) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const serialized = JSON.stringify(value)
  return serialized.length <= maxLength ? value as Record<string, unknown> : {}
}

function allowedBooleanChecks(value: unknown) {
  const source = safeRecord(value)
  return Object.fromEntries(REQUIRED_GREEN_CHECKS.flatMap((key) => (
    typeof source[key] === 'boolean' ? [[key, source[key]]] : []
  )))
}

async function payloadHash(value: unknown) {
  return sha256Hex(JSON.stringify(value))
}

async function initialShadowReviewStatements(db: ClubDatabase, input: {
  submissionId: string
  scanId: string
  targetUrl: string
  hasImage: boolean
  now: string
}) {
  const checks: Record<string, boolean> = {
    grownUpSubmissionPresent: true,
    currentLegalAcceptancePresent: true,
    playableUrlHttps: true,
  }
  if (!input.hasImage) {
    checks.imageAbsentOrModerationPassed = true
    checks.imageAbsentOrNoIdentifiableChild = true
    checks.imageAbsentOrMetadataRemovedServerSide = true
  }
  const limitations = [
    'Safety Agent, Technical Playtest, image, network, and source evidence are not complete.',
    'Shadow mode cannot publish; a grown-up remains authoritative.',
  ]
  const decision = evaluateShadowReview({
    checks,
    evidenceKinds: ['deterministic'],
    safetyAgent: { classification: 'yellow', limitations: [limitations[0]] },
    technicalPlaytest: { classification: 'yellow', limitations: [limitations[0]] },
    limitations,
  })
  const runId = crypto.randomUUID()
  const decisionId = crypto.randomUUID()
  const evidenceId = crypto.randomUUID()
  const deterministicPayload = { checks, source: 'submission_intake', termsVersion: legalTermsVersion }
  const empty = '{}'
  return [
    db.prepare(`
      INSERT INTO review_runs (
        id, submission_id, legacy_scan_id, legacy_attempt, target_url_hash, policy_version,
        status, proposed_lane, deterministic_checks_json, playthrough_coverage_json,
        network_findings_json, text_moderation_json, image_moderation_json, source_scan_json,
        safety_agent_report_json, technical_playtest_report_json, limitations_json,
        model_versions_json, prompt_versions_json, final_publication_state, created_at, completed_at
      ) VALUES (?, ?, ?, 0, ?, ?, 'awaiting_evidence', ?, ?, '{}', '[]', '{}', ?, '{}', '{}', '{}', ?, '{}', '{}', 'unchanged_pending_human', ?, NULL)
    `).bind(
      runId, input.submissionId, input.scanId, await sha256Hex(input.targetUrl), REVIEW_POLICY_VERSION,
      decision.proposedLane, JSON.stringify(checks),
      JSON.stringify({ status: input.hasImage ? 'pending' : 'not_applicable' }),
      JSON.stringify(limitations), input.now,
    ),
    db.prepare(`
      INSERT INTO review_evidence (
        id, review_run_id, evidence_kind, producer, model_version, prompt_version,
        payload_hash, payload_json, limitations_json, created_at
      ) VALUES (?, ?, 'deterministic', 'worker_submission_intake', NULL, 'intake-2027.1', ?, ?, ?, ?)
    `).bind(evidenceId, runId, await payloadHash(deterministicPayload), JSON.stringify(deterministicPayload), JSON.stringify(limitations), input.now),
    db.prepare(`
      INSERT INTO automated_decisions (
        id, review_run_id, policy_version, mode, proposed_lane, reason_codes_json,
        evidence_ids_json, model_versions_json, prompt_versions_json,
        confidence_and_limitations_json, publication_allowed, created_at
      ) VALUES (?, ?, ?, 'shadow', ?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(
      decisionId, runId, REVIEW_POLICY_VERSION, decision.proposedLane,
      JSON.stringify(decision.reasonCodes), JSON.stringify([evidenceId]), empty,
      JSON.stringify({ deterministic: 'intake-2027.1' }),
      JSON.stringify({ confidenceIsEvidence: false, limitations }), input.now,
    ),
  ]
}

async function completedShadowReviewStatements(db: ClubDatabase, input: {
  scan: { id: string; submissionId: string; targetUrl: string; attempt: number; hasImage: number; termsVersion: string; termsAccepted: number; consent: number; publicSharing: number; childLed: number }
  body: Record<string, unknown>
  status: string
  screenshots: number
  now: string
}) {
  const shadow = safeRecord(input.body.shadowReview)
  const suppliedChecks = allowedBooleanChecks(shadow.checks)
  const technicalFlags = Array.isArray(input.body.technicalFlags) ? input.body.technicalFlags : []
  const categories = Array.isArray(input.body.categories) ? input.body.categories : []
  const checks: Record<string, boolean> = {
    ...suppliedChecks,
    grownUpSubmissionPresent: Boolean(input.scan.consent && input.scan.publicSharing && input.scan.childLed),
    currentLegalAcceptancePresent: Boolean(input.scan.termsAccepted && input.scan.termsVersion === legalTermsVersion),
    playableUrlHttps: input.scan.targetUrl.startsWith('https://'),
    destinationReachable: input.status !== 'failed' && input.screenshots > 0,
    descriptionModerationPassed: categories.length === 0,
    visibleTextAndScreensModerationPassed: categories.length === 0,
  }
  if (!input.scan.hasImage) {
    checks.imageAbsentOrModerationPassed = true
    checks.imageAbsentOrNoIdentifiableChild = true
    checks.imageAbsentOrMetadataRemovedServerSide = true
  }
  const safetyAgent = safeRecord(shadow.safetyAgent)
  const technicalPlaytest = safeRecord(shadow.technicalPlaytest)
  const networkFindings = Array.isArray(shadow.networkFindings) ? shadow.networkFindings.slice(0, 200) : []
  const consoleFindings = Array.isArray(shadow.consoleFindings) ? shadow.consoleFindings.slice(0, 100) : []
  const coverage = safeRecord(shadow.coverage)
  const sourceScan = safeRecord(shadow.sourceScan)
  const imageModeration = input.scan.hasImage ? { status: 'missing', reason: 'Uploaded submission image was not inspected by the browser runner.' } : { status: 'not_applicable' }
  const textModeration = { categories, screenshotsReviewed: input.screenshots }
  const limitations = [
    ...(Array.isArray(shadow.limitations) ? shadow.limitations.map(String).slice(0, 40) : []),
    ...technicalFlags.map(String).slice(0, 40),
    ...(Object.keys(sourceScan).length ? [] : ['Source inspection evidence is missing.']),
    ...(input.scan.hasImage ? ['Uploaded image moderation and server-side metadata normalization are missing.'] : []),
  ]
  const evidenceKinds = ['deterministic', 'text_moderation', 'image_moderation', 'safety_agent', 'technical_playtest', 'network']
  if (sourceScan.status === 'passed') evidenceKinds.push('source_scan')
  const decision = evaluateShadowReview({
    checks,
    evidenceKinds,
    safetyAgent,
    technicalPlaytest,
    limitations,
    redSignals: Array.isArray(shadow.redSignals) ? shadow.redSignals : [],
  })
  const runId = crypto.randomUUID()
  const decisionId = crypto.randomUUID()
  const modelVersions = safeRecord(shadow.modelVersions)
  const promptVersions = safeRecord(shadow.promptVersions)
  const reports = [
    ['deterministic', 'worker_shadow_coordinator', { checks }, []],
    ['text_moderation', 'openai_moderation', textModeration, []],
    ['image_moderation', 'worker_shadow_coordinator', imageModeration, input.scan.hasImage ? [limitations.at(-1)] : []],
    ['safety_agent', 'safety_agent', safetyAgent, Array.isArray(safetyAgent.limitations) ? safetyAgent.limitations : []],
    ['technical_playtest', 'technical_playtest_agent', { ...technicalPlaytest, coverage }, Array.isArray(technicalPlaytest.limitations) ? technicalPlaytest.limitations : []],
    ['network', 'technical_playtest_agent', networkFindings, []],
    ['console', 'technical_playtest_agent', consoleFindings, []],
  ] as const
  if (Object.keys(sourceScan).length) reports.push(['source_scan', 'source_scanner', sourceScan, []])
  const evidenceRows = await Promise.all(reports.map(async ([kind, producer, payload, evidenceLimitations]) => ({
    id: crypto.randomUUID(), kind, producer, payload, limitations: evidenceLimitations,
    hash: await payloadHash(payload),
  })))
  return [
    db.prepare(`
      INSERT INTO review_runs (
        id, submission_id, legacy_scan_id, legacy_attempt, target_url_hash, policy_version,
        status, proposed_lane, deterministic_checks_json, playthrough_coverage_json,
        network_findings_json, text_moderation_json, image_moderation_json, source_scan_json,
        safety_agent_report_json, technical_playtest_report_json, limitations_json,
        model_versions_json, prompt_versions_json, final_publication_state, created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unchanged_pending_human', ?, ?)
    `).bind(
      runId, input.scan.submissionId, input.scan.id, input.scan.attempt, await sha256Hex(input.scan.targetUrl),
      REVIEW_POLICY_VERSION, input.status === 'failed' ? 'failed' : 'evaluated', decision.proposedLane,
      JSON.stringify(checks), JSON.stringify(coverage), JSON.stringify(networkFindings),
      JSON.stringify(textModeration), JSON.stringify(imageModeration), JSON.stringify(sourceScan),
      JSON.stringify(safetyAgent), JSON.stringify(technicalPlaytest), JSON.stringify(limitations),
      JSON.stringify(modelVersions), JSON.stringify(promptVersions), input.now, input.now,
    ),
    ...evidenceRows.map((evidence) => db.prepare(`
      INSERT INTO review_evidence (
        id, review_run_id, evidence_kind, producer, model_version, prompt_version,
        payload_hash, payload_json, limitations_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      evidence.id, runId, evidence.kind, evidence.producer,
      text(modelVersions[evidence.kind]) || null, text(promptVersions[evidence.kind]) || null,
      evidence.hash, JSON.stringify(evidence.payload), JSON.stringify(evidence.limitations), input.now,
    )),
    db.prepare(`
      INSERT INTO automated_decisions (
        id, review_run_id, policy_version, mode, proposed_lane, reason_codes_json,
        evidence_ids_json, model_versions_json, prompt_versions_json,
        confidence_and_limitations_json, publication_allowed, created_at
      ) VALUES (?, ?, ?, 'shadow', ?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(
      decisionId, runId, REVIEW_POLICY_VERSION, decision.proposedLane,
      JSON.stringify(decision.reasonCodes), JSON.stringify(evidenceRows.map(({ id }) => id)),
      JSON.stringify(modelVersions), JSON.stringify(promptVersions),
      JSON.stringify({ confidenceIsEvidence: false, limitations, missingChecks: decision.missingChecks, missingEvidence: decision.missingEvidence }),
      input.now,
    ),
  ]
}

async function claimSafetyScans(db: ClubDatabase, request: Request, env: Env) {
  if (!env.SAFETY_SCAN_SECRET) return json({ error: 'Safety playthroughs are not configured.' }, 503)
  if (!isSafetyRunner(request, env)) return json({ error: 'Unauthorized' }, 401)

  const now = new Date().toISOString()
  const stale = new Date(Date.now() - 45 * 60_000).toISOString()
  await db.prepare(`
    UPDATE safety_scans
    SET status = 'queued', error = 'Previous playthrough timed out and was re-queued.', updated_at = ?
    WHERE status = 'running' AND updated_at < ?
  `).bind(now, stale).run()

  const { results } = await db.prepare(`
    SELECT sc.id, sc.attempt, sc.submission_id AS submissionId, sc.target_url AS targetUrl,
      s.project_title AS projectTitle, s.description
    FROM safety_scans sc
    JOIN submissions s ON s.id = sc.submission_id
    WHERE sc.status = 'queued' AND sc.target_kind = 'playable'
    ORDER BY sc.updated_at LIMIT 2
  `).all<Record<string, unknown>>()

  if (results.length) {
    await db.batch(results.map((scan) => db.prepare(`
      UPDATE safety_scans
      SET status = 'running', started_at = ?, completed_at = NULL, updated_at = ?,
        error = NULL, attempt = attempt + 1
      WHERE id = ? AND status = 'queued'
    `).bind(now, now, scan.id)))
  }

  return json({ scans: results.map((scan) => ({ ...scan, attempt: Number(scan.attempt || 0) + 1 })) })
}

async function recordSafetyScanResult(db: ClubDatabase, request: Request, env: Env) {
  if (!env.SAFETY_SCAN_SECRET) return json({ error: 'Safety playthroughs are not configured.' }, 503)
  if (!isSafetyRunner(request, env)) return json({ error: 'Unauthorized' }, 401)
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const id = validText(body?.id, 100)
  const status = ['passed', 'review', 'failed'].includes(text(body?.status)) ? text(body?.status) : null
  const verdict = validText(body?.verdict, 40) || null
  const summary = validText(body?.summary, 2000) || null
  const model = validText(body?.model, 100) || null
  const error = validText(body?.error, 1000) || null
  const screenshots = Number(body?.screenshotsReviewed)
  const attempt = Number(body?.attempt)
  if (!id || !status || !Number.isInteger(attempt) || attempt < 1 || !Number.isInteger(screenshots) || screenshots < 0 || screenshots > 20) {
    return json({ error: 'Invalid safety result.' }, 400)
  }
  const now = new Date().toISOString()
  const existing = await db.prepare(`
    SELECT sc.id, sc.submission_id AS submissionId, sc.target_url AS targetUrl, sc.attempt,
      CASE WHEN s.image_key IS NULL OR s.image_key = '' THEN 0 ELSE 1 END AS hasImage,
      s.terms_version AS termsVersion, s.terms_accepted AS termsAccepted,
      s.consent, s.public_sharing AS publicSharing, s.child_led AS childLed
    FROM safety_scans sc
    JOIN submissions s ON s.id = sc.submission_id
    WHERE sc.id = ? AND sc.status = 'running' AND sc.attempt = ?
  `).bind(id, attempt).first<{
    id: string; submissionId: string; targetUrl: string; attempt: number; hasImage: number
    termsVersion: string; termsAccepted: number; consent: number; publicSharing: number; childLed: number
  }>()
  if (!existing) return json({ error: 'Safety scan is stale, already completed, or not found.' }, 409)

  const shadowStatements = await completedShadowReviewStatements(db, {
    scan: existing,
    body,
    status,
    screenshots,
    now,
  })
  await db.batch([db.prepare(`
    UPDATE safety_scans SET status = ?, verdict = ?, summary = ?, categories = ?,
      actions = ?, technical_flags = ?, screenshots_reviewed = ?, model = ?, error = ?,
      completed_at = ?, updated_at = ? WHERE id = ? AND status = 'running' AND attempt = ?
  `).bind(
    status, verdict, summary, safeJsonArray(body?.categories, 4000),
    safeJsonArray(body?.actions, 16_000), safeJsonArray(body?.technicalFlags, 4000),
    screenshots, model, error, now, now, id, attempt,
  ), ...shadowStatements])
  return json({ ok: true })
}

async function serveUpload(uploads: ClubUploads, key: string, isPublic = false) {
  const object = await uploads.get(key)
  if (!object) return new Response('Image not found', { status: 404 })
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'application/octet-stream',
      'cache-control': isPublic ? 'public, max-age=3600' : 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

async function projectImage(db: ClubDatabase, uploads: ClubUploads, request: Request) {
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const project = await db.prepare(`SELECT image_key AS imageKey FROM projects WHERE id = ? AND status = 'approved'`)
    .bind(id).first<{ imageKey: string | null }>()
  if (!project?.imageKey) return new Response('Image not found', { status: 404 })
  return serveUpload(uploads, project.imageKey, true)
}

async function adminLogin(db: ClubDatabase, request: Request, env: Env) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return json({ error: 'Admin access is not configured' }, 503)
  const body = await request.json().catch(() => null) as { password?: unknown } | null
  const password = text(body?.password)
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
  const ipHash = await sha256Hex(ip)
  const now = new Date()
  const cutoff = now.getTime() - 15 * 60_000
  const attempt = await db.prepare(`SELECT attempts, window_started AS windowStarted FROM admin_login_attempts WHERE ip_hash = ?`)
    .bind(ipHash).first<{ attempts: number; windowStarted: string }>()
  const inWindow = attempt && Date.parse(attempt.windowStarted) >= cutoff
  if (inWindow && Number(attempt.attempts) >= 10) return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429)

  const suppliedHash = await sha256Hex(password)
  const expectedHash = await sha256Hex(env.ADMIN_PASSWORD)
  if (!password || !constantTimeEqual(suppliedHash, expectedHash)) {
    const attempts = inWindow ? Number(attempt?.attempts || 0) + 1 : 1
    const windowStarted = inWindow ? attempt!.windowStarted : now.toISOString()
    await db.prepare(`
      INSERT INTO admin_login_attempts (ip_hash, attempts, window_started)
      VALUES (?, ?, ?)
      ON CONFLICT(ip_hash) DO UPDATE SET attempts = excluded.attempts, window_started = excluded.window_started
    `).bind(ipHash, attempts, windowStarted).run()
    return json({ error: 'That clubhouse password did not match.' }, 401)
  }

  await db.prepare(`DELETE FROM admin_login_attempts WHERE ip_hash = ?`).bind(ipHash).run()
  const session = await adminSessionValue(env.ADMIN_SESSION_SECRET)
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': `${adminCookieName}=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
    },
  })
}

function adminLogout() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': `${adminCookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
    },
  })
}

async function adminCreateReviewerInvite(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const label = validText(body?.label, 60, 2)
  if (!label) return json({ error: 'Add a short name for this reviewer.' }, 400)
  const token = `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`
  const tokenHash = await sha256Hex(token)
  const id = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 86_400_000).toISOString()
  await db.batch([
    db.prepare(`
      INSERT INTO reviewer_invites (id, label, token_hash, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, label, tokenHash, now.toISOString(), expiresAt),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'reviewer_invite', ?, 'created', ?)`)
      .bind(crypto.randomUUID(), id, now.toISOString()),
  ])
  const inviteUrl = `${new URL(request.url).origin}/review#invite=${encodeURIComponent(token)}`
  return json({ invite: { id, label, createdAt: now.toISOString(), expiresAt, revokedAt: null, lastUsedAt: null }, inviteUrl }, 201)
}

async function adminRevokeReviewerInvite(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  if (!id) return json({ error: 'Invite not found.' }, 404)
  const now = new Date().toISOString()
  await db.batch([
    db.prepare(`UPDATE reviewer_invites SET revoked_at = ? WHERE id = ?`).bind(now, id),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'reviewer_invite', ?, 'revoked', ?)`)
      .bind(crypto.randomUUID(), id, now),
  ])
  return json({ ok: true })
}

async function reviewerSubmissions(db: ClubDatabase, request: Request) {
  const invite = await reviewerAccess(db, request)
  if (!invite) return json({ error: 'This reviewer invite is missing, expired, or revoked.' }, 401)
  const { results } = await db.prepare(`
    SELECT s.id, s.child_nickname AS childNickname, s.age_band AS ageBand,
      s.country_code AS countryCode, s.project_title AS projectTitle, s.description, s.repo_url AS repoUrl,
      s.demo_url AS demoUrl,
      CASE WHEN s.image_key IS NULL OR s.image_key = '' THEN 0 ELSE 1 END AS hasImage,
      sc.status AS safetyStatus, sc.summary AS safetySummary,
      sc.technical_flags AS safetyTechnicalFlags,
      rr.verdict AS myVerdict, rr.note AS myNote, rr.updated_at AS myReviewedAt
    FROM submissions s
    LEFT JOIN safety_scans sc ON sc.submission_id = s.id
    LEFT JOIN reviewer_reviews rr ON rr.submission_id = s.id AND rr.invite_id = ?
    WHERE s.status = 'pending'
      AND COALESCE((
        SELECT proposed_lane FROM review_runs
        WHERE submission_id = s.id ORDER BY created_at DESC LIMIT 1
      ), 'yellow') != 'red'
    ORDER BY s.created_at
    LIMIT 200
  `).bind(invite.id).all<Record<string, unknown>>()
  return json({
    reviewerLabel: invite.label,
    expiresAt: invite.expiresAt,
    submissions: results.map((item) => ({
      ...item,
      hasImage: Boolean(item.hasImage),
      safetyTechnicalFlags: JSON.parse(String(item.safetyTechnicalFlags || '[]')),
    })),
  })
}

async function reviewerSubmissionImage(db: ClubDatabase, uploads: ClubUploads, request: Request) {
  const invite = await reviewerAccess(db, request, false)
  if (!invite) return new Response('Unauthorized', { status: 401 })
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const submission = await db.prepare(`
    SELECT image_key AS imageKey FROM submissions s
    WHERE id = ? AND status = 'pending'
      AND COALESCE((SELECT proposed_lane FROM review_runs WHERE submission_id = s.id ORDER BY created_at DESC LIMIT 1), 'yellow') != 'red'
  `)
    .bind(id).first<{ imageKey: string | null }>()
  if (!submission?.imageKey) return new Response('Image not found', { status: 404 })
  return serveUpload(uploads, submission.imageKey)
}

async function reviewerReview(db: ClubDatabase, request: Request) {
  const invite = await reviewerAccess(db, request)
  if (!invite) return json({ error: 'This reviewer invite is missing, expired, or revoked.' }, 401)
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const submissionId = validText(body?.submissionId, 100)
  const verdict = text(body?.verdict)
  const note = text(body?.note)
  if (!submissionId || !['ready', 'concern'].includes(verdict) || note.length > 500) return json({ error: 'Invalid review.' }, 400)
  const submission = await db.prepare(`
    SELECT id FROM submissions s WHERE id = ? AND status = 'pending'
      AND COALESCE((SELECT proposed_lane FROM review_runs WHERE submission_id = s.id ORDER BY created_at DESC LIMIT 1), 'yellow') != 'red'
  `)
    .bind(submissionId).first<{ id: string }>()
  if (!submission) return json({ error: 'This submission is no longer waiting for review.' }, 409)
  const now = new Date().toISOString()
  await db.batch([
    db.prepare(`
      INSERT INTO reviewer_reviews (submission_id, invite_id, verdict, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(submission_id, invite_id) DO UPDATE SET
        verdict = excluded.verdict, note = excluded.note, updated_at = excluded.updated_at
    `).bind(submissionId, invite.id, verdict, note || null, now, now),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'reviewer_review', ?, ?, ?)`)
      .bind(crypto.randomUUID(), submissionId, verdict, now),
  ])
  return json({ ok: true })
}

async function adminDashboard(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const now = new Date().toISOString()
  const visitMetric = await db.prepare(`
    SELECT value, updated_at AS updatedAt FROM site_metrics WHERE metric = 'anonymous_visits'
  `).first<{ value: number; updatedAt: string }>()
  const { results: visitCountryRows } = await db.prepare(`
    SELECT SUBSTR(metric, 9) AS countryCode, value AS count
    FROM site_metrics
    WHERE metric LIKE 'country:%'
    ORDER BY value DESC, metric
    LIMIT 20
  `).all<{ countryCode: string; count: number }>()
  const { results: submissions } = await db.prepare(`
    SELECT s.id, challenge_id AS challengeId, child_nickname AS childNickname,
      age_band AS ageBand, country_code AS countryCode, project_title AS projectTitle, description, repo_url AS repoUrl,
      demo_url AS demoUrl, parent_name AS parentName, parent_email AS parentEmail,
      child_led AS childLed,
      image_name AS imageName, image_content_type AS imageContentType, image_size AS imageSize,
      CASE WHEN image_key IS NULL OR image_key = '' THEN 0 ELSE 1 END AS hasImage,
      s.status, s.created_at AS createdAt,
      sc.id AS safetyScanId, sc.status AS safetyStatus, sc.verdict AS safetyVerdict,
      sc.summary AS safetySummary, sc.categories AS safetyCategories,
      sc.actions AS safetyActions, sc.technical_flags AS safetyTechnicalFlags,
      sc.screenshots_reviewed AS safetyScreenshotsReviewed, sc.model AS safetyModel,
      sc.error AS safetyError, sc.started_at AS safetyStartedAt,
      sc.completed_at AS safetyCompletedAt, sc.updated_at AS safetyUpdatedAt
    FROM submissions s
    LEFT JOIN safety_scans sc ON sc.submission_id = s.id
    ORDER BY s.created_at DESC LIMIT 200
  `).all<Record<string, unknown>>()
  const { results: ideas } = await db.prepare(`
    SELECT id, idea_title AS ideaTitle, idea_prompt AS ideaPrompt, starter_spark AS starterSpark,
      creator_nickname AS creatorNickname, creator_group AS creatorGroup,
      grownup_email AS grownupEmail, status, created_at AS createdAt
    FROM challenge_ideas ORDER BY created_at DESC LIMIT 200
  `).all<Record<string, unknown>>()
  const { results: subscribers } = await db.prepare(`
    SELECT id, email, status, source, created_at AS createdAt, updated_at AS updatedAt
    FROM subscribers ORDER BY created_at DESC LIMIT 500
  `).all<Record<string, unknown>>()
  const { results: activity } = await db.prepare(`
    SELECT id, item_type AS itemType, item_id AS itemId, action, created_at AS createdAt
    FROM moderation_events ORDER BY created_at DESC LIMIT 50
  `).all<Record<string, unknown>>()
  const { results: voteAlerts } = await db.prepare(`
    SELECT va.id, va.challenge_id AS challengeId, c.title AS challengeTitle,
      va.project_id AS projectId, p.title AS projectTitle, va.signal,
      va.observed_count AS observedCount, va.status,
      va.first_seen_at AS firstSeenAt, va.last_seen_at AS lastSeenAt
    FROM vote_alerts va
    JOIN challenges c ON c.id = va.challenge_id
    LEFT JOIN projects p ON p.id = va.project_id
    ORDER BY CASE va.status WHEN 'open' THEN 0 ELSE 1 END, va.last_seen_at DESC
    LIMIT 200
  `).all<Record<string, unknown>>()
  const { results: reviewerInvites } = await db.prepare(`
    SELECT id, label, created_at AS createdAt, expires_at AS expiresAt,
      revoked_at AS revokedAt, last_used_at AS lastUsedAt
    FROM reviewer_invites ORDER BY created_at DESC LIMIT 200
  `).all<Record<string, unknown>>()
  const { results: reviewerReviewRows } = await db.prepare(`
    SELECT rr.submission_id AS submissionId, ri.label AS reviewerLabel,
      rr.verdict, rr.note, rr.updated_at AS updatedAt
    FROM reviewer_reviews rr
    JOIN reviewer_invites ri ON ri.id = rr.invite_id
    ORDER BY rr.updated_at DESC
  `).all<Record<string, unknown>>()
  const reviewsBySubmission = new Map<string, Record<string, unknown>[]>()
  for (const review of reviewerReviewRows) {
    const submissionId = String(review.submissionId)
    const list = reviewsBySubmission.get(submissionId) || []
    list.push(review)
    reviewsBySubmission.set(submissionId, list)
  }
  const { results: challengeRows } = await db.prepare(`
    SELECT id, week_label AS weekLabel, title, eyebrow, prompt, brief,
      opens_at AS opensAt, closes_at AS closesAt, voting_opens_at AS votingOpensAt,
      voting_closes_at AS votingClosesAt, status, starter_ideas AS starterIdeas, tools
    FROM challenges ORDER BY opens_at
  `).all<Record<string, unknown>>()
  const challenges = challengeRows.map((challenge) => ({
    ...challenge,
    starterIdeas: JSON.parse(String(challenge.starterIdeas || '[]')),
    tools: JSON.parse(String(challenge.tools || '[]')),
  }))
  const { results: draftRows } = await db.prepare(`
    SELECT id, title, eyebrow, prompt, brief, starter_ideas AS starterIdeas, tools,
      status, created_at AS createdAt, updated_at AS updatedAt
    FROM challenge_drafts
    WHERE status != 'archived'
    ORDER BY CASE status WHEN 'scheduled' THEN 0 ELSE 1 END, updated_at DESC, title
  `).all<Record<string, unknown>>()
  const challengeDrafts = draftRows.map((draft) => ({
    ...draft,
    starterIdeas: JSON.parse(String(draft.starterIdeas || '[]')),
    tools: JSON.parse(String(draft.tools || '[]')),
  }))
  const { results: yearChallengeRows } = await db.prepare(`
    SELECT cv.id AS versionId, cv.challenge_id AS challengeId, cv.version, cv.kind,
      cv.week_number AS weekNumber, cv.seasonal_arc AS seasonalArc, cv.title,
      cv.opening_date AS openingDate, cv.submission_close_date AS submissionCloseDate,
      cv.voting_open_date AS votingOpenDate, cv.voting_close_date AS votingCloseDate,
      cv.status, cv.approval_gate AS approvalGate, cv.content_json AS contentJson,
      ccp.editorial_state AS contentEditorialState
    FROM challenge_versions cv
    JOIN challenge_programs cp ON cp.id = cv.program_id
    LEFT JOIN challenge_content_packages ccp ON ccp.challenge_version_id = cv.id
    WHERE cp.year = 2027
      AND cv.version = (SELECT MAX(newer.version) FROM challenge_versions newer WHERE newer.challenge_id = cv.challenge_id)
    ORDER BY cv.opening_date, cv.kind
  `).all<Record<string, unknown>>()
  const { results: yearReviewRows } = await db.prepare(`
    SELECT cr.challenge_version_id AS challengeVersionId, cr.review_type AS reviewType,
      cr.verdict, cr.reviewer_kind AS reviewerKind, cr.reviewer_label AS reviewerLabel,
      cr.notes, cr.created_at AS createdAt
    FROM challenge_reviews cr
    JOIN challenge_versions cv ON cv.id = cr.challenge_version_id
    JOIN challenge_programs cp ON cp.id = cv.program_id
    WHERE cp.year = 2027
    ORDER BY cr.created_at
  `).all<Record<string, unknown>>()
  const { results: yearHistoryRows } = await db.prepare(`
    SELECT cv.challenge_id AS challengeId, cv.id AS versionId, cv.version, cv.title,
      cv.status, cv.created_at AS createdAt
    FROM challenge_versions cv
    JOIN challenge_programs cp ON cp.id = cv.program_id
    WHERE cp.year = 2027
    ORDER BY cv.challenge_id, cv.version DESC
  `).all<Record<string, unknown>>()
  const yearHistoryByChallenge = new Map<string, Record<string, unknown>[]>()
  for (const version of yearHistoryRows) {
    const challengeId = String(version.challengeId)
    const list = yearHistoryByChallenge.get(challengeId) || []
    list.push(version)
    yearHistoryByChallenge.set(challengeId, list)
  }
  const yearReviewsByVersion = new Map<string, Record<string, unknown>[]>()
  for (const review of yearReviewRows) {
    const versionId = String(review.challengeVersionId)
    const list = yearReviewsByVersion.get(versionId) || []
    list.push(review)
    yearReviewsByVersion.set(versionId, list)
  }
  const { results: shadowReviewRows } = await db.prepare(`
    SELECT rr.id AS runId, rr.submission_id AS submissionId, s.project_title AS projectTitle,
      rr.status, rr.proposed_lane AS proposedLane, rr.policy_version AS policyVersion,
      rr.playthrough_coverage_json AS playthroughCoverage,
      rr.network_findings_json AS networkFindings, rr.limitations_json AS limitations,
      rr.model_versions_json AS modelVersions, rr.prompt_versions_json AS promptVersions,
      rr.created_at AS createdAt, rr.completed_at AS completedAt,
      ad.id AS decisionId, ad.reason_codes_json AS reasonCodes,
      ad.confidence_and_limitations_json AS confidenceAndLimitations,
      ad.publication_allowed AS publicationAllowed,
      ha.human_action AS humanAction, ha.agreement, ha.override_reason AS overrideReason
    FROM review_runs rr
    JOIN submissions s ON s.id = rr.submission_id
    LEFT JOIN automated_decisions ad ON ad.review_run_id = rr.id
    LEFT JOIN human_audits ha ON ha.review_run_id = rr.id
    ORDER BY rr.created_at DESC LIMIT 300
  `).all<Record<string, unknown>>()
  const latestShadowBySubmission = new Map<string, Record<string, unknown>>()
  for (const review of shadowReviewRows) {
    const submissionId = String(review.submissionId)
    if (!latestShadowBySubmission.has(submissionId)) latestShadowBySubmission.set(submissionId, review)
  }
  const { results: operationControls } = await db.prepare(`
    SELECT control_key AS controlKey, control_value AS controlValue, reason,
      changed_by AS changedBy, changed_at AS changedAt
    FROM operation_controls ORDER BY control_key
  `).all<Record<string, unknown>>()
  const { results: contentQueueRows } = await db.prepare(`
    SELECT ccp.id, cv.challenge_id AS challengeId, cv.title, cv.kind,
      ccp.editorial_state AS editorialState, ccp.publication_mode AS publicationMode,
      ccp.scheduled_for AS scheduledFor, ccp.updated_at AS updatedAt,
      sc.id AS socialContentId, sc.approval_state AS socialApprovalState,
      sc.publication_mode AS socialPublicationMode
    FROM challenge_content_packages ccp
    JOIN challenge_versions cv ON cv.id = ccp.challenge_version_id
    LEFT JOIN social_content sc ON sc.challenge_version_id = cv.id
    ORDER BY cv.opening_date, cv.kind
  `).all<Record<string, unknown>>()

  return json({
    siteVisits: Number(visitMetric?.value || 0),
    lastVisitAt: visitMetric?.updatedAt || null,
    visitCountries: visitCountryRows.map((item) => ({ countryCode: item.countryCode, count: Number(item.count) })),
    submissions: submissions.map((item) => ({
      ...item,
      childLed: Boolean(item.childLed),
      hasImage: Boolean(item.hasImage),
      imageUrl: item.hasImage ? `/api/admin/submission-images/${item.id}` : null,
      safetyCategories: JSON.parse(String(item.safetyCategories || '[]')),
      safetyActions: JSON.parse(String(item.safetyActions || '[]')),
      safetyTechnicalFlags: JSON.parse(String(item.safetyTechnicalFlags || '[]')),
      safetyScreenshotsReviewed: Number(item.safetyScreenshotsReviewed || 0),
      reviewerReviews: reviewsBySubmission.get(String(item.id)) || [],
      shadowProposal: latestShadowBySubmission.has(String(item.id)) ? {
        lane: latestShadowBySubmission.get(String(item.id))?.proposedLane,
        policyVersion: latestShadowBySubmission.get(String(item.id))?.policyVersion,
        status: latestShadowBySubmission.get(String(item.id))?.status,
        reasonCodes: JSON.parse(String(latestShadowBySubmission.get(String(item.id))?.reasonCodes || '[]')),
        limitations: JSON.parse(String(latestShadowBySubmission.get(String(item.id))?.limitations || '[]')),
      } : null,
    })),
    ideas,
    subscribers,
    voteAlerts,
    reviewerInvites,
    activity,
    challengeDrafts,
    yearProgram: yearChallengeRows.map((challenge) => ({
      ...challenge,
      content: JSON.parse(String(challenge.contentJson || '{}')),
      contentJson: undefined,
      reviews: yearReviewsByVersion.get(String(challenge.versionId)) || [],
      history: yearHistoryByChallenge.get(String(challenge.challengeId)) || [],
    })),
    shadowReviews: shadowReviewRows.map((review) => ({
      ...review,
      publicationAllowed: Boolean(review.publicationAllowed),
      playthroughCoverage: JSON.parse(String(review.playthroughCoverage || '{}')),
      networkFindings: JSON.parse(String(review.networkFindings || '[]')),
      limitations: JSON.parse(String(review.limitations || '[]')),
      modelVersions: JSON.parse(String(review.modelVersions || '{}')),
      promptVersions: JSON.parse(String(review.promptVersions || '{}')),
      reasonCodes: JSON.parse(String(review.reasonCodes || '[]')),
      confidenceAndLimitations: JSON.parse(String(review.confidenceAndLimitations || '{}')),
    })),
    operationControls,
    contentQueue: contentQueueRows,
    safetyScannerEnabled: Boolean(env.SAFETY_SCAN_SECRET),
    schedule: {
      now,
      currentChallenge: challenges.find((challenge) => challenge.status === 'active') || null,
      votingChallenge: challenges.find((challenge) => String(challenge.votingOpensAt) <= now && String(challenge.votingClosesAt) > now) || null,
      nextChallenge: challenges.find((challenge) => String(challenge.opensAt) > now) || null,
      challenges,
    },
  })
}

async function adminSubmissionImage(db: ClubDatabase, uploads: ClubUploads, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const submission = await db.prepare(`SELECT image_key AS imageKey FROM submissions WHERE id = ?`)
    .bind(id).first<{ imageKey: string | null }>()
  if (!submission?.imageKey) return new Response('Image not found', { status: 404 })
  return serveUpload(uploads, submission.imageKey)
}

async function adminUploadSubmissionImage(db: ClubDatabase, uploads: ClubUploads, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const body = await request.formData().catch(() => null)
  const image = body?.get('image')
  if (!(image instanceof File) || image.size === 0) return json({ error: 'Choose an image to upload.' }, 400)
  if (!['image/webp', 'image/jpeg', 'image/png'].includes(image.type) || image.size > 5_000_000) {
    return json({ error: 'Project images must be a WebP, JPEG, or PNG under 5 MB.' }, 400)
  }

  const submission = await db.prepare(`SELECT image_key AS imageKey FROM submissions WHERE id = ?`)
    .bind(id).first<{ imageKey: string | null }>()
  if (!submission) return json({ error: 'Submission not found' }, 404)

  const extension = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }[image.type] || 'bin'
  const imageKey = `submissions/${id}/${crypto.randomUUID()}.${extension}`
  await uploads.put(imageKey, await image.arrayBuffer(), {
    httpMetadata: { contentType: image.type },
    customMetadata: { submissionId: id, originalName: image.name.slice(0, 120), addedBy: 'clubhouse-admin' },
  })

  try {
    await db.batch([
      db.prepare(`
        UPDATE submissions
        SET image_key = ?, image_name = ?, image_content_type = ?, image_size = ?
        WHERE id = ?
      `).bind(imageKey, image.name.slice(0, 120), image.type, image.size, id),
      db.prepare(`UPDATE projects SET image_key = ? WHERE id = ?`).bind(imageKey, `community-${id}`),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'submission', ?, ?, ?)`)
        .bind(crypto.randomUUID(), id, submission.imageKey ? 'image_replaced' : 'image_added', new Date().toISOString()),
    ])
  } catch (error) {
    await uploads.delete(imageKey).catch(() => undefined)
    throw error
  }

  if (submission.imageKey && submission.imageKey !== imageKey) await uploads.delete(submission.imageKey).catch(() => undefined)
  return json({ ok: true })
}

async function adminUpdateChallenge(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const title = validText(body?.title, 80, 3)
  const eyebrow = validText(body?.eyebrow, 100, 3)
  const prompt = validText(body?.prompt, 400, 10)
  const brief = validText(body?.brief, 800, 10)
  const weekLabel = validText(body?.weekLabel, 80, 3)
  const starterIdeas = Array.isArray(body?.starterIdeas) ? body.starterIdeas.map((item) => validText(item, 100)).filter(Boolean) : []
  const tools = Array.isArray(body?.tools) ? body.tools.map((item) => validText(item, 60)).filter(Boolean) : []
  const opensAt = validText(body?.opensAt, 40)
  const closesAt = validText(body?.closesAt, 40)
  const votingOpensAt = validText(body?.votingOpensAt, 40)
  const votingClosesAt = validText(body?.votingClosesAt, 40)
  const dates = [opensAt, closesAt, votingOpensAt, votingClosesAt].map((value) => value ? Date.parse(value) : Number.NaN)
  if (!title || !eyebrow || !prompt || !brief || !weekLabel || starterIdeas.length < 1 || tools.length < 1 || dates.some(Number.isNaN)) {
    return json({ error: 'Complete every challenge field before saving.' }, 400)
  }
  if (!(dates[0] < dates[1] && dates[1] <= dates[2] && dates[2] < dates[3])) {
    return json({ error: 'The build window must end before voting opens, and voting must end afterward.' }, 400)
  }
  const existing = await db.prepare(`
    SELECT opens_at AS opensAt, closes_at AS closesAt, voting_opens_at AS votingOpensAt,
      voting_closes_at AS votingClosesAt FROM challenges WHERE id = ?
  `).bind(id).first<{ opensAt: string; closesAt: string; votingOpensAt: string; votingClosesAt: string }>()
  if (!existing) return json({ error: 'Challenge not found' }, 404)
  const scheduleChanged = [existing.opensAt, existing.closesAt, existing.votingOpensAt, existing.votingClosesAt]
    .some((value, index) => Date.parse(value) !== dates[index])
  if (Date.parse(existing.opensAt) <= Date.now() && scheduleChanged) {
    return json({ error: 'Dates lock after a challenge begins, but its title and prompt can still be edited.' }, 409)
  }

  await db.batch([
    db.prepare(`
      UPDATE challenges SET week_label = ?, title = ?, eyebrow = ?, prompt = ?, brief = ?,
        opens_at = ?, closes_at = ?, voting_opens_at = ?, voting_closes_at = ?,
        starter_ideas = ?, tools = ?
      WHERE id = ?
    `).bind(
      weekLabel, title, eyebrow, prompt, brief, opensAt, closesAt, votingOpensAt, votingClosesAt,
      JSON.stringify(starterIdeas), JSON.stringify(tools), id,
    ),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'challenge', ?, 'schedule_updated', ?)`)
      .bind(crypto.randomUUID(), id, new Date().toISOString()),
  ])
  return json({ ok: true })
}

async function adminUpdateChallengeDraft(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const title = validText(body?.title, 80, 3)
  const eyebrow = validText(body?.eyebrow, 100, 3)
  const prompt = validText(body?.prompt, 400, 10)
  const brief = validText(body?.brief, 800, 10)
  const starterIdeas = Array.isArray(body?.starterIdeas) ? body.starterIdeas.map((item) => validText(item, 100)).filter(Boolean) : []
  const tools = Array.isArray(body?.tools) ? body.tools.map((item) => validText(item, 60)).filter(Boolean) : []
  if (!title || !eyebrow || !prompt || !brief || starterIdeas.length < 1 || tools.length < 1) {
    return json({ error: 'Complete every idea field before saving.' }, 400)
  }
  const existing = await db.prepare(`SELECT id FROM challenge_drafts WHERE id = ?`).bind(id).first<{ id: string }>()
  if (!existing) return json({ error: 'Challenge idea not found.' }, 404)
  const now = new Date().toISOString()
  await db.batch([
    db.prepare(`
      UPDATE challenge_drafts SET title = ?, eyebrow = ?, prompt = ?, brief = ?,
        starter_ideas = ?, tools = ?, updated_at = ? WHERE id = ?
    `).bind(title, eyebrow, prompt, brief, JSON.stringify(starterIdeas), JSON.stringify(tools), now, id),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'challenge_draft', ?, 'updated', ?)`)
      .bind(crypto.randomUUID(), id, now),
  ])
  return json({ ok: true })
}

async function adminDuplicateYearChallenge(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const parts = new URL(request.url).pathname.split('/').filter(Boolean)
  const duplicateOnly = parts.at(-1) === 'duplicate'
  const versionId = decodeURIComponent(parts.at(duplicateOnly ? -2 : -1) || '')
  if (!versionId) return json({ error: 'Challenge version not found.' }, 404)
  const source = await db.prepare(`
    SELECT cv.*, ccp.package_json AS packageJson, sc.content_json AS socialJson
    FROM challenge_versions cv
    LEFT JOIN challenge_content_packages ccp ON ccp.challenge_version_id = cv.id
    LEFT JOIN social_content sc ON sc.challenge_version_id = cv.id
    WHERE cv.id = ?
  `).bind(versionId).first<Record<string, unknown>>()
  if (!source) return json({ error: 'Challenge version not found.' }, 404)
  const latest = await db.prepare(`SELECT MAX(version) AS version FROM challenge_versions WHERE challenge_id = ?`)
    .bind(source.challenge_id).first<{ version: number }>()
  const nextVersion = Number(latest?.version || 0) + 1
  const nextId = `${source.challenge_id}-v${nextVersion}`
  const now = new Date().toISOString()
  const content = JSON.parse(String(source.content_json || '{}')) as Record<string, unknown>
  let title = String(source.title)
  if (!duplicateOnly) {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    const revisedTitle = validText(body?.title, 100, 3)
    const prompt = validText(body?.prompt, 400, 10)
    const fullBrief = validText(body?.fullBrief, 2400, 30)
    const sparkBrief = validText(body?.sparkBrief, 1200, 10)
    const buildBrief = validText(body?.buildBrief, 1200, 10)
    const glowUpBrief = validText(body?.glowUpBrief, 1200, 10)
    const parentNote = validText(body?.parentNote, 1800, 20)
    const makeItYoursQuestion = validText(body?.makeItYoursQuestion, 500, 10)
    const prePublishSafetyCheck = validText(body?.prePublishSafetyCheck, 1200, 20)
    const reflectionQuestion = validText(body?.reflectionQuestion, 500, 10)
    if (!revisedTitle || !prompt || !fullBrief || !sparkBrief || !buildBrief || !glowUpBrief || !parentNote || !makeItYoursQuestion || !prePublishSafetyCheck || !reflectionQuestion) {
      return json({ error: 'Complete every Challenge Studio field within its length limit.' }, 400)
    }
    title = revisedTitle
    content.title = revisedTitle
    content.prompt = prompt
    content.fullBrief = fullBrief
    content.pathways = {
      spark: { name: 'Spark', brief: sparkBrief },
      build: { name: 'Build', brief: buildBrief },
      glowUp: { name: 'Glow-Up', brief: glowUpBrief },
    }
    content.parentNote = parentNote
    content.makeItYoursQuestion = makeItYoursQuestion
    content.prePublishSafetyCheck = prePublishSafetyCheck
    content.reflectionQuestion = reflectionQuestion
  }
  content.version = nextVersion
  content.status = 'draft'
  const packageJson = JSON.parse(String(source.packageJson || '{}')) as Record<string, unknown>
  packageJson.website = content.fullBrief
  packageJson.needsEditorialRefresh = !duplicateOnly
  packageJson.sourceVersion = nextVersion
  const socialJson = JSON.parse(String(source.socialJson || '{}')) as Record<string, unknown>
  socialJson.needsEditorialRefresh = !duplicateOnly
  socialJson.sourceVersion = nextVersion
  const pendingReviews = ['curriculum', 'age_fit', 'accessibility', 'inclusion']
  await db.batch([
    db.prepare(`
      INSERT INTO challenge_versions (
        id, program_id, challenge_id, version, kind, week_number, seasonal_arc, title,
        opening_date, submission_close_date, voting_open_date, voting_close_date,
        status, approval_gate, content_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `).bind(
      nextId, source.program_id, source.challenge_id, nextVersion, source.kind,
      source.week_number, source.seasonal_arc, title, source.opening_date,
      source.submission_close_date, source.voting_open_date, source.voting_close_date,
      source.approval_gate, JSON.stringify(content), now,
    ),
    db.prepare(`
      INSERT INTO challenge_content_packages (
        id, challenge_version_id, version, editorial_state, publication_mode,
        package_json, approved_by, scheduled_for, published_at, verified_at, created_at, updated_at
      ) VALUES (?, ?, ?, 'draft', 'dry_run', ?, NULL, NULL, NULL, NULL, ?, ?)
    `).bind(`content-${source.challenge_id}-v${nextVersion}`, nextId, nextVersion, JSON.stringify(packageJson), now, now),
    db.prepare(`
      INSERT INTO social_content (
        id, challenge_version_id, channel, content_type, content_json, approval_state,
        publication_mode, scheduled_for, created_at, updated_at
      ) VALUES (?, ?, 'adult-organic', 'weekly-package', ?, 'draft', 'dry_run', NULL, ?, ?)
    `).bind(`social-${source.challenge_id}-v${nextVersion}`, nextId, JSON.stringify(socialJson), now, now),
    ...pendingReviews.map((reviewType) => db.prepare(`
      INSERT INTO challenge_reviews (
        id, challenge_version_id, review_type, verdict, reviewer_kind,
        reviewer_label, notes, evidence_json, created_at
      ) VALUES (?, ?, ?, 'pending', 'human', 'unassigned', 'New private version requires fresh review.', '[]', ?)
    `).bind(`${nextId}-${reviewType}`, nextId, reviewType, now)),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'challenge_version', ?, ?, ?)`)
      .bind(crypto.randomUUID(), nextId, duplicateOnly ? 'duplicated_private_draft' : 'revised_private_draft', now),
  ])
  return json({ ok: true, versionId: nextId, version: nextVersion }, 201)
}

async function adminReviewContentPackage(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const action = text(body?.action)
  if (!id || !['curriculum-review', 'safety-review', 'approve', 'reset'].includes(action)) return json({ error: 'Invalid content review action.' }, 400)
  const item = await db.prepare(`
    SELECT ccp.id, ccp.editorial_state AS editorialState, sc.id AS socialContentId
    FROM challenge_content_packages ccp
    LEFT JOIN social_content sc ON sc.challenge_version_id = ccp.challenge_version_id
    WHERE ccp.id = ?
  `).bind(id).first<{ id: string; editorialState: string; socialContentId: string | null }>()
  if (!item) return json({ error: 'Content package not found.' }, 404)
  const transitions: Record<string, { from: string[]; editorial: string; social: string }> = {
    'curriculum-review': { from: ['draft'], editorial: 'curriculum_reviewed', social: 'reviewed' },
    'safety-review': { from: ['curriculum_reviewed'], editorial: 'safety_accuracy_reviewed', social: 'reviewed' },
    approve: { from: ['safety_accuracy_reviewed'], editorial: 'approved', social: 'approved' },
    reset: { from: ['draft', 'curriculum_reviewed', 'safety_accuracy_reviewed', 'approved'], editorial: 'draft', social: 'draft' },
  }
  const transition = transitions[action]
  if (!transition.from.includes(item.editorialState)) return json({ error: `Cannot ${action} from ${item.editorialState}.` }, 409)
  const now = new Date().toISOString()
  const statements = [
    db.prepare(`UPDATE challenge_content_packages SET editorial_state = ?, approved_by = ?, updated_at = ? WHERE id = ?`)
      .bind(transition.editorial, action === 'approve' ? 'clubhouse_admin' : null, now, id),
    db.prepare(`UPDATE social_content SET approval_state = ?, updated_at = ? WHERE id = ?`)
      .bind(transition.social, now, item.socialContentId),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'content_package', ?, ?, ?)`)
      .bind(crypto.randomUUID(), id, action, now),
  ]
  if (item.socialContentId && ['approve', 'reset'].includes(action)) {
    statements.push(db.prepare(`
      INSERT INTO social_approvals (id, social_content_id, decision, approver_label, reason, created_at)
      VALUES (?, ?, ?, 'clubhouse_admin', ?, ?)
    `).bind(
      crypto.randomUUID(), item.socialContentId,
      action === 'approve' ? 'approved' : 'changes_requested',
      action === 'approve' ? 'Approved only for the dry-run queue; no account or publication authority is connected.' : 'Returned to draft.',
      now,
    ))
  }
  await db.batch(statements)
  return json({ ok: true, editorialState: transition.editorial, publicationMode: 'dry_run' })
}

async function adminScheduleYearChallenge(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const parts = new URL(request.url).pathname.split('/').filter(Boolean)
  const versionId = decodeURIComponent(parts.at(-2) || '')
  const source = await db.prepare(`
    SELECT cv.*, ccp.editorial_state AS editorialState
    FROM challenge_versions cv
    JOIN challenge_content_packages ccp ON ccp.challenge_version_id = cv.id
    WHERE cv.id = ?
      AND cv.version = (SELECT MAX(newer.version) FROM challenge_versions newer WHERE newer.challenge_id = cv.challenge_id)
  `).bind(versionId).first<Record<string, unknown>>()
  if (!source) return json({ error: 'Only the latest challenge version can be scheduled.' }, 404)
  if (source.kind !== 'primary') return json({ error: 'Bonus scheduling needs its own inclusion-reviewed public surface and is not supported here.' }, 409)
  if (source.status !== 'draft' || source.editorialState !== 'approved') {
    return json({ error: 'The latest private draft needs an approved dry-run content package before scheduling.' }, 409)
  }
  const now = new Date().toISOString()
  if (String(source.opening_date) <= now) return json({ error: 'A challenge cannot be scheduled after its opening time.' }, 409)
  const conflict = await db.prepare(`
    SELECT id, title FROM challenges
    WHERE (opens_at < ? AND closes_at > ?)
       OR (voting_opens_at < ? AND voting_closes_at > ?)
    LIMIT 1
  `).bind(
    source.submission_close_date, source.opening_date,
    source.voting_close_date, source.voting_open_date,
  ).first<{ id: string; title: string }>()
  if (conflict) return json({ error: `Schedule conflict with “${conflict.title}” (${conflict.id}).` }, 409)
  const content = JSON.parse(String(source.content_json || '{}')) as Record<string, unknown>
  const starterIdeas = Array.isArray(content.starterIdeas) ? content.starterIdeas : []
  const tools = Array.isArray(content.recommendedTools) ? content.recommendedTools : []
  const weekNumber = Number(source.week_number)
  await db.batch([
    db.prepare(`
      INSERT INTO challenges (
        id, week_label, title, eyebrow, prompt, brief, opens_at, closes_at,
        voting_opens_at, voting_closes_at, status, starter_ideas, tools
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?)
    `).bind(
      source.challenge_id, `2027 Week ${String(weekNumber).padStart(2, '0')}`, source.title,
      text(content.eyebrow) || `2027 creative coding · week ${String(weekNumber).padStart(2, '0')}`,
      content.prompt, content.fullBrief, source.opening_date, source.submission_close_date,
      source.voting_open_date, source.voting_close_date, JSON.stringify(starterIdeas), JSON.stringify(tools),
    ),
    db.prepare(`UPDATE challenge_versions SET status = 'scheduled' WHERE id = ?`).bind(versionId),
    db.prepare(`
      UPDATE challenge_content_packages
      SET editorial_state = 'scheduled', scheduled_for = ?, updated_at = ?
      WHERE challenge_version_id = ?
    `).bind(source.opening_date, now, versionId),
    db.prepare(`
      INSERT INTO challenge_reviews (
        id, challenge_version_id, review_type, verdict, reviewer_kind,
        reviewer_label, notes, evidence_json, created_at
      ) VALUES (?, ?, 'human_steward', 'approved', 'human', 'clubhouse_admin',
        'Human Steward approved this exact version and schedule. Merge/deploy approval remains separate.', '[]', ?)
    `).bind(`${versionId}-human-steward-${crypto.randomUUID()}`, versionId, now),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'challenge_version', ?, 'scheduled_by_human_steward', ?)`)
      .bind(crypto.randomUUID(), versionId, now),
  ])
  return json({ ok: true, challengeId: source.challenge_id, scheduledFor: source.opening_date })
}

async function adminQueueSafetyScan(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  if (!env.SAFETY_SCAN_SECRET) return json({ error: 'Connect the safety runner before starting a playthrough.' }, 503)
  const scanId = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '')
  const scan = await db.prepare(`
    SELECT sc.id, s.demo_url AS demoUrl
    FROM safety_scans sc JOIN submissions s ON s.id = sc.submission_id
    WHERE sc.id = ?
  `).bind(scanId).first<{ id: string; demoUrl: string | null }>()
  if (!scan) return json({ error: 'Safety scan not found.' }, 404)
  if (!scan.demoUrl) return json({ error: 'Add a playable link before requesting an AI playthrough.' }, 409)
  const now = new Date().toISOString()
  await db.batch([
    db.prepare(`
      UPDATE safety_scans SET target_url = ?, target_kind = 'playable', status = 'queued',
        verdict = NULL, summary = NULL, categories = '[]', actions = '[]',
        technical_flags = '[]', screenshots_reviewed = 0, model = NULL, error = NULL,
        started_at = NULL, completed_at = NULL, updated_at = ? WHERE id = ?
    `).bind(scan.demoUrl, now, scanId),
    db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'safety_scan', ?, 'queued', ?)`)
      .bind(crypto.randomUUID(), scanId, now),
  ])
  return json({ ok: true })
}

async function latestShadowDecision(db: ClubDatabase, submissionId: string) {
  return db.prepare(`
    SELECT rr.id AS runId, ad.id AS decisionId, ad.proposed_lane AS proposedLane
    FROM automated_decisions ad
    JOIN review_runs rr ON rr.id = ad.review_run_id
    WHERE rr.submission_id = ?
    ORDER BY ad.created_at DESC LIMIT 1
  `).bind(submissionId).first<{ runId: string; decisionId: string; proposedLane: 'green' | 'yellow' | 'red' }>()
}

function shadowAgreement(lane: 'green' | 'yellow' | 'red', humanAction: 'approved' | 'rejected') {
  if (humanAction === 'approved') return lane === 'green' ? 'agreed' : 'disagreed'
  if (lane === 'red') return 'agreed'
  return lane === 'green' ? 'disagreed' : 'not_comparable'
}

function humanAuditStatements(db: ClubDatabase, shadow: { runId: string; decisionId: string; proposedLane: 'green' | 'yellow' | 'red' } | null, humanAction: 'approved' | 'rejected', reason: string | null, now: string) {
  if (!shadow) return []
  const finalState = humanAction === 'approved' ? 'human_approved' : 'human_rejected'
  return [
    db.prepare(`
      INSERT INTO human_audits (
        id, review_run_id, automated_decision_id, human_action, agreement,
        override_reason, auditor_label, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'clubhouse_admin', ?)
    `).bind(
      crypto.randomUUID(), shadow.runId, shadow.decisionId, humanAction,
      shadowAgreement(shadow.proposedLane, humanAction), reason, now,
    ),
    db.prepare(`UPDATE review_runs SET final_publication_state = ? WHERE id = ?`).bind(finalState, shadow.runId),
  ]
}

async function adminModerate(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const type = text(body?.type)
  const id = validText(body?.id, 100)
  const action = text(body?.action)
  const safetyOverride = body?.safetyOverride === true
  const decisionReason = validText(body?.decisionReason, 500, 10)
  if (!id) return json({ error: 'Invalid moderation request' }, 400)
  const now = new Date().toISOString()

  if (type === 'submission' && action === 'approve') {
    const shadow = await latestShadowDecision(db, id)
    const submission = await db.prepare(`
      SELECT id, challenge_id AS challengeId, child_nickname AS childNickname,
        age_band AS ageBand, country_code AS countryCode, project_title AS projectTitle, description,
        repo_url AS repoUrl, demo_url AS demoUrl, image_key AS imageKey
      FROM submissions WHERE id = ?
    `).bind(id).first<{
      id: string; challengeId: string; childNickname: string; ageBand: string; countryCode: string;
      projectTitle: string; description: string; repoUrl: string; demoUrl: string | null; imageKey: string | null;
    }>()
    if (!submission) return json({ error: 'Submission not found' }, 404)
    const scan = await db.prepare(`SELECT status FROM safety_scans WHERE submission_id = ?`)
      .bind(id).first<{ status: string }>()
    if (env.SAFETY_SCAN_SECRET && scan?.status !== 'passed' && !safetyOverride) {
      return json({ error: 'This project needs a passed AI playthrough or an explicit grown-up safety override.' }, 409)
    }
    if ((safetyOverride || (shadow && shadow.proposedLane !== 'green')) && !decisionReason) {
      return json({ error: 'Record a grown-up reason before overriding a safety or shadow recommendation.' }, 409)
    }
    const scenes = ['space', 'ocean', 'garden', 'monster']
    const accents = ['#b9f44a', '#65d9ff', '#ffb3c7', '#ffcb45']
    const variant = Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0) % scenes.length
    const projectId = `community-${submission.id}`
    await db.batch([
      db.prepare(`
        INSERT INTO projects (
          id, challenge_id, title, builder, age_band, country_code, description, repo_url, demo_url,
          base_votes, scene, accent, image_key, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'approved')
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title, builder = excluded.builder, age_band = excluded.age_band,
          country_code = excluded.country_code, description = excluded.description, repo_url = excluded.repo_url, demo_url = excluded.demo_url,
          scene = excluded.scene, accent = excluded.accent, image_key = excluded.image_key, status = 'approved'
      `).bind(
        projectId, submission.challengeId, submission.projectTitle, submission.childNickname,
        submission.ageBand, submission.countryCode, submission.description, submission.repoUrl, submission.demoUrl || '',
        scenes[variant], accents[variant], submission.imageKey,
      ),
      db.prepare(`UPDATE submissions SET status = 'approved' WHERE id = ?`).bind(id),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'submission', ?, ?, ?)`)
        .bind(crypto.randomUUID(), id, safetyOverride ? 'approved_safety_override' : 'approved', now),
      ...humanAuditStatements(db, shadow, 'approved', decisionReason, now),
    ])
    return json({ ok: true })
  }

  if (type === 'submission' && action === 'reject') {
    const shadow = await latestShadowDecision(db, id)
    if (shadow?.proposedLane === 'green' && !decisionReason) {
      return json({ error: 'Record a grown-up reason before overriding a green shadow proposal.' }, 409)
    }
    await db.batch([
      db.prepare(`UPDATE submissions SET status = 'rejected' WHERE id = ?`).bind(id),
      db.prepare(`UPDATE projects SET status = 'hidden' WHERE id = ?`).bind(`community-${id}`),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'submission', ?, 'rejected', ?)`)
        .bind(crypto.randomUUID(), id, now),
      ...humanAuditStatements(db, shadow, 'rejected', decisionReason, now),
    ])
    return json({ ok: true })
  }

  if (type === 'idea' && ['select', 'archive'].includes(action)) {
    const status = action === 'select' ? 'selected' : 'archived'
    await db.batch([
      db.prepare(`UPDATE challenge_ideas SET status = ? WHERE id = ?`).bind(status, id),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'idea', ?, ?, ?)`)
        .bind(crypto.randomUUID(), id, status, now),
    ])
    return json({ ok: true })
  }

  if (type === 'subscriber' && ['activate', 'unsubscribe'].includes(action)) {
    const status = action === 'activate' ? 'active' : 'unsubscribed'
    await db.batch([
      db.prepare(`UPDATE subscribers SET status = ?, updated_at = ? WHERE id = ?`).bind(status, now, id),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'subscriber', ?, ?, ?)`)
        .bind(crypto.randomUUID(), id, status, now),
    ])
    return json({ ok: true })
  }

  if (type === 'voteAlert' && ['dismiss', 'reopen'].includes(action)) {
    const status = action === 'dismiss' ? 'dismissed' : 'open'
    await db.batch([
      db.prepare(`UPDATE vote_alerts SET status = ?, last_seen_at = ? WHERE id = ?`).bind(status, now, id),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'vote_alert', ?, ?, ?)`)
        .bind(crypto.randomUUID(), id, status, now),
    ])
    return json({ ok: true })
  }

  return json({ error: 'Unsupported moderation action' }, 400)
}

export default {
  async fetch(request: Request, env: Env, context: WorkerExecutionContext) {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 })

    try {
      await initialize(env.DB)
      if (request.method === 'GET' && url.pathname === '/api/community') return community(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/visits') return recordAnonymousVisit(env.DB, request)
      if (request.method === 'GET' && url.pathname === '/api/favorites') return favorites(env.DB)
      if (request.method === 'GET' && url.pathname.startsWith('/api/project-images/')) return projectImage(env.DB, env.UPLOADS, request)
      if (request.method === 'POST' && url.pathname === '/api/vote') return vote(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/submissions') return submit(env.DB, env.UPLOADS, request, env, context)
      if (request.method === 'POST' && url.pathname === '/api/challenge-ideas') return submitChallengeIdea(env.DB, request, env, context)
      if (request.method === 'POST' && url.pathname === '/api/subscribers') return subscribe(env.DB, request, env)
      if (request.method === 'GET' && url.pathname === '/api/unsubscribe') return unsubscribe(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/newsletter/send-weekly') return sendWeeklyChallenge(env.DB, request, env)
      if (request.method === 'GET' && url.pathname === '/api/safety/queue') return claimSafetyScans(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/safety/results') return recordSafetyScanResult(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/admin/login') return adminLogin(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/admin/logout') return adminLogout()
      if (request.method === 'GET' && url.pathname === '/api/admin/dashboard') return adminDashboard(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/admin/reviewer-invites') return adminCreateReviewerInvite(env.DB, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/reviewer-invites/')) return adminRevokeReviewerInvite(env.DB, request, env)
      if (request.method === 'GET' && url.pathname.startsWith('/api/admin/submission-images/')) return adminSubmissionImage(env.DB, env.UPLOADS, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/submission-images/')) return adminUploadSubmissionImage(env.DB, env.UPLOADS, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/challenge-drafts/')) return adminUpdateChallengeDraft(env.DB, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/year-challenges/') && url.pathname.endsWith('/duplicate')) return adminDuplicateYearChallenge(env.DB, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/year-challenges/') && url.pathname.endsWith('/schedule')) return adminScheduleYearChallenge(env.DB, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/year-challenges/')) return adminDuplicateYearChallenge(env.DB, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/content-packages/')) return adminReviewContentPackage(env.DB, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/challenges/')) return adminUpdateChallenge(env.DB, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/safety-scans/')) return adminQueueSafetyScan(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/admin/moderate') return adminModerate(env.DB, request, env)
      if (request.method === 'GET' && url.pathname === '/api/reviewer/submissions') return reviewerSubmissions(env.DB, request)
      if (request.method === 'GET' && url.pathname.startsWith('/api/reviewer/submission-images/')) return reviewerSubmissionImage(env.DB, env.UPLOADS, request)
      if (request.method === 'POST' && url.pathname === '/api/reviewer/reviews') return reviewerReview(env.DB, request)
      return json({ error: 'Not found' }, 404)
    } catch (error) {
      console.error('Community API error', error)
      return json({ error: 'The clubhouse database is taking a break. Please try again.' }, 500)
    }
  },
}
