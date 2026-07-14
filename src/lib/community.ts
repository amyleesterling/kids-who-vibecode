import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { activeChallenge, seedProjects } from '../data'
import type { Challenge, CommunitySnapshot, Project, SubmissionInput } from '../types'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId)
const app = firebaseReady ? initializeApp(config) : null
const db = app ? getFirestore(app) : null
const auth = app ? getAuth(app) : null

const localVoteKey = (challengeId: string) => `vibe-club-vote:${challengeId}`

async function ensureUser() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  return (await signInAnonymously(auth)).user
}

function asChallenge(id: string, value: Record<string, unknown>): Challenge {
  return { ...activeChallenge, ...value, id } as Challenge
}

function asProject(id: string, value: Record<string, unknown>): Project {
  return { ...value, id, baseVotes: Number(value.baseVotes ?? 0) } as Project
}

export async function loadCommunity(): Promise<CommunitySnapshot> {
  if (!db || !auth) {
    const stored = localStorage.getItem(localVoteKey(activeChallenge.id))
    const localCounts = JSON.parse(localStorage.getItem('vibe-club-counts') || '{}') as Record<string, number>
    return { challenge: activeChallenge, projects: seedProjects, voteCounts: localCounts, myVote: stored, source: 'demo' }
  }

  try {
    const challengeDocs = await getDocs(query(collection(db, 'challenges'), where('status', '==', 'active'), limit(1)))
    const challenge = challengeDocs.empty ? activeChallenge : asChallenge(challengeDocs.docs[0].id, challengeDocs.docs[0].data())
    const projectDocs = await getDocs(query(collection(db, 'projects'), where('challengeId', '==', challenge.id), where('status', '==', 'approved')))
    const projects = projectDocs.empty ? seedProjects : projectDocs.docs.map((item) => asProject(item.id, item.data()))
    const voteDocs = await getDocs(query(collection(db, 'votes'), where('challengeId', '==', challenge.id)))
    const voteCounts: Record<string, number> = {}
    voteDocs.forEach((item) => {
      const projectId = String(item.data().projectId)
      voteCounts[projectId] = (voteCounts[projectId] || 0) + 1
    })
    const user = await ensureUser()
    const myVoteDoc = user ? await getDoc(doc(db, 'votes', `${challenge.id}_${user.uid}`)) : null
    return { challenge, projects, voteCounts, myVote: myVoteDoc?.exists() ? String(myVoteDoc.data().projectId) : null, source: 'firebase' }
  } catch (error) {
    console.warn('Firebase unavailable; using demo data.', error)
    return { challenge: activeChallenge, projects: seedProjects, voteCounts: {}, myVote: null, source: 'demo' }
  }
}

export async function saveVote(challengeId: string, projectId: string, previousVote: string | null) {
  if (!db || !auth) {
    const counts = JSON.parse(localStorage.getItem('vibe-club-counts') || '{}') as Record<string, number>
    if (previousVote && previousVote !== projectId) counts[previousVote] = Math.max(0, (counts[previousVote] || 0) - 1)
    if (previousVote !== projectId) counts[projectId] = (counts[projectId] || 0) + 1
    localStorage.setItem('vibe-club-counts', JSON.stringify(counts))
    localStorage.setItem(localVoteKey(challengeId), projectId)
    return
  }
  const user = await ensureUser()
  if (!user) throw new Error('Could not start a voting session.')
  await setDoc(doc(db, 'votes', `${challengeId}_${user.uid}`), {
    challengeId, projectId, uid: user.uid, updatedAt: serverTimestamp(),
  })
}

export async function submitProject(input: SubmissionInput, challengeId: string) {
  const payload = { ...input, challengeId, status: 'pending', createdAt: new Date().toISOString() }
  if (!db) {
    const submissions = JSON.parse(localStorage.getItem('vibe-club-submissions') || '[]') as unknown[]
    localStorage.setItem('vibe-club-submissions', JSON.stringify([...submissions, payload]))
    return
  }
  await addDoc(collection(db, 'submissions'), { ...payload, createdAt: serverTimestamp() })
}

export { firebaseReady }
