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

const adminCookieName = 'clubhouse_admin'
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

async function initialize(db: ClubDatabase) {
  await ensureDatabase(db)
  await seedDatabase(db)
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
  const projectsStatement = galleryChallenge ? db.prepare(`
    SELECT id, challenge_id AS challengeId, title, builder, age_band AS ageBand,
      description, repo_url AS repoUrl, demo_url AS demoUrl, base_votes AS baseVotes,
      scene, accent, image_key AS imageKey,
      CASE WHEN id IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco') THEN 1 ELSE 0 END AS isSample
    FROM projects WHERE challenge_id = ? AND status = 'approved'
      AND id NOT IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco')
  `).bind(galleryId) : db.prepare(`
    SELECT id, challenge_id AS challengeId, title, builder, age_band AS ageBand,
      description, repo_url AS repoUrl, demo_url AS demoUrl, base_votes AS baseVotes,
      scene, accent, image_key AS imageKey, 1 AS isSample
    FROM projects
    WHERE challenge_id = ? AND status = 'approved'
      AND id IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco')
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
    SELECT id, week_label AS weekLabel, title, eyebrow, prompt, opens_at AS opensAt,
      closes_at AS closesAt FROM challenges WHERE opens_at > ? ORDER BY opens_at LIMIT 3
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
      isSample: Boolean(project.isSample),
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
      AND p.id NOT IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco')
      AND c.voting_opens_at <= ? AND c.voting_closes_at > ?
  `).bind(projectId, challengeId, now, now).first<{ id: string }>()
  if (!project) return json({ error: 'Project not found' }, 404)

  await db.prepare(`
    INSERT INTO votes (challenge_id, voter_id, project_id, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(challenge_id, voter_id)
    DO UPDATE SET project_id = excluded.project_id, updated_at = excluded.updated_at
  `).bind(challengeId, voterId, projectId, new Date().toISOString()).run()
  return json({ ok: true })
}

async function submit(db: ClubDatabase, uploads: ClubUploads, request: Request) {
  const body = await request.formData().catch(() => null)
  if (!body || text(body.get('website'))) return json({ error: 'Invalid submission' }, 400)

  const challengeId = validText(body.get('challengeId'), 80)
  const childNickname = validText(body.get('childNickname'), 24)
  const ageBand = ['5–6', '7–9', '10–12', '13–15'].includes(text(body.get('ageBand'))) ? text(body.get('ageBand')) : null
  const projectTitle = validText(body.get('projectTitle'), 60)
  const description = validText(body.get('description'), 280, 10)
  const repoUrl = validUrl(body.get('repoUrl'))
  const demoUrl = validUrl(body.get('demoUrl'), false)
  const parentName = validText(body.get('parentName'), 80)
  const parentEmail = validEmail(body.get('parentEmail'))
  const consent = body.get('consent') === 'true'
  const publicSharing = body.get('publicSharing') === 'true'
  const image = body.get('image')
  const hasImage = image instanceof File && image.size > 0

  if (!challengeId || !childNickname || !ageBand || !projectTitle || !description || !repoUrl || demoUrl === null || !parentName || !parentEmail || !consent || !publicSharing) {
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
    await db.prepare(`
      INSERT INTO submissions (
        id, challenge_id, child_nickname, age_band, project_title, description,
        repo_url, demo_url, parent_name, parent_email, consent, public_sharing,
        image_key, image_name, image_content_type, image_size, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      id, challengeId, childNickname, ageBand, projectTitle, description,
      repoUrl, demoUrl, parentName, parentEmail, imageKey || null,
      hasImage ? image.name.slice(0, 120) : null, hasImage ? image.type : null,
      hasImage ? image.size : null, new Date().toISOString(),
    ).run()
  } catch (error) {
    if (imageKey) await uploads.delete(imageKey).catch(() => undefined)
    throw error
  }
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

async function adminDashboard(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const now = new Date().toISOString()
  const { results: submissions } = await db.prepare(`
    SELECT id, challenge_id AS challengeId, child_nickname AS childNickname,
      age_band AS ageBand, project_title AS projectTitle, description, repo_url AS repoUrl,
      demo_url AS demoUrl, parent_name AS parentName, parent_email AS parentEmail,
      image_name AS imageName, image_content_type AS imageContentType, image_size AS imageSize,
      CASE WHEN image_key IS NULL OR image_key = '' THEN 0 ELSE 1 END AS hasImage,
      status, created_at AS createdAt
    FROM submissions ORDER BY created_at DESC LIMIT 200
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

  return json({
    submissions: submissions.map((item) => ({
      ...item,
      hasImage: Boolean(item.hasImage),
      imageUrl: item.hasImage ? `/api/admin/submission-images/${item.id}` : null,
    })),
    ideas,
    subscribers,
    activity,
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
  const existing = await db.prepare(`SELECT opens_at AS opensAt FROM challenges WHERE id = ?`).bind(id).first<{ opensAt: string }>()
  if (!existing) return json({ error: 'Challenge not found' }, 404)
  if (Date.parse(existing.opensAt) <= Date.now()) return json({ error: 'Only upcoming challenges can be edited.' }, 409)

  await db.batch([
    db.prepare(`
      UPDATE challenges SET week_label = ?, title = ?, eyebrow = ?, prompt = ?, brief = ?,
        opens_at = ?, closes_at = ?, voting_opens_at = ?, voting_closes_at = ?,
        starter_ideas = ?, tools = ?, status = 'upcoming'
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

async function adminModerate(db: ClubDatabase, request: Request, env: Env) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const type = text(body?.type)
  const id = validText(body?.id, 100)
  const action = text(body?.action)
  if (!id) return json({ error: 'Invalid moderation request' }, 400)
  const now = new Date().toISOString()

  if (type === 'submission' && action === 'approve') {
    const submission = await db.prepare(`
      SELECT id, challenge_id AS challengeId, child_nickname AS childNickname,
        age_band AS ageBand, project_title AS projectTitle, description,
        repo_url AS repoUrl, demo_url AS demoUrl, image_key AS imageKey
      FROM submissions WHERE id = ?
    `).bind(id).first<{
      id: string; challengeId: string; childNickname: string; ageBand: string;
      projectTitle: string; description: string; repoUrl: string; demoUrl: string | null; imageKey: string | null;
    }>()
    if (!submission) return json({ error: 'Submission not found' }, 404)
    const scenes = ['space', 'ocean', 'garden', 'monster']
    const accents = ['#b9f44a', '#65d9ff', '#ffb3c7', '#ffcb45']
    const variant = Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0) % scenes.length
    const projectId = `community-${submission.id}`
    await db.batch([
      db.prepare(`
        INSERT INTO projects (
          id, challenge_id, title, builder, age_band, description, repo_url, demo_url,
          base_votes, scene, accent, image_key, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'approved')
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title, builder = excluded.builder, age_band = excluded.age_band,
          description = excluded.description, repo_url = excluded.repo_url, demo_url = excluded.demo_url,
          scene = excluded.scene, accent = excluded.accent, image_key = excluded.image_key, status = 'approved'
      `).bind(
        projectId, submission.challengeId, submission.projectTitle, submission.childNickname,
        submission.ageBand, submission.description, submission.repoUrl, submission.demoUrl || '',
        scenes[variant], accents[variant], submission.imageKey,
      ),
      db.prepare(`UPDATE submissions SET status = 'approved' WHERE id = ?`).bind(id),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'submission', ?, 'approved', ?)`)
        .bind(crypto.randomUUID(), id, now),
    ])
    return json({ ok: true })
  }

  if (type === 'submission' && action === 'reject') {
    await db.batch([
      db.prepare(`UPDATE submissions SET status = 'rejected' WHERE id = ?`).bind(id),
      db.prepare(`UPDATE projects SET status = 'hidden' WHERE id = ?`).bind(`community-${id}`),
      db.prepare(`INSERT INTO moderation_events (id, item_type, item_id, action, created_at) VALUES (?, 'submission', ?, 'rejected', ?)`)
        .bind(crypto.randomUUID(), id, now),
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

  return json({ error: 'Unsupported moderation action' }, 400)
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 })

    try {
      await initialize(env.DB)
      if (request.method === 'GET' && url.pathname === '/api/community') return community(env.DB, request)
      if (request.method === 'GET' && url.pathname.startsWith('/api/project-images/')) return projectImage(env.DB, env.UPLOADS, request)
      if (request.method === 'POST' && url.pathname === '/api/vote') return vote(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/submissions') return submit(env.DB, env.UPLOADS, request)
      if (request.method === 'POST' && url.pathname === '/api/challenge-ideas') return submitChallengeIdea(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/subscribers') return subscribe(env.DB, request)
      if (request.method === 'GET' && url.pathname === '/api/unsubscribe') return unsubscribe(env.DB, request)
      if (request.method === 'POST' && url.pathname === '/api/newsletter/send-weekly') return sendWeeklyChallenge(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/admin/login') return adminLogin(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/admin/logout') return adminLogout()
      if (request.method === 'GET' && url.pathname === '/api/admin/dashboard') return adminDashboard(env.DB, request, env)
      if (request.method === 'GET' && url.pathname.startsWith('/api/admin/submission-images/')) return adminSubmissionImage(env.DB, env.UPLOADS, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/submission-images/')) return adminUploadSubmissionImage(env.DB, env.UPLOADS, request, env)
      if (request.method === 'POST' && url.pathname.startsWith('/api/admin/challenges/')) return adminUpdateChallenge(env.DB, request, env)
      if (request.method === 'POST' && url.pathname === '/api/admin/moderate') return adminModerate(env.DB, request, env)
      return json({ error: 'Not found' }, 404)
    } catch (error) {
      console.error('Community API error', error)
      return json({ error: 'The clubhouse database is taking a break. Please try again.' }, 500)
    }
  },
}
