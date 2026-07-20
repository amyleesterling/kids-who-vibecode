import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Code2, Copy, Gamepad2,
  Lightbulb, Palette, Rocket, ShieldCheck, Sparkles, WandSparkles,
} from 'lucide-react'

type ProjectIdea = {
  age: string
  slug: string
  label: string
  title: string
  tagline: string
  time: string
  color: string
  icon: 'palette' | 'game' | 'code' | 'sparkles' | 'rocket'
  make: string
  kidLeads: string[]
  prompt: string
  levelUps: string[]
  more: string[]
}

const ideas: ProjectIdea[] = [
  {
    age: '5–6', slug: 'ages-5-6', label: 'Tiny tinkerers', title: 'The Giggle Button',
    tagline: 'Make one enormous button that creates a new silly surprise every time it is tapped.',
    time: '15–25 min', color: 'coral', icon: 'palette',
    make: 'A one-page toy with a big button. Each tap can change the background, reveal a goofy creature, or show a made-up word.',
    kidLeads: ['Choose what the button looks like', 'Invent three or more surprises', 'Decide which version is funniest'],
    prompt: 'Help us make a very simple, colorful webpage for a young child. Put one huge button in the middle. Every tap should show a different silly surprise: [ADD THE CHILD’S IDEAS]. Use big shapes, very little text, and no links or menus. Ask us one creative question before you build it.',
    levelUps: ['Add a “start over” button', 'Make the button wobble', 'Create a day and night version'],
    more: ['Dress-up potato', 'Animal soundboard', 'Magic color mixer'],
  },
  {
    age: '7–9', slug: 'ages-7-9', label: 'Curious creators', title: 'Alien Pet Maker',
    tagline: 'Mix features, name a creature, and discover what makes it happy.',
    time: '30–45 min', color: 'blue', icon: 'game',
    make: 'A playful pet creator with choices for eyes, color, antennae, and favorite snack—plus a button that introduces the finished alien.',
    kidLeads: ['Draw or describe the pet parts', 'Write the funny introductions', 'Choose every color and label'],
    prompt: 'Build a kid-friendly alien pet maker. Let me choose a body color, number of eyes, antenna style, and favorite snack. Add a button that reveals the pet with a funny introduction. Make it bright, easy to tap, and usable without typing personal information. Use these pet ideas: [ADD THE CHILD’S IDEAS].',
    levelUps: ['Add a randomize button', 'Give each snack a reaction', 'Make a printable pet card'],
    more: ['Joke vending machine', 'Design-a-dinosaur', 'Tiny café menu'],
  },
  {
    age: '10–12', slug: 'ages-10-12', label: 'World builders', title: 'The Mystery Map',
    tagline: 'Explore a strange place, collect clues, and unlock one secret ending.',
    time: '45–90 min', color: 'green', icon: 'code',
    make: 'A small choice-based adventure with four locations, three collectible clues, and a final door that opens only when the clues are found.',
    kidLeads: ['Sketch the map and name each place', 'Write clues and wrong answers', 'Test whether the ending feels fair'],
    prompt: 'Create a one-page mystery map game with four clickable locations: [LIST THE PLACES]. Players collect three clues and then try to open a secret door. Show the clues they have found. Include a reset button and a hint if they get stuck. Keep everything on the device—no accounts, chat, or personal data.',
    levelUps: ['Add two possible endings', 'Create a simple inventory', 'Add keyboard controls'],
    more: ['Creature care simulator', 'Choose-your-path comic', 'Mini escape room'],
  },
  {
    age: '13–15', slug: 'ages-13-15', label: 'Feature inventors', title: 'Mood-to-Music Machine',
    tagline: 'Turn a feeling into a custom color palette, animation, and imaginary playlist.',
    time: '1–2 hours', color: 'yellow', icon: 'sparkles',
    make: 'An interactive generator where a visitor chooses a mood and energy level, then gets a visual “mix” with a name, colors, and animated cover art.',
    kidLeads: ['Define the moods and visual rules', 'Design the cover styles', 'Decide what should be saved or reset'],
    prompt: 'Build a polished mood-to-music generator. Let someone choose a mood and energy level, then create an imaginary playlist title, three-color palette, and animated cover. Do not use a music service or collect data. Include accessible labels, a reset button, and a way to save the cover as an image if that can work entirely in the browser.',
    levelUps: ['Remember the last mix on this device', 'Add shareable color codes', 'Make the motion react to energy'],
    more: ['Personal quiz builder', 'Habit streak garden', 'Interactive fan museum'],
  },
  {
    age: '16–18', slug: 'ages-16-18', label: 'Product shapers', title: 'Local Events Explorer',
    tagline: 'Turn a messy list of public events into a useful, searchable mini-product.',
    time: '2–4 hours', color: 'purple', icon: 'rocket',
    make: 'A responsive explorer built from a small hand-checked dataset. Visitors can filter by category, cost, date, and accessibility needs.',
    kidLeads: ['Choose the audience and useful filters', 'Gather and verify public information', 'Interview one tester and improve the design'],
    prompt: 'Help me build a responsive local events explorer for [AUDIENCE]. Start with sample data in a separate file. Add search and filters for date, category, free/paid, and accessibility. Show an empty state when nothing matches. Do not scrape sites or collect visitor information. Cite each event’s public source and clearly label when details were last checked.',
    levelUps: ['Import a clean CSV file', 'Add a map using a privacy-safe approach', 'Write usability tests and fix the top issue'],
    more: ['Volunteer opportunity finder', 'School club toolkit', 'Public-data story'],
  },
]

const ideaIcons = {
  palette: Palette,
  game: Gamepad2,
  code: Code2,
  sparkles: Sparkles,
  rocket: Rocket,
}

function ProjectIdeasPage() {
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Project Ideas by Age — Vibe Code Club'
    return () => { document.title = previousTitle }
  }, [])

  async function copyPrompt(slug: string, prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(slug)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {
      setCopied('')
    }
  }

  return (
    <div className="ideas-page">
      <header className="ideas-header page-shell">
        <a className="logo" href="/" aria-label="Vibe Code Club home">
          <span className="logo-mark"><span /> <span /> <span /></span>
          <span>VIBE CODE<br /><b>CLUB</b></span>
        </a>
        <a className="button button-light ideas-back" href="/"><ArrowLeft size={17} /> Back to the clubhouse</a>
      </header>

      <main>
        <section className="ideas-hero">
          <div className="page-shell ideas-hero-inner">
            <div className="ideas-hero-copy">
              <span className="kicker">Pick an idea. Make it wonderfully yours.</span>
              <h1>Vibe coding projects for every age.</h1>
              <p>Five playful starting points—with a doable first version, a prompt to borrow, and room for a kid’s imagination to take over.</p>
              <a className="button button-coral" href="#pick-an-age">Find a project <ChevronDown size={18} /></a>
            </div>
            <aside className="ideas-hero-card">
              <span className="ideas-hero-scribble">IDEA ≠ INSTRUCTIONS</span>
              <WandSparkles size={42} />
              <h2>The best project is the one they want to keep changing.</h2>
              <p>Ages are only a rough guide. Start easier, leap ahead, or remix two ideas together.</p>
            </aside>
          </div>
        </section>

        <section id="pick-an-age" className="age-picker page-shell" aria-labelledby="age-picker-title">
          <div><span className="kicker">Jump to a starting point</span><h2 id="age-picker-title">What sounds fun today?</h2></div>
          <nav aria-label="Project age groups">
            {ideas.map((idea) => <a href={`#${idea.slug}`} key={idea.slug}><b>{idea.age}</b><span>{idea.label}</span></a>)}
          </nav>
        </section>

        <section className="ideas-list">
          {ideas.map((idea, index) => {
            const Icon = ideaIcons[idea.icon]
            return (
              <article id={idea.slug} className={`idea-band idea-${idea.color}`} key={idea.slug}>
                <div className="page-shell idea-band-inner">
                  <div className="idea-band-lead">
                    <div className="idea-age-stamp"><small>AGES</small><b>{idea.age}</b></div>
                    <span className="idea-number">PROJECT {String(index + 1).padStart(2, '0')}</span>
                    <span className="idea-icon"><Icon /></span>
                    <h2>{idea.title}</h2>
                    <p className="idea-tagline">{idea.tagline}</p>
                    <span className="idea-time"><Clock3 size={15} /> A first version: {idea.time}</span>
                  </div>

                  <div className="idea-band-details">
                    <section className="idea-brief">
                      <span className="idea-detail-label">WHAT TO MAKE</span>
                      <p>{idea.make}</p>
                    </section>
                    <section className="kid-leads-card">
                      <span className="idea-detail-label">THE KID LEADS</span>
                      <ul>{idea.kidLeads.map((item) => <li key={item}><Check size={16} /> {item}</li>)}</ul>
                    </section>
                    <section className="idea-prompt-card">
                      <div><span><Lightbulb size={17} /> STARTER PROMPT</span><button onClick={() => copyPrompt(idea.slug, idea.prompt)} aria-label={`Copy the ${idea.title} starter prompt`}><Copy size={15} /> {copied === idea.slug ? 'Copied!' : 'Copy'}</button></div>
                      <p>{idea.prompt}</p>
                    </section>
                    <div className="idea-extras">
                      <section><span className="idea-detail-label">LEVEL IT UP</span><ul>{idea.levelUps.map((item) => <li key={item}>{item}</li>)}</ul></section>
                      <section><span className="idea-detail-label">TRY THIS TOO</span><ul>{idea.more.map((item) => <li key={item}>{item}</li>)}</ul></section>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="ideas-grownup page-shell">
          <div className="ideas-grownup-icon"><ShieldCheck /></div>
          <div><span className="kicker">The useful grown-up role</span><h2>Hold the guardrails. Hand over the creative controls.</h2><p>Manage accounts, privacy, payments, and publishing. Let the kid choose the idea, make the weird decisions, test the result, and decide what to change next.</p></div>
          <a className="button button-dark" href="/getting-started">Read the parent guide <ArrowRight size={17} /></a>
        </section>

        <section className="ideas-final">
          <div className="page-shell"><span className="ideas-final-burst"><Sparkles /></span><div><small>ONE LAST RULE</small><h2>Stop while it’s still fun.</h2><p>A tiny finished experiment beats a giant abandoned plan. You can always come back and add one more delight.</p></div><a className="button button-coral" href="/#challenge">See this week’s challenge <ArrowRight size={18} /></a></div>
        </section>
      </main>

      <footer className="legal-footer"><div className="page-shell"><p>Made for curious kids and the grown-ups learning beside them.</p><a href="/">Return to vibecodekids.com</a></div></footer>
    </div>
  )
}

export default ProjectIdeasPage
