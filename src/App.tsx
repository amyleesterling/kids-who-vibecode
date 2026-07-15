import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  ArrowRight, CalendarDays, Check, ChevronDown, Code2, ExternalLink, Github, Heart, Lightbulb,
  ImagePlus, LockKeyhole, Mail, Menu, MousePointer2, ShieldCheck, Sparkles, Trophy, X,
} from 'lucide-react'
import { loadCommunity, saveVote, subscribeWeeklyChallenge, submitChallengeIdea, submitProject } from './lib/community'
import { prepareProjectImage } from './lib/projectImage'
import type { Challenge, ChallengeIdeaInput, CommunitySnapshot, Project, SubmissionInput } from './types'

const emptySubmission: SubmissionInput = {
  childNickname: '', ageBand: '', projectTitle: '', description: '', repoUrl: '', demoUrl: '',
  parentName: '', parentEmail: '', consent: false, publicSharing: false, childLed: false, termsAccepted: false, image: null,
}

const emptyChallengeIdea: ChallengeIdeaInput = {
  ideaTitle: '', ideaPrompt: '', starterSpark: '', creatorNickname: '', creatorGroup: '',
  grownupEmail: '', consent: false, termsAccepted: false,
}

const mascotMessages = [
  'Psst—tap me!',
  'Tiny idea. Big weird.',
  'Tap. Test. Tweak!',
  'I sniff out bugs for snacks.',
]

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
  if (project.imageUrl) {
    return (
      <div className="project-scene project-photo">
        <img src={project.imageUrl} alt={`Screenshot of ${project.title}`} loading="lazy" />
        <span className="scene-label">{project.title}</span>
      </div>
    )
  }
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
  const [imagePreview, setImagePreview] = useState('')
  const [preparingImage, setPreparingImage] = useState(false)

  const update = (name: keyof SubmissionInput, value: string | boolean | File | null) => setForm((current) => ({ ...current, [name]: value }))

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  async function chooseImage(file?: File) {
    if (!file) return
    setPreparingImage(true)
    setError('')
    try {
      const prepared = await prepareProjectImage(file)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(URL.createObjectURL(prepared))
      update('image', prepared)
    } catch (reason) {
      update('image', null)
      setError(reason instanceof Error ? reason.message : 'We could not prepare that image.')
    } finally {
      setPreparingImage(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!form.consent || !form.publicSharing || !form.childLed || !form.termsAccepted) {
      setError('A grown-up needs to check every permission, attestation, and terms box before submitting.')
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
                  <label>Creator nickname <small>Public — no full names</small><input required maxLength={24} value={form.childNickname} onChange={(e) => update('childNickname', e.target.value)} placeholder="Your club nickname" /></label>
                  <label>Age group <small>Public</small><select required value={form.ageBand} onChange={(e) => update('ageBand', e.target.value)}><option value="">Choose one</option><option>5–6</option><option>7–9</option><option>10–12</option><option>13–15</option><option>16–18</option></select></label>
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
                <label className="image-upload">
                  <span className="image-upload-icon"><ImagePlus size={25} /></span>
                  <span><b>{preparingImage ? 'Preparing your picture…' : form.image ? 'Project picture ready!' : 'Add a project picture'}</b><small>Optional · Use a screenshot or artwork—no faces or identifying details. We resize it and remove photo metadata.</small></span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(event.target.files?.[0])} disabled={preparingImage} />
                  {imagePreview && <img src={imagePreview} alt="Project upload preview" />}
                </label>
              </fieldset>
              <fieldset className="grownup-fieldset">
                <legend><span>3</span> Grown-up checkpoint</legend>
                <div className="form-grid">
                  <label>Parent / guardian name <small>Never public</small><input required value={form.parentName} onChange={(e) => update('parentName', e.target.value)} /></label>
                  <label>Parent / guardian email <small>Never public</small><input required type="email" value={form.parentEmail} onChange={(e) => update('parentEmail', e.target.value)} /></label>
                </div>
                <label className="checkbox-row"><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} /><span>I’m the child’s parent or legal guardian, or I have their permission to submit this project.</span></label>
                <label className="checkbox-row"><input type="checkbox" checked={form.publicSharing} onChange={(e) => update('publicSharing', e.target.checked)} /><span>I approve the nickname, age group, project description, and project links being displayed publicly.</span></label>
                <label className="checkbox-row child-led-check"><input type="checkbox" checked={form.childLed} onChange={(e) => update('childLed', e.target.checked)} /><span><b>I confirm this is a child-led project—not a project built for them by an adult.</b><small>Grown-ups and AI may help teach, brainstorm, and troubleshoot, but the child made the creative decisions and led the build.</small></span></label>
                <label className="checkbox-row terms-check"><input type="checkbox" checked={form.termsAccepted} onChange={(e) => update('termsAccepted', e.target.checked)} /><span>I have read and agree to the <a href="/legal" target="_blank" rel="noreferrer">Terms, Safety & Privacy Notice</a> as the responsible adult.</span></label>
              </fieldset>
              {error && <p className="form-error">{error}</p>}
              <div className="submit-row"><p><ShieldCheck size={17} /> Every submission is reviewed before it goes live.</p><button disabled={step === 'saving' || preparingImage} className="button button-coral" type="submit">{step === 'saving' ? 'Sending…' : 'Send for review'} <ArrowRight size={18} /></button></div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

function ChallengeIdeaModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(emptyChallengeIdea)
  const [step, setStep] = useState<'form' | 'saving' | 'done'>('form')
  const [error, setError] = useState('')

  const update = (name: keyof ChallengeIdeaInput, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!form.consent || !form.termsAccepted) {
      setError('A grown-up needs to check both the permission and terms boxes before submitting.')
      return
    }
    setStep('saving')
    try {
      await submitChallengeIdea(form)
      setStep('done')
    } catch {
      setError('That idea did not go through. Please check the form and try again.')
      setStep('form')
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="submission-modal idea-modal" role="dialog" aria-modal="true" aria-labelledby="idea-title">
        <button className="modal-close" onClick={onClose} aria-label="Close challenge idea form"><X size={20} /></button>
        {step === 'done' ? (
          <div className="success-state">
            <span className="success-burst idea-success"><Lightbulb size={34} strokeWidth={2.5} /></span>
            <span className="kicker">Idea received!</span>
            <h2 id="idea-title">It’s in the clubhouse idea jar.</h2>
            <p>A club grown-up will review it privately. If we want to turn it into a future challenge, we’ll email the grown-up who submitted it.</p>
            <button className="button button-dark" onClick={onClose}>Back to the clubhouse</button>
          </div>
        ) : (
          <>
            <div className="modal-intro">
              <span className="kicker">Your turn to inspire the club</span>
              <h2 id="idea-title">Pitch a weekly challenge</h2>
              <p>Kids and grown-ups can dream up the next mission together. We’ll keep the contact email private.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend><span>1</span> The big idea</legend>
                <label>Challenge name<input required maxLength={80} value={form.ideaTitle} onChange={(e) => update('ideaTitle', e.target.value)} placeholder="Make a creature that loves bad jokes" /></label>
                <label>What should everyone make?<textarea required minLength={10} maxLength={400} value={form.ideaPrompt} onChange={(e) => update('ideaPrompt', e.target.value)} placeholder="Describe the mission, the fun part, and what players might click, tap, or discover." /></label>
                <label>One starter spark <small>Optional</small><input maxLength={180} value={form.starterSpark} onChange={(e) => update('starterSpark', e.target.value)} placeholder="Maybe it tells a new joke every time you tap its hat…" /></label>
              </fieldset>
              <fieldset className="grownup-fieldset">
                <legend><span>2</span> Who dreamed it up?</legend>
                <div className="form-grid">
                  <label>Creator nickname <small>No full names</small><input required maxLength={24} value={form.creatorNickname} onChange={(e) => update('creatorNickname', e.target.value)} placeholder="Your club nickname" /></label>
                  <label>Creator group<select required value={form.creatorGroup} onChange={(e) => update('creatorGroup', e.target.value)}><option value="">Choose one</option><option>5–6</option><option>7–9</option><option>10–12</option><option>13–15</option><option>16–18</option><option>Grown-up</option></select></label>
                </div>
                <label>Grown-up email <small>Never public</small><input required type="email" maxLength={160} value={form.grownupEmail} onChange={(e) => update('grownupEmail', e.target.value)} placeholder="grownup@example.com" /></label>
                <label className="checkbox-row"><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} /><span>I’m an adult submitting my own idea, or I’m the child’s parent/legal guardian and approve this idea being reviewed for a future public challenge.</span></label>
                <label className="checkbox-row terms-check"><input type="checkbox" checked={form.termsAccepted} onChange={(e) => update('termsAccepted', e.target.checked)} /><span>I have read and agree to the <a href="/legal" target="_blank" rel="noreferrer">Terms, Safety & Privacy Notice</a> as the responsible adult.</span></label>
              </fieldset>
              {error && <p className="form-error">{error}</p>}
              <div className="submit-row"><p><ShieldCheck size={17} /> Ideas and contact details stay private while we review them.</p><button disabled={step === 'saving'} className="button button-coral" type="submit">{step === 'saving' ? 'Sending…' : 'Put it in the idea jar'} <ArrowRight size={18} /></button></div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

function WeeklySignup() {
  const [email, setEmail] = useState('')
  const [adultConsent, setAdultConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!adultConsent) { setStatus('error'); return }
    setStatus('saving')
    try {
      await subscribeWeeklyChallenge(email, adultConsent)
      setStatus('done')
      setEmail('')
      setAdultConsent(false)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="subscribe" className="newsletter-section">
      <div className="page-shell newsletter-card">
        <div className="newsletter-art" aria-hidden="true"><Mail size={48} /><span>NEW<br />MISSION!</span><i>✦</i></div>
        <div className="newsletter-copy">
          <span className="kicker">A tiny email for the grown-ups</span>
          <h2>Get the weekly challenge.</h2>
          <p>One playful coding prompt every Monday. No kid emails, no spam, and one-click unsubscribe anytime.</p>
        </div>
        {status === 'done' ? (
          <div className="newsletter-success" role="status"><Check size={25} /><div><b>You’re on the grown-up list!</b><span>The next challenge will head your way.</span></div></div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <label htmlFor="newsletter-email">Grown-up email</label>
            <div className="newsletter-input-row"><input id="newsletter-email" required type="email" maxLength={160} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="grownup@example.com" /><button className="button button-dark" disabled={status === 'saving'} type="submit">{status === 'saving' ? 'Joining…' : 'Send me the challenge'} <ArrowRight size={17} /></button></div>
            <label className="newsletter-consent"><input type="checkbox" checked={adultConsent} onChange={(event) => setAdultConsent(event.target.checked)} /><span>I’m 18+ and want Vibe Code Club’s weekly challenge emails. See our <a href="/legal#privacy" target="_blank" rel="noreferrer">Privacy Notice</a>.</span></label>
            {status === 'error' && <p className="newsletter-error" role="alert">Please add a valid grown-up email and check the permission box.</p>}
          </form>
        )}
      </div>
    </section>
  )
}

function App() {
  const [community, setCommunity] = useState<CommunitySnapshot | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)
  const [showIdea, setShowIdea] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [notice, setNotice] = useState('')
  const [voting, setVoting] = useState('')
  const [mascotMessage, setMascotMessage] = useState(0)

  useEffect(() => { loadCommunity().then(setCommunity) }, [])
  useEffect(() => {
    if (!showSubmit && !showIdea) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setShowSubmit(false); setShowIdea(false) }
    }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKey)
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKey) }
  }, [showSubmit, showIdea])

  const sortedProjects = useMemo(() => {
    if (!community) return []
    const score = (project: Project) => project.baseVotes + (community.voteCounts[project.id] || 0)
    return [...community.projects].sort((a, b) => score(b) - score(a))
  }, [community])

  async function vote(project: Project) {
    if (!community || voting) return
    if (!community.votingOpen || !community.galleryChallenge) { setNotice('Voting opens with the gallery next Monday!'); return }
    if (community.myVote === project.id) { setNotice('That build already has your favorite vote!'); return }
    setVoting(project.id)
    try {
      await saveVote(community.galleryChallenge.id, project.id, community.myVote)
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

  function openSubmission() {
    if (!community?.acceptingSubmissions) {
      setNotice('This build window is closed. The next challenge launches Monday morning!')
      window.setTimeout(() => setNotice(''), 3200)
      return
    }
    setShowSubmit(true)
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
          <a href="/favorites">Clubhouse Favorites</a>
          <a href="#how" onClick={() => setMobileNav(false)}>How it works</a>
          <a href="#subscribe" onClick={() => setMobileNav(false)}>Weekly email</a>
          <a href="/getting-started">Parent guide</a>
        </nav>
        <button className="button button-small button-dark header-submit" onClick={openSubmission}>{community.acceptingSubmissions ? 'Submit a build' : 'Build window closed'} <ArrowRight size={16} /></button>
      </header>

      <main>
        <section className="hero page-shell">
          <div className="hero-copy">
            <div className="eyebrow-pill"><Sparkles size={14} /> A weekly vibe coding club for kids</div>
            <h1>A prompt to create.<br />A place to share.<br /><span>Ideas to inspire.</span></h1>
            <p className="hero-lede">Every Monday, kids get a new vibe coding challenge. Build it your way, share it with the club, and get inspired by projects from kids around the world.</p>
            <div className="hero-actions"><a className="button button-coral" href="#challenge">See this week’s challenge <ArrowRight size={19} /></a><button className="text-link" onClick={openSubmission}>I made something! <span>↗</span></button></div>
            <div className="trust-note"><span className="avatar-stack"><i>🐯</i><i>🦊</i><i>🐸</i></span><p><b>Built for kids who create. Guided by grown-ups.</b></p></div>
          </div>
          <div className="mobile-mascot-wrap">
            <button className="mobile-mascot" type="button" onClick={() => setMascotMessage((current) => (current + 1) % mascotMessages.length)} aria-label="Tap the club cat for another message">
              <span className="mascot-bubble" key={`bubble-${mascotMessage}`}>{mascotMessages[mascotMessage]}</span>
              <img key={`cat-${mascotMessage}`} src="/club-cat.webp" alt="A curious, chubby orange club cat" />
              <small>tap the cat</small>
            </button>
          </div>
          <ChallengePreview challenge={community.challenge} />
        </section>

        <section id="challenge" className="challenge-section">
          <div className="page-shell challenge-layout">
            <div className="section-number">01 <span>THIS WEEK'S MISSION</span></div>
            <div className="challenge-copy">
              <span className="kicker">{community.challenge.eyebrow}</span>
              <h2>{community.challenge.title}</h2>
              <p className="challenge-prompt">{community.challenge.prompt}</p>
              <p>{community.challenge.brief}</p>
              <button className="button button-light" onClick={openSubmission}>{community.acceptingSubmissions ? 'Share your tiny world' : 'Submissions are closed'} <ArrowRight size={18} /></button>
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
            <div><span className="kicker">{community.votingOpen ? `Voting now · ${community.galleryChallenge?.weekLabel}` : 'Fresh builds · Voting opens next Monday'}</span><h2>{community.votingOpen ? `${community.galleryChallenge?.title} showcase` : 'The weekly showcase'}</h2></div>
            <p>{community.votingOpen ? 'Explore this week’s gallery of approved builds and choose one favorite before Sunday night. Come back Monday to meet the winners and see the next challenge!' : 'Explore this week’s gallery of approved builds. Come back on Monday to vote for your favorite and see the next challenge!'}</p>
          </div>
          <div className="gallery-grid">
            {sortedProjects.map((project, index) => {
              const votes = project.baseVotes + (community.voteCounts[project.id] || 0)
              const selected = community.myVote === project.id
              return (
                <article className="project-card" key={project.id} style={{ '--accent': project.accent } as CSSProperties}>
                  {project.demoUrl ? <a className="project-browser experience-launch" href={project.demoUrl} target="_blank" rel="noreferrer" aria-label={`Launch ${project.title}`}><div className="window-bar"><span /><span /><span /><small>{project.builder.toLowerCase()}.world</small></div><ProjectScene project={project} /></a> : <div className="project-browser"><div className="window-bar"><span /><span /><span /><small>{project.builder.toLowerCase()}.world</small></div><ProjectScene project={project} /></div>}
                  <div className="project-meta"><div><div className="project-rank">{community.votingOpen ? `#${index + 1} this week` : 'Ready for Monday’s vote'}</div><h3>{project.demoUrl ? <a className="project-title-launch" href={project.demoUrl} target="_blank" rel="noreferrer">{project.title}</a> : project.title}</h3><p>{project.description}</p><span className="builder-tag">by {project.builder} · age {project.ageBand}</span></div>
                    {community.votingOpen ? <button className={`vote-button ${selected ? 'selected' : ''}`} onClick={() => vote(project)} aria-pressed={selected} aria-label={`Vote for ${project.title}`}><Heart size={22} fill={selected ? 'currentColor' : 'none'} /><b>{votes}</b><small>{selected ? 'Your fave' : 'Favorite'}</small></button> : <div className="vote-locked" aria-label="Voting opens Monday"><LockKeyhole size={21} /><small>Voting Monday</small></div>}
                  </div>
                  <div className="project-links">{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer"><Github size={16} /> See the code</a>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Try it</a>}</div>
                </article>
              )
            })}
          </div>
          {!community.projects.length && <div className="gallery-waiting"><Sparkles size={30} /><h3>The gallery is getting ready.</h3><p>Approved projects will appear here as clubhouse grown-ups finish reviewing them.</p></div>}
          <div className="gallery-footer-row"><p className="gallery-footnote"><ShieldCheck size={16} /> Every project and link is checked by a club grown-up before appearing here.</p><a className="button button-dark" href="/favorites"><Trophy size={17} /> Meet the Clubhouse Favorites</a></div>
        </section>

        <section id="how" className="how-section">
          <div className="page-shell">
            <div className="section-heading compact"><div><span className="kicker">Zero pressure. Maximum curiosity.</span><h2>How the club works</h2></div><p>Every Monday brings two adventures: a brand-new build challenge and a chance to vote for last week’s Clubhouse Favorite.</p></div>
            <div className="steps-grid">
              <article><span className="step-icon coral"><MousePointer2 /></span><small>01 · MONDAY</small><h3>A new prompt drops</h3><p>We reveal a playful mission. Use any tool, language, or creative shortcut you like.</p></article>
              <article><span className="step-icon blue"><Code2 /></span><small>02 · ALL WEEK</small><h3>Build and submit</h3><p>Vibe at your own pace. A grown-up can submit your project any time before Sunday night.</p></article>
              <article><span className="step-icon green"><Heart /></span><small>03 · NEXT MONDAY</small><h3>Voting opens</h3><p>A fresh prompt begins while last week’s approved gallery gets a full, equal week of cheering.</p></article>
              <article><span className="step-icon yellow"><Trophy /></span><small>04 · SUNDAY NIGHT</small><h3>A favorite is crowned</h3><p>Each visitor picks one favorite. The project with the most hearts becomes that challenge’s Clubhouse Favorite.</p></article>
            </div>
            <div className="season-note"><span><CalendarDays /></span><div><small>THE SUMMER SESSION · JULY 13–LABOR DAY</small><h3>8 weekly challenges + one big finale</h3><p>Eight build weeks run from July 13 through Labor Day weekend. The final gallery opens on Labor Day, with voting through September 14—every maker celebrated, with one final community favorite.</p></div></div>
          </div>
        </section>

        <section className="up-next page-shell">
          <div className="up-next-title"><span>Top secret until Monday</span><h2>The challenge calendar</h2><p>We’ll share the dates—not the prompts. Every new mission should feel like opening a surprise.</p></div>
          <div>
            <div className="challenge-list">{community.upcomingChallenges.map((item, index) => <article key={item.opensAt}><span className="up-number" style={{ background: ['#65d9ff', '#ffb3c7', '#b9f44a'][index % 3] }}>{item.weekLabel.match(/\d+/)?.[0]?.padStart(2, '0') || String(index + 2).padStart(2, '0')}</span><div><h3>Mystery challenge</h3><p>Prompt revealed when the new build week begins.</p></div><span className="locked"><LockKeyhole size={15} /> {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(item.opensAt))}</span></article>)}</div>
            <div className="pitch-challenge"><span><Lightbulb size={24} /></span><div><h3>Got a wildly good idea?</h3><p>Kids and grown-ups can pitch a future weekly mission.</p></div><button className="button button-dark" onClick={() => setShowIdea(true)}>Pitch a challenge <ArrowRight size={17} /></button></div>
          </div>
        </section>

        <WeeklySignup />

        <section id="grownups" className="grownups-section">
          <div className="page-shell grownups-layout">
            <div className="safety-art"><ShieldCheck size={66} /><span className="safety-star">✦</span><span className="safety-code">{'{ safe + silly }'}</span></div>
            <div><span className="kicker">Grown-ups stay in the loop</span><h2>Big creativity.<br />Small digital footprint.</h2><p>Kids use nicknames and age groups—never full names. A parent or guardian approves every submission, and our club grown-ups check each project and link before it goes public.</p><ul><li><Check size={17} /> No direct messages or public comments</li><li><Check size={17} /> Parent contact details are never public</li><li><Check size={17} /> One favorite vote per browser each week</li></ul><div className="grownup-actions"><a className="button button-coral" href="/getting-started">New to vibe coding? Start here <ArrowRight size={17} /></a><a className="button button-dark" href="/legal">Safety & privacy <ArrowRight size={17} /></a></div></div>
          </div>
        </section>
      </main>

      <footer><div className="page-shell footer-layout"><Logo /><p>Vibe Code Kids was created by Amy Sterling, whose kids enjoy vibe coding and wanted to see what other kids were creating.</p><div><a href="/favorites">Clubhouse Favorites</a><a href="/getting-started">Parent guide</a><a href="#subscribe">Weekly email</a><a href="/legal">Terms & Privacy</a><a href="mailto:hello@vibecodekids.com">Email Amy</a><a href="#top">Back to top ↑</a></div></div><div className="footer-ticker"><span>MAKE SOMETHING WEIRD</span><i>✦</i><span>BREAK IT ON PURPOSE</span><i>✦</i><span>SHOW US WHAT YOU BUILT</span><i>✦</i></div></footer>
      {community.source === 'offline' && <div className="offline-badge" title="The community database could not be reached">Offline mode <ChevronDown size={13} /></div>}
      {notice && <div className="toast" role="status"><Heart size={17} fill="currentColor" /> {notice}</div>}
      {showSubmit && community.acceptingSubmissions && <SubmissionModal challenge={community.challenge} onClose={() => setShowSubmit(false)} />}
      {showIdea && <ChallengeIdeaModal onClose={() => setShowIdea(false)} />}
    </div>
  )
}

export default App
