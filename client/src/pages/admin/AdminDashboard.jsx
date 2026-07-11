import { useEffect, useState } from 'react';
import { adminService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { timeAgo, FOOD_TYPE_LABELS, DONATION_STATUS_CONFIG } from '../../utils/formatters';
import { MdPeople, MdVolunteerActivism, MdCheckCircle, MdTrendingUp, MdArrowForward } from 'react-icons/md';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminService.getStats()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error('Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)' }}>
      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-xl)' }} />)}
    </div>
  );

  const ov = data?.overview || {};
  const STAT_CARDS = [
    { icon: <MdPeople />,              label: 'Total Users',       value: ov.totalUsers ?? 0,       color: '#10b981' },
    { icon: <MdVolunteerActivism />,   label: 'Total Donations',   value: ov.totalDonations ?? 0,   color: '#06b6d4' },
    { icon: <MdCheckCircle />,         label: 'Delivered',         value: ov.deliveredDonations ?? 0, color: '#34d399' },
    { icon: <MdTrendingUp />,          label: 'People Served',     value: ov.totalPeopleServed ?? 0, color: '#8b5cf6' },
    { label: 'Donors',     value: ov.totalDonors ?? 0,     color: '#f59e0b' },
    { label: 'NGOs',       value: ov.totalNGOs ?? 0,       color: '#ec4899' },
    { label: 'Active Now', value: ov.activeDonations ?? 0, color: '#06b6d4' },
    { label: 'Pending Claims', value: ov.pendingClaims ?? 0, color: '#f87171' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>🛡️ Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>Platform overview and management</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)' }}>
        {STAT_CARDS.map((sc) => (
          <div key={sc.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {sc.icon && (
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: `${sc.color}18`, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {sc.icon}
              </div>
            )}
            <div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-display)', color: sc.color, lineHeight: 1 }}>{sc.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sc.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Donations by type */}
      {data?.donationsByType?.length > 0 && (
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Donations by Food Type</h2>
            <Link to="/admin/analytics" className="btn btn-ghost btn-sm">Full Analytics <MdArrowForward /></Link>
          </div>
          <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {data.donationsByType.map(({ _id, count }) => {
              const max = data.donationsByType[0].count;
              const pct = Math.round((count / max) * 100);
              return (
                <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', width: 140, flexShrink: 0, color: 'var(--text-secondary)' }}>{FOOD_TYPE_LABELS[_id] || _id}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--clr-primary), var(--clr-accent))', borderRadius: 'var(--radius-full)', transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Donations */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Recent Donations (Last 7 Days)</h2>
          <Link to="/admin/donations" className="btn btn-ghost btn-sm">View All <MdArrowForward /></Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Title</th><th>Type</th><th>Donor</th><th>Status</th><th>When</th></tr></thead>
            <tbody>
              {(data?.recentDonations || []).map(d => {
                const cfg = DONATION_STATUS_CONFIG[d.status] || {};
                return (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.title}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{FOOD_TYPE_LABELS[d.foodType]}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{d.donor?.name || '—'}</td>
                    <td><span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{timeAgo(d.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
