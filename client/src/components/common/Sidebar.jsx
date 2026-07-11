import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdVolunteerActivism, MdAddBox, MdList,
  MdPeople, MdBarChart, MdSmartToy, MdNotifications,
  MdLogout, MdMenu, MdClose, MdOutlineHandshake,
  MdOutlineInventory2, MdAdminPanelSettings,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const NAV_LINKS = {
  donor: [
    { to: '/donor/dashboard',       icon: <MdDashboard />,          label: 'Dashboard'        },
    { to: '/donor/create-donation', icon: <MdAddBox />,             label: 'Create Donation'  },
    { to: '/donor/donations',       icon: <MdList />,               label: 'My Donations'     },
  ],
  ngo: [
    { to: '/ngo/dashboard',         icon: <MdDashboard />,          label: 'Dashboard'        },
    { to: '/ngo/available',         icon: <MdVolunteerActivism />,   label: 'Find Donations'   },
    { to: '/ngo/claims',            icon: <MdOutlineHandshake />,   label: 'My Claims'        },
  ],
  volunteer: [
    { to: '/volunteer/dashboard',   icon: <MdDashboard />,          label: 'Dashboard'        },
    { to: '/volunteer/pickups',     icon: <MdOutlineInventory2 />,  label: 'Pickups'          },
  ],
  admin: [
    { to: '/admin/dashboard',       icon: <MdDashboard />,          label: 'Dashboard'        },
    { to: '/admin/users',           icon: <MdPeople />,             label: 'Manage Users'     },
    { to: '/admin/donations',       icon: <MdList />,               label: 'All Donations'    },
    { to: '/admin/analytics',       icon: <MdBarChart />,           label: 'Analytics'        },
  ],
};

const ROLE_ICONS = {
  donor:     <MdVolunteerActivism />,
  ngo:       <MdOutlineHandshake />,
  volunteer: <MdPeople />,
  admin:     <MdAdminPanelSettings />,
};

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = NAV_LINKS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.mobileOverlay} onClick={onToggle} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoEmoji}>🍱</span>
          <div>
            <span className={styles.logoText}>FoodBridge</span>
            <span className={styles.logoSub}>AI Donation System</span>
          </div>
          <button className={styles.closeBtn} onClick={onToggle} aria-label="Close sidebar">
            <MdClose size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.userText}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userRole}>
              {ROLE_ICONS[user?.role]}
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          <span className={styles.navSection}>Main Menu</span>
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={() => window.innerWidth < 768 && onToggle()}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={styles.bottom}>
          <NavLink to="/notifications" className={styles.bottomLink}>
            <MdNotifications size={18} />
            <span>Notifications</span>
          </NavLink>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
