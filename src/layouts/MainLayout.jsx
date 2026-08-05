/**
 * MainLayout
 * Layout wrapper for public pages (Landing, Login, Register).
 * Includes the Navbar and renders child routes via <Outlet>.
 */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      {/* Content offset for fixed navbar */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
