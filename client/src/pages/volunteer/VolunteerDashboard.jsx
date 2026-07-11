import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>
          Welcome, {user?.name?.split(' ')[0]}! 🙋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
          Volunteer dashboard — pickup & delivery coordination
        </p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🚚</div>
        <h2>Volunteer Features Coming Soon</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
          Volunteer pickup scheduling and route management will be available in the next phase.
          For now, explore available donations.
        </p>
        <Link to="/ngo/available" className="btn btn-primary">
          Browse Donations <MdArrowForward />
        </Link>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
