/**
 * Navbar — light theme top navigation bar.
 * White background, hairline border, navy logo, role-aware nav links.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ROLE_LABELS = {
  buyer: 'Buyer',
  seller: 'Seller',
  officer: 'Govt. Officer',
  admin: 'Administrator',
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const dashboardRoute = user ? (ROLE_ROUTES[user.role] || '/') : '/';
  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200" style={{ boxShadow: '0 1px 3px rgba(30,58,95,0.06)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-blue-900 font-serif tracking-tight">Land</span>
            <span className="text-lg font-bold text-amber-600 font-serif tracking-tight">Ledger</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {!isAuthenticated ? (
            <>
              <NavLink to="/" label="Home" />
              <NavLink to="/search" label="Search Properties" />
            </>
          ) : (
            <>
              <NavLink to={dashboardRoute} label="Dashboard" />
              <NavLink to="/search" label="Search" />
              {(user?.role === 'seller' || user?.role === 'admin') && (
                <NavLink to="/register-property" label="Register Property" />
              )}
            </>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <ConnectButton />
              <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{displayName}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-52 ll-card shadow-lg py-1 animate-fade-in">
                  <Link
                    to={dashboardRoute}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard className="h-4 w-4 text-gray-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    My Profile
                  </Link>
                  <hr className="ll-divider my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {!isAuthenticated ? (
              <>
                <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/search" label="Search Properties" onClick={() => setMobileOpen(false)} />
                <hr className="ll-divider my-2" />
                <MobileLink to="/login" label="Sign In" onClick={() => setMobileOpen(false)} />
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center mt-2"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                    <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role]}</p>
                  </div>
                </div>
                <div className="px-3 mb-3">
                  <ConnectButton />
                </div>
                <MobileLink to={dashboardRoute} label="Dashboard" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/search" label="Search Properties" onClick={() => setMobileOpen(false)} />
                {(user?.role === 'seller' || user?.role === 'admin') && (
                  <MobileLink to="/register-property" label="Register Property" onClick={() => setMobileOpen(false)} />
                )}
                <hr className="ll-divider my-2" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 text-blue-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {label}
    </Link>
  );
}
