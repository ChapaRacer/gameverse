// Pestaña de Búsqueda
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gamesService } from '../services/api'
import GameCard from '../components/GameCard'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    setResults([])
    setPage(1)
    gamesService.search(q, 1).then(r => {
      setResults(r.data.results || [])
      setHasNext(!!r.data.next)
    }).finally(() => setLoading(false))
  }, [q])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    setLoading(true)
    gamesService.search(q, next).then(r => {
      setResults(prev => [...prev, ...(r.data.results || [])])
      setHasNext(!!r.data.next)
    }).finally(() => setLoading(false))
  }

  return (
    <main className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
        Resultados para <span>"{q}"</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{results.length} juegos encontrados</p>
      {loading && results.length === 0 ? (
        <div className="loader" />
      ) : (
        <>
          <div className="games-grid">
            {results.map(g => (
              <GameCard key={g.id} game={{ ...g, genres_display: g.genres?.map(x => x.name).join(',') }} />
            ))}
          </div>
          {results.length === 0 && !loading && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>
              No se encontraron juegos con ese término.
            </p>
          )}
          {hasNext && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn btn-ghost" onClick={loadMore} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

// Pestaña de Catálogo
export function CatalogPage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState('-rating')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    setLoading(true)
    setGames([])
    gamesService.popular({ page: 1, page_size: 20, ordering }).then(r => {
      setGames(r.data.results || [])
      setHasNext(!!r.data.next)
      setPage(1)
    }).finally(() => setLoading(false))
  }, [ordering])

  const loadMore = () => {
    const next = page + 1
    setLoading(true)
    gamesService.popular({ page: next, page_size: 20, ordering }).then(r => {
      setGames(prev => [...prev, ...(r.data.results || [])])
      setHasNext(!!r.data.next)
      setPage(next)
    }).finally(() => setLoading(false))
  }

  const orderOptions = [
    { value: '-rating', label: 'Mejor calificados' },
    { value: '-added', label: 'Más recientes' },
    { value: 'name', label: 'A-Z' },
    { value: '-metacritic', label: 'Metacritic' },
  ]

  return (
    <main className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="section-title">Catálogo <span>Completo</span></h1>
        <div className="field" style={{ margin: 0 }}>
          <select value={ordering} onChange={e => setOrdering(e.target.value)} style={{ minWidth: 180 }}>
            {orderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {loading && games.length === 0 ? <div className="loader" /> : (
        <>
          <div className="games-grid">
            {games.map(g => <GameCard key={g.id} game={{ ...g, genres_display: g.genres?.map(x => x.name).join(',') }} />)}
          </div>
          {hasNext && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn btn-ghost" onClick={loadMore} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

// Pestaña de Favoritos
import { useAuth } from '../context/AuthContext'

export function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    gamesService.favorites.list().then(r => {
      setFavorites(r.data)
    }).finally(() => setLoading(false))
  }, [user])

  const remove = async (gameId) => {
    await gamesService.favorites.remove(gameId)
    setFavorites(f => f.filter(fav => fav.game_id !== gameId))
  }

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: '3rem' }}>🎮</p>
      <p>Inicia sesión para ver tus favoritos</p>
    </div>
  )

  return (
    <main className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Mis <span>Favoritos</span></h1>
      {loading ? <div className="loader" /> : (
        favorites.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>
            No tienes juegos favoritos aún.
          </p>
        ) : (
          <div className="games-grid">
            {favorites.map(fav => (
              <GameCard
                key={fav.id}
                game={fav.game}
                isFavorite={true}
                onFavorite={() => remove(fav.game_id)}
              />
            ))}
          </div>
        )
      )}
    </main>
  )
}
