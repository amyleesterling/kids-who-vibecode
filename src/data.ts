import type { Challenge } from './types'

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
  eyebrow: 'Small human. Big imagination.',
  prompt: 'Create a little place we can visit. Who lives there? What happens when we tap, click, or press a key?',
  brief: 'Make a tiny interactive world with at least one surprise. It can be a website, game, animation, or something nobody has named yet.',
  opensAt: new Date().toISOString(),
  closesAt: nextSunday(),
  votingOpensAt: nextSunday(),
  votingClosesAt: nextSunday(),
  status: 'active',
  starterIdeas: ['A moon base for cats', 'A garden that sings', 'A city inside a raindrop'],
  tools: ['Scratch', 'HTML + CSS', 'Replit', 'Anything you love'],
}
