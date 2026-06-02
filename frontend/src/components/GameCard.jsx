import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './GameCard.css'

export default function GameCard({ game }) {
  const navigate = useNavigate()
  const [imgErr, setImgErr] = useState(false)

  const rating = game.rating || 0
  const stars = Math.round(rating)
  
  let rawGenres = [];
  if (Array.isArray(game.genres)) {
    rawGenres = game.genres.map(g => g.name);
  } else if (typeof game.genres === 'string') {
    rawGenres = game.genres.split(',');
  } else if (typeof game.genres_display === 'string') {
    rawGenres = game.genres_display.split(',');
  }
  const genreList = rawGenres.slice(0, 2).filter(Boolean);

  return (
    <article className="card game-card" onClick={() => navigate(`/game/${game.id || game.rawg_id || game.slug}`)}>
      <div className="game-card-img">
        {!imgErr && game.background_image ? (
          <img src={game.background_image} alt={game.name} onError={() => setImgErr(true)} loading="lazy" />
        ) : (
          <div className="game-card-placeholder">🎮</div>
        )}
        <div className="game-card-overlay" />
      </div>

      <div className="game-card-body">
        <h3 className="game-card-title">{game.name}</h3>

        <div className="game-card-meta">
          <div className="stars">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`star ${i <= stars ? 'filled' : ''}`}>★</span>
            ))}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
              {rating.toFixed(1)}
            </span>
          </div>
          {game.released && <span className="year">{game.released?.slice(0, 4)}</span>}
        </div>

        <div className="game-card-genres">
          {genreList.map(g => <span key={g} className="tag">{g.trim()}</span>)}
        </div>
      </div>
    </article>
  )
}