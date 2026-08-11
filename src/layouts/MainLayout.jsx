/**
 * MainLayout — wraps public pages (Landing, Login, Register, Search, Property)
 * Light background, white navbar, full-width content area without sidebar.
 */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { navItemsForRole } from './DashboardLayout';

export default function MainLayout() {
  const { isAuthenticated, user, mode } = useAuth();
  const navItems = navItemsForRole(user, mode);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-1)' }}>
      <Navbar />
      {isAuthenticated && <Sidebar navItems={navItems} />}
      <main className={`${isAuthenticated ? 'ml-[64px]' : ''} pt-16 min-h-screen`}>
        <Outlet />
      </main>
    </div>
  );
}
