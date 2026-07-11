import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-8)' }}>
    <div style={{ fontSize: '8rem', lineHeight: 1, animation: 'float 3s ease-in-out infinite' }}>🍽️</div>
    <div>
      <h1 style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, marginBottom: 'var(--space-2)' }}>404</h1>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
        Looks like this page went missing like leftover food. Let's get you back on track.
      </p>
    </div>
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <Link to="/" className="btn btn-primary">Go Home</Link>
      <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
    </div>
    <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>
  </div>
);

export default NotFound;
