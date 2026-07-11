import { useEffect, useState } from 'react';
import { ngoService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { CLAIM_STATUS_CONFIG, FOOD_TYPE_LABELS, timeAgo } from '../../utils/formatters';

const STATUS_FLOW = { pending: 'approved', approved: 'picked_up', picked_up: 'delivered' };
const NEXT_LABEL  = { pending: 'Approve', approved: 'Mark Picked Up', picked_up: 'Mark Delivered' };

const NGOClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await ngoService.getClaims({ status: filter });
      setClaims(data.data || []);
    } catch { toast.error('Failed to load claims'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const advance = async (claim) => {
    const next = STATUS_FLOW[claim.status];
    if (!next) return;
    let peopleServed;
    if (next === 'delivered') {
      peopleServed = Number(prompt('How many people were served? (Enter a number)') || 0);
    }
    setUpdating(claim._id);
    try {
      await ngoService.updateClaimStatus(claim._id, { status: next, peopleServed });
      toast.success(`Status updated to ${next.replace('_', ' ')}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setUpdating(null); }
  };

  const cancel = async (claim) => {
    if (!confirm('Cancel this claim? The donation will become available again.')) return;
    setUpdating(claim._id);
    try {
      await ngoService.cancelClaim(claim._id, { reason: 'Cancelled by NGO' });
      toast.success('Claim cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>My Claims</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>Track all your claimed donations</p>
        </div>
        <select className="form-select" style={{ width: 'auto' }}
          value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          {Object.entries(CLAIM_STATUS_CONFIG).map(([v, c]) =>
            <option key={v} value={v}>{c.label}</option>
          )}
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : !claims.length ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>📋</div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No claims found</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>Donation</th><th>Type</th><th>Donor</th>
              <th>Status</th><th>Pickup</th><th>Claimed</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {claims.map(c => {
                const cfg = CLAIM_STATUS_CONFIG[c.status] || {};
                const d = c.donation || {};
                const canAdvance = !!STATUS_FLOW[c.status];
                const canCancel  = !['delivered', 'cancelled'].includes(c.status);
                return (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.title || '—'}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{FOOD_TYPE_LABELS[d.foodType] || '—'}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{d.donor?.name || '—'}</td>
                    <td><span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {c.pickupScheduled ? new Date(c.pickupScheduled).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {canAdvance && (
                          <button className="btn btn-primary btn-sm"
                            disabled={updating === c._id}
                            onClick={() => advance(c)}>
                            {updating === c._id ? '…' : NEXT_LABEL[c.status]}
                          </button>
                        )}
                        {canCancel && (
                          <button className="btn btn-danger btn-sm"
                            disabled={updating === c._id}
                            onClick={() => cancel(c)}>
                            Cancel
                          </button>
                        )}
                      </div>
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

export default NGOClaims;
