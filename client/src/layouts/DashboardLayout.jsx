import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MdMenu, MdNotifications } from 'react-icons/md';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className={styles.wrapper}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />

      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((p) => !p)}
            aria-label="Toggle sidebar"
          >
            <MdMenu size={22} />
          </button>

          <div className={styles.topbarRight}>
            <a href="/notifications" className={styles.notifBtn} aria-label="Notifications">
              <MdNotifications size={20} />
              {user?.notificationsCount > 0 && (
                <span className={styles.badge}>{user.notificationsCount}</span>
              )}
            </a>
            <div className={styles.topbarAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
