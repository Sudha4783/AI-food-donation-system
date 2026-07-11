import { useEffect, useState } from 'react';
import {
  MdVolunteerActivism, MdCheckCircle, MdSchedule,
  MdLocalShipping, MdAddBox, MdArrowForward,
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  DONATION_STATUS_CONFIG, FOOD_TYPE_LABELS,
  formatDate, timeAgo,
} from '../../utils/formatters';
import styles from './DonorDashboard.module.css';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`stat-card ${styles.statCard}`}>
    <div className={styles.statIcon} style={{ color, background: `${color}18` }}>{icon}</div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  </div>
);

const DonorDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await donationService.getMyStats();
        setStats(data.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className={styles.skeletonWrap}>
        {[1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
      </div>
    );
  }

  const s = stats?.stats || {};

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className={styles.subtitle}>Here's an overview of your donation activity.</p>
        </div>
        <Link to="/donor/create-donation" className="btn btn-primary">
          <MdAddBox /> New Donation
        </Link>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <StatCard icon={<MdVolunteerActivism />} label="Total Donated"
          value={s.total ?? 0} color="#10b981" sub="All time" />
        <StatCard icon={<MdSchedule />} label="Available"
          value={s.active ?? 0} color="#06b6d4" sub="Waiting for NGO" />
        <StatCard icon={<MdLocalShipping />} label="In Progress"
          value={s.claimed ?? 0} color="#f59e0b" sub="Claimed / Pickup" />
        <StatCard icon={<MdCheckCircle />} label="Delivered"
          value={s.delivered ?? 0} color="#34d399" sub="Successfully delivered" />
      </div>

      {/* Recent Donations */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Donations</h2>
          <Link to="/donor/donations" className="btn btn-ghost btn-sm">
            View All <MdArrowForward />
          </Link>
        </div>

        {!stats?.recentDonations?.length ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🍽️</span>
            <p>No donations yet. Create your first one!</p>
            <Link to="/donor/create-donation" className="btn btn-primary">
              <MdAddBox /> Create Donation
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Claimed By</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDonations.map((d) => {
                  const cfg = DONATION_STATUS_CONFIG[d.status] || {};
                  return (
                    <tr key={d._id}>
                      <td className={styles.titleCell}>{d.title}</td>
                      <td>{FOOD_TYPE_LABELS[d.foodType] || d.foodType}</td>
                      <td>
                        <span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span>
                      </td>
                      <td>{d.claimedBy?.name || d.claimedBy?.organization || '—'}</td>
                      <td className="text-muted">{timeAgo(d.createdAt)}</td>
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

export default DonorDashboard;
