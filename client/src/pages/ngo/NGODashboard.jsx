import { useEffect, useState } from 'react';
import { ngoService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { CLAIM_STATUS_CONFIG, timeAgo } from '../../utils/formatters';
import { MdOutlineHandshake, MdCheckCircle, MdLocalShipping, MdPeople, MdArrowForward } from 'react-icons/md';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  </div>
);

const NGODashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    ngoService.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-xl)' }} />)}
    </div>
  );

  const s = stats?.stats || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>Welcome, {user?.name?.split(' ')[0]}! 🏢</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>Manage your food claims and pickups.</p>
        </div>
        <Link to="/ngo/available" className="btn btn-primary">Find Donations <MdArrowForward /></Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)' }}>
        <StatCard icon={<MdOutlineHandshake />} label="Total Claims" value={s.total ?? 0} color="#10b981" />
        <StatCard icon={<MdCheckCircle />} label="Pending" value={s.pending ?? 0} color="#f59e0b" />
        <StatCard icon={<MdLocalShipping />} label="Picked Up" value={s.pickedUp ?? 0} color="#06b6d4" />
        <StatCard icon={<MdPeople />} label="People Served" value={s.totalPeopleServed ?? 0} color="#8b5cf6" />
      </div>

      <div style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Recent Claims</h2>
          <Link to="/ngo/claims" className="btn btn-ghost btn-sm">View All <MdArrowForward /></Link>
        </div>
        {!stats?.recentClaims?.length ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🤝</div>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 var(--space-4)' }}>No claims yet. Find available donations!</p>
            <Link to="/ngo/available" className="btn btn-primary">Browse Donations</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Donation</th><th>Status</th><th>Scheduled Pickup</th><th>Claimed</th></tr></thead>
              <tbody>
                {stats.recentClaims.map(c => {
                  const cfg = CLAIM_STATUS_CONFIG[c.status] || {};
                  return (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.donation?.title || '—'}</td>
                      <td><span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span></td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {c.pickupScheduled ? new Date(c.pickupScheduled).toLocaleString() : '—'}
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODashboard;
