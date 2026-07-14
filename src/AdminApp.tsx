import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, CalendarDays, Check, Clock3, ExternalLink, Github, Heart, Image as ImageIcon, ImagePlus, Inbox,
  Lightbulb, LogOut, Mail, RefreshCw, Save, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { prepareProjectImage } from './lib/projectImage'

type AdminSubmission = {
  id: string
  challengeId: string
  childNickname: string
  ageBand: string
  projectTitle: string
  description: string
  repoUrl: string
  demoUrl?: string
  parentName: string
  parentEmail: string
  childLed: boolean
  imageName?: string
  imageSize?: number
  hasImage: boolean
  imageUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

type AdminIdea = {
  id: string
  ideaTitle: string
  ideaPrompt: string
  starterSpark?: string
  creatorNickname: string
  creatorGroup: string
  grownupEmail: string
  status: 'pending' | 'selected' | 'archived'
  createdAt: string
}

type AdminSubscriber = {
  id: string
  email: string
  status: 'active' | 'unsubscribed'
  source: string
  createdAt: string
  updatedAt: string
}

type AdminChallenge = {
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

type Dashboard = {
  submissions: AdminSubmission[]
  ideas: AdminIdea[]
  subscribers: AdminSubscriber[]
  activity: Array<{ id: string; itemType: string; itemId: string; action: string; createdAt: string }>
  schedule: {
    now: string
    currentChallenge: AdminChallenge | null
    votingChallenge: AdminChallenge | null
    nextChallenge: AdminChallenge | null
    challenges: AdminChallenge[]
  }
}

type AdminTab = 'challenges' | 'submissions' | 'ideas' | 'subscribers'

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function fileSize(value?: number) {
  if (!value) return ''
  return value > 1_000_000 ? `${(value / 1_000_000).toFixed(1)} MB` : `${Math.ceil(value / 1000)} KB`
}

function remainingLabel(value?: string, now = Date.now()) {
  if (!value) return 'Not scheduled'
  const milliseconds = Math.max(0, new Date(value).getTime() - now)
  const days = Math.floor(milliseconds / 86_400_000)
  const hours = Math.floor((milliseconds % 86_400_000) / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

function localDateTime(value: string) {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

async function readError(response: Response) {
  const body = await response.json().catch(() => ({ error: 'Something went wrong.' })) as { error?: string }
  return body.error || 'Something went wrong.'
}

function UpcomingChallengeEditor({ challenge, busy, onSave }: {
  challenge: AdminChallenge
  busy: boolean
  onSave: (challenge: AdminChallenge) => Promise<void>
}) {
  const [draft, setDraft] = useState(() => ({
    ...challenge,
    opensAt: localDateTime(challenge.opensAt),
    closesAt: localDateTime(challenge.closesAt),
    votingOpensAt: localDateTime(challenge.votingOpensAt),
    votingClosesAt: localDateTime(challenge.votingClosesAt),
    starterIdeas: challenge.starterIdeas.join('\n'),
    tools: challenge.tools.join(', '),
  }))
  const update = (name: string, value: string) => setDraft((current) => ({ ...current, [name]: value }))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave({
      ...challenge,
      weekLabel: draft.weekLabel,
      title: draft.title,
      eyebrow: draft.eyebrow,
      prompt: draft.prompt,
      brief: draft.brief,
      opensAt: new Date(draft.opensAt).toISOString(),
      closesAt: new Date(draft.closesAt).toISOString(),
      votingOpensAt: new Date(draft.votingOpensAt).toISOString(),
      votingClosesAt: new Date(draft.votingClosesAt).toISOString(),
      starterIdeas: draft.starterIdeas.split('\n').map((item) => item.trim()).filter(Boolean),
      tools: draft.tools.split(',').map((item) => item.trim()).filter(Boolean),
    })
  }

  return (
    <form className="challenge-editor" onSubmit={submit}>
      <div className="challenge-editor-intro"><span className="kicker">Next scheduled challenge</span><h3>{challenge.title}</h3><p>Saving changes updates the launch schedule immediately. Times use this device’s timezone.</p></div>
      <div className="challenge-form-grid">
        <label><span>Week label</span><input required value={draft.weekLabel} onChange={(event) => update('weekLabel', event.target.value)} /></label>
        <label><span>Challenge title</span><input required value={draft.title} onChange={(event) => update('title', event.target.value)} /></label>
        <label className="wide"><span>Short tagline</span><input required value={draft.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} /></label>
        <label className="wide"><span>The prompt</span><textarea required rows={3} value={draft.prompt} onChange={(event) => update('prompt', event.target.value)} /></label>
        <label className="wide"><span>Build brief</span><textarea required rows={4} value={draft.brief} onChange={(event) => update('brief', event.target.value)} /></label>
        <label><span>Build opens</span><input required type="datetime-local" value={draft.opensAt} onChange={(event) => update('opensAt', event.target.value)} /></label>
        <label><span>Submissions close</span><input required type="datetime-local" value={draft.closesAt} onChange={(event) => update('closesAt', event.target.value)} /></label>
        <label><span>Voting opens</span><input required type="datetime-local" value={draft.votingOpensAt} onChange={(event) => update('votingOpensAt', event.target.value)} /></label>
        <label><span>Voting closes</span><input required type="datetime-local" value={draft.votingClosesAt} onChange={(event) => update('votingClosesAt', event.target.value)} /></label>
        <label className="wide"><span>Starter ideas · one per line</span><textarea required rows={3} value={draft.starterIdeas} onChange={(event) => update('starterIdeas', event.target.value)} /></label>
        <label className="wide"><span>Suggested tools · comma separated</span><input required value={draft.tools} onChange={(event) => update('tools', event.target.value)} /></label>
      </div>
      <button className="admin-save-challenge" disabled={busy} type="submit"><Save size={17} /> {busy ? 'Saving…' : 'Save upcoming challenge'}</button>
    </form>
  )
}

function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<AdminTab>('challenges')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [clock, setClock] = useState(Date.now())

  const loadDashboard = useCallback(async () => {
    setError('')
    const response = await fetch('/api/admin/dashboard', { cache: 'no-store' })
    if (response.status === 401) {
      setAuthenticated(false)
      setDashboard(null)
      return
    }
    if (!response.ok) throw new Error(await readError(response))
    setDashboard(await response.json() as Dashboard)
    setAuthenticated(true)
  }, [])

  useEffect(() => { loadDashboard().catch((reason) => { setAuthenticated(false); setError(reason.message) }) }, [loadDashboard])
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const counts = useMemo(() => ({
    challenges: dashboard?.schedule.challenges.filter((item) => item.status === 'upcoming').length || 0,
    submissions: dashboard?.submissions.filter((item) => item.status === 'pending').length || 0,
    ideas: dashboard?.ideas.filter((item) => item.status === 'pending').length || 0,
    subscribers: dashboard?.subscribers.filter((item) => item.status === 'active').length || 0,
  }), [dashboard])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy('login')
    setError('')
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!response.ok) {
      setError(await readError(response))
      setBusy('')
      return
    }
    setPassword('')
    await loadDashboard().catch((reason) => setError(reason.message))
    setBusy('')
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthenticated(false)
    setDashboard(null)
  }

  async function moderate(type: 'submission' | 'idea' | 'subscriber', id: string, action: string, label: string) {
    if (!window.confirm(label)) return
    const key = `${type}:${id}`
    setBusy(key)
    setError('')
    const response = await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, id, action }),
    })
    if (!response.ok) setError(await readError(response))
    else await loadDashboard().catch((reason) => setError(reason.message))
    setBusy('')
  }

  async function uploadSubmissionImage(id: string, original: File) {
    const key = `image:${id}`
    setBusy(key)
    setError('')
    try {
      const image = await prepareProjectImage(original)
      const body = new FormData()
      body.set('image', image)
      const response = await fetch(`/api/admin/submission-images/${encodeURIComponent(id)}`, { method: 'POST', body })
      if (!response.ok) throw new Error(await readError(response))
      await loadDashboard()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not add that image.')
    } finally {
      setBusy('')
    }
  }

  async function saveChallenge(challenge: AdminChallenge) {
    const key = `challenge:${challenge.id}`
    setBusy(key)
    setError('')
    const response = await fetch(`/api/admin/challenges/${encodeURIComponent(challenge.id)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(challenge),
    })
    if (!response.ok) setError(await readError(response))
    else await loadDashboard().catch((reason) => setError(reason.message))
    setBusy('')
  }

  if (authenticated === null) {
    return <main className="admin-loading"><span><Sparkles /></span><p>Opening the clubhouse inbox…</p></main>
  }

  if (!authenticated) {
    return (
      <main className="admin-login-page">
        <a className="admin-back" href="/"><ArrowLeft size={17} /> Back to the club</a>
        <section className="admin-login-card">
          <span className="admin-lock"><ShieldCheck size={42} /></span>
          <span className="kicker">Club grown-ups only</span>
          <h1>Clubhouse Admin</h1>
          <p>Review kids’ projects, check uploaded images and links, collect challenge ideas, and manage the grown-up email list.</p>
          <form onSubmit={login}>
            <label htmlFor="admin-password">Clubhouse password</label>
            <input id="admin-password" autoFocus required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="button button-dark" disabled={busy === 'login'} type="submit">{busy === 'login' ? 'Opening…' : 'Open the inbox'}</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div><span className="kicker">Private clubhouse</span><h1>Good morning, grown-up!</h1><p>Nothing becomes public until you approve it here.</p></div>
        <div className="admin-header-actions"><a className="button button-light" href="/" target="_blank">View public site <ExternalLink size={16} /></a><button className="admin-icon-button" onClick={() => loadDashboard().catch((reason) => setError(reason.message))} aria-label="Refresh inbox"><RefreshCw size={18} /></button><button className="admin-icon-button" onClick={logout} aria-label="Sign out"><LogOut size={18} /></button></div>
      </header>

      <section className="admin-schedule-overview" aria-label="Challenge schedule overview">
        <article className="schedule-card current"><span><Clock3 size={17} /> Building now</span><h2>{dashboard?.schedule.currentChallenge?.title || 'No active challenge'}</h2>{dashboard?.schedule.currentChallenge && <><b>{remainingLabel(dashboard.schedule.currentChallenge.closesAt, clock)} left to submit</b><small>Closes {dateLabel(dashboard.schedule.currentChallenge.closesAt)}</small></>}</article>
        <article className="schedule-card voting"><span><Heart size={17} /> Voting now</span><h2>{dashboard?.schedule.votingChallenge?.title || 'Voting waits for Monday'}</h2>{dashboard?.schedule.votingChallenge ? <><b>{remainingLabel(dashboard.schedule.votingChallenge.votingClosesAt, clock)} left to vote</b><small>Closes {dateLabel(dashboard.schedule.votingChallenge.votingClosesAt)}</small></> : dashboard?.schedule.currentChallenge && <><b>Delayed for a fair start</b><small>Opens {dateLabel(dashboard.schedule.currentChallenge.votingOpensAt)}</small></>}</article>
        <article className="schedule-card next"><span><CalendarDays size={17} /> Up next</span><h2>{dashboard?.schedule.nextChallenge?.title || 'Summer finale'}</h2>{dashboard?.schedule.nextChallenge && <><b>Auto-launches in {remainingLabel(dashboard.schedule.nextChallenge.opensAt, clock)}</b><small>{dateLabel(dashboard.schedule.nextChallenge.opensAt)}</small></>}</article>
      </section>

      <nav className="admin-tabs" aria-label="Clubhouse inbox sections">
        <button className={tab === 'challenges' ? 'active' : ''} onClick={() => setTab('challenges')}><CalendarDays size={18} /> Challenges <b>{counts.challenges}</b></button>
        <button className={tab === 'submissions' ? 'active' : ''} onClick={() => setTab('submissions')}><Inbox size={18} /> Projects <b>{counts.submissions}</b></button>
        <button className={tab === 'ideas' ? 'active' : ''} onClick={() => setTab('ideas')}><Lightbulb size={18} /> Challenge ideas <b>{counts.ideas}</b></button>
        <button className={tab === 'subscribers' ? 'active' : ''} onClick={() => setTab('subscribers')}><Mail size={18} /> Grown-up emails <b>{counts.subscribers}</b></button>
      </nav>

      {error && <p className="admin-global-error" role="alert">{error}</p>}

      <main className="admin-content">
        {tab === 'challenges' && <section>
          <div className="admin-section-heading"><div><span className="kicker">Automatic weekly rollover</span><h2>Upcoming challenge</h2></div><p>The public site chooses the active prompt and voting gallery from these dates—no Monday-morning button press needed.</p></div>
          {dashboard?.schedule.nextChallenge ? <UpcomingChallengeEditor key={dashboard.schedule.nextChallenge.id} challenge={dashboard.schedule.nextChallenge} busy={busy === `challenge:${dashboard.schedule.nextChallenge.id}`} onSave={saveChallenge} /> : <div className="admin-empty"><CalendarDays size={35} /><h3>No upcoming challenge is scheduled.</h3></div>}
          <div className="season-schedule">
            <div className="season-schedule-heading"><span className="kicker">The full summer session</span><h3>Challenge calendar</h3></div>
            {dashboard?.schedule.challenges.map((challenge) => <article key={challenge.id} className={`season-row status-${challenge.status}`}><span className="admin-status">{challenge.status}</span><div><b>{challenge.title}</b><small>{challenge.weekLabel}</small></div><div><span>Build</span><small>{dateLabel(challenge.opensAt)} → {dateLabel(challenge.closesAt)}</small></div><div><span>Vote</span><small>{dateLabel(challenge.votingOpensAt)} → {dateLabel(challenge.votingClosesAt)}</small></div></article>)}
          </div>
        </section>}

        {tab === 'submissions' && <section>
          <div className="admin-section-heading"><div><span className="kicker">Moderation queue</span><h2>Project submissions</h2></div><p>Open every code and playable link before approving.</p></div>
          <div className="admin-card-list">
            {dashboard?.submissions.map((item) => <article className={`admin-card submission-card status-${item.status}`} key={item.id}>
              <div className="admin-card-top"><span className="admin-status">{item.status}</span><time>{dateLabel(item.createdAt)}</time></div>
              <div className="submission-review-grid">
                <div className="admin-image-panel">
                  {item.hasImage && item.imageUrl ? <img src={item.imageUrl} alt={`Submitted preview for ${item.projectTitle}`} /> : <div className="admin-image-empty"><ImageIcon size={32} /><span>No picture submitted</span></div>}
                  {item.hasImage && <small>{item.imageName} · {fileSize(item.imageSize)}</small>}
                  <label className="admin-image-upload">
                    <ImagePlus size={16} />
                    <span>{busy === `image:${item.id}` ? 'Preparing image…' : item.hasImage ? 'Replace image' : 'Add image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy === `image:${item.id}`}
                      onChange={(event) => {
                        const input = event.currentTarget
                        const file = input.files?.[0]
                        if (file) uploadSubmissionImage(item.id, file).finally(() => { input.value = '' })
                      }}
                    />
                  </label>
                  <small>JPEG, PNG, or WebP · resized and stripped of photo metadata</small>
                </div>
                <div className="admin-card-copy">
                  <span className="builder-tag">by {item.childNickname} · age {item.ageBand}</span>
                  {item.childLed ? <span className="child-led-badge"><ShieldCheck size={15} /> Grown-up attested: child-led project</span> : <span className="child-led-badge missing"><X size={15} /> No child-led attestation on this older submission</span>}
                  <h3>{item.projectTitle}</h3>
                  <p>{item.description}</p>
                  <div className="admin-links"><a href={item.repoUrl} target="_blank" rel="noreferrer"><Github size={16} /> Check the code</a>{item.demoUrl && <a href={item.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open playable link</a>}</div>
                  <div className="private-contact"><ShieldCheck size={16} /><span><b>Private grown-up contact</b>{item.parentName} · <a href={`mailto:${item.parentEmail}`}>{item.parentEmail}</a></span></div>
                </div>
              </div>
              <div className="admin-card-actions"><span>Challenge: {item.challengeId}</span><div><button disabled={busy === `submission:${item.id}`} className="admin-reject" onClick={() => moderate('submission', item.id, 'reject', `Reject “${item.projectTitle}” and keep it out of the gallery?`)}><X size={16} /> Reject</button><button disabled={busy === `submission:${item.id}`} className="admin-approve" onClick={() => moderate('submission', item.id, 'approve', `Approve “${item.projectTitle}” for its scheduled gallery week?`)}><Check size={16} /> Approve for gallery</button></div></div>
            </article>)}
            {!dashboard?.submissions.length && <div className="admin-empty"><Inbox size={35} /><h3>The project inbox is empty.</h3></div>}
          </div>
        </section>}

        {tab === 'ideas' && <section>
          <div className="admin-section-heading"><div><span className="kicker">Idea jar</span><h2>Future challenge pitches</h2></div><p>Select promising ideas or archive the rest.</p></div>
          <div className="admin-card-list idea-list">
            {dashboard?.ideas.map((idea) => <article className={`admin-card status-${idea.status}`} key={idea.id}>
              <div className="admin-card-top"><span className="admin-status">{idea.status}</span><time>{dateLabel(idea.createdAt)}</time></div>
              <span className="builder-tag">{idea.creatorNickname} · {idea.creatorGroup}</span><h3>{idea.ideaTitle}</h3><p>{idea.ideaPrompt}</p>{idea.starterSpark && <blockquote>Starter spark: {idea.starterSpark}</blockquote>}
              <div className="private-contact"><Mail size={16} /><a href={`mailto:${idea.grownupEmail}`}>{idea.grownupEmail}</a></div>
              <div className="admin-card-actions"><span>Private until selected</span><div><button disabled={busy === `idea:${idea.id}`} className="admin-reject" onClick={() => moderate('idea', idea.id, 'archive', `Archive “${idea.ideaTitle}”?`)}>Archive</button><button disabled={busy === `idea:${idea.id}`} className="admin-approve" onClick={() => moderate('idea', idea.id, 'select', `Mark “${idea.ideaTitle}” as selected?`)}><Check size={16} /> Select idea</button></div></div>
            </article>)}
            {!dashboard?.ideas.length && <div className="admin-empty"><Lightbulb size={35} /><h3>The idea jar is waiting.</h3></div>}
          </div>
        </section>}

        {tab === 'subscribers' && <section>
          <div className="admin-section-heading"><div><span className="kicker">Grown-up list</span><h2>Weekly email subscribers</h2></div><p>{counts.subscribers} currently active.</p></div>
          <div className="subscriber-table" role="table" aria-label="Weekly email subscribers">
            {dashboard?.subscribers.map((subscriber) => <div className="subscriber-row" role="row" key={subscriber.id}><div><b>{subscriber.email}</b><span>Joined {dateLabel(subscriber.createdAt)} · {subscriber.source}</span></div><span className={`admin-status status-${subscriber.status}`}>{subscriber.status}</span><button disabled={busy === `subscriber:${subscriber.id}`} onClick={() => moderate('subscriber', subscriber.id, subscriber.status === 'active' ? 'unsubscribe' : 'activate', `${subscriber.status === 'active' ? 'Unsubscribe' : 'Reactivate'} ${subscriber.email}?`)}>{subscriber.status === 'active' ? 'Unsubscribe' : 'Reactivate'}</button></div>)}
            {!dashboard?.subscribers.length && <div className="admin-empty"><Mail size={35} /><h3>No grown-up emails yet.</h3></div>}
          </div>
        </section>}
      </main>
    </div>
  )
}

export default AdminApp
