export type Challenge = {
  id: string
  weekLabel: string
  title: string
  eyebrow: string
  prompt: string
  brief: string
  closesAt: string
  status: 'active' | 'upcoming' | 'closed'
  starterIdeas: string[]
  tools: string[]
}

export type Project = {
  id: string
  challengeId: string
  title: string
  builder: string
  ageBand: string
  description: string
  repoUrl?: string
  demoUrl?: string
  baseVotes: number
  scene: 'space' | 'garden' | 'ocean' | 'monster'
  accent: string
}

export type SubmissionInput = {
  childNickname: string
  ageBand: string
  projectTitle: string
  description: string
  repoUrl: string
  demoUrl: string
  parentName: string
  parentEmail: string
  consent: boolean
  publicSharing: boolean
}

export type CommunitySnapshot = {
  challenge: Challenge
  projects: Project[]
  voteCounts: Record<string, number>
  myVote: string | null
  source: 'database' | 'demo'
}
