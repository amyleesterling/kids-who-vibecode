import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ImagePlus, ShieldCheck } from 'lucide-react'
import { countries } from './lib/countries'
import { loadCommunity, submitProject } from './lib/community'
import { prepareProjectImage } from './lib/projectImage'
import type { CommunitySnapshot, SubmissionInput } from './types'

const blankSubmission: SubmissionInput = {
  childNickname: '', ageBand: '', countryCode: '', projectTitle: '', description: '', repoUrl: '', demoUrl: '',
  parentName: '', parentEmail: '', consent: false, publicSharing: false, childLed: false, termsAccepted: false, image: null,
}

function submissionAgeBand(value: string) {
  const youngest = Number(value.match(/\d+/)?.[0] || 0)
  if (!youngest) return ''
  if (youngest <= 6) return '5–6'
  if (youngest <= 9) return '7–9'
  if (youngest <= 12) return '10–12'
  if (youngest <= 15) return '13–15'
  return '16–18'
}

function SubmitPage() {
  const params = new URLSearchParams(window.location.search)
  const [community, setCommunity] = useState<CommunitySnapshot | null>(null)
  const [form, setForm] = useState<SubmissionInput>(() => ({ ...blankSubmission, projectTitle: params.get('idea') || '', ageBand: submissionAgeBand(params.get('age') || '') }))
  const [status, setStatus] = useState<'form' | 'saving' | 'done'>('form')
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [preparingImage, setPreparingImage] = useState(false)

  useEffect(() => { loadCommunity().then(setCommunity); document.title = 'Submit a Project — Vibe Code Kids' }, [])
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }, [imagePreview])
  const update = (name: keyof SubmissionInput, value: string | boolean | File | null) => setForm((current) => ({ ...current, [name]: value }))

  async function chooseImage(file?: File) {
    if (!file) return
    setPreparingImage(true); setError('')
    try {
      const prepared = await prepareProjectImage(file)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(URL.createObjectURL(prepared)); update('image', prepared)
    } catch (reason) {
      update('image', null); setError(reason instanceof Error ? reason.message : 'We could not prepare that image.')
    } finally { setPreparingImage(false) }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (!community?.acceptingSubmissions) { setError('This build window is closed. The next challenge launches Monday morning!'); return }
    if (!form.consent || !form.publicSharing || !form.childLed || !form.termsAccepted) { setError('A grown-up needs to check every permission, attestation, and terms box before submitting.'); return }
    setStatus('saving')
    try { await submitProject(form, community.challenge.id); setStatus('done'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'That did not go through. Please check the form and try again.'); setStatus('form') }
  }

  if (!community) return <main className="submit-loading"><span /><span /><span /><p>Checking this week’s challenge…</p></main>

  return <div className="submit-page">
    <header className="submit-page-header page-shell"><a className="logo" href="/" aria-label="Vibe Code Club home"><span className="logo-mark"><span /><span /><span /></span><span>VIBE CODE<br /><b>CLUB</b></span></a><a className="button button-light" href="/"><ArrowLeft size={17} /> Back to the clubhouse</a></header>
    <main>
      <section className="submit-page-hero"><div className="page-shell"><span className="kicker">Grown-up checkpoint included</span><h1>Share what you made.</h1><p>Submitting to <b>{community.challenge.title}</b> · {community.challenge.weekLabel}</p></div></section>
      {status === 'done' ? <section className="submit-page-success page-shell"><span><Check size={36} /></span><div><span className="kicker">High five!</span><h2>Your build is in the review queue.</h2><p>A club grown-up will check the links before anything appears in the public gallery. We’ll email the parent or guardian with an update.</p><a className="button button-dark" href="/">Back to the clubhouse</a></div></section> :
      <form className="submit-page-form page-shell" onSubmit={handleSubmit}>
        <aside className="submit-progress"><span>01</span><b>Builder</b><span>02</span><b>Project</b><span>03</span><b>Grown-up</b></aside>
        <div className="submit-fields">
          {!community.acceptingSubmissions && <div className="submission-closed"><b>Submissions are currently closed.</b><span>The next build window opens Monday morning.</span></div>}
          <fieldset><legend><span>1</span> About the builder</legend><div className="form-grid"><label>Creator nickname <small>Public — no full names</small><input required maxLength={24} value={form.childNickname} onChange={(event) => update('childNickname', event.target.value)} placeholder="Your club nickname" /></label><label>Age group <small>Public</small><select required value={form.ageBand} onChange={(event) => update('ageBand', event.target.value)}><option value="">Choose one</option><option>5–6</option><option>7–9</option><option>10–12</option><option>13–15</option><option>16–18</option></select></label></div><label>Country <small>Public — shown as a flag</small><select required value={form.countryCode} onChange={(event) => update('countryCode', event.target.value)}><option value="">Choose a country</option>{countries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}</select></label></fieldset>
          <fieldset><legend><span>2</span> About the build</legend><label>Project title<input required maxLength={60} value={form.projectTitle} onChange={(event) => update('projectTitle', event.target.value)} placeholder="My very tiny world" /></label><label>Tell us about it<textarea required maxLength={280} value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="What did you make? What should we try?" /></label><div className="form-grid"><label>Code or project link<input required type="url" value={form.repoUrl} onChange={(event) => update('repoUrl', event.target.value)} placeholder="https://github.com/..." /></label><label>Playable link <small>Optional</small><input type="url" value={form.demoUrl} onChange={(event) => update('demoUrl', event.target.value)} placeholder="https://..." /></label></div><label className="image-upload"><span className="image-upload-icon"><ImagePlus size={25} /></span><span><b>{preparingImage ? 'Preparing your picture…' : form.image ? 'Project picture ready!' : 'Add a project picture'}</b><small>Optional · Use a screenshot or artwork—no faces or identifying details. We resize it and remove photo metadata.</small></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(event.target.files?.[0])} disabled={preparingImage} />{imagePreview && <img src={imagePreview} alt="Project upload preview" />}</label></fieldset>
          <fieldset className="grownup-fieldset"><legend><span>3</span> Grown-up checkpoint</legend><div className="form-grid"><label>Parent / guardian name <small>Never public</small><input required value={form.parentName} onChange={(event) => update('parentName', event.target.value)} /></label><label>Parent / guardian email <small>Never public</small><input required type="email" value={form.parentEmail} onChange={(event) => update('parentEmail', event.target.value)} /></label></div><label className="checkbox-row"><input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} /><span>I’m the child’s parent or legal guardian, or I have their permission to submit this project.</span></label><label className="checkbox-row"><input type="checkbox" checked={form.publicSharing} onChange={(event) => update('publicSharing', event.target.checked)} /><span>I approve the nickname, age group, project description, and project links being displayed publicly.</span></label><label className="checkbox-row child-led-check"><input type="checkbox" checked={form.childLed} onChange={(event) => update('childLed', event.target.checked)} /><span><b>I confirm this is a child-led project—not a project built for them by an adult.</b><small>Grown-ups and AI may help teach, brainstorm, and troubleshoot, but the child made the creative decisions and led the build.</small></span></label><label className="checkbox-row terms-check"><input type="checkbox" checked={form.termsAccepted} onChange={(event) => update('termsAccepted', event.target.checked)} /><span>I have read and agree to the <a href="/legal" target="_blank" rel="noreferrer">Terms, Safety & Privacy Notice</a> as the responsible adult.</span></label></fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="submit-row"><p><ShieldCheck size={17} /> Every submission is reviewed before it goes live.</p><button disabled={status === 'saving' || preparingImage || !community.acceptingSubmissions} className="button button-coral" type="submit">{status === 'saving' ? 'Sending…' : 'Send for review'} <ArrowRight size={18} /></button></div>
        </div>
      </form>}
    </main>
  </div>
}

export default SubmitPage
