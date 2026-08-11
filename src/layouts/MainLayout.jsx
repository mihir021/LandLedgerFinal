/**
 * MainLayout — wraps public pages (Landing, Login, Register, Search, Property)
 * Light background, white navbar, full-width content area without sidebar.
 */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-1)' }}>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
