export type Challenge = {
  id: string
  weekLabel: string
  title: string
  eyebrow: string
  prompt: string
  brief: string
  opensAt: string
  closesAt: string
  votingOpensAt: string
  votingClosesAt: string
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
  countryCode?: string
  description: string
  repoUrl?: string
  demoUrl?: string
  imageUrl?: string | null
  baseVotes: number
  scene: 'space' | 'garden' | 'ocean' | 'monster'
  accent: string
}

export type SubmissionInput = {
  childNickname: string
  ageBand: string
  countryCode: string
  projectTitle: string
  description: string
  repoUrl: string
  demoUrl: string
  parentName: string
  parentEmail: string
  consent: boolean
  publicSharing: boolean
  childLed: boolean
  termsAccepted: boolean
  image: File | null
}

export type ChallengeIdeaInput = {
  ideaTitle: string
  ideaPrompt: string
  starterSpark: string
  creatorNickname: string
  creatorGroup: string
  grownupEmail: string
  consent: boolean
  termsAccepted: boolean
}

export type CommunitySnapshot = {
  challenge: Challenge
  projects: Project[]
  voteCounts: Record<string, number>
  myVote: string | null
  galleryChallenge: Pick<Challenge, 'id' | 'weekLabel' | 'title' | 'votingOpensAt' | 'votingClosesAt'> | null
  votingOpen: boolean
  acceptingSubmissions: boolean
  upcomingChallenges: Array<Pick<Challenge, 'weekLabel' | 'opensAt'>>
  source: 'database' | 'offline'
}

export type FavoriteProject = {
  projectId: string
  rank: number
  title: string
  builder: string
  ageBand: string
  countryCode?: string
  description: string
  repoUrl?: string
  demoUrl?: string
  imageUrl?: string | null
  votes: number
}

export type FavoriteChallenge = {
  challengeId: string
  weekLabel: string
  challengeTitle: string
  votingClosedAt: string
  podium: FavoriteProject[]
}

export type FavoritesSnapshot = {
  challenges: FavoriteChallenge[]
  nextRevealAt: string | null
}
