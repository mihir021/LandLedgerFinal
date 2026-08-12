/**
 * Navbar — premium whitish light-theme top navbar with gold & dark navy accents.
 * Clean white background with backdrop blur on scroll, high-contrast typography,
 * and classic institutional buttons.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown, ArrowRight, ShieldCheck, Bell } from 'lucide-react';
import { useAuth, ROLE_ROUTES, ROLE_LABELS } from '../context/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout, mode } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const dashboardRoute = user ? (ROLE_ROUTES[user.role] || '/') : '/';
  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const notificationRoute = user?.role === 'both'
    ? `/${mode === 'seller' ? 'seller' : 'buyer'}/notifications`
    : user
      ? `/${user.role}/notifications`
      : '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-md py-3'
          : 'bg-white border-b border-gray-100 py-3.5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Premium Institutional Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group" onClick={() => setMobileOpen(false)}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A1628] border border-amber-500/40 shadow-sm group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all duration-300 group-hover:scale-105">
            <ShieldCheck className="h-5 w-5 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-xl font-extrabold text-[#0A1628] font-serif tracking-tight">Land</span>
              <span className="text-xl font-extrabold text-amber-600 font-serif tracking-tight">Ledger</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Govt. Registry</span>
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
              {(user?.role === 'seller' || user?.role === 'both' || user?.role === 'admin') && (
                <NavLink to="/register-property" label="Register Property" />
              )}
            </>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-950 px-4 py-2 rounded-lg hover:bg-gray-100/70 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-xl bg-[#0A1628] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#14233c] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <ConnectButton />
              {(user?.role === 'buyer' || user?.role === 'seller' || user?.role === 'both') && (
                <Link
                  to={notificationRoute}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-gray-950">
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">{displayName}</p>
                    <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl bg-white border border-gray-100 shadow-xl py-1 animate-fade-in">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <User className="h-4 w-4 text-amber-600" />
                      My Profile
                    </Link>
                    <hr className="border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur-xl animate-fade-in shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {!isAuthenticated ? (
              <>
                <MobileLink to="/login" label="Sign In" onClick={() => setMobileOpen(false)} />
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A1628] py-3 text-sm font-semibold text-white mt-3 shadow-md transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-gray-950">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role]}</p>
                  </div>
                </div>
                <div className="px-1 mb-3">
                  <ConnectButton />
                </div>
                <MobileLink to={dashboardRoute} label="Dashboard" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/search" label="Search Properties" onClick={() => setMobileOpen(false)} />
                {(user?.role === 'seller' || user?.role === 'both' || user?.role === 'admin') && (
                  <MobileLink to="/register-property" label="Register Property" onClick={() => setMobileOpen(false)} />
                )}
                <hr className="border-gray-100 my-3" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-gray-900 font-semibold'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
      {isActive && (
        <span
          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
          style={{ background: 'linear-gradient(90deg, #D4AF37, #FDE047)' }}
        />
      )}
    </Link>
  );
}

function MobileLink({ to, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-amber-50 text-gray-900 border-l-2 border-amber-500 font-semibold'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
}
