import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gamesService } from '../services/api'
import GameCard from '../components/GameCard'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const GENRES = [
  { slug: '', name: 'Todos' },
  { slug: 'action', name: 'Acción' },
  { slug: 'role-playing-games-rpg', name: 'RPG' },
  { slug: 'shooter', name: 'Disparos' },
  { slug: 'adventure', name: 'Aventura' },
  { slug: 'strategy', name: 'Estrategia' },
  { slug: 'sports', name: 'Deportes' },
  { slug: 'puzzle', name: 'Puzzle' },
  { slug: 'indie', name: 'Indie' },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [games, setGames] = useState([])
  const [genre, setGenre] = useState('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    gamesService.popular({ page_size: 5, ordering: '-added' })
      .then(r => setFeatured(r.data.results || []))
    if (user) {
      gamesService.favorites.list()
        .then(r => setFavorites(new Set(r.data.map(f => f.game?.rawg_id))))
        .catch(() => {})
    }
  }, [user])

  const loadGames = useCallback(() => {
    setLoading(true)
    gamesService.popular({ page, page_size: 12, genre: genre || undefined })
      .then(r => {
        const results = r.data.results || []
        setGames(prev => page === 1 ? results : [...prev, ...results])
        setHasNext(!!r.data.next)
      })
      .finally(() => setLoading(false))
  }, [genre, page])

  useEffect(() => { loadGames() }, [loadGames])
  useEffect(() => { setGames([]); setPage(1) }, [genre])
  useEffect(() => { if (page > 1) loadGames() }, [page])

  // Auto-advance hero
  useEffect(() => {
    if (!featured.length) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % featured.length), 5000)
    return () => clearInterval(t)
  }, [featured.length])

  const handleFavorite = async (game) => {
    if (!user) return
    const rawgId = game.id
    const isFav = favorites.has(rawgId)
    try {
      await gamesService.save({
        rawg_id: game.id, name: game.name, slug: game.slug,
        background_image: game.background_image, rating: game.rating,
        released: game.released,
        genres: game.genres?.map(g => g.name).join(','),
        platforms: game.platforms?.map(p => p.platform.name).join(','),
      })
      const savedRes = await gamesService.saved()
      const saved = savedRes.data.find(g => g.rawg_id === rawgId)
      if (saved) {
        if (isFav) {
          await gamesService.favorites.remove(saved.id)
          setFavorites(f => { const n = new Set(f); n.delete(rawgId); return n })
        } else {
          await gamesService.favorites.add(saved.id)
          setFavorites(f => new Set([...f, rawgId]))
        }
      }
    } catch {}
  }

  const hero = featured[heroIdx]

  return (
    <main>
      {hero && (
        <section className="hero" style={{ backgroundImage: `url(${hero.background_image})` }}>
          <div className="hero-overlay" />
          <div className="container hero-content">
            <div className="hero-badges">
              <span className="badge badge-accent">🔥 Destacado</span>
              {hero.genres?.slice(0, 2).map(g => <span key={g.id} className="badge">{g.name}</span>)}
            </div>
            <h1 className="hero-title">{hero.name}</h1>
            <div className="hero-meta">
              <div className="stars">
                {[1,2,3,4,5].map(i => <span key={i} className={`star ${i <= Math.round(hero.rating) ? 'filled' : ''}`}>★</span>)}
                <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{hero.rating?.toFixed(1)}</span>
              </div>
              {hero.released && <span style={{ color: 'var(--text-muted)' }}>{hero.released?.slice(0,4)}</span>}
            </div>
            <button className="btn btn-primary hero-cta" onClick={() => navigate(`/game/${hero.id}`)}>
              Ver detalles →
            </button>
          </div>
          <div className="hero-dots">
            {featured.map((_, i) => (
              <button key={i} className={`dot ${i === heroIdx ? 'active' : ''}`} onClick={() => setHeroIdx(i)} />
            ))}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Explorar <span>Juegos</span></h2>
        </div>

        <div className="genre-bar">
          {GENRES.map(g => (
            <button key={g.slug} className={`tag ${genre === g.slug ? 'active' : ''}`} onClick={() => setGenre(g.slug)}>
              {g.name}
            </button>
          ))}
        </div>

        {loading && games.length === 0 ? (
          <div className="loader" />
        ) : (
          <>
            <div className="games-grid">
              {games.map(game => (
                <GameCard
                  key={game.id}
                  game={{ ...game, genres_display: game.genres?.map(g => g.name).join(',') }}
                  isFavorite={favorites.has(game.id)}
                  onFavorite={user ? handleFavorite : null}
                />
              ))}
            </div>
            {hasNext && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn btn-ghost" onClick={() => setPage(p => p + 1)} disabled={loading}>
                  {loading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
