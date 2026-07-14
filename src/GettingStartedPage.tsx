import { useEffect } from 'react'
import {
  ArrowLeft, ArrowRight, Bot, Check, Code2, ExternalLink, Film, Github, Image,
  Lightbulb, MousePointer2, Play, Rocket, ShieldCheck, Sparkles, WandSparkles, Wrench,
} from 'lucide-react'

const tools = [
  {
    name: 'ChatGPT', family: 'GPT · OpenAI', color: 'green',
    best: 'A friendly all-round starting place',
    copy: 'Brainstorm an idea, make a first version, explain confusing code, fix bugs, and create images—all in one conversation.',
    href: 'https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq',
  },
  {
    name: 'Claude', family: 'Claude · Anthropic', color: 'pink',
    best: 'Quick interactive pages and games',
    copy: 'Claude Artifacts can turn a conversation into a shareable mini-app. It is especially nice for seeing the creation beside the chat while you iterate.',
    href: 'https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them',
  },
  {
    name: 'Gemini', family: 'Gemini · Google', color: 'blue',
    best: 'Families already using Google',
    copy: 'Useful for planning, writing, coding, and talking through changes. Google offers supervised access in some places through Family Link.',
    href: 'https://support.google.com/gemini/answer/16109150',
  },
]

const builders = [
  {
    name: 'Canva Code', label: 'Easiest colorful start', icon: <WandSparkles />,
    copy: 'Describe a quiz, mini-game, or interactive page and customize it inside Canva. Great when design is part of the fun.',
    href: 'https://www.canva.com/newsroom/news/canva-ai-launches/',
  },
  {
    name: 'Replit Agent', label: 'More app-building power', icon: <Rocket />,
    copy: 'Describe an app, see it in a live preview, ask for fixes, and publish a link. A grown-up should review the plan and test the result.',
    href: 'https://docs.replit.com/build/your-first-app',
  },
  {
    name: 'Scratch', label: 'See how the logic works', icon: <Code2 />,
    copy: 'Drag-and-drop blocks make the program visible. Scratch is designed mainly for ages 8–16; younger children often use it with a parent.',
    href: 'https://scratch.mit.edu/help/parents/',
  },
]

function GettingStartedPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Parent Guide — Vibe Code Club'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="getting-started-page">
      <header className="guide-header page-shell">
        <a className="logo" href="/" aria-label="Vibe Code Club home">
          <span className="logo-mark"><span /> <span /> <span /></span>
          <span>VIBE CODE<br /><b>CLUB</b></span>
        </a>
        <a className="button button-light guide-back" href="/"><ArrowLeft size={17} /> Back to the clubhouse</a>
      </header>

      <main>
        <section className="guide-hero">
          <div className="page-shell guide-hero-inner">
            <div>
              <span className="kicker">A no-experience-required guide</span>
              <h1>You don’t need to know how to code.</h1>
              <p>Your kid brings the imagination. You bring the grown-up judgment. AI can help with the typing, explaining, and untangling in between.</p>
              <div className="guide-hero-actions">
                <a className="button button-coral" href="#first-build">Make a first project <ArrowRight size={18} /></a>
                <a className="guide-text-link" href="#tools">Meet the tools</a>
              </div>
            </div>
            <aside className="guide-starter-card">
              <span className="guide-starter-spark"><Sparkles /></span>
              <small>YOUR STARTER KIT</small>
              <h2>One curious kid.<br />One grown-up nearby.<br />One tiny idea.</h2>
              <p>A browser and about 20 minutes are enough for a first experiment.</p>
              <div><span>NO</span> coding degree, perfect prompt, or giant plan required.</div>
            </aside>
          </div>
        </section>

        <section className="guide-definition page-shell">
          <div className="guide-section-number">01</div>
          <div>
            <span className="kicker">First: what are we even doing?</span>
            <h2>Vibe coding is making software by describing, trying, and changing.</h2>
            <p>You tell an AI what you want. It creates a first version. You click around, notice what is delightful or broken, and ask for the next change. The useful skill is not memorizing magic words—it is having an idea, making choices, testing, and explaining what should happen next.</p>
            <div className="model-tool-note">
              <div><Bot /><span><b>A model is the engine.</b> GPT, Claude, and Gemini are model families. Their exact version names change often.</span></div>
              <div><Wrench /><span><b>A tool is where you create.</b> ChatGPT, Claude, Gemini, Canva, Replit, and Scratch are products or workspaces.</span></div>
              <p>For a first project, use the normal/default option. You do not need to become a model expert.</p>
            </div>
          </div>
        </section>

        <section id="first-build" className="first-build-section">
          <div className="page-shell">
            <div className="guide-heading">
              <div><span className="kicker">The 20-minute experiment</span><h2>Make one tiny thing together.</h2></div>
              <p>The goal is a complete loop—not a perfect project.</p>
            </div>
            <div className="first-build-grid">
              <ol className="first-build-steps">
                <li><span>01</span><div><h3>Let the kid choose</h3><p>A pet rock game? An alien lunch menu? A button that makes frogs rain? Small and specific wins.</p></div></li>
                <li><span>02</span><div><h3>Pick one tool</h3><p>Start with ChatGPT, Claude, Canva Code, or Scratch. Do not open five tools at once.</p></div></li>
                <li><span>03</span><div><h3>Describe, then build</h3><p>Use the starter prompt. Let the child answer the creative questions.</p></div></li>
                <li><span>04</span><div><h3>Click everything</h3><p>Try the buttons, make a weird choice, refresh the page, and look at it on a phone.</p></div></li>
                <li><span>05</span><div><h3>Ask for one change</h3><p>“Make the moon bounce” is better than “make it better.” Repeat while it is still fun.</p></div></li>
              </ol>
              <aside className="starter-prompt-card">
                <div><Lightbulb size={20} /><span>COPY, FILL IN, AND GO</span></div>
                <p>We are making a <b>kid-led project</b> together. Ask the child three short questions, one at a time, about what it should look like and do.</p>
                <p>Then build a small playable <mark>[game / world / page]</mark> about <mark>[our idea]</mark>. It needs <mark>[feature one]</mark>, <mark>[feature two]</mark>, and one surprise.</p>
                <p>Use big buttons and simple instructions. Do not add logins, chat, purchases, personal information, or outside links. After the first version, stop and ask what the child wants to change.</p>
                <small>Tip: keep the child in the director’s chair. AI can type; it should not make every interesting decision.</small>
              </aside>
            </div>
          </div>
        </section>

        <section id="tools" className="guide-tools page-shell">
          <div className="guide-section-number">02</div>
          <div>
            <div className="guide-heading">
              <div><span className="kicker">Meet the helpers</span><h2>Three big AI families, in normal language.</h2></div>
              <p>All can brainstorm and write code. The best one is usually the one your grown-up already understands.</p>
            </div>
            <div className="ai-tool-grid">
              {tools.map((tool) => <article className={`ai-tool-card ${tool.color}`} key={tool.name}>
                <span>{tool.family}</span><h3>{tool.name}</h3><b>{tool.best}</b><p>{tool.copy}</p>
                <a href={tool.href} target="_blank" rel="noreferrer">Official guide <ExternalLink size={14} /></a>
              </article>)}
            </div>

            <div className="builder-heading"><span className="kicker">Places to build</span><h2>Pick the kind of workspace that feels fun.</h2></div>
            <div className="builder-grid">
              {builders.map((builder) => <article key={builder.name}><span className="builder-icon">{builder.icon}</span><small>{builder.label}</small><h3>{builder.name}</h3><p>{builder.copy}</p><a href={builder.href} target="_blank" rel="noreferrer">Learn more <ExternalLink size={14} /></a></article>)}
            </div>
          </div>
        </section>

        <section className="creative-tools-section">
          <div className="page-shell">
            <div className="guide-heading">
              <div><span className="kicker">Pictures, motion, and extra sparkle</span><h2>Make assets—then bring them into the project.</h2></div>
              <p>Use generated media as ingredients. The project should still reflect the child’s choices.</p>
            </div>
            <div className="creative-tool-grid">
              <article><span className="creative-icon image"><Image /></span><div><small>IMAGES</small><h3>ChatGPT Images</h3><p>Ask for a character, background, button, map, or transparent sticker. You can also upload an image and describe an edit.</p><a href="https://help.openai.com/en/articles/11084440-images-in-chatgpt" target="_blank" rel="noreferrer">Image guide <ExternalLink size={14} /></a></div></article>
              <article><span className="creative-icon sparkle"><WandSparkles /></span><div><small>DESIGN + IMAGES</small><h3>Canva AI</h3><p>Useful for title cards, backgrounds, simple graphics, and arranging everything into a consistent visual style.</p><a href="https://www.canva.com/newsroom/news/canva-ai-launches/" target="_blank" rel="noreferrer">Canva overview <ExternalLink size={14} /></a></div></article>
              <article><span className="creative-icon video"><Film /></span><div><small>IMAGES + SHORT VIDEO</small><h3>Adobe Firefly</h3><p>Generate or edit visuals and make short video clips from text or an image. Video tools can use credits, so let the grown-up control the button.</p><a href="https://www.adobe.com/products/firefly/features/ai-video-generator.html" target="_blank" rel="noreferrer">Firefly video <ExternalLink size={14} /></a></div></article>
            </div>
            <p className="creative-footnote">Plans, credits, availability, and age rules change. Check the provider’s current terms before creating an account or uploading anything.</p>
          </div>
        </section>

        <section className="github-guide page-shell">
          <div className="github-window">
            <div className="window-bar"><span /><span /><span /><small>github_explained.txt</small></div>
            <div className="github-window-body">
              <div className="github-intro"><Github size={48} /><div><span className="kicker">The mysterious “repo” box</span><h2>GitHub is a project shelf plus a time machine.</h2><p>A GitHub <b>repository</b> (usually called a “repo”) is a folder containing the project’s code, files, and saved history. If something breaks, that history helps you see what changed or return to an earlier version.</p></div></div>
              <div className="github-terms">
                <article><span>README</span><h3>The project’s label</h3><p>What it is, how to try it, and anything another person should know.</p></article>
                <article><span>COMMIT</span><h3>A named checkpoint</h3><p>A saved group of changes, like “made the frog jump.”</p></article>
                <article><span>REPO LINK</span><h3>See the ingredients</h3><p>Shows the files and code. It is not always the playable experience.</p></article>
                <article><span>LIVE LINK</span><h3>Try the finished thing</h3><p>GitHub Pages can turn HTML, CSS, and JavaScript in a repo into a public website.</p></article>
              </div>
              <div className="github-warning"><ShieldCheck /><p><b>Public means public.</b> Never put a child’s full name, school, location, private photo, password, API key, or <code>.env</code> file in a public repository. GitHub accounts are for people 13+ (or older where local law requires).</p></div>
              <div className="github-links"><a href="https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories" target="_blank" rel="noreferrer">What is a repository? <ExternalLink size={14} /></a><a href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages" target="_blank" rel="noreferrer">What is GitHub Pages? <ExternalLink size={14} /></a></div>
            </div>
          </div>
        </section>

        <section className="grownup-role-section">
          <div className="page-shell grownup-role-grid">
            <div>
              <span className="kicker">The part that matters most</span>
              <h2>Help without taking over.</h2>
              <p>A kid-led project does not mean a kid works alone. It means the child owns the idea, makes the interesting decisions, and can tell you what they tried.</p>
              <div className="role-columns">
                <article><span><MousePointer2 /> THE KID LEADS</span><ul><li><Check /> The idea and characters</li><li><Check /> What happens when you click</li><li><Check /> Colors, sounds, jokes, and surprises</li><li><Check /> Which changes feel right</li></ul></article>
                <article><span><ShieldCheck /> THE GROWN-UP HANDLES</span><ul><li><Check /> Accounts, terms, and payments</li><li><Check /> Privacy and personal information</li><li><Check /> Publishing and public links</li><li><Check /> The final safety check</li></ul></article>
              </div>
            </div>
            <aside className="safety-checklist">
              <span className="kicker">Before you share</span><h3>The five-click grown-up check</h3>
              <ol><li><b>Play it from the beginning.</b><span>Try every button and strange choice.</span></li><li><b>Read every word.</b><span>AI can invent surprising or incorrect text.</span></li><li><b>Look for personal clues.</b><span>No names, faces, voices, school, or location.</span></li><li><b>Check every link.</b><span>Make sure it opens the intended project.</span></li><li><b>Open it on a phone.</b><span>Buttons should be tappable and the page usable.</span></li></ol>
            </aside>
          </div>
        </section>

        <section className="age-safety page-shell">
          <ShieldCheck size={40} />
          <div><span className="kicker">A note about kids and AI accounts</span><h2>Adult supervision is not optional.</h2><p>Many consumer AI and coding services require users to be at least 13, sometimes older, and rules vary by country and feature. ChatGPT requires users to be 13+ with parent permission under 18; GitHub accounts are 13+; Google provides some supervised Gemini access through Family Link. For younger children, the adult should actively operate an eligible adult account only where the service’s terms allow—or choose a child-focused tool such as Scratch or ScratchJr. Never hand a child an adult login.</p><p>AI filters are not perfect. Stay beside younger creators, keep personal information out of prompts, and review everything before it goes public.</p>
            <div><a href="https://openai.com/policies/terms-of-use/" target="_blank" rel="noreferrer">OpenAI terms <ExternalLink size={14} /></a><a href="https://help.openai.com/en/articles/12315553-parental-controls-in-chatgpt" target="_blank" rel="noreferrer">ChatGPT parental controls <ExternalLink size={14} /></a><a href="https://support.google.com/gemini/answer/16109150" target="_blank" rel="noreferrer">Gemini family guide <ExternalLink size={14} /></a></div>
          </div>
        </section>

        <section className="guide-final">
          <div className="page-shell"><span><Play /></span><div><small>READY?</small><h2>Start tiny. Let it be weird.</h2><p>A working button that makes a potato sing is a perfectly excellent first project.</p></div><a className="button button-coral" href="/#challenge">See this week’s challenge <ArrowRight size={18} /></a></div>
        </section>
      </main>

      <footer className="legal-footer"><div className="page-shell"><p>Made for curious kids and the grown-ups learning beside them.</p><a href="/">Return to vibecodekids.com</a></div></footer>
    </div>
  )
}

export default GettingStartedPage
