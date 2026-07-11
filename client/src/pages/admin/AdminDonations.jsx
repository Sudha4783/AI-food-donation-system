import { useEffect, useState } from 'react';
import { adminService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { DONATION_STATUS_CONFIG, FOOD_TYPE_LABELS, formatDate } from '../../utils/formatters';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', foodType: '', city: '' });
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getDonations(filter);
      setDonations(data.data || []);
    } catch { toast.error('Failed to load donations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>All Donations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>Platform-wide donation audit</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="City..." style={{ width: 130 }}
            value={filter.city} onChange={e => setFilter(p => ({ ...p, city: e.target.value }))} />
          <select className="form-select" style={{ width: 'auto' }}
            value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            {Object.entries(DONATION_STATUS_CONFIG).map(([v,c]) =>
              <option key={v} value={v}>{c.label}</option>
            )}
          </select>
          <select className="form-select" style={{ width: 'auto' }}
            value={filter.foodType} onChange={e => setFilter(p => ({ ...p, foodType: e.target.value }))}>
            <option value="">All Types</option>
            {Object.entries(FOOD_TYPE_LABELS).map(([v,l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>Title</th><th>Type</th><th>Donor</th><th>City</th>
              <th>AI Score</th><th>Status</th><th>Claimed By</th><th>Expiry</th>
            </tr></thead>
            <tbody>
              {donations.map(d => {
                const cfg = DONATION_STATUS_CONFIG[d.status] || {};
                return (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{FOOD_TYPE_LABELS[d.foodType]}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{d.donor?.name || '—'}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{d.location?.city || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>
                      {d.aiQualityScore?.score != null ? `${d.aiQualityScore.score}/100` : '—'}
                    </td>
                    <td><span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{d.claimedBy?.name || d.claimedBy?.organization || '—'}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatDate(d.expiryDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDonations;
