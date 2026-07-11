import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Loader from './components/common/Loader';

// ── Public Pages ─────────────────────────────────────────────────
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// ── Donor Pages ──────────────────────────────────────────────────
import DonorDashboard from './pages/donor/DonorDashboard';
import CreateDonation from './pages/donor/CreateDonation';
import DonorDonations from './pages/donor/DonorDonations';

// ── NGO Pages ────────────────────────────────────────────────────
import NGODashboard from './pages/ngo/NGODashboard';
import AvailableDonations from './pages/ngo/AvailableDonations';
import NGOClaims from './pages/ngo/NGOClaims';

// ── Volunteer Pages ─────────────────────────────────────────────
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

// ── Admin Pages ──────────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AdminDonations from './pages/admin/AdminDonations';
import Analytics from './pages/admin/Analytics';

// ── Shared Pages ─────────────────────────────────────────────────
import NotificationsPage from './pages/Notifications';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// ── Role-based redirect after login ──────────────────────────────
const RoleRedirect = () => {
  const { user } = useAuth();
  const map = {
    donor:     '/donor/dashboard',
    ngo:       '/ngo/dashboard',
    volunteer: '/volunteer/dashboard',
    admin:     '/admin/dashboard',
  };
  return <Navigate to={map[user?.role] || '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Post-login redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleRedirect />
                </ProtectedRoute>
              }
            />

            {/* Donor Routes */}
            <Route
              element={
                <ProtectedRoute roles={['donor']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/donor/dashboard"       element={<DonorDashboard />} />
              <Route path="/donor/create-donation" element={<CreateDonation />} />
              <Route path="/donor/donations"       element={<DonorDonations />} />
            </Route>

            {/* Volunteer Routes */}
            <Route
              element={
                <ProtectedRoute roles={['volunteer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            </Route>

            {/* NGO Routes */}
            <Route
              element={
                <ProtectedRoute roles={['ngo']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/ngo/dashboard" element={<NGODashboard />} />
              <Route path="/ngo/available" element={<AvailableDonations />} />
              <Route path="/ngo/claims"    element={<NGOClaims />} />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users"     element={<ManageUsers />} />
              <Route path="/admin/donations" element={<AdminDonations />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>

            {/* Shared (any authenticated user) */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
