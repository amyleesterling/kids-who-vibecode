import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Check, ExternalLink, Github, Image as ImageIcon, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react'

type ReviewerSubmission = {
  id: string
  childNickname: string
  ageBand: string
  projectTitle: string
  description: string
  repoUrl: string
  demoUrl?: string
  hasImage: boolean
  safetyStatus?: string
  safetySummary?: string
  safetyTechnicalFlags: string[]
  myVerdict?: 'ready' | 'concern'
  myNote?: string
  myReviewedAt?: string
}

type ReviewerSnapshot = {
  reviewerLabel: string
  expiresAt: string
  submissions: ReviewerSubmission[]
}

function inviteToken() {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get('invite') || ''
  if (fromHash) {
    sessionStorage.setItem('vibe-reviewer-invite', fromHash)
    window.history.replaceState(null, '', '/review')
    return fromHash
  }
  return sessionStorage.getItem('vibe-reviewer-invite') || ''
}

async function readError(response: Response) {
  const body = await response.json().catch(() => ({ error: 'Something went wrong.' })) as { error?: string }
  return body.error || 'Something went wrong.'
}

function ProtectedImage({ submission, token }: { submission: ReviewerSubmission; token: string }) {
  const [source, setSource] = useState('')

  useEffect(() => {
    if (!submission.hasImage) return
    let objectUrl = ''
    fetch(`/api/reviewer/submission-images/${encodeURIComponent(submission.id)}`, {
      headers: { authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) return
      objectUrl = URL.createObjectURL(await response.blob())
      setSource(objectUrl)
    }).catch(() => undefined)
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [submission.hasImage, submission.id, token])

  return source ? <img src={source} alt={`Submitted preview for ${submission.projectTitle}`} /> : <div className="reviewer-image-empty"><ImageIcon size={34} /><span>{submission.hasImage ? 'Loading submitted image…' : 'No picture submitted'}</span></div>
}

function ReviewCard({ submission, token, onSaved }: { submission: ReviewerSubmission; token: string; onSaved: () => Promise<void> }) {
  const [note, setNote] = useState(submission.myNote || '')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function save(verdict: 'ready' | 'concern') {
    setBusy(verdict)
    setError('')
    const response = await fetch('/api/reviewer/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ submissionId: submission.id, verdict, note }),
    })
    if (!response.ok) setError(await readError(response))
    else await onSaved()
    setBusy('')
  }

  return <article className="reviewer-card">
    <ProtectedImage submission={submission} token={token} />
    <div className="reviewer-card-copy">
      <span className="builder-tag">by {submission.childNickname} · age {submission.ageBand}</span>
      <h2>{submission.projectTitle}</h2>
      <p>{submission.description}</p>
      <div className="reviewer-links"><a href={submission.repoUrl} target="_blank" rel="noreferrer"><Github size={17} /> Review the code</a>{submission.demoUrl && <a href={submission.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Play the experience</a>}</div>
      <div className={`reviewer-safety status-${submission.safetyStatus || 'manual'}`}><b><ShieldCheck size={17} /> AI playthrough: {submission.safetyStatus || 'manual review'}</b>{submission.safetySummary && <p>{submission.safetySummary}</p>}{!!submission.safetyTechnicalFlags.length && <small>Coverage notes: {submission.safetyTechnicalFlags.join(' · ')}</small>}</div>
      <label className="reviewer-note">Private note for Amy <small>Optional · up to 500 characters</small><textarea maxLength={500} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What did you notice?" /></label>
      {error && <p className="reviewer-error" role="alert">{error}</p>}
      <div className="reviewer-decisions"><button className={submission.myVerdict === 'concern' ? 'selected concern' : 'concern'} disabled={!!busy} onClick={() => save('concern')}><AlertTriangle size={17} /> {busy === 'concern' ? 'Saving…' : 'Needs attention'}</button><button className={submission.myVerdict === 'ready' ? 'selected ready' : 'ready'} disabled={!!busy} onClick={() => save('ready')}><Check size={18} /> {busy === 'ready' ? 'Saving…' : 'Looks ready'}</button></div>
      {submission.myVerdict && <p className="reviewer-saved"><Check size={15} /> Your current recommendation: {submission.myVerdict === 'ready' ? 'Looks ready' : 'Needs attention'}</p>}
    </div>
  </article>
}

function ReviewerApp() {
  const [token] = useState(inviteToken)
  const [snapshot, setSnapshot] = useState<ReviewerSnapshot | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) { setError('Open the private reviewer link Amy shared with you.'); return }
    setError('')
    const response = await fetch('/api/reviewer/submissions', { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!response.ok) { sessionStorage.removeItem('vibe-reviewer-invite'); setError(await readError(response)); return }
    setSnapshot(await response.json() as ReviewerSnapshot)
  }, [token])

  useEffect(() => { load().catch(() => setError('The review room could not be opened.')) }, [load])

  return <div className="reviewer-page">
    <header className="reviewer-header"><a className="logo" href="/" aria-label="Vibe Code Club home"><span className="logo-mark"><span /> <span /> <span /></span><span>VIBE CODE<br /><b>CLUB</b></span></a><a href="/">View public club</a></header>
    <main className="reviewer-main">
      <section className="reviewer-hero"><span className="reviewer-hero-icon"><UsersIcon /></span><div><span className="kicker">Parent review room</span><h1>Help us check the builds.</h1><p>{snapshot ? `Hi ${snapshot.reviewerLabel}! ` : ''}You can review pending projects and leave a recommendation. Only Amy can publish, reject, edit challenges, or see private family contact details.</p></div></section>
      <div className="reviewer-scope"><ShieldCheck size={22} /><p><b>Your view is intentionally limited.</b> You will not see the challenge calendar, future prompts, subscriber list, or submitting grown-up’s name and email.</p><button onClick={() => load().catch(() => setError('Could not refresh.'))} aria-label="Refresh submissions"><RefreshCw size={17} /></button></div>
      {error && <section className="reviewer-access-error"><AlertTriangle size={38} /><h2>This private review room is locked.</h2><p>{error}</p></section>}
      {!snapshot && !error && <div className="reviewer-loading"><Sparkles size={32} /><p>Opening the project queue…</p></div>}
      {snapshot && <section className="reviewer-list">{snapshot.submissions.map((submission) => <ReviewCard key={submission.id} submission={submission} token={token} onSaved={load} />)}{!snapshot.submissions.length && <div className="reviewer-empty"><Sparkles size={40} /><h2>All caught up!</h2><p>There are no pending projects to review right now.</p></div>}</section>}
    </main>
  </div>
}

function UsersIcon() {
  return <Users size={38} />
}

export default ReviewerApp
