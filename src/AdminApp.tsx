import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Check, ExternalLink, Github, Image as ImageIcon, ImagePlus, Inbox,
  Lightbulb, LogOut, Mail, RefreshCw, ShieldCheck, Sparkles, X,
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

type Dashboard = {
  submissions: AdminSubmission[]
  ideas: AdminIdea[]
  subscribers: AdminSubscriber[]
  activity: Array<{ id: string; itemType: string; itemId: string; action: string; createdAt: string }>
}

type AdminTab = 'submissions' | 'ideas' | 'subscribers'

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function fileSize(value?: number) {
  if (!value) return ''
  return value > 1_000_000 ? `${(value / 1_000_000).toFixed(1)} MB` : `${Math.ceil(value / 1000)} KB`
}

async function readError(response: Response) {
  const body = await response.json().catch(() => ({ error: 'Something went wrong.' })) as { error?: string }
  return body.error || 'Something went wrong.'
}

function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<AdminTab>('submissions')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

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

  const counts = useMemo(() => ({
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

      <nav className="admin-tabs" aria-label="Clubhouse inbox sections">
        <button className={tab === 'submissions' ? 'active' : ''} onClick={() => setTab('submissions')}><Inbox size={18} /> Projects <b>{counts.submissions}</b></button>
        <button className={tab === 'ideas' ? 'active' : ''} onClick={() => setTab('ideas')}><Lightbulb size={18} /> Challenge ideas <b>{counts.ideas}</b></button>
        <button className={tab === 'subscribers' ? 'active' : ''} onClick={() => setTab('subscribers')}><Mail size={18} /> Grown-up emails <b>{counts.subscribers}</b></button>
      </nav>

      {error && <p className="admin-global-error" role="alert">{error}</p>}

      <main className="admin-content">
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
                  <h3>{item.projectTitle}</h3>
                  <p>{item.description}</p>
                  <div className="admin-links"><a href={item.repoUrl} target="_blank" rel="noreferrer"><Github size={16} /> Check the code</a>{item.demoUrl && <a href={item.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open playable link</a>}</div>
                  <div className="private-contact"><ShieldCheck size={16} /><span><b>Private grown-up contact</b>{item.parentName} · <a href={`mailto:${item.parentEmail}`}>{item.parentEmail}</a></span></div>
                </div>
              </div>
              <div className="admin-card-actions"><span>Challenge: {item.challengeId}</span><div><button disabled={busy === `submission:${item.id}`} className="admin-reject" onClick={() => moderate('submission', item.id, 'reject', `Reject “${item.projectTitle}” and keep it out of the gallery?`)}><X size={16} /> Reject</button><button disabled={busy === `submission:${item.id}`} className="admin-approve" onClick={() => moderate('submission', item.id, 'approve', `Approve “${item.projectTitle}” and publish it in the gallery?`)}><Check size={16} /> Approve & publish</button></div></div>
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
