export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '2rem 1.5rem',
      marginTop: '4rem',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.875rem'
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>
        GAMEVERSE
      </p>
      <p>Plataforma de videojuegos — Prueba Técnica Turing-IA</p>
      <p style={{ marginTop: '0.5rem' }}>
        Datos provistos por{' '}
        <a href="https://rawg.io" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
          RAWG.io
        </a>
      </p>
    </footer>
  )
}
