import { useEffect, useState } from 'react';
import { adminService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { FOOD_TYPE_LABELS } from '../../utils/formatters';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminService.getStats()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
      {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-2xl)' }} />)}
    </div>
  );

  const byType    = data?.donationsByType || [];
  const monthly   = data?.monthlyTrend   || [];
  const maxMonth  = Math.max(...monthly.map(m => m.count), 1);
  const maxType   = byType[0]?.count || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>📊 Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>Platform donation trends and insights</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Monthly Trend */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Monthly Donation Trend</h2>
          {!monthly.length ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', height: 200 }}>
              {monthly.map((m) => {
                const pct = (m.count / maxMonth) * 100;
                return (
                  <div key={`${m._id.year}-${m._id.month}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.count}</span>
                    <div style={{ width: '100%', height: `${pct}%`, minHeight: 4, background: 'linear-gradient(0deg, var(--clr-primary), var(--clr-accent))', borderRadius: '4px 4px 0 0', transition: 'height 0.8s ease' }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {MONTH_NAMES[(m._id.month - 1) % 12]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donations by Type */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Donations by Food Type</h2>
          {!byType.length ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {byType.map(({ _id, count }) => {
                const pct = Math.round((count / maxType) * 100);
                return (
                  <div key={_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--text-xs)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{FOOD_TYPE_LABELS[_id] || _id}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--clr-primary), var(--clr-accent))', borderRadius: 'var(--radius-full)', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overview Summary */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Platform Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          {[
            ['Total Users', data?.overview?.totalUsers ?? 0, '#10b981'],
            ['Total Donations', data?.overview?.totalDonations ?? 0, '#06b6d4'],
            ['Active Donations', data?.overview?.activeDonations ?? 0, '#f59e0b'],
            ['Delivered', data?.overview?.deliveredDonations ?? 0, '#34d399'],
            ['Total Claims', data?.overview?.totalClaims ?? 0, '#8b5cf6'],
            ['People Served', data?.overview?.totalPeopleServed ?? 0, '#ec4899'],
          ].map(([label, value, color]) => (
            <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
