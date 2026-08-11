/**
 * MainLayout — wraps public pages (Landing, Login, Register, Search, Property)
 * Light background, white navbar, clean content area.
 */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { NAV_BY_ROLE } from './DashboardLayout';

export default function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  
  const role = user?.role || 'buyer';
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.buyer;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-1)' }}>
      <Navbar />
      {isAuthenticated && <Sidebar navItems={navItems} />}
      <main className={`pt-16 min-h-screen ${isAuthenticated ? 'ml-[64px]' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
