import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, Bot, CalendarDays, Check, Clock3, ExternalLink, Github, Heart, Image as ImageIcon,
  BookOpen, ImagePlus, Inbox, Lightbulb, LogOut, Mail, Pencil, Play, RefreshCw, Save, ShieldCheck, Sparkles, X,
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
  safetyScanId?: string
  safetyStatus?: 'queued' | 'running' | 'passed' | 'review' | 'failed' | 'manual'
  safetyVerdict?: string
  safetySummary?: string
  safetyCategories: string[]
  safetyActions: Array<{ step?: number; action?: string; target?: string; result?: string }>
  safetyTechnicalFlags: string[]
  safetyScreenshotsReviewed: number
  safetyModel?: string
  safetyError?: string
  safetyStartedAt?: string
  safetyCompletedAt?: string
  safetyUpdatedAt?: string
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

type AdminVoteAlert = {
  id: string
  challengeId: string
  challengeTitle: string
  projectId?: string
  projectTitle?: string
  signal: 'shared_fingerprint' | 'rapid_project_spike'
  observedCount: number
  status: 'open' | 'dismissed'
  firstSeenAt: string
  lastSeenAt: string
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

type AdminChallengeDraft = {
  id: string
  title: string
  eyebrow: string
  prompt: string
  brief: string
  starterIdeas: string[]
  tools: string[]
  status: 'idea' | 'scheduled' | 'archived'
  createdAt: string
  updatedAt: string
}

type Dashboard = {
  submissions: AdminSubmission[]
  ideas: AdminIdea[]
  subscribers: AdminSubscriber[]
  voteAlerts: AdminVoteAlert[]
  activity: Array<{ id: string; itemType: string; itemId: string; action: string; createdAt: string }>
  safetyScannerEnabled: boolean
  challengeDrafts: AdminChallengeDraft[]
  schedule: {
    now: string
    currentChallenge: AdminChallenge | null
    votingChallenge: AdminChallenge | null
    nextChallenge: AdminChallenge | null
    challenges: AdminChallenge[]
  }
}

function SafetyReview({ item, enabled, busy, onQueue }: {
  item: AdminSubmission
  enabled: boolean
  busy: boolean
  onQueue: (scanId: string) => Promise<void>
}) {
  const status = item.safetyStatus || 'manual'
  const statusCopy = {
    queued: 'Waiting for AI runner',
    running: 'AI is playing now',
    passed: 'AI playthrough passed',
    review: 'Grown-up review needed',
    failed: 'Playthrough failed',
    manual: item.demoUrl ? 'Manual review required' : 'No playable link',
  }[status]

  return (
    <section className={`safety-review safety-${status}`} aria-label={`AI safety review: ${statusCopy}`}>
      <div className="safety-review-heading"><span><Bot size={19} /><b>{statusCopy}</b></span><span className="admin-status">{status}</span></div>
      {!enabled && <p className="safety-setup-note"><AlertTriangle size={15} /> The review dashboard is ready, but the private AI runner still needs its OpenAI key.</p>}
      {item.safetySummary && <p className="safety-summary">{item.safetySummary}</p>}
      {item.safetyError && <p className="safety-error">{item.safetyError}</p>}
      {!!item.safetyCategories.length && <div className="safety-tags">{item.safetyCategories.map((category) => <span key={category}>{category}</span>)}</div>}
      {!!item.safetyTechnicalFlags.length && <div className="safety-flags"><b>Coverage limits</b>{item.safetyTechnicalFlags.map((flag) => <span key={flag}>{flag}</span>)}</div>}
      {(item.safetyScreenshotsReviewed > 0 || item.safetyCompletedAt) && <p className="safety-meta">Reviewed {item.safetyScreenshotsReviewed} screen{item.safetyScreenshotsReviewed === 1 ? '' : 's'}{item.safetyModel ? ` with ${item.safetyModel}` : ''}{item.safetyCompletedAt ? ` · ${dateLabel(item.safetyCompletedAt)}` : ''}</p>}
      {!!item.safetyActions.length && <details><summary>See what the AI tested ({item.safetyActions.length} steps)</summary><ol>{item.safetyActions.map((action, index) => <li key={`${action.step || index}-${action.action || ''}`}><b>{action.action || 'Observed'}</b>{action.target ? ` · ${action.target}` : ''}{action.result ? <span>{action.result}</span> : null}</li>)}</ol></details>}
      {item.demoUrl && item.safetyScanId && <button className="safety-run-button" disabled={!enabled || busy || status === 'running' || status === 'queued'} onClick={() => onQueue(item.safetyScanId!)}><Play size={15} /> {busy ? 'Queuing…' : status === 'queued' ? 'Already queued' : 'Run AI playthrough again'}</button>}
      {!item.demoUrl && <p className="safety-meta">A repository can be checked manually, but an interactive playthrough requires a playable HTTPS link.</p>}
    </section>
  )
}

type AdminTab = 'challenges' | 'submissions' | 'ideas' | 'vote-alerts' | 'subscribers'

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

function ChallengeEditor({ challenge, busy, onSave, onClose }: {
  challenge: AdminChallenge
  busy: boolean
  onSave: (challenge: AdminChallenge) => Promise<void>
  onClose: () => void
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
      <div className="challenge-editor-intro"><span className="kicker">{challenge.status} challenge · click-to-edit</span><h3>{challenge.title}</h3><p>{challenge.status === 'upcoming' ? 'Copy and schedule are editable. Times use this device’s timezone.' : 'The challenge text is editable; dates lock after a challenge begins so voting stays fair.'}</p></div>
      <div className="challenge-form-grid">
        <label><span>Week label</span><input required value={draft.weekLabel} onChange={(event) => update('weekLabel', event.target.value)} /></label>
        <label><span>Challenge title</span><input required value={draft.title} onChange={(event) => update('title', event.target.value)} /></label>
        <label className="wide"><span>Short tagline</span><input required value={draft.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} /></label>
        <label className="wide"><span>The prompt</span><textarea required rows={3} value={draft.prompt} onChange={(event) => update('prompt', event.target.value)} /></label>
        <label className="wide"><span>Build brief</span><textarea required rows={4} value={draft.brief} onChange={(event) => update('brief', event.target.value)} /></label>
        <label><span>Build opens</span><input disabled={challenge.status !== 'upcoming'} required type="datetime-local" value={draft.opensAt} onChange={(event) => update('opensAt', event.target.value)} /></label>
        <label><span>Submissions close</span><input disabled={challenge.status !== 'upcoming'} required type="datetime-local" value={draft.closesAt} onChange={(event) => update('closesAt', event.target.value)} /></label>
        <label><span>Voting opens</span><input disabled={challenge.status !== 'upcoming'} required type="datetime-local" value={draft.votingOpensAt} onChange={(event) => update('votingOpensAt', event.target.value)} /></label>
        <label><span>Voting closes</span><input disabled={challenge.status !== 'upcoming'} required type="datetime-local" value={draft.votingClosesAt} onChange={(event) => update('votingClosesAt', event.target.value)} /></label>
        <label className="wide"><span>Starter ideas · one per line</span><textarea required rows={3} value={draft.starterIdeas} onChange={(event) => update('starterIdeas', event.target.value)} /></label>
        <label className="wide"><span>Suggested tools · comma separated</span><input required value={draft.tools} onChange={(event) => update('tools', event.target.value)} /></label>
      </div>
      <div className="challenge-editor-actions"><button className="admin-save-challenge" disabled={busy} type="submit"><Save size={17} /> {busy ? 'Saving…' : 'Save challenge'}</button><button className="admin-close-editor" type="button" onClick={onClose}><X size={16} /> Close</button></div>
    </form>
  )
}

function ChallengeDraftEditor({ draft, busy, onSave, onClose }: {
  draft: AdminChallengeDraft
  busy: boolean
  onSave: (draft: AdminChallengeDraft) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState(() => ({ ...draft, starterIdeas: draft.starterIdeas.join('\n'), tools: draft.tools.join(', ') }))
  const update = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave({
      ...draft, title: form.title, eyebrow: form.eyebrow, prompt: form.prompt, brief: form.brief,
      starterIdeas: form.starterIdeas.split('\n').map((item) => item.trim()).filter(Boolean),
      tools: form.tools.split(',').map((item) => item.trim()).filter(Boolean),
    })
  }
  return <form className="challenge-editor draft-editor" onSubmit={submit}>
    <div className="challenge-editor-intro"><span className="kicker">Private challenge idea · {draft.status}</span><h3>{draft.title}</h3><p>Edit this idea without changing the live summer calendar.</p></div>
    <div className="challenge-form-grid">
      <label><span>Challenge title</span><input required value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
      <label><span>Short tagline</span><input required value={form.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} /></label>
      <label className="wide"><span>The prompt</span><textarea required rows={3} value={form.prompt} onChange={(event) => update('prompt', event.target.value)} /></label>
      <label className="wide"><span>Build brief</span><textarea required rows={4} value={form.brief} onChange={(event) => update('brief', event.target.value)} /></label>
      <label className="wide"><span>Starter ideas · one per line</span><textarea required rows={3} value={form.starterIdeas} onChange={(event) => update('starterIdeas', event.target.value)} /></label>
      <label className="wide"><span>Suggested tools · comma separated</span><input required value={form.tools} onChange={(event) => update('tools', event.target.value)} /></label>
    </div>
    <div className="challenge-editor-actions"><button className="admin-save-challenge" disabled={busy} type="submit"><Save size={17} /> {busy ? 'Saving…' : 'Save idea'}</button><button className="admin-close-editor" type="button" onClick={onClose}><X size={16} /> Close</button></div>
  </form>
}

function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<AdminTab>('challenges')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [clock, setClock] = useState(Date.now())
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null)
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)

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
    voteAlerts: dashboard?.voteAlerts.filter((item) => item.status === 'open').length || 0,
    subscribers: dashboard?.subscribers.filter((item) => item.status === 'active').length || 0,
  }), [dashboard])
  const safetyScannerEnabled = dashboard?.safetyScannerEnabled || false

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

  async function moderate(type: 'submission' | 'idea' | 'voteAlert' | 'subscriber', id: string, action: string, label: string, safetyOverride = false) {
    if (!window.confirm(label)) return
    const key = `${type}:${id}`
    setBusy(key)
    setError('')
    const response = await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, id, action, safetyOverride }),
    })
    if (!response.ok) setError(await readError(response))
    else await loadDashboard().catch((reason) => setError(reason.message))
    setBusy('')
  }

  async function queueSafetyScan(scanId: string) {
    const key = `safety:${scanId}`
    setBusy(key)
    setError('')
    const response = await fetch(`/api/admin/safety-scans/${encodeURIComponent(scanId)}`, { method: 'POST' })
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

  async function saveChallengeDraft(draft: AdminChallengeDraft) {
    const key = `challenge-draft:${draft.id}`
    setBusy(key)
    setError('')
    const response = await fetch(`/api/admin/challenge-drafts/${encodeURIComponent(draft.id)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
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
        <button className={tab === 'vote-alerts' ? 'active' : ''} onClick={() => setTab('vote-alerts')}><AlertTriangle size={18} /> Vote alerts <b>{counts.voteAlerts}</b></button>
        <button className={tab === 'subscribers' ? 'active' : ''} onClick={() => setTab('subscribers')}><Mail size={18} /> Grown-up emails <b>{counts.subscribers}</b></button>
      </nav>

      {error && <p className="admin-global-error" role="alert">{error}</p>}

      <main className="admin-content">
        {tab === 'challenges' && <section>
          <div className="admin-section-heading"><div><span className="kicker">Automatic weekly rollover</span><h2>Challenge calendar</h2></div><p>Click any challenge to see its full prompt and edit it. Upcoming rows also let you change the schedule.</p></div>
          <div className="season-schedule">
            <div className="season-schedule-heading"><span className="kicker">The full summer session</span><h3>8 challenges · July 13–Labor Day</h3></div>
            {dashboard?.schedule.challenges.map((challenge) => <button key={challenge.id} type="button" aria-expanded={selectedChallengeId === challenge.id} className={`season-row status-${challenge.status} ${selectedChallengeId === challenge.id ? 'selected' : ''}`} onClick={() => { setSelectedChallengeId((current) => current === challenge.id ? null : challenge.id); setSelectedDraftId(null) }}><span className="admin-status">{challenge.status}</span><div><b>{challenge.title}</b><small>{challenge.weekLabel}</small></div><div><span>Build</span><small>{dateLabel(challenge.opensAt)} → {dateLabel(challenge.closesAt)}</small></div><div><span>Vote</span><small>{dateLabel(challenge.votingOpensAt)} → {dateLabel(challenge.votingClosesAt)}</small></div><Pencil size={16} /></button>)}
          </div>
          {selectedChallengeId && dashboard?.schedule.challenges.find((challenge) => challenge.id === selectedChallengeId) && <ChallengeEditor key={selectedChallengeId} challenge={dashboard.schedule.challenges.find((challenge) => challenge.id === selectedChallengeId)!} busy={busy === `challenge:${selectedChallengeId}`} onSave={saveChallenge} onClose={() => setSelectedChallengeId(null)} />}

          <div className="challenge-bank-heading"><div><span className="kicker">Private idea bank</span><h3>Challenge ideas</h3></div><p>These stay inside the clubhouse until you decide to schedule one. Click any card to edit its full text.</p></div>
          <div className="challenge-bank">{dashboard?.challengeDrafts.map((draft) => <button type="button" key={draft.id} className={`challenge-draft-card ${selectedDraftId === draft.id ? 'selected' : ''}`} aria-expanded={selectedDraftId === draft.id} onClick={() => { setSelectedDraftId((current) => current === draft.id ? null : draft.id); setSelectedChallengeId(null) }}><span><BookOpen size={17} /><b>{draft.status}</b></span><h4>{draft.title}</h4><p>{draft.eyebrow}</p><Pencil size={15} /></button>)}</div>
          {selectedDraftId && dashboard?.challengeDrafts.find((draft) => draft.id === selectedDraftId) && <ChallengeDraftEditor key={selectedDraftId} draft={dashboard.challengeDrafts.find((draft) => draft.id === selectedDraftId)!} busy={busy === `challenge-draft:${selectedDraftId}`} onSave={saveChallengeDraft} onClose={() => setSelectedDraftId(null)} />}
        </section>}

        {tab === 'submissions' && <section>
          <div className="admin-section-heading"><div><span className="kicker">Human + AI moderation</span><h2>Project submissions</h2></div><p>AI explores each playable experience first. A clubhouse grown-up always makes the final decision.</p></div>
          <div className={`safety-system-banner ${safetyScannerEnabled ? 'enabled' : 'setup'}`}><Bot size={25} /><div><b>{safetyScannerEnabled ? 'AI playthrough runner connected' : 'AI review dashboard installed'}</b><p>{safetyScannerEnabled ? 'New playable links are queued automatically. Approval waits for a pass or a recorded grown-up override.' : 'Add the private runner secrets to begin automatic playthroughs. Until then, approvals continue as manual grown-up reviews.'}</p></div></div>
          <div className="admin-card-list">
            {dashboard?.submissions.map((item) => {
              const waitingForScan = safetyScannerEnabled && ['queued', 'running'].includes(item.safetyStatus || '')
              const needsOverride = safetyScannerEnabled && !waitingForScan && item.safetyStatus !== 'passed'
              return <article className={`admin-card submission-card status-${item.status}`} key={item.id}>
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
                  <SafetyReview item={item} enabled={safetyScannerEnabled} busy={busy === `safety:${item.safetyScanId}`} onQueue={queueSafetyScan} />
                  <div className="private-contact"><ShieldCheck size={16} /><span><b>Private grown-up contact</b>{item.parentName} · <a href={`mailto:${item.parentEmail}`}>{item.parentEmail}</a></span></div>
                </div>
              </div>
              <div className="admin-card-actions"><span>Challenge: {item.challengeId}</span><div><button disabled={busy === `submission:${item.id}`} className="admin-reject" onClick={() => moderate('submission', item.id, 'reject', `Reject “${item.projectTitle}” and keep it out of the gallery?`)}><X size={16} /> Reject</button><button disabled={busy === `submission:${item.id}` || waitingForScan} className={needsOverride ? 'admin-override' : 'admin-approve'} onClick={() => moderate('submission', item.id, 'approve', needsOverride ? `The AI playthrough did not pass. Approve “${item.projectTitle}” with a recorded grown-up safety override?` : `Approve “${item.projectTitle}” for its scheduled gallery week?`, needsOverride)}>{waitingForScan ? <><Bot size={16} /> Awaiting AI</> : needsOverride ? <><AlertTriangle size={16} /> Override & approve</> : <><Check size={16} /> Approve for gallery</>}</button></div></div>
            </article>})}
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

        {tab === 'vote-alerts' && <section>
          <div className="admin-section-heading"><div><span className="kicker">Voting integrity</span><h2>Suspicious-vote alerts</h2></div><p>Review unusual patterns without automatically removing votes or identifying visitors.</p></div>
          <div className="vote-alert-privacy"><ShieldCheck size={22} /><div><b>Privacy-preserving signals only</b><p>The system stores a challenge-specific hash—not a raw IP address—and alerts are advisory. Shared family devices and popular links can create innocent spikes.</p></div></div>
          <div className="admin-card-list vote-alert-list">
            {dashboard?.voteAlerts.map((alert) => <article className={`admin-card vote-alert-card status-${alert.status}`} key={alert.id}>
              <div className="admin-card-top"><span className="admin-status">{alert.status}</span><time>Last seen {dateLabel(alert.lastSeenAt)}</time></div>
              <span className="vote-alert-icon"><AlertTriangle size={23} /></span>
              <h3>{alert.signal === 'shared_fingerprint' ? 'Several browser IDs share one signal' : 'Rapid vote burst for one project'}</h3>
              <p>{alert.signal === 'shared_fingerprint' ? `${alert.observedCount} browser vote IDs used the same privacy-safe network/browser signature during this challenge.` : `${alert.observedCount} votes for this project were updated inside a 10-minute window.`}</p>
              <div className="vote-alert-context"><b>{alert.projectTitle || 'Unknown project'}</b><span>{alert.challengeTitle} · first noticed {dateLabel(alert.firstSeenAt)}</span></div>
              <div className="admin-card-actions"><span>No votes were removed automatically.</span><div><button disabled={busy === `voteAlert:${alert.id}`} className={alert.status === 'open' ? 'admin-reject' : 'admin-approve'} onClick={() => moderate('voteAlert', alert.id, alert.status === 'open' ? 'dismiss' : 'reopen', `${alert.status === 'open' ? 'Dismiss' : 'Reopen'} this vote alert?`)}>{alert.status === 'open' ? 'Dismiss alert' : 'Reopen alert'}</button></div></div>
            </article>)}
            {!dashboard?.voteAlerts.length && <div className="admin-empty"><ShieldCheck size={35} /><h3>No suspicious vote patterns.</h3><p>The clubhouse will flag unusual activity here.</p></div>}
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
