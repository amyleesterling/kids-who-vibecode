import { activeChallenge, seedProjects } from '../data'
import type { CommunitySnapshot, SubmissionInput } from '../types'

const deviceKey = 'vibe-club-device-id'

function getVoterId() {
  const existing = localStorage.getItem(deviceKey)
  if (existing) return existing
  const next = crypto.randomUUID()
  localStorage.setItem(deviceKey, next)
  return next
}

function demoSnapshot(): CommunitySnapshot {
  const stored = localStorage.getItem(`vibe-club-vote:${activeChallenge.id}`)
  const counts = JSON.parse(localStorage.getItem('vibe-club-counts') || '{}') as Record<string, number>
  return { challenge: activeChallenge, projects: seedProjects, voteCounts: counts, myVote: stored, source: 'demo' }
}

export async function loadCommunity(): Promise<CommunitySnapshot> {
  try {
    const response = await fetch(`/api/community?voterId=${encodeURIComponent(getVoterId())}`)
    if (!response.ok) throw new Error('Community API unavailable')
    return await response.json() as CommunitySnapshot
  } catch (error) {
    console.warn('Community database unavailable; using demo data.', error)
    return demoSnapshot()
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
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...input, challengeId, website: '' }),
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({ error: 'Submission failed' })) as { error?: string }
    throw new Error(result.error || 'Submission failed')
  }
}
