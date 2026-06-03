import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const { login, register } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
        addToast('Bienvenido de vuelta 🎮', 'success')
      } else {
        await register(form.username, form.email, form.password)
        await login(form.username, form.password)
        addToast('Cuenta creada correctamente', 'success')
      }
      onClose()
    } catch (err) {
      setError(err.message)
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.05em' }}>
            {mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="field">
            <label>Usuario</label>
            <input name="username" value={form.username} onChange={update} placeholder="Tu nombre de usuario" required />
          </div>
          {mode === 'register' && (
            <div className="field">
              <label>Correo</label>
              <input name="email" type="email" value={form.email} onChange={update} placeholder="correo@ejemplo.com" required />
            </div>
          )}
          <div className="field">
            <label>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={update} placeholder="••••••••" required />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          {' '}
          <button onClick={() => onSwitch(mode === 'login' ? 'register' : 'login')} style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
