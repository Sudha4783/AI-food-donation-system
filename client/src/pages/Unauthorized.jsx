import { Link } from 'react-router-dom';
import { MdLock } from 'react-icons/md';

const Unauthorized = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-8)' }}>
    <MdLock style={{ fontSize: '5rem', color: 'var(--clr-danger)' }} />
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Access Denied</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
        You don't have permission to view this page. Please contact an admin if you think this is a mistake.
      </p>
    </div>
    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
  </div>
);

export default Unauthorized;
