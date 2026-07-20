import { useEffect, useMemo, useState } from 'react'
import type { ComponentType, CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, Check, Gamepad2, RotateCcw, Sparkles } from 'lucide-react'

const demos = {
  'cloud-catcher': { age: '5–6', title: 'Cloud Catcher', color: '#ffb3c7' },
  'alien-snack-dash': { age: '7–9', title: 'Alien Snack Dash', color: '#65d9ff' },
  'mystery-map': { age: '10–12', title: 'Mystery Map', color: '#b9f44a' },
  'vibe-shift': { age: '13–15', title: 'Vibe Shift', color: '#ffd84d' },
  'signal-lost': { age: '16–18', title: 'Signal Lost', color: '#d6b8ff' },
} as const

type DemoSlug = keyof typeof demos

function CloudCatcher() {
  const [basket, setBasket] = useState(50)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const clouds = useMemo(() => [
    { x: 15, happy: true, face: '☁️' }, { x: 36, happy: true, face: '☁️' },
    { x: 59, happy: false, face: '🌧️' }, { x: 82, happy: true, face: '☁️' },
  ], [])
  const move = (amount: number) => setBasket((value) => Math.max(8, Math.min(92, value + amount)))
  const catchCloud = (x: number, happy: boolean) => {
    setBasket(x)
    if (happy) setScore((value) => value + 1)
    setRound((value) => value + 1)
  }
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') move(-10)
      if (event.key === 'ArrowRight') move(10)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  return <div className="cloud-demo demo-board">
    <div className="demo-score">Clouds caught: <b>{score}</b></div>
    <div className="cloud-row">{clouds.map((cloud, index) => <button key={`${round}-${index}`} style={{ left: `${cloud.x}%` }} onClick={() => catchCloud(cloud.x, cloud.happy)} aria-label={cloud.happy ? 'Catch smiling cloud' : 'Avoid raincloud'}>{cloud.face}</button>)}</div>
    <div className="catcher-basket" style={{ left: `${basket}%` }}>🧺</div>
    <div className="demo-controls"><button onClick={() => move(-12)}>← Move left</button><button onClick={() => move(12)}>Move right →</button></div>
    <p>Move the basket, then tap a smiling cloud. Avoid the raincloud!</p>
  </div>
}

const snackCells = [2, 12, 18, 21]
function AlienSnackDash() {
  const [position, setPosition] = useState(0)
  const [snacks, setSnacks] = useState<number[]>(snackCells)
  const won = position === 24 && snacks.length === 0
  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPosition((current) => {
      const row = Math.floor(current / 5), column = current % 5
      const next = direction === 'up' && row > 0 ? current - 5 : direction === 'down' && row < 4 ? current + 5 : direction === 'left' && column > 0 ? current - 1 : direction === 'right' && column < 4 ? current + 1 : current
      setSnacks((items) => items.filter((item) => item !== next))
      return next
    })
  }
  const reset = () => { setPosition(0); setSnacks(snackCells) }
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const directions: Record<string, 'up' | 'down' | 'left' | 'right'> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
      if (directions[event.key]) { event.preventDefault(); move(directions[event.key]) }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  return <div className="alien-demo demo-board">
    <div className="demo-score">Snacks left: <b>{snacks.length}</b> · Ship: 🚀</div>
    <div className="alien-grid">{Array.from({ length: 25 }, (_, cell) => <span key={cell} className={cell === 24 ? 'ship-cell' : ''}>{cell === position ? '👽' : snacks.includes(cell) ? '🍕' : cell === 24 ? '🚀' : ''}</span>)}</div>
    {won ? <div className="demo-win"><Check /> Snack mission complete!</div> : <div className="direction-pad"><button onClick={() => move('up')}>↑</button><button onClick={() => move('left')}>←</button><button onClick={() => move('down')}>↓</button><button onClick={() => move('right')}>→</button></div>}
    <button className="demo-reset" onClick={reset}><RotateCcw size={15} /> Reset</button>
  </div>
}

function MysteryMap() {
  const rooms = [
    { name: 'Whispering Woods', clue: 'A silver feather', icon: '🌲' },
    { name: 'Moonlit Lake', clue: 'A moon-shaped key', icon: '🌙' },
    { name: 'Clockwork Cave', clue: 'The number 3', icon: '⚙️' },
    { name: 'Secret Door', clue: '', icon: '🚪' },
  ]
  const [clues, setClues] = useState<string[]>([])
  const [message, setMessage] = useState('Choose a place to explore.')
  const visit = (room: typeof rooms[number]) => {
    if (!room.clue) { setMessage(clues.length === 3 ? 'The three clues glow. The secret door swings open!' : `The door needs ${3 - clues.length} more clue${3 - clues.length === 1 ? '' : 's'}.`); return }
    setClues((items) => items.includes(room.clue) ? items : [...items, room.clue])
    setMessage(`You found ${room.clue}!`)
  }
  return <div className="map-demo demo-board">
    <div className="map-rooms">{rooms.map((room) => <button key={room.name} onClick={() => visit(room)}><span>{room.icon}</span><b>{room.name}</b></button>)}</div>
    <div className="map-message" role="status">{message}</div>
    <div className="clue-tray"><b>Clues</b>{clues.length ? clues.map((clue) => <span key={clue}>{clue}</span>) : <span>Nothing yet…</span>}</div>
    <button className="demo-reset" onClick={() => { setClues([]); setMessage('Choose a place to explore.') }}><RotateCcw size={15} /> Reset mystery</button>
  </div>
}

const vibes = [
  { name: 'Calm', color: '#65d9ff', symbol: '●' },
  { name: 'Electric', color: '#ffd84d', symbol: '▲' },
  { name: 'Wild', color: '#ff6d65', symbol: '◆' },
]
function VibeShift() {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [feedback, setFeedback] = useState('Match the incoming shape to its vibe.')
  const current = vibes[(round * 7 + 1) % vibes.length]
  const choose = (name: string) => {
    const correct = name === current.name
    setScore((value) => value + (correct ? 10 + combo * 2 : 0))
    setCombo((value) => correct ? value + 1 : 0)
    setFeedback(correct ? 'Perfect match!' : `That shape was ${current.name}.`)
    setRound((value) => value + 1)
  }
  return <div className="vibe-demo demo-board">
    <div className="vibe-score"><span>Score <b>{score}</b></span><span>Combo <b>{combo}</b></span></div>
    <div className="incoming-vibe" style={{ color: current.color }}>{current.symbol}</div>
    <p role="status">{feedback}</p>
    <div className="vibe-buttons">{vibes.map((vibe) => <button key={vibe.name} style={{ background: vibe.color }} onClick={() => choose(vibe.name)}>{vibe.name}</button>)}</div>
    <button className="demo-reset" onClick={() => { setRound(0); setScore(0); setCombo(0); setFeedback('Match the incoming shape to its vibe.') }}><RotateCcw size={15} /> Reset</button>
  </div>
}

const stationEvents = [
  { title: 'Solar storm incoming', choices: [{ label: 'Shield the lab', effect: [-2, 1, 0, 1] }, { label: 'Keep transmitting', effect: [-1, 2, -1, -1] }] },
  { title: 'A supply drone is lost', choices: [{ label: 'Launch a search', effect: [-1, 0, 2, 1] }, { label: 'Ration supplies', effect: [0, 0, 1, -2] }] },
  { title: 'A strange signal appears', choices: [{ label: 'Study it', effect: [-1, 2, 0, 1] }, { label: 'Ignore it', effect: [1, -1, 0, 0] }] },
  { title: 'The greenhouse is thriving', choices: [{ label: 'Share the harvest', effect: [0, 0, 2, 2] }, { label: 'Store everything', effect: [0, 0, 3, -1] }] },
  { title: 'The crew wants a festival', choices: [{ label: 'Celebrate', effect: [-1, 0, -1, 3] }, { label: 'Stay focused', effect: [1, 1, 0, -2] }] },
  { title: 'Final transmission window', choices: [{ label: 'Send the research', effect: [-2, 3, 0, 1] }, { label: 'Protect the station', effect: [2, -1, 1, 0] }] },
]
function SignalLost() {
  const [turn, setTurn] = useState(0)
  const [resources, setResources] = useState([5, 3, 5, 5])
  const labels = ['Power', 'Signal', 'Supplies', 'Morale']
  const finished = turn >= stationEvents.length || resources.some((value) => value <= 0)
  const choose = (effect: number[]) => { setResources((values) => values.map((value, index) => Math.max(0, Math.min(9, value + effect[index])))); setTurn((value) => value + 1) }
  const reset = () => { setTurn(0); setResources([5, 3, 5, 5]) }
  return <div className="signal-demo demo-board">
    <div className="resource-grid">{labels.map((label, index) => <div key={label}><span>{label}</span><b>{resources[index]}</b><i><em style={{ width: `${resources[index] * 10}%` }} /></i></div>)}</div>
    {finished ? <div className="signal-ending"><Sparkles /><h3>{resources.some((value) => value <= 0) ? 'Station offline' : 'Research delivered!'}</h3><p>{resources.some((value) => value <= 0) ? 'One resource reached zero. Try a different strategy.' : 'Your crew made it through all six events.'}</p></div> : <div className="station-event"><small>TURN {turn + 1} OF 6</small><h3>{stationEvents[turn].title}</h3><div>{stationEvents[turn].choices.map((choice) => <button key={choice.label} onClick={() => choose(choice.effect)}>{choice.label} <ArrowRight size={15} /></button>)}</div></div>}
    <button className="demo-reset" onClick={reset}><RotateCcw size={15} /> Start over</button>
  </div>
}

const components: Record<DemoSlug, ComponentType> = {
  'cloud-catcher': CloudCatcher,
  'alien-snack-dash': AlienSnackDash,
  'mystery-map': MysteryMap,
  'vibe-shift': VibeShift,
  'signal-lost': SignalLost,
}

function ProjectDemoPage() {
  const slug = window.location.pathname.split('/').filter(Boolean).pop() as DemoSlug
  const demo = demos[slug] || demos['cloud-catcher']
  const Demo = components[slug] || CloudCatcher
  useEffect(() => { document.title = `${demo.title} Demo — Vibe Code Kids` }, [demo.title])
  return <div className="project-demo-page" style={{ '--demo-accent': demo.color } as CSSProperties}>
    <header className="demo-page-header page-shell"><a href="/project-ideas"><ArrowLeft size={17} /> All project ideas</a><span><Gamepad2 size={16} /> PLAYABLE DEMO</span><a href={`/submit?idea=${encodeURIComponent(demo.title)}&age=${encodeURIComponent(demo.age)}`}>Submit your version <ArrowRight size={16} /></a></header>
    <main className="page-shell demo-page-main">
      <div className="demo-page-title"><span className="kicker">Ages {demo.age} · remix this idea</span><h1>{demo.title}</h1><p>Play the tiny version. Then borrow the prompt, change the rules, and make it yours.</p></div>
      <Demo />
      <div className="demo-next-actions"><a className="button button-coral" href={`/submit?idea=${encodeURIComponent(demo.title)}&age=${encodeURIComponent(demo.age)}`}>I made my own version <ArrowRight size={17} /></a><a className="button button-light" href="/project-ideas">Choose another idea</a></div>
    </main>
  </div>
}

export default ProjectDemoPage
