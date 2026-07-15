import { useEffect } from 'react'
import {
  ArrowLeft, ArrowRight, Bot, Check, Code2, ExternalLink, Film, Github, Image,
  Lightbulb, MousePointer2, Play, Rocket, ShieldCheck, Sparkles, WandSparkles,
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
    name: 'Replit Agent', label: 'AI app builder', icon: <Rocket />,
    copy: 'A prompt-driven vibe-coding workspace that can build, preview, fix, and publish an app. It is powerful, but not required for a first project.',
    href: 'https://docs.replit.com/build/your-first-app',
  },
  {
    name: 'Canva Code', label: 'Prompt + design', icon: <WandSparkles />,
    copy: 'Canva’s prompt-driven coding tool makes interactive pages, games, and apps that you can also edit like a Canva design. It counts as vibe coding.',
    href: 'https://www.canva.com/newsroom/news/Canva-Code/',
  },
  {
    name: 'Scratch', label: 'Visual coding, not AI', icon: <Code2 />,
    copy: 'Scratch is not vibe coding by itself. Its drag-and-drop blocks can still help kids see, change, and understand the logic behind a project.',
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
              <p>Your kid brings the imagination. You bring the grown-up judgment. AI does the work.</p>
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
            <h2>Vibe coding is making software where AI does the coding.</h2>
            <p>You tell an AI what you want. It creates a first version. You click around, notice what is delightful or broken, and ask for the next change. Your unique human perspective turns AI-generated code into something that only you could create.</p>
            <div className="guide-definition-explainer">
              <figure className="guide-definition-art"><img src="/parent-guide-vibe-coding.jpg" alt="Orange clubhouse cat using a laptop to imagine and build a playful cat-feeding machine" /></figure>
              <div className="model-tool-note">
                <div><Bot /><span><b>A model is the engine.</b> GPT, Claude, and Gemini are model families. Their exact version names change often.</span></div>
                <p>For a first project, use the normal/default option. You do not need to become a model expert.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="first-build" className="first-build-section">
          <div className="page-shell">
            <div className="guide-heading">
              <div><span className="kicker">The 20-minute experiment</span><h2>Make one tiny thing together.</h2></div>
              <p>The goal is something that you can tinker with, not a perfect project.</p>
            </div>
            <div className="first-build-grid">
              <ol className="first-build-steps">
                <li><span>01</span><div><h3>Let the kid choose</h3><p>A pet rock game? An alien lunch menu? A button that makes frogs rain? Small and specific wins.</p></div></li>
                <li><span>02</span><div><h3>Pick one tool</h3><p>Start with ChatGPT or Claude. Do not open five tools at once.</p></div></li>
                <li><span>03</span><div><h3>Describe, then build</h3><p>You craft the starter prompt. Let your child answer the creative questions. Ask the AI to give you a link to the working prototype so that you can test it.</p></div></li>
                <li><span>04</span><div><h3>Click everything</h3><p>Try the buttons, visit and try everything in your build, refresh the page, and look at it on a phone.</p></div></li>
                <li><span>05</span><div><h3>Ask for one change</h3><p>“Make the moon bounce” is better than “make it better.” Repeat while it is still fun.</p></div></li>
              </ol>
              <div className="starter-prompt-column">
                <aside className="starter-prompt-card">
                  <div><Lightbulb size={20} /><span>COPY, FILL IN, AND GO</span></div>
                  <p className="starter-prompt-parent-note"><b>For parents:</b> Ask your child what their creation should look like and do—colors, style, and anything else they imagine.</p>
                  <p>We are making a <b>kid-led project</b> together.</p>
                  <p>Build a <mark>[game / world / page]</mark> about <mark>[our idea]</mark>. It needs <mark>[feature one]</mark>, <mark>[feature two]</mark>, and one surprise.</p>
                  <small>Tip: keep the child in the director’s chair. Invite them to make as many decisions as possible.</small>
                </aside>
                <figure className="first-build-art"><img src="/parent-guide-together-cats.jpg" alt="A grown-up clubhouse cat and a younger cat celebrating their build with a high five" /></figure>
              </div>
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
              <div className="github-intro"><Github size={48} /><div><span className="kicker">The mysterious “repo” box</span><h2>GitHub is where the project lives and gets updated.</h2><p>A GitHub <b>repository</b> (usually called a “repo”) is a folder containing the project’s code, files, and saved history. A grown-up can connect that repo to an AI coding workspace, review each proposed update, and keep the public site current.</p></div></div>
              <div className="github-terms">
                <article><span>01</span><h3>Sign in or make an account</h3><p>The grown-up creates a free GitHub account, verifies the email address, and signs in.</p></article>
                <article><span>02</span><h3>Create the repository</h3><p>Make a new repo for the project and initialize it with a README.</p></article>
                <article><span>03</span><h3>Give the AI the repo link</h3><p>In a coding workspace that can access GitHub, paste the repository link and authorize access if asked.</p></article>
                <article><span>04</span><h3>Review and merge updates</h3><p>Ask the AI to propose changes in a pull request. Review the new code, then merge it on GitHub to update the connected public site.</p></article>
              </div>
              <div className="github-warning"><ShieldCheck /><p><b>Public means public.</b> Never put a child’s full name, school, location, private photo, password, API key, or <code>.env</code> file in a public repository. GitHub accounts are for people 13+ (or older where local law requires).</p></div>
              <div className="github-links"><a href="https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github" target="_blank" rel="noreferrer">Create an account <ExternalLink size={14} /></a><a href="https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository" target="_blank" rel="noreferrer">Create a repository <ExternalLink size={14} /></a><a href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request" target="_blank" rel="noreferrer">Create a pull request <ExternalLink size={14} /></a><a href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request" target="_blank" rel="noreferrer">Merge a pull request <ExternalLink size={14} /></a></div>
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
              <span className="kicker">Before you share</span><h3>The four-click grown-up check</h3>
              <ol><li><b>Play it from the beginning.</b><span>Try every button and strange choice.</span></li><li><b>Read every word.</b><span>AI can invent surprising or incorrect text.</span></li><li><b>Check every link.</b><span>Make sure it opens the intended project.</span></li><li><b>Open it on a phone.</b><span>Buttons should be tappable and the page usable.</span></li></ol>
            </aside>
          </div>
        </section>

        <section className="age-safety page-shell">
          <figure className="age-safety-art"><img src="/parent-guide-resting-cat.png" alt="Orange clubhouse cat curled up and resting" /></figure>
          <div><span className="kicker">A note about kids and AI accounts</span><h2>Adult supervision is not optional.</h2><p>Many consumer AI and coding services require users to be at least 13, sometimes older, and rules vary by country and feature. ChatGPT requires users to be 13+ with parent permission under 18; GitHub accounts are 13+; Google provides some supervised Gemini access through Family Link. For younger children, the adult should actively operate an eligible adult account only where the service’s terms allow—or choose a child-focused tool such as Scratch or ScratchJr. Never hand a child an adult login.</p><p>AI filters are not perfect. Stay beside younger creators, keep personal information out of prompts, and review everything before it goes public.</p>
            <div><a href="https://openai.com/policies/terms-of-use/" target="_blank" rel="noreferrer">OpenAI terms <ExternalLink size={14} /></a><a href="https://help.openai.com/en/articles/12315553-parental-controls-in-chatgpt" target="_blank" rel="noreferrer">ChatGPT parental controls <ExternalLink size={14} /></a><a href="https://support.google.com/gemini/answer/16109150" target="_blank" rel="noreferrer">Gemini family guide <ExternalLink size={14} /></a></div>
          </div>
        </section>

        <section className="more-tools-section page-shell">
          <div className="builder-heading"><span className="kicker">More tools to try</span><h2>Explore these after your first project.</h2><p>None of these is required. Replit Agent and Canva Code are prompt-driven vibe-coding tools; Scratch is a visual programming workspace that can help kids understand the logic.</p></div>
          <div className="builder-grid">
            {builders.map((builder) => <article key={builder.name}><span className="builder-icon">{builder.icon}</span><small>{builder.label}</small><h3>{builder.name}</h3><p>{builder.copy}</p><a href={builder.href} target="_blank" rel="noreferrer">Learn more <ExternalLink size={14} /></a></article>)}
          </div>
        </section>

        <section className="guide-final">
          <div className="page-shell"><span><Play /></span><div><small>READY?</small><h2>Start small. Have fun!</h2><p>A working button that makes a potato sing is a perfectly excellent first project.</p></div><a className="button button-coral" href="/#challenge">See this week’s challenge <ArrowRight size={18} /></a></div>
        </section>
      </main>

      <footer className="legal-footer"><div className="page-shell"><p>Made for curious kids and the grown-ups learning beside them.</p><a href="/">Return to vibecodekids.com</a></div></footer>
    </div>
  )
}

export default GettingStartedPage
