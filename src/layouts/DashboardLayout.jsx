/**
 * DashboardLayout
 * Layout wrapper for authenticated dashboard pages.
 * Includes Navbar, Sidebar, and content area.
 */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <Sidebar />
      {/* Content area – offset for navbar (h-16 = 4rem) and sidebar (w-64) */}
      <main className="ml-64 pt-16 transition-all duration-300 max-lg:ml-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
