/**
 * DashboardLayout — wraps authenticated dashboard pages.
 * Light background, Navbar + collapsible Sidebar.
 */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LoaderCircle } from 'lucide-react';

export default function DashboardLayout() {
  const { initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-1">
        <LoaderCircle className="h-8 w-8 text-blue-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-1)' }}>
      <Navbar />
      <Sidebar />
      {/* Main content: offset for fixed navbar (h-16) + sidebar (w-60 → transitions to 68px) */}
      <main className="ml-60 pt-16 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
