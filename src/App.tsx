import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  ArrowRight, Check, ChevronDown, Code2, ExternalLink, Github, Heart,
  LockKeyhole, Menu, MousePointer2, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { upcomingChallenges } from './data'
import { firebaseReady, loadCommunity, saveVote, submitProject } from './lib/community'
import type { Challenge, CommunitySnapshot, Project, SubmissionInput } from './types'

const emptySubmission: SubmissionInput = {
  childNickname: '', ageBand: '', projectTitle: '', description: '', repoUrl: '', demoUrl: '',
  parentName: '', parentEmail: '', consent: false, publicSharing: false,
}

function timeLeft(iso: string) {
  const milliseconds = Math.max(0, new Date(iso).getTime() - Date.now())
  const days = Math.floor(milliseconds / 86_400_000)
  const hours = Math.floor((milliseconds % 86_400_000) / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  return { days, hours, minutes }
}

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Vibe Code Club home">
      <span className="logo-mark"><span /> <span /> <span /></span>
      <span>VIBE CODE<br /><b>CLUB</b></span>
    </a>
  )
}

function ProjectScene({ project }: { project: Project }) {
  return (
    <div className={`project-scene scene-${project.scene}`} aria-label={`Preview of ${project.title}`}>
      <div className="scene-sky" />
      {project.scene === 'space' && <><i className="moon" /><i className="planet" /><i className="sprout sprout-one" /><i className="sprout sprout-two" /></>}
      {project.scene === 'ocean' && <><i className="bubble bubble-one" /><i className="bubble bubble-two" /><i className="bubble bubble-three" /><i className="tiny-house" /></>}
      {project.scene === 'garden' && <><i className="tree tree-one" /><i className="tree tree-two" /><i className="snack-toast" /><i className="monster" /></>}
      {project.scene === 'monster' && <><i className="spotlight" /><i className="dancer dancer-one" /><i className="dancer dancer-two" /><i className="disco-ball" /></>}
      <span className="scene-label">{project.title}</span>
    </div>
  )
}

function ChallengePreview({ challenge }: { challenge: Challenge }) {
  const [remaining, setRemaining] = useState(() => timeLeft(challenge.closesAt))
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(timeLeft(challenge.closesAt)), 60_000)
    return () => window.clearInterval(timer)
  }, [challenge.closesAt])

  return (
    <aside className="challenge-preview" aria-label="This week's challenge">
      <div className="window-bar"><span /><span /><span /><small>THIS_WEEK.vibe</small></div>
      <div className="challenge-art">
        <span className="orbit orbit-one" /><span className="orbit orbit-two" />
        <span className="pixel-sun">✦</span>
        <div className="tiny-world">
          <span className="world-face">•ᴗ•</span><i className="world-tree" /><i className="world-home" />
        </div>
        <span className="floating-code">&lt;make<br />magic /&gt;</span>
      </div>
      <div className="challenge-preview-copy">
        <span className="kicker">{challenge.weekLabel}</span>
        <h2>{challenge.title}</h2>
        <div className="countdown" aria-label={`${remaining.days} days, ${remaining.hours} hours left`}>
          <span><b>{String(remaining.days).padStart(2, '0')}</b> days</span>
          <em>:</em><span><b>{String(remaining.hours).padStart(2, '0')}</b> hrs</span>
          <em>:</em><span><b>{String(remaining.minutes).padStart(2, '0')}</b> min</span>
        </div>
      </div>
    </aside>
  )
}

function SubmissionModal({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [form, setForm] = useState(emptySubmission)
  const [step, setStep] = useState<'form' | 'saving' | 'done'>('form')
  const [error, setError] = useState('')

  const update = (name: keyof SubmissionInput, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!form.consent || !form.publicSharing) {
      setError('A grown-up needs to check both permission boxes before submitting.')
      return
    }
    setStep('saving')
    try {
      await submitProject(form, challenge.id)
      setStep('done')
    } catch {
      setError('That did not go through. Please check the form and try again.')
      setStep('form')
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="submission-modal" role="dialog" aria-modal="true" aria-labelledby="submit-title">
        <button className="modal-close" onClick={onClose} aria-label="Close submission form"><X size={20} /></button>
        {step === 'done' ? (
          <div className="success-state">
            <span className="success-burst"><Check size={34} strokeWidth={3} /></span>
            <span className="kicker">High five!</span>
            <h2 id="submit-title">Your build is in the review queue.</h2>
            <p>A club grown-up will check the links before anything appears in the public gallery. We’ll email the parent or guardian with an update.</p>
            <button className="button button-dark" onClick={onClose}>Back to the clubhouse</button>
          </div>
        ) : (
          <>
            <div className="modal-intro">
              <span className="kicker">Share a creation</span>
              <h2 id="submit-title">Submit to “{challenge.title}”</h2>
              <p>Kids can do the typing. A parent or guardian handles the permission part at the end.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend><span>1</span> About the builder</legend>
                <div className="form-grid">
                  <label>Creator nickname <small>Public — no full names</small><input required maxLength={24} value={form.childNickname} onChange={(e) => update('childNickname', e.target.value)} placeholder="PixelPanda" /></label>
                  <label>Age group <small>Public</small><select required value={form.ageBand} onChange={(e) => update('ageBand', e.target.value)}><option value="">Choose one</option><option>5–6</option><option>7–9</option><option>10–12</option><option>13–15</option></select></label>
                </div>
              </fieldset>
              <fieldset>
                <legend><span>2</span> About the build</legend>
                <label>Project title<input required maxLength={60} value={form.projectTitle} onChange={(e) => update('projectTitle', e.target.value)} placeholder="My very tiny world" /></label>
                <label>Tell us about it<textarea required maxLength={280} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What did you make? What should we try?" /></label>
                <div className="form-grid">
                  <label>Code or project link<input required type="url" value={form.repoUrl} onChange={(e) => update('repoUrl', e.target.value)} placeholder="https://github.com/..." /></label>
                  <label>Playable link <small>Optional</small><input type="url" value={form.demoUrl} onChange={(e) => update('demoUrl', e.target.value)} placeholder="https://..." /></label>
                </div>
              </fieldset>
              <fieldset className="grownup-fieldset">
                <legend><span>3</span> Grown-up checkpoint</legend>
                <div className="form-grid">
                  <label>Parent / guardian name <small>Never public</small><input required value={form.parentName} onChange={(e) => update('parentName', e.target.value)} /></label>
                  <label>Parent / guardian email <small>Never public</small><input required type="email" value={form.parentEmail} onChange={(e) => update('parentEmail', e.target.value)} /></label>
                </div>
                <label className="checkbox-row"><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} /><span>I’m the child’s parent or legal guardian, or I have their permission to submit this project.</span></label>
                <label className="checkbox-row"><input type="checkbox" checked={form.publicSharing} onChange={(e) => update('publicSharing', e.target.checked)} /><span>I approve the nickname, age group, project description, and project links being displayed publicly.</span></label>
              </fieldset>
              {error && <p className="form-error">{error}</p>}
              <div className="submit-row"><p><ShieldCheck size={17} /> Every submission is reviewed before it goes live.</p><button disabled={step === 'saving'} className="button button-coral" type="submit">{step === 'saving' ? 'Sending…' : 'Send for review'} <ArrowRight size={18} /></button></div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

function App() {
  const [community, setCommunity] = useState<CommunitySnapshot | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [notice, setNotice] = useState('')
  const [voting, setVoting] = useState('')

  useEffect(() => { loadCommunity().then(setCommunity) }, [])
  useEffect(() => {
    if (!showSubmit) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setShowSubmit(false)
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKey)
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKey) }
  }, [showSubmit])

  const sortedProjects = useMemo(() => {
    if (!community) return []
    return [...community.projects].sort((a, b) => (b.baseVotes + (community.voteCounts[b.id] || 0)) - (a.baseVotes + (community.voteCounts[a.id] || 0)))
  }, [community])

  async function vote(project: Project) {
    if (!community || voting) return
    if (community.myVote === project.id) { setNotice('That build already has your favorite vote!'); return }
    setVoting(project.id)
    try {
      await saveVote(community.challenge.id, project.id, community.myVote)
      setCommunity((current) => {
        if (!current) return current
        const counts = { ...current.voteCounts }
        if (current.myVote) counts[current.myVote] = Math.max(0, (counts[current.myVote] || 0) - 1)
        counts[project.id] = (counts[project.id] || 0) + 1
        return { ...current, voteCounts: counts, myVote: project.id }
      })
      setNotice(`Your favorite is now “${project.title}”!`)
    } catch { setNotice('Voting took a tumble. Please try again.') }
    finally { setVoting(''); window.setTimeout(() => setNotice(''), 3200) }
  }

  if (!community) return <main className="loading-screen"><Logo /><div className="loader"><span /><span /><span /></div><p>Opening the clubhouse…</p></main>

  return (
    <div id="top">
      <header className="site-header">
        <Logo />
        <button className="menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Menu /></button>
        <nav className={mobileNav ? 'open' : ''} aria-label="Main navigation">
          <a href="#challenge" onClick={() => setMobileNav(false)}>This week</a>
          <a href="#gallery" onClick={() => setMobileNav(false)}>The gallery</a>
          <a href="#how" onClick={() => setMobileNav(false)}>How it works</a>
          <a href="#grownups" onClick={() => setMobileNav(false)}>For grown-ups</a>
        </nav>
        <button className="button button-small button-dark header-submit" onClick={() => setShowSubmit(true)}>Submit a build <ArrowRight size={16} /></button>
      </header>

      <main>
        <section className="hero page-shell">
          <div className="hero-copy">
            <div className="eyebrow-pill"><Sparkles size={14} /> A creative coding club for curious kids</div>
            <h1>Make weird.<br />Make wonderful.<br /><span>Make it yours.</span></h1>
            <p className="hero-lede">A new creative coding adventure every week. Build it your way, share it with the club, and cheer on other young makers.</p>
            <div className="hero-actions"><a className="button button-coral" href="#challenge">See this week’s challenge <ArrowRight size={19} /></a><button className="text-link" onClick={() => setShowSubmit(true)}>I made something! <span>↗</span></button></div>
            <div className="trust-note"><span className="avatar-stack"><i>🐯</i><i>🦊</i><i>🐸</i></span><p><b>Built for kids. Guided by grown-ups.</b><br />Nicknames only · Parent-approved sharing</p></div>
          </div>
          <ChallengePreview challenge={community.challenge} />
        </section>

        <section id="challenge" className="challenge-section">
          <div className="page-shell challenge-layout">
            <div className="section-number">01 <span>THIS WEEK’S MISSION</span></div>
            <div className="challenge-copy">
              <span className="kicker">{community.challenge.eyebrow}</span>
              <h2>{community.challenge.title}</h2>
              <p className="challenge-prompt">“{community.challenge.prompt}”</p>
              <p>{community.challenge.brief}</p>
              <button className="button button-light" onClick={() => setShowSubmit(true)}>Share your tiny world <ArrowRight size={18} /></button>
            </div>
            <div className="idea-board">
              <span className="tape" />
              <h3>Need a spark?</h3>
              <ul>{community.challenge.starterIdeas.map((idea, index) => <li key={idea}><span>0{index + 1}</span>{idea}</li>)}</ul>
              <div className="tool-row">{community.challenge.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
              <small>No required tool. No “right” answer.</small>
            </div>
          </div>
        </section>

        <section id="gallery" className="gallery-section page-shell">
          <div className="section-heading">
            <div><span className="kicker">Fresh from the clubhouse</span><h2>This week’s tiny worlds</h2></div>
            <p>Explore what other young makers dreamed up, then tap the heart on your favorite. One favorite per person each week.</p>
          </div>
          <div className="gallery-grid">
            {sortedProjects.map((project, index) => {
              const votes = project.baseVotes + (community.voteCounts[project.id] || 0)
              const selected = community.myVote === project.id
              return (
                <article className="project-card" key={project.id} style={{ '--accent': project.accent } as CSSProperties}>
                  <div className="project-browser"><div className="window-bar"><span /><span /><span /><small>{project.builder.toLowerCase()}.world</small></div><ProjectScene project={project} /></div>
                  <div className="project-meta"><div><div className="project-rank">#{index + 1} this week</div><h3>{project.title}</h3><p>{project.description}</p><span className="builder-tag">by {project.builder} · age {project.ageBand}</span></div>
                    <button className={`vote-button ${selected ? 'selected' : ''}`} onClick={() => vote(project)} aria-pressed={selected} aria-label={`Vote for ${project.title}`}><Heart size={22} fill={selected ? 'currentColor' : 'none'} /><b>{votes}</b><small>{selected ? 'Your fave' : 'Favorite'}</small></button>
                  </div>
                  <div className="project-links">{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer"><Github size={16} /> See the code</a>}{project.demoUrl && project.demoUrl !== '#' && <a href={project.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Try it</a>}</div>
                </article>
              )
            })}
          </div>
          <p className="gallery-footnote"><ShieldCheck size={16} /> Every project and link is checked by a club grown-up before appearing here.</p>
        </section>

        <section id="how" className="how-section">
          <div className="page-shell">
            <div className="section-heading compact"><div><span className="kicker">Zero pressure. Maximum curiosity.</span><h2>How the club works</h2></div></div>
            <div className="steps-grid">
              <article><span className="step-icon coral"><MousePointer2 /></span><small>01 · MONDAY</small><h3>Pick up the prompt</h3><p>We reveal a playful new mission. Use any tool, language, or creative shortcut you like.</p></article>
              <article><span className="step-icon blue"><Code2 /></span><small>02 · YOUR TIME</small><h3>Vibe, tinker, make</h3><p>Follow your curiosity. Ask a grown-up or an AI for help. Bugs and weird detours are welcome.</p></article>
              <article><span className="step-icon green"><Heart /></span><small>03 · SUNDAY</small><h3>Share and cheer</h3><p>A grown-up submits your build. The club explores, votes, and celebrates a weekly favorite.</p></article>
            </div>
          </div>
        </section>

        <section className="up-next page-shell">
          <div className="up-next-title"><span>Coming soon</span><h2>Next on the idea machine</h2></div>
          <div className="challenge-list">{upcomingChallenges.map((item) => <article key={item.number}><span className="up-number" style={{ background: item.color }}>{item.number}</span><div><h3>{item.title}</h3><p>{item.hint}</p></div><span className="locked"><LockKeyhole size={15} /> Locked</span></article>)}</div>
        </section>

        <section id="grownups" className="grownups-section">
          <div className="page-shell grownups-layout">
            <div className="safety-art"><ShieldCheck size={66} /><span className="safety-star">✦</span><span className="safety-code">{'{ safe + silly }'}</span></div>
            <div><span className="kicker">Grown-ups stay in the loop</span><h2>Big creativity.<br />Small digital footprint.</h2><p>Kids use nicknames and age groups—never full names. A parent or guardian approves every submission, and our club grown-ups check each project and link before it goes public.</p><ul><li><Check size={17} /> No direct messages or public comments</li><li><Check size={17} /> Parent contact details are never public</li><li><Check size={17} /> One favorite vote per account each week</li></ul><button className="button button-dark" onClick={() => setShowSubmit(true)}>Read the grown-up checklist <ArrowRight size={17} /></button></div>
          </div>
        </section>
      </main>

      <footer><div className="page-shell footer-layout"><Logo /><p>Made for small coders with big ideas.</p><div><a href="#grownups">Safety</a><a href="mailto:hello@vibecode.club">Contact</a><a href="#top">Back to top ↑</a></div></div><div className="footer-ticker"><span>MAKE SOMETHING WEIRD</span><i>✦</i><span>BREAK IT ON PURPOSE</span><i>✦</i><span>SHOW US WHAT YOU BUILT</span><i>✦</i></div></footer>
      {community.source === 'demo' && <div className="demo-badge" title={firebaseReady ? 'Firebase could not be reached' : 'Add Firebase environment variables to connect live data'}>Demo clubhouse <ChevronDown size={13} /></div>}
      {notice && <div className="toast" role="status"><Heart size={17} fill="currentColor" /> {notice}</div>}
      {showSubmit && <SubmissionModal challenge={community.challenge} onClose={() => setShowSubmit(false)} />}
    </div>
  )
}

export default App
