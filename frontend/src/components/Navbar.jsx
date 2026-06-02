import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authModal, setAuthModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchQ('')
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🎮</span>
            <span className="logo-text">GAME<span>VERSE</span></span>
          </Link>

          <form className="navbar-search" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar juegos..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </form>

          <div className="navbar-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link>
            <Link to="/catalog" className={location.pathname === '/catalog' ? 'active' : ''}>Catálogo</Link>
            {user && <Link to="/favorites" className={location.pathname === '/favorites' ? 'active' : ''}>Favoritos</Link>}
            {user?.role === 'admin' && <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>}
          </div>

          <div className="navbar-auth">
            {user ? (
              <div className="user-menu">
                <span className="user-chip">
                  <span className="user-avatar">{user.username[0].toUpperCase()}</span>
                  {user.username}
                </span>
                <button className="btn btn-ghost" onClick={logout}>Salir</button>
              </div>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => setAuthModal('login')}>Iniciar sesión</button>
                <button className="btn btn-primary" onClick={() => setAuthModal('register')}>Registrarse</button>
              </>
            )}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <form className="navbar-search" onSubmit={handleSearch}>
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Buscar juegos..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </form>
            <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link to="/catalog" onClick={() => setMenuOpen(false)}>Catálogo</Link>
            {user && <Link to="/favorites" onClick={() => setMenuOpen(false)}>Favoritos</Link>}
            {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
            {user ? (
              <button className="btn btn-ghost" onClick={() => { logout(); setMenuOpen(false) }}>Salir</button>
            ) : (
              <button className="btn btn-primary" onClick={() => { setAuthModal('login'); setMenuOpen(false) }}>Iniciar sesión</button>
            )}
          </div>
        )}
      </nav>

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={m => setAuthModal(m)} />}
    </>
  )
}
