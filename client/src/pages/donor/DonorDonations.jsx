import { useEffect, useState } from 'react';
import { donationService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { DONATION_STATUS_CONFIG, FOOD_TYPE_LABELS, formatDate, timeAgo } from '../../utils/formatters';
import { MdDelete, MdSearch, MdFilterList } from 'react-icons/md';
import { Link } from 'react-router-dom';

const DonorDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', foodType: '' });
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await donationService.getAll({ ...filter, role: 'donor' });
      setDonations(data.data || []);
    } catch { toast.error('Failed to load donations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this donation?')) return;
    try {
      await donationService.delete(id);
      toast.success('Donation deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>My Donations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>All your listed food donations</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <select className="form-select" style={{ width: 'auto' }}
            value={filter.status} onChange={(e) => setFilter(p => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            {Object.entries(DONATION_STATUS_CONFIG).map(([v, c]) =>
              <option key={v} value={v}>{c.label}</option>
            )}
          </select>
          <select className="form-select" style={{ width: 'auto' }}
            value={filter.foodType} onChange={(e) => setFilter(p => ({ ...p, foodType: e.target.value }))}>
            <option value="">All Types</option>
            {Object.entries(FOOD_TYPE_LABELS).map(([v, l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </select>
          <Link to="/donor/create-donation" className="btn btn-primary btn-sm">+ New</Link>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : !donations.length ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📦</div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No donations found</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>Title</th><th>Type</th><th>Qty</th><th>Expiry</th>
              <th>AI Score</th><th>Status</th><th>Created</th><th>Action</th>
            </tr></thead>
            <tbody>
              {donations.map(d => {
                const cfg = DONATION_STATUS_CONFIG[d.status] || {};
                return (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.title}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{FOOD_TYPE_LABELS[d.foodType]}</td>
                    <td>{d.quantity?.amount} {d.quantity?.unit}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{formatDate(d.expiryDate)}</td>
                    <td>
                      {d.aiQualityScore?.score != null ? (
                        <span style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>
                          {d.aiQualityScore.score}/100
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td><span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{timeAgo(d.createdAt)}</td>
                    <td>
                      {['available'].includes(d.status) && (
                        <button className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(d._id)} aria-label="Delete donation">
                          <MdDelete />
                        </button>
                      )}
                    </td>
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

export default DonorDonations;
