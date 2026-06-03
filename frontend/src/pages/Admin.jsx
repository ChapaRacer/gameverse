import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Admin.css'

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/'); return }
    Promise.all([
      api.get('/api/auth/users'),
      api.get('/api/reviews/'),
      api.get('/api/games/saved'),
    ]).then(([u, r, g]) => {
      setUsers(u.data)
      setReviews(r.data)
      setGames(g.data)
    }).finally(() => setLoading(false))
  }, [user, isAdmin])

  const deleteUser = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return
    await api.delete(`/api/auth/users/${id}`)
    setUsers(u => u.filter(x => x.id !== id))
  }

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    await api.put(`/api/auth/users/${u.id}`, { role: newRole })
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x))
  }

  const deleteReview = async (id) => {
    if (!confirm('¿Eliminar reseña?')) return
    await api.delete(`/api/reviews/${id}`)
    setReviews(r => r.filter(x => x.id !== id))
  }

  const deleteGame = async (id) => {
    if (!confirm('¿Eliminar juego de la BD?')) return
    await api.delete(`/api/games/saved/${id}`)
    setGames(g => g.filter(x => x.id !== id))
  }

  if (loading) return <div className="loader" style={{ marginTop: '5rem' }} />

  return (
    <main className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Panel <span>Admin</span></h1>

      <div className="admin-stats">
        <div className="stat-card"><span className="stat-num">{users.length}</span><span>Usuarios</span></div>
        <div className="stat-card"><span className="stat-num">{games.length}</span><span>Juegos guardados</span></div>
        <div className="stat-card"><span className="stat-num">{reviews.length}</span><span>Reseñas</span></div>
      </div>

      <div className="admin-tabs">
        {['users', 'games', 'reviews'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'users' ? '👥 Usuarios' : t === 'games' ? '🎮 Juegos' : '⭐ Reseñas'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td><strong>{u.username}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-accent' : ''}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.is_active ? 'badge-accent' : ''}`}>{u.is_active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => toggleRole(u)}>
                        {u.role === 'admin' ? 'Hacer user' : 'Hacer admin'}
                      </button>
                      {u.id !== user.id && (
                        <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => deleteUser(u.id)}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'games' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Rating</th><th>Géneros</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id}>
                  <td>#{g.id}</td>
                  <td><strong>{g.name}</strong></td>
                  <td>⭐ {g.rating?.toFixed(1)}</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>{g.genres}</td>
                  <td>
                    <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => deleteGame(g.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Usuario</th><th>Juego</th><th>Rating</th><th>Comentario</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.author?.username}</td>
                  <td style={{ maxWidth: 150 }}>{r.game?.name}</td>
                  <td>{'★'.repeat(Math.round(r.rating))}</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.comment || '—'}
                  </td>
                  <td>
                    <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => deleteReview(r.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
