import { useEffect, useState } from 'react';
import { donationService, aiService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { FOOD_TYPE_LABELS, QUALITY_LABEL_CONFIG, formatDate, timeAgo } from '../../utils/formatters';
import { MdSmartToy, MdHandshake, MdSearch } from 'react-icons/md';
import Modal from '../../components/common/Modal';

const AvailableDonations = () => {
  const [donations, setDonations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [claimModal, setClaimModal] = useState(null);
  const [claimData, setClaimData] = useState({ pickupScheduled: '', notes: '' });
  const [claiming, setClaiming] = useState(false);
  const [city, setCity] = useState('');
  const toast = useToast();

  const load = async (cityFilter = '') => {
    setLoading(true);
    try {
      const { data } = await donationService.getAll({ status: 'available', city: cityFilter });
      setDonations(data.data || []);
    } catch { toast.error('Failed to load donations'); }
    finally { setLoading(false); }
  };

  const loadRecommendations = async () => {
    setRecLoading(true);
    try {
      const { data } = await aiService.getRecommendations({ city, limit: 5 });
      setRecommendations(data.data.recommendations || []);
      toast.success('AI recommendations ready!');
    } catch { toast.error('Failed to get recommendations'); }
    finally { setRecLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleClaim = async () => {
    if (!claimModal) return;
    setClaiming(true);
    try {
      await donationService.claim(claimModal._id, claimData);
      toast.success('Donation claimed successfully! 🎉');
      setClaimModal(null);
      load(city);
    } catch (err) { toast.error(err.response?.data?.message || 'Claim failed'); }
    finally { setClaiming(false); }
  };

  const DonationCard = ({ donation, score, reasons }) => {
    const qc = donation.aiQualityScore;
    const qualCfg = qc?.label ? QUALITY_LABEL_CONFIG[qc.label] : null;
    return (
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', margin: '0 0 4px' }}>{donation.title}</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {FOOD_TYPE_LABELS[donation.foodType]} · {donation.quantity?.amount} {donation.quantity?.unit}
            </span>
          </div>
          {donation.isUrgent && <span className="badge badge-danger">🚨 Urgent</span>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          {qc?.score != null && (
            <div style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: qualCfg?.bg, color: qualCfg?.color, fontSize: 'var(--text-xs)', fontWeight: 700 }}>
              AI: {qc.score}/100 — {qc.label}
            </div>
          )}
          {score != null && (
            <div style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
              🤖 Match: {score}%
            </div>
          )}
        </div>
        {reasons?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {reasons.map(r => <span key={r} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{r}</span>)}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <span>📍 {donation.location?.city}{donation.location?.area ? `, ${donation.location.area}` : ''}</span>
          <span>⏰ Expires: {formatDate(donation.expiryDate)}</span>
          <span>👤 By: {donation.donor?.name || donation.donor?.organization || '—'}</span>
          {donation.servingSize && <span>🍽️ ~{donation.servingSize} servings</span>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setClaimModal(donation)} id={`claim-${donation._id}`}>
          <MdHandshake /> Claim This Donation
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>Available Donations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>{donations.length} donations available</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input className="form-input" placeholder="Filter by city..." style={{ width: 160 }}
              value={city} onChange={e => setCity(e.target.value)} />
            <button className="btn btn-secondary btn-icon" onClick={() => load(city)}><MdSearch /></button>
          </div>
          <button className="btn btn-primary" onClick={loadRecommendations} disabled={recLoading} id="ai-recommend-btn">
            <MdSmartToy /> {recLoading ? 'Loading…' : 'AI Recommendations'}
          </button>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>🤖 AI Top Picks For You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {recommendations.map(({ donation, recommendationScore, reasons }) => (
              <DonationCard key={donation._id} donation={donation} score={recommendationScore} reasons={reasons} />
            ))}
          </div>
          <hr className="divider" />
        </div>
      )}

      {/* All Donations */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      ) : !donations.length ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>🔍</div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No available donations found. Try a different city.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {donations.map(d => <DonationCard key={d._id} donation={d} />)}
        </div>
      )}

      {/* Claim Modal */}
      <Modal isOpen={!!claimModal} onClose={() => setClaimModal(null)} title="Claim Donation" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            You're claiming: <strong style={{ color: 'var(--text-primary)' }}>{claimModal?.title}</strong>
          </p>
          <div className="form-group">
            <label className="form-label">Scheduled Pickup Date/Time</label>
            <input className="form-input" type="datetime-local"
              value={claimData.pickupScheduled}
              onChange={e => setClaimData(p => ({ ...p, pickupScheduled: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-textarea" rows={3} placeholder="Any special instructions..."
              value={claimData.notes}
              onChange={e => setClaimData(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setClaimModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleClaim} disabled={claiming} id="confirm-claim-btn">
              {claiming ? 'Claiming…' : 'Confirm Claim'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AvailableDonations;
