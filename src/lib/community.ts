import { activeChallenge } from '../data'
import type { ChallengeIdeaInput, CommunitySnapshot, SubmissionInput } from '../types'

const deviceKey = 'vibe-club-device-id'

function getVoterId() {
  const existing = localStorage.getItem(deviceKey)
  if (existing) return existing
  const next = crypto.randomUUID()
  localStorage.setItem(deviceKey, next)
  return next
}

function offlineSnapshot(): CommunitySnapshot {
  const stored = localStorage.getItem(`vibe-club-vote:${activeChallenge.id}`)
  const counts = JSON.parse(localStorage.getItem('vibe-club-counts') || '{}') as Record<string, number>
  return {
    challenge: activeChallenge, projects: [], voteCounts: counts, myVote: stored,
    galleryChallenge: null, votingOpen: false, acceptingSubmissions: true, upcomingChallenges: [], source: 'offline',
  }
}

export async function loadCommunity(): Promise<CommunitySnapshot> {
  try {
    const response = await fetch(`/api/community?voterId=${encodeURIComponent(getVoterId())}`)
    if (!response.ok) throw new Error('Community API unavailable')
    return await response.json() as CommunitySnapshot
  } catch (error) {
    console.warn('Community database unavailable; using offline mode.', error)
    return offlineSnapshot()
  }
}

export async function saveVote(challengeId: string, projectId: string, previousVote: string | null) {
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ challengeId, projectId, voterId: getVoterId() }),
    })
    if (!response.ok) throw new Error('Vote was rejected')
  } catch (error) {
    const counts = JSON.parse(localStorage.getItem('vibe-club-counts') || '{}') as Record<string, number>
    if (previousVote && previousVote !== projectId) counts[previousVote] = Math.max(0, (counts[previousVote] || 0) - 1)
    if (previousVote !== projectId) counts[projectId] = (counts[projectId] || 0) + 1
    localStorage.setItem('vibe-club-counts', JSON.stringify(counts))
    localStorage.setItem(`vibe-club-vote:${challengeId}`, projectId)
    throw error
  }
}

export async function submitProject(input: SubmissionInput, challengeId: string) {
  const body = new FormData()
  body.set('challengeId', challengeId)
  body.set('childNickname', input.childNickname)
  body.set('ageBand', input.ageBand)
  body.set('projectTitle', input.projectTitle)
  body.set('description', input.description)
  body.set('repoUrl', input.repoUrl)
  body.set('demoUrl', input.demoUrl)
  body.set('parentName', input.parentName)
  body.set('parentEmail', input.parentEmail)
  body.set('consent', String(input.consent))
  body.set('publicSharing', String(input.publicSharing))
  body.set('childLed', String(input.childLed))
  body.set('termsAccepted', String(input.termsAccepted))
  body.set('website', '')
  if (input.image) body.set('image', input.image)
  const response = await fetch('/api/submissions', {
    method: 'POST',
    body,
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({ error: 'Submission failed' })) as { error?: string }
    throw new Error(result.error || 'Submission failed')
  }
}

export async function submitChallengeIdea(input: ChallengeIdeaInput) {
  const response = await fetch('/api/challenge-ideas', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...input, website: '' }),
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({ error: 'Idea submission failed' })) as { error?: string }
    throw new Error(result.error || 'Idea submission failed')
  }
}

export async function subscribeWeeklyChallenge(email: string, adultConsent: boolean) {
  const response = await fetch('/api/subscribers', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, adultConsent, website: '' }),
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({ error: 'Signup failed' })) as { error?: string }
    throw new Error(result.error || 'Signup failed')
  }
}
