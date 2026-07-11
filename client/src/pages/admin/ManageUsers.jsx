import { useEffect, useState } from 'react';
import { adminService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import { ROLE_CONFIG, timeAgo } from '../../utils/formatters';
import { MdSearch, MdBlock, MdCheckCircle, MdDelete } from 'react-icons/md';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getUsers({ search, role: roleFilter });
      setUsers(data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const toggleBan = async (user) => {
    setUpdating(user._id);
    try {
      await adminService.updateUser(user._id, { isBanned: !user.isBanned });
      toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setUpdating(null); }
  };

  const changeRole = async (user, role) => {
    setUpdating(user._id);
    try {
      await adminService.updateUser(user._id, { role });
      toast.success(`Role changed to ${role}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setUpdating(null); }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setUpdating(user._id);
    try {
      await adminService.deleteUser(user._id);
      toast.success('User deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>Manage Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>{users.length} users found</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input className="form-input" placeholder="Search name or email..." style={{ width: 220 }}
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()} />
            <button className="btn btn-secondary btn-icon" onClick={load}><MdSearch /></button>
          </div>
          <select className="form-select" style={{ width: 'auto' }}
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {['donor','ngo','volunteer','admin'].map(r =>
              <option key={r} value={r}>{ROLE_CONFIG[r]?.icon} {ROLE_CONFIG[r]?.label}</option>
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
              <th>User</th><th>Email</th><th>Role</th><th>Status</th>
              <th>Last Login</th><th>Joined</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {users.map(u => {
                const rc = ROLE_CONFIG[u.role] || {};
                return (
                  <tr key={u._id} style={{ opacity: u.isBanned ? 0.6 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${rc.color}20`, color: rc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <select className="form-select" style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: 'var(--text-xs)' }}
                        value={u.role} disabled={updating === u._id || u.role === 'admin'}
                        onChange={e => changeRole(u, e.target.value)}>
                        {['donor','ngo','volunteer','admin'].map(r =>
                          <option key={r} value={r}>{r}</option>
                        )}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.isBanned ? 'badge-danger' : 'badge-success'}`}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{u.lastLogin ? timeAgo(u.lastLogin) : '—'}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{timeAgo(u.createdAt)}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className={`btn btn-sm btn-icon ${u.isBanned ? '' : 'btn-danger'}`}
                            style={u.isBanned ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' } : {}}
                            onClick={() => toggleBan(u)} disabled={updating === u._id}
                            title={u.isBanned ? 'Unban user' : 'Ban user'}>
                            {u.isBanned ? <MdCheckCircle /> : <MdBlock />}
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon"
                            onClick={() => deleteUser(u)} disabled={updating === u._id}
                            title="Delete user">
                            <MdDelete />
                          </button>
                        </div>
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

export default ManageUsers;
