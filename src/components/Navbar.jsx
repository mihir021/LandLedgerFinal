/**
 * Navbar Component
 * Top navigation bar used across all pages.
 * Adapts between public (landing) and authenticated (dashboard) modes.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLogOut, FiUser, FiGrid } from 'react-icons/fi';
import { SiBlockchaindotcom } from 'react-icons/si';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /** Determine the correct dashboard route for the user's role */
  const getDashboardRoute = () => {
    if (!user) return '/login';
    return ROLE_ROUTES[user.role] || '/login';
  };

  /** Display name — use fullName from backend or fall back */
  const displayName = user?.fullName || user?.name || 'User';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-navy-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <SiBlockchaindotcom className="text-lg text-white" />
          </div>
          <span className="text-white">Land<span className="text-blue-400">Ledger</span></span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden items-center gap-1 md:flex">
          {!isAuthenticated ? (
            <>
              <NavLink to="/" label="Home" />
              <NavLink to="/#features" label="Features" />
              <NavLink to="/search" label="Search" />
            </>
          ) : (
            <>
              <NavLink to={getDashboardRoute()} label="Dashboard" />
              <NavLink to="/search" label="Search" />
              <NavLink to="/register-property" label="Register Property" />
            </>
          )}
        </div>

        {/* ── Desktop Auth Buttons ── */}
        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-navy-200 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardRoute()}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-navy-200 transition-colors hover:bg-white/10"
              >
                <FiUser className="text-blue-400" />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-navy-400 transition-colors hover:text-red-400"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="text-2xl text-navy-200 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/5 bg-navy-900/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {!isAuthenticated ? (
              <>
                <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/search" label="Search Properties" onClick={() => setMobileOpen(false)} />
                <hr className="my-2 border-white/10" />
                <MobileLink to="/login" label="Sign In" onClick={() => setMobileOpen(false)} />
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <MobileLink to={getDashboardRoute()} label="Dashboard" onClick={() => setMobileOpen(false)} icon={<FiGrid />} />
                <MobileLink to="/search" label="Search" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/register-property" label="Register Property" onClick={() => setMobileOpen(false)} />
                <hr className="my-2 border-white/10" />
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

/** Desktop nav link */
function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-2 text-sm font-medium text-navy-300 transition-colors hover:bg-white/5 hover:text-white"
    >
      {label}
    </Link>
  );
}

/** Mobile nav link */
function MobileLink({ to, label, onClick, icon }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-navy-200 transition-colors hover:bg-white/5"
    >
      {icon} {label}
    </Link>
  );
}
