import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gamesService} from '../services/api'
import './GameDetail.css'

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const isNum = !isNaN(id)
    const fetchGame = isNum
      ? gamesService.detail(id).then(r => r.data)
      : gamesService.detail(id).then(r => r.data)

    fetchGame.then(data => {
      setGame(data)
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <div className="loader" style={{ marginTop: '5rem' }} />
  if (!game) return null

  return (
    <div className="game-detail">
      <div className="game-detail-hero" style={{ backgroundImage: `url(${game.background_image})` }}>
        <div className="game-detail-hero-overlay" />
        <div className="container game-detail-hero-content">
          <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>← Volver</button>
          <div className="game-detail-header">
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {game.genres?.slice(0, 3).map(g => <span key={g.id} className="badge">{g.name}</span>)}
              </div>
              <h1 className="game-detail-title">{game.name}</h1>
              <div className="game-detail-meta">
                <div className="stars">
                  <span style={{ color: '#ffd700' }}>★</span>
                  <span style={{ marginLeft: 6 }}>{game.rating}</span>
                </div>
                {game.released && <span>📅 {game.released}</span>}
                {game.playtime > 0 && <span>⏱ {game.playtime}h promedio</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container game-detail-body">
        <div className="game-detail-grid">
          <div>
            {game.description_raw && (
              <section className="detail-section">
                <h2 className="detail-section-title">Descripción</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  {game.description_raw.slice(0, 800)}{game.description_raw.length > 800 ? '...' : ''}
                </p>
              </section>
            )}

            {game.parent_platforms?.length > 0 && (
              <section className="detail-section">
                <h2 className="detail-section-title">Plataformas</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {game.parent_platforms.map(p => (
                    <span key={p.platform.id} className="badge">{p.platform.name}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="game-detail-sidebar">
            {game.background_image && (
              <img src={game.background_image} alt={game.name} className="sidebar-cover" />
            )}
            <div className="sidebar-info">
              {game.metacritic && (
                <div className="sidebar-stat">
                  <span>Metacritic</span>
                  <span className="badge badge-accent">{game.metacritic}</span>
                </div>
              )}
              {game.developers?.length > 0 && (
                <div className="sidebar-stat">
                  <span>Desarrollador</span>
                  <span>{game.developers[0]?.name}</span>
                </div>
              )}
              {game.publishers?.length > 0 && (
                <div className="sidebar-stat">
                  <span>Publisher</span>
                  <span>{game.publishers[0]?.name}</span>
                </div>
              )}
              {game.esrb_rating && (
                <div className="sidebar-stat">
                  <span>Rating</span>
                  <span>{game.esrb_rating.name}</span>
                </div>
              )}
              {game.website && (
                <a href={game.website} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                  Sitio oficial ↗
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
