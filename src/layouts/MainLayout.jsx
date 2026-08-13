/**
 * MainLayout — wraps public pages (Landing, Login, Register, Search, Property)
 * Full-width content area with optional sidebar, dot-grid baseplate, and live background canvas.
 */
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardLiveCanvas from '../components/DashboardLiveCanvas';
import { useAuth } from '../context/AuthContext';
import { navItemsForRole } from './DashboardLayout';

export default function MainLayout() {
  const { isAuthenticated, user, mode } = useAuth();
  const location = useLocation();
  const navItems = navItemsForRole(user, mode);
  const isLanding = location.pathname === '/';

  return (
    <div className={`relative min-h-screen ${!isLanding ? 'dashboard-lego-bg' : 'bg-[#060D17]'} overflow-x-hidden`}>
      {/* Global Interactive Background canvas across all public/search pages */}
      {!isLanding && <DashboardLiveCanvas />}

      <Navbar />
      {isAuthenticated && <Sidebar navItems={navItems} />}

      <main className={`relative z-10 ${isAuthenticated ? 'ml-[64px]' : ''} ${!isLanding ? 'pt-16' : ''} min-h-screen`}>
        <Outlet />
      </main>
    </div>
  );
}
