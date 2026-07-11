import { useEffect, useState } from 'react';
import { notificationService } from '../services/donationService';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/formatters';
import { MdNotifications, MdDoneAll } from 'react-icons/md';

const TYPE_ICONS = {
  donation_created: '✅', donation_claimed: '🤝', donation_picked_up: '🚚',
  donation_delivered: '🎉', donation_expired: '⏰', claim_approved: '👍',
  claim_cancelled: '❌', user_banned: '🚫', system: '🔔',
};

const NotificationsPage = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    try {
      const { data } = await notificationService.getAll();
      setNotifs(data.data.notifications || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifs(p => p.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark as read'); }
  };

  useEffect(() => { load(); }, []);

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            {unread > 0 ? `${unread} unread` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            <MdDoneAll /> Mark All Read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-xl)' }} />)
        ) : !notifs.length ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
            <MdNotifications style={{ fontSize: '4rem', color: 'var(--text-muted)', display: 'block', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No notifications yet</p>
          </div>
        ) : (
          notifs.map(n => (
            <div key={n._id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
              padding: 'var(--space-4) var(--space-5)',
              background: n.isRead ? 'var(--bg-glass)' : 'rgba(16,185,129,0.06)',
              border: `1px solid ${n.isRead ? 'var(--border-subtle)' : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius-xl)',
              transition: 'var(--transition-fast)',
            }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{n.message}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 6 }}>{timeAgo(n.createdAt)}</div>
              </div>
              {!n.isRead && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clr-primary)', flexShrink: 0, marginTop: 4 }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
