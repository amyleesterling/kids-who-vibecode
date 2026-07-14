import { ArrowLeft, ExternalLink, Github, Medal, Sparkles, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FavoritesSnapshot } from './types'

function revealLabel(value: string | null) {
  if (!value) return 'after the first voting week closes'
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date(value))
}

function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritesSnapshot | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/favorites')
      .then(async (response) => {
        if (!response.ok) throw new Error('The trophy shelf could not be opened.')
        return response.json() as Promise<FavoritesSnapshot>
      })
      .then(setFavorites)
      .catch((reason: Error) => setError(reason.message))
  }, [])

  return (
    <div className="favorites-page">
      <header className="favorites-header page-shell">
        <a className="logo" href="/" aria-label="Vibe Code Club home">
          <span className="logo-mark"><span /> <span /> <span /></span>
          <span>VIBE CODE<br /><b>CLUB</b></span>
        </a>
        <a className="button button-light" href="/"><ArrowLeft size={17} /> Back to this week</a>
      </header>

      <main>
        <section className="favorites-hero">
          <div className="page-shell favorites-hero-inner">
            <div><span className="kicker">The clubhouse trophy shelf</span><h1>Clubhouse<br /><span>Favorites</span></h1></div>
            <div className="favorites-hero-copy"><Trophy size={40} /><p>One Clubhouse Favorite and two runners-up from every finished challenge. Results appear only after voting closes, so every build gets a full and fair week.</p></div>
          </div>
        </section>

        <section className="page-shell favorites-content">
          {!favorites && !error && <div className="favorites-loading"><span /><span /><span /><p>Polishing the trophies…</p></div>}
          {error && <div className="favorites-empty"><Medal size={48} /><h2>The trophy shelf is taking a tiny break.</h2><p>{error} Please try again soon.</p></div>}
          {favorites && !favorites.challenges.length && <div className="favorites-empty"><Sparkles size={48} /><span className="kicker">The very first week</span><h2>No winners yet—and that’s exactly right.</h2><p>The first Clubhouse Favorite and runners-up will appear {revealLabel(favorites.nextRevealAt)}.</p><a className="button button-coral" href="/#gallery">Explore this week’s builds</a></div>}
          {favorites?.challenges.map((challenge) => <section className="favorite-week" key={challenge.challengeId}>
            <div className="favorite-week-heading"><div><span className="kicker">{challenge.weekLabel}</span><h2>{challenge.challengeTitle}</h2></div><p>Final results · {revealLabel(challenge.votingClosedAt)}</p></div>
            <div className="podium-grid">{challenge.podium.map((project) => <article className={`podium-card rank-${project.rank}`} key={project.projectId}>
              <div className="podium-ribbon">{project.rank === 1 ? <><Trophy size={17} /> Clubhouse Favorite</> : <><Medal size={17} /> Runner-up #{project.rank - 1}</>}</div>
              <div className="podium-image">{project.imageUrl ? <img src={project.imageUrl} alt={`Screenshot of ${project.title}`} /> : <div><Sparkles size={32} /><span>{project.title}</span></div>}</div>
              <div className="podium-copy"><h3>{project.title}</h3><p>{project.description}</p><span>by {project.builder} · age {project.ageBand}</span><b>{project.votes} favorite{project.votes === 1 ? '' : 's'}</b></div>
              <div className="podium-links">{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer"><Github size={15} /> Code</a>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Try it</a>}</div>
            </article>)}</div>
          </section>)}
        </section>
      </main>

      <footer className="favorites-footer"><div className="page-shell"><p>Every maker belongs on the clubhouse wall.</p><a href="/">See this week’s challenge</a></div></footer>
    </div>
  )
}

export default FavoritesPage
