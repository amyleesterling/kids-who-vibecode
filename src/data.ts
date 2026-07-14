import type { Challenge, Project } from './types'

const nextSunday = () => {
  const date = new Date()
  const daysUntilSunday = (7 - date.getDay()) % 7 || 7
  date.setDate(date.getDate() + daysUntilSunday)
  date.setHours(20, 0, 0, 0)
  return date.toISOString()
}

export const activeChallenge: Challenge = {
  id: 'tiny-worlds',
  weekLabel: 'Challenge 01 · This week',
  title: 'Build a tiny world',
  eyebrow: 'Small screen. Big imagination.',
  prompt: 'Create a little place we can visit. Who lives there? What happens when we tap, click, or press a key?',
  brief: 'Make a tiny interactive world with at least one surprise. It can be a website, game, animation, or something nobody has named yet.',
  closesAt: nextSunday(),
  status: 'active',
  starterIdeas: ['A moon base for cats', 'A garden that sings', 'A city inside a raindrop'],
  tools: ['Scratch', 'HTML + CSS', 'Replit', 'Anything you love'],
}

export const seedProjects: Project[] = [
  {
    id: 'mossy-moon', challengeId: 'tiny-worlds', title: 'Mossy Moon', builder: 'PixelPanda', ageBand: '7–9',
    description: 'Grow glowing space plants and wake up the moon bugs.', repoUrl: 'https://github.com/', baseVotes: 18, scene: 'space', accent: '#b9f44a',
  },
  {
    id: 'bubble-town', challengeId: 'tiny-worlds', title: 'Bubble Town', builder: 'RainbowRex', ageBand: '5–6',
    description: 'A whole town where every building can float away.', demoUrl: '#', baseVotes: 14, scene: 'ocean', accent: '#65d9ff',
  },
  {
    id: 'snack-forest', challengeId: 'tiny-worlds', title: 'The Snack Forest', builder: 'CodeKoala', ageBand: '7–9',
    description: 'Help a tiny monster find the legendary golden toast.', repoUrl: 'https://github.com/', baseVotes: 11, scene: 'garden', accent: '#ffb3c7',
  },
  {
    id: 'monster-disco', challengeId: 'tiny-worlds', title: 'Monster Disco', builder: 'BugBunny', ageBand: '5–6',
    description: 'Tap the beat and give every monster a silly dance.', demoUrl: '#', baseVotes: 9, scene: 'monster', accent: '#ffcb45',
  },
]

export const upcomingChallenges = [
  { number: '02', title: 'Make it musical', hint: 'Build something that blips, bloops, sings, or stomps.', color: '#65d9ff' },
  { number: '03', title: 'Invent a creature', hint: 'Give it a home, a personality, and one very odd talent.', color: '#ffb3c7' },
  { number: '04', title: 'Helpful little robot', hint: 'What tiny problem could your robot solve?', color: '#b9f44a' },
]
