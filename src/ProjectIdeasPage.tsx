import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, BookOpen, Brush, Check, ChevronDown, Clock3, Code2, Copy, Gamepad2,
  ExternalLink, Image as ImageIcon, Images, Lightbulb, MapPin, Palette, Rocket, Send, ShieldCheck, Sparkles, Users, WandSparkles,
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
  gamePrompt: { title: string; concept: string; prompt: string }
  demoSlug: string
  levelUps: string[]
  more: { title: string; type: string; description: string }[]
}

const ideas: ProjectIdea[] = [
  {
    age: '5–6', slug: 'ages-5-6', label: 'Tiny tinkerers', title: 'The Giggle Button',
    tagline: 'Make one enormous button that creates a new silly surprise every time it is tapped.',
    time: '15–25 min', color: 'coral', icon: 'palette',
    make: 'A one-page toy with a big button. Each tap can change the background, reveal a goofy creature, or show a made-up word.',
    kidLeads: ['Choose what the button looks like', 'Invent three or more surprises', 'Decide which version is funniest'],
    prompt: 'Help us make a very simple, colorful webpage for a young child. Put one huge button in the middle. Every tap should show a different silly surprise: [ADD THE CHILD’S IDEAS]. Use big shapes, very little text, and no links or menus. Ask us one creative question before you build it.',
    gamePrompt: { title: 'Cloud Catcher', concept: 'Move one basket left and right to catch smiling clouds while avoiding the grumpy raincloud.', prompt: 'Make a very simple game for a young child called Cloud Catcher. The player moves one large basket left and right with big on-screen buttons. Smiling clouds fall slowly and earn one point when caught. A grumpy raincloud ends the round. Use large shapes, no reading during play, gentle motion, and a restart button.' },
    demoSlug: 'cloud-catcher',
    levelUps: ['Add a “start over” button', 'Make the button wobble', 'Create a day and night version'],
    more: [
      { title: 'Dress-Up Potato', type: 'Interactive toy', description: 'Tap hats, shoes, faces, and costumes to style one extremely fashionable potato.' },
      { title: 'Animal Soundboard', type: 'Sound + buttons', description: 'Build a board of big animal buttons with sounds chosen or recorded by a grown-up.' },
      { title: 'Magic Color Mixer', type: 'Art experiment', description: 'Choose two colors, stir them together, and reveal a creature that matches the new color.' },
    ],
  },
  {
    age: '7–9', slug: 'ages-7-9', label: 'Curious creators', title: 'Alien Pet Maker',
    tagline: 'Mix features, name a creature, and discover what makes it happy.',
    time: '30–45 min', color: 'blue', icon: 'game',
    make: 'A playful pet creator with choices for eyes, color, antennae, and favorite snack—plus a button that introduces the finished alien.',
    kidLeads: ['Draw or describe the pet parts', 'Write the funny introductions', 'Choose every color and label'],
    prompt: 'Build a kid-friendly alien pet maker. Let me choose a body color, number of eyes, antenna style, and favorite snack. Add a button that reveals the pet with a funny introduction. Make it bright, easy to tap, and usable without typing personal information. Use these pet ideas: [ADD THE CHILD’S IDEAS].',
    gamePrompt: { title: 'Alien Snack Dash', concept: 'Guide an alien through a tiny maze to collect its favorite snacks before the timer runs out.', prompt: 'Build a colorful maze game called Alien Snack Dash. Let the player choose one alien, move with arrow keys or large touch controls, collect five funny snacks, and reach the spaceship before a gentle timer ends. Include one easy level, a score, a restart button, and a celebratory ending. No accounts, chat, or personal information.' },
    demoSlug: 'alien-snack-dash',
    levelUps: ['Add a randomize button', 'Give each snack a reaction', 'Make a printable pet card'],
    more: [
      { title: 'Joke Vending Machine', type: 'Comedy machine', description: 'Press a chunky vending-machine button to receive a joke, riddle, or absurd fortune.' },
      { title: 'Design-a-Dinosaur', type: 'Character creator', description: 'Combine a head, tail, pattern, habitat, and snack to invent a brand-new dinosaur.' },
      { title: 'Tiny Café Menu', type: 'Pretend-play page', description: 'Create a clickable menu of impossible snacks, then total a customer’s silly order.' },
    ],
  },
  {
    age: '10–12', slug: 'ages-10-12', label: 'World builders', title: 'The Mystery Map',
    tagline: 'Explore a strange place, collect clues, and unlock one secret ending.',
    time: '45–90 min', color: 'green', icon: 'code',
    make: 'A small choice-based adventure with four locations, three collectible clues, and a final door that opens only when the clues are found.',
    kidLeads: ['Sketch the map and name each place', 'Write clues and wrong answers', 'Test whether the ending feels fair'],
    prompt: 'Create a one-page mystery map game with four clickable locations: [LIST THE PLACES]. Players collect three clues and then try to open a secret door. Show the clues they have found. Include a reset button and a hint if they get stuck. Keep everything on the device—no accounts, chat, or personal data.',
    gamePrompt: { title: 'Mystery Map', concept: 'Explore four locations, collect three clues, and use them to unlock a secret ending.', prompt: 'Create a one-page mystery map game with four clickable locations: [LIST THE PLACES]. Players collect three clues and then try to open a secret door. Show the clues they have found. Add a fair hint, two funny wrong answers, keyboard and touch support, and a complete reset button.' },
    demoSlug: 'mystery-map',
    levelUps: ['Add two possible endings', 'Create a simple inventory', 'Add keyboard controls'],
    more: [
      { title: 'Creature Care Simulator', type: 'Simulation', description: 'Balance a tiny creature’s snacks, sleep, play, and mysterious magical needs.' },
      { title: 'Choose-Your-Path Comic', type: 'Interactive story', description: 'Turn drawings or generated scenes into a branching comic with multiple endings.' },
      { title: 'Mini Escape Room', type: 'Puzzle game', description: 'Hide three clues in one illustrated room and make a final lock that checks the answer.' },
    ],
  },
  {
    age: '13–15', slug: 'ages-13-15', label: 'Feature inventors', title: 'Mood-to-Music Machine',
    tagline: 'Turn a feeling into a custom color palette, animation, and imaginary playlist.',
    time: '1–2 hours', color: 'yellow', icon: 'sparkles',
    make: 'An interactive generator where a visitor chooses a mood and energy level, then gets a visual “mix” with a name, colors, and animated cover art.',
    kidLeads: ['Define the moods and visual rules', 'Design the cover styles', 'Decide what should be saved or reset'],
    prompt: 'Build a polished mood-to-music generator. Let someone choose a mood and energy level, then create an imaginary playlist title, three-color palette, and animated cover. Do not use a music service or collect data. Include accessible labels, a reset button, and a way to save the cover as an image if that can work entirely in the browser.',
    gamePrompt: { title: 'Vibe Shift', concept: 'Match incoming shapes to the right mood, color, and rhythm as the game gradually changes speed.', prompt: 'Design a polished browser game called Vibe Shift. Colored shapes arrive in a rhythm and the player sorts each one into the matching mood zone. Create three short levels, a combo meter, clear keyboard and touch controls, reduced-motion support, and an end screen showing accuracy. Use original visual assets and no external music.' },
    demoSlug: 'vibe-shift',
    levelUps: ['Remember the last mix on this device', 'Add shareable color codes', 'Make the motion react to energy'],
    more: [
      { title: 'Personal Quiz Builder', type: 'Quiz tool', description: 'Write questions, outcomes, and scoring rules for a quiz about any delightfully niche topic.' },
      { title: 'Habit Streak Garden', type: 'Local tracker', description: 'Grow a private, device-only garden as small daily habits are checked off.' },
      { title: 'Interactive Fan Museum', type: 'Digital exhibit', description: 'Curate a spoiler-aware gallery about a favorite fictional world, with sources and sections.' },
    ],
  },
  {
    age: '16–18', slug: 'ages-16-18', label: 'Product shapers', title: 'Local Events Explorer',
    tagline: 'Turn a messy list of public events into a useful, searchable mini-product.',
    time: '2–4 hours', color: 'purple', icon: 'rocket',
    make: 'A responsive explorer built from a small hand-checked dataset. Visitors can filter by category, cost, date, and accessibility needs.',
    kidLeads: ['Choose the audience and useful filters', 'Gather and verify public information', 'Interview one tester and improve the design'],
    prompt: 'Help me build a responsive local events explorer for [AUDIENCE]. Start with sample data in a separate file. Add search and filters for date, category, free/paid, and accessibility. Show an empty state when nothing matches. Do not scrape sites or collect visitor information. Cite each event’s public source and clearly label when details were last checked.',
    gamePrompt: { title: 'Signal Lost', concept: 'Run a remote research station by balancing power, communication, supplies, and crew morale through unexpected events.', prompt: 'Build a strategy game called Signal Lost. The player manages a remote research station for twelve turns with four resources: power, signal, supplies, and morale. Each turn presents an original event with two meaningful choices and visible consequences. Include multiple endings, accessible controls, an in-game explanation of every rule, deterministic tests for the resource logic, and a full reset. Store progress only on the device.' },
    demoSlug: 'signal-lost',
    levelUps: ['Import a clean CSV file', 'Add a map using a privacy-safe approach', 'Write usability tests and fix the top issue'],
    more: [
      { title: 'Volunteer Opportunity Finder', type: 'Community tool', description: 'Organize verified public opportunities by interest, schedule, age requirement, and location.' },
      { title: 'School Club Toolkit', type: 'Productivity app', description: 'Create a private agenda, role picker, decision log, and meeting timer for a student club.' },
      { title: 'Public-Data Story', type: 'Data visualization', description: 'Turn one trustworthy open dataset into a clear visual argument with sources and caveats.' },
    ],
  },
]

const ideaIcons = {
  palette: Palette,
  game: Gamepad2,
  code: Code2,
  sparkles: Sparkles,
  rocket: Rocket,
}

const visualIdeas = [
  {
    age: 'AGES 5–7', title: 'Silly Creature Sticker Sheet', icon: Brush,
    generate: 'Invent one creature, then make six transparent-background stickers showing it sleepy, dancing, muddy, surprised, upside down, and wearing a giant hat.',
    build: 'Turn the stickers into a tap-to-dress character or a digital sticker book.',
    prompt: 'Create a child-friendly sticker sheet of the same [DESCRIBE CREATURE] in six funny poses. Keep the character design consistent. Use bold shapes, a thick white sticker border, no words, and a transparent background.',
  },
  {
    age: 'AGES 7–10', title: 'Three-Page Picture Portal', icon: BookOpen,
    generate: 'Create a hero, a strange doorway, and three connected places in one consistent picture-book style.',
    build: 'Make a click-through story where each scene has one choice and one tiny animation.',
    prompt: 'Design a warm picture-book character named [NAME]. First make a character reference image, then create three landscape scenes with that exact character visiting [LIST THREE PLACES]. No text inside the images.',
  },
  {
    age: 'AGES 10–13', title: 'Museum of Impossible Objects', icon: Images,
    generate: 'Make a collection of artifacts that could not exist: bottled thunderstorms, fossilized jokes, moon seeds, or your own inventions.',
    build: 'Curate them into a museum webpage with exhibit labels, rooms, and a secret object.',
    prompt: 'Create a museum catalog image of [IMPOSSIBLE OBJECT] on a simple display plinth. Use the same lighting, background, camera angle, and visual style for every object. Do not add labels or text to the image.',
  },
  {
    age: 'AGES 13–18', title: 'Cover Art Remix Lab', icon: ImageIcon,
    generate: 'Direct three radically different covers for an imaginary game, album, podcast, or novel.',
    build: 'Create a comparison tool where visitors change the title, palette, mood, and layout—then choose a final direction.',
    prompt: 'Create cover art for an imaginary [GAME / ALBUM / PODCAST / NOVEL] called [TITLE]. The mood is [MOOD]. Leave a calm, high-contrast area for us to add the title later. Do not render any words or logos.',
  },
]

const realKidExamples = [
  { title: 'Sweet Creation Paradise', team: 'Candy Creators', location: 'Amsterdam, Netherlands', description: 'A game where kids design and build their own imaginary sweet treats.' },
  { title: 'Sport Origins Explorer', team: 'Sports Historians', location: 'London, UK', description: 'An educational explorer about the history and origins of sports around the world.' },
  { title: 'Rainbow Cuddle Shop', team: 'Cuddle Squad', location: 'Rotterdam, Netherlands', description: 'A playful shop experience for designing and customizing stuffed animals.' },
  { title: 'Comic Fantasy Generator', team: 'Comic Creators', location: 'Brussels, Belgium', description: 'A creative tool for making original fantasy comic strips and stories.' },
  { title: 'Word Web Weaver Puzzles', team: 'Word Wizards', location: 'Paris, France', description: 'A collection of word puzzles and vocabulary games.' },
]

const kidsHackathonUrl = 'https://www.kidsaicoding.com/sample-projects'

const categories = ['All', 'Games', 'Art & images', 'Stories', 'Useful tools'] as const
type Category = typeof categories[number]

function categoryForType(type: string): Category {
  if (/story|comic|museum|exhibit/i.test(type)) return 'Stories'
  if (/art|character|sound|pretend/i.test(type)) return 'Art & images'
  if (/tool|tracker|productivity|data|community/i.test(type)) return 'Useful tools'
  return 'Games'
}

function ageBandAnchor(age: string) {
  const youngest = Number(age.match(/\d+/)?.[0] || 10)
  if (youngest <= 6) return 'ages-5-6'
  if (youngest <= 9) return 'ages-7-9'
  if (youngest <= 12) return 'ages-10-12'
  if (youngest <= 15) return 'ages-13-15'
  return 'ages-16-18'
}

const catalogProjects = [
  ...ideas.map((idea) => ({ title: idea.gamePrompt.title, age: idea.age, category: 'Games' as Category, summary: idea.gamePrompt.concept, prompt: idea.gamePrompt.prompt, demo: `/project-demos/${idea.demoSlug}` })),
  ...visualIdeas.map((idea) => ({ title: idea.title, age: idea.age.replace('AGES ', ''), category: 'Art & images' as Category, summary: idea.build, prompt: idea.prompt, demo: '' })),
  ...ideas.flatMap((idea) => idea.more.map((project) => ({ title: project.title, age: idea.age, category: categoryForType(project.type), summary: project.description, prompt: `Help me build ${project.title}, a kid-led ${project.type.toLowerCase()}. ${project.description} Start with one small working version, use clear touch-friendly controls, add a complete reset, and do not collect personal information. Ask me three creative questions before building.`, demo: '' }))),
  { title: 'Local Events Explorer', age: '16–18', category: 'Useful tools' as Category, summary: 'Filter a small, verified collection of public events by date, cost, and accessibility.', prompt: 'Build a responsive local events explorer from a small hand-checked data file. Add search and filters for date, category, cost, and accessibility. Cite each event source, show when details were checked, and do not collect visitor information.', demo: '' },
]

function ProjectIdeasPage() {
  const [copied, setCopied] = useState('')
  const [category, setCategory] = useState<Category>('All')

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
              <p>Code a game, direct an image collection, tell a story, explore data, or invent something new. Every starting point has a doable first version and room for a kid’s imagination to take over.</p>
              <div className="ideas-hero-actions"><a className="button button-coral" href="#browse-ideas">Find a project <ChevronDown size={18} /></a><a className="button button-dark" href="/submit">Submit your project <Send size={17} /></a></div>
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

        <section id="browse-ideas" className="idea-browser page-shell">
          <div className="idea-browser-heading"><div><span className="kicker">Browse by what you want to make</span><h2>Pick a direction.</h2></div><p>{catalogProjects.length} starting points · five playable demos</p></div>
          <div className="idea-filter" role="group" aria-label="Filter project ideas">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div>
          <div className="idea-catalog-grid">{catalogProjects.filter((project) => category === 'All' || project.category === category).map((project) => <article key={project.title}>
            <div><span>{project.category}</span><b>Ages {project.age}</b></div><h3>{project.title}</h3><p>{project.summary}</p>
            <div className="catalog-actions"><button onClick={() => copyPrompt(`catalog-${project.title}`, project.prompt)}><Copy size={14} /> {copied === `catalog-${project.title}` ? 'Copied!' : 'Copy prompt'}</button>{project.demo ? <a href={project.demo}><Gamepad2 size={14} /> Play demo</a> : <a href={`#${ageBandAnchor(project.age)}`}>Age guide</a>}<a href={`/submit?idea=${encodeURIComponent(project.title)}&age=${encodeURIComponent(project.age)}`}>Submit <ArrowRight size={14} /></a></div>
          </article>)}</div>
          <p className="idea-browser-safety"><ShieldCheck size={16} /> Keep full names, faces, schools, locations, and identifying details out of prompts and projects.</p>
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
                    <a className="button button-dark idea-demo-link" href={`/project-demos/${idea.demoSlug}`}><Gamepad2 size={17} /> Play the demo</a>
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
                    <section className="game-prompt-card">
                      <div className="game-prompt-heading"><span><Gamepad2 size={18} /> GAME DESIGN PROMPT</span><button onClick={() => copyPrompt(`${idea.slug}-game`, idea.gamePrompt.prompt)} aria-label={`Copy the ${idea.gamePrompt.title} game prompt`}><Copy size={15} /> {copied === `${idea.slug}-game` ? 'Copied!' : 'Copy'}</button></div>
                      <div><small>{idea.gamePrompt.title}</small><p>{idea.gamePrompt.concept}</p><blockquote>{idea.gamePrompt.prompt}</blockquote></div>
                    </section>
                    <div className="idea-extras"><section><span className="idea-detail-label">LEVEL IT UP</span><ul>{idea.levelUps.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section id="real-projects" className="real-examples-section">
          <div className="page-shell">
            <div className="real-examples-heading"><div><span className="kicker">Built by real kids</span><h2>Ideas from an international kids’ hackathon.</h2></div><p>These projects appear in the Kids AI Coding showcase. The event is for ages 8–13; individual participant ages and names were not published, so we list the credited team and location instead.</p></div>
            <div className="real-examples-grid">
              {realKidExamples.map((example, index) => <article key={example.title}>
                <span className="real-example-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{example.title}</h3><p>{example.description}</p>
                <div><span><Users size={14} /> Ages 8–13 · {example.team}</span><span><MapPin size={14} /> {example.location}</span></div>
                <a href={kidsHackathonUrl} target="_blank" rel="noreferrer">View source showcase <ExternalLink size={13} /></a>
              </article>)}
            </div>
            <p className="real-examples-source">Reference: Kids AI Coding’s public sample-project showcase. Project descriptions, team credits, and locations are reproduced in shortened form; exact individual ages were not provided.</p>
          </div>
        </section>

        <section className="ideas-grownup page-shell">
          <div className="ideas-grownup-icon"><ShieldCheck /></div>
          <div><span className="kicker">The useful grown-up role</span><h2>Hold the guardrails. Hand over the creative controls.</h2><p>Manage accounts, privacy, payments, and publishing. Let the kid choose the idea, make the weird decisions, test the result, and decide what to change next.</p></div>
          <a className="button button-dark" href="/getting-started">Read the parent guide <ArrowRight size={17} /></a>
        </section>

        <section className="ideas-submit">
          <div className="page-shell ideas-submit-inner">
            <span className="ideas-submit-icon"><Send /></span>
            <div><span className="kicker">Made something wonderfully weird?</span><h2>Put your project in the clubhouse gallery.</h2><p>A grown-up submits the link and approves what can be shared. Every project and link is reviewed before it appears publicly.</p></div>
            <a className="button button-coral" href="/submit">Submit a project <ArrowRight size={18} /></a>
          </div>
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
