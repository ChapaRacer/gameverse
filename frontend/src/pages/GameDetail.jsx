import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gamesService, reviewsService} from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './GameDetail.css'

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="stars" style={{ fontSize: '1.5rem' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i} className={`star ${i <= (hover || value) ? 'filled' : ''}`}
          style={{ cursor: 'pointer', fontSize: '1.6rem' }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >★</span>
      ))}
    </div>
  )
}

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [game, setGame] = useState(null)
  const [localGame, setLocalGame] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    setLoading(true)
    const isNum = !isNaN(id)
    const fetchGame = isNum
      ? gamesService.detail(id).then(r => r.data)
      : gamesService.detail(id).then(r => r.data)

    fetchGame.then(data => {
      setGame(data)
      return gamesService.saved().then(r => {
        const lg = r.data.find(g => g.rawg_id === data.id)
        setLocalGame(lg || null)
        if (lg) {
          reviewsService.byGame(lg.id).then(r => setReviews(r.data))
          if (user) {
            gamesService.favorites.list().then(r => {
              setIsFavorite(r.data.some(f => f.game?.rawg_id === data.id))
            })
          }
        }
      })
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const ensureSaved = async () => {
    if (localGame) return localGame
    const { data } = await gamesService.save({
      rawg_id: game.id, name: game.name, slug: game.slug,
      background_image: game.background_image, rating: game.rating,
      released: game.released,
      genres: game.genres?.map(g => g.name).join(','),
      platforms: game.parent_platforms?.map(p => p.platform.name).join(','),
      description: game.description_raw?.slice(0, 500),
    })
    setLocalGame(data)
    return data
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating) return setReviewError('Selecciona una calificación')
    setSubmitting(true); setReviewError('')
    try {
        const lg = await ensureSaved()
        await reviewsService.create({ game_id: lg.id, ...reviewForm })
        const r = await reviewsService.byGame(lg.id)
        setReviews(r.data)
        setReviewForm({ rating: 0, comment: '' })
        addToast('Reseña publicada correctamente', 'success')
    } catch (err) {
        setReviewError(err.message)
        addToast('Error al publicar la reseña', 'error')
    } finally { setSubmitting(false) }
  }

  const handleFavorite = async () => {
    if (!user) {
        addToast('Inicia sesión para guardar favoritos', 'info')
        return
    }
    try {
        const lg = await ensureSaved()
        if (isFavorite) {
        await gamesService.favorites.remove(lg.id)
        setIsFavorite(false)
        addToast('Quitado de favoritos', 'info')
        } else {
        await gamesService.favorites.add(lg.id)
        setIsFavorite(true)
        addToast('Agregado a favoritos ♥', 'success')
        }
    } catch {
        addToast('Error al actualizar favoritos', 'error')
    }
  }

  if (loading) return <div className="loader" style={{ marginTop: '5rem' }} />
  if (!game) return null

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : game.rating

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
                  {[1,2,3,4,5].map(i => <span key={i} className={`star ${i <= Math.round(avgRating) ? 'filled' : ''}`}>★</span>)}
                  <span style={{ marginLeft: 6 }}>{avgRating?.toFixed(1)}</span>
                </div>
                {game.released && <span>📅 {game.released}</span>}
                {game.playtime > 0 && <span>⏱ {game.playtime}h promedio</span>}
              </div>
            </div>
            <button
              className={`fav-hero-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavorite}
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isFavorite ? '♥ Guardado' : '♡ Favorito'}
            </button>
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

            <section className="detail-section">
              <h2 className="detail-section-title">Reseñas ({reviews.length})</h2>

              {user && (
                <form className="review-form" onSubmit={handleReview}>
                  <div className="field">
                    <label>Tu calificación</label>
                    <StarPicker value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
                  </div>
                  <div className="field">
                    <label>Comentario (opcional)</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="¿Qué te pareció el juego?"
                    />
                  </div>
                  {reviewError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{reviewError}</p>}
                  <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? 'Publicando...' : 'Publicar reseña'}
                  </button>
                </form>
              )}
              {!user && (
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Inicia sesión para dejar una reseña.
                </p>
              )}

              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Aún no hay reseñas. ¡Sé el primero!</p>
                ) : reviews.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-header">
                      <span className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                        {r.author?.username?.[0]?.toUpperCase()}
                      </span>
                      <div>
                        <p style={{ fontWeight: 600 }}>{r.author?.username}</p>
                        <div className="stars" style={{ fontSize: '0.85rem' }}>
                          {[1,2,3,4,5].map(i => <span key={i} className={`star ${i <= r.rating ? 'filled' : ''}`}>★</span>)}
                        </div>
                      </div>
                      <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(r.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    {r.comment && <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.7 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            </section>
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
