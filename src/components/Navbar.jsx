/**
 * Navbar — Modern, high-contrast institutional-grade LEGO/voxel style top navigation.
 * Features fixed header with scroll blur, tactile offset box shadows, high-contrast 
 * Deep Navy (#0A1628) and Gold (#D4AF37) accents, and responsive mobile controls.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown, ArrowRight, ShieldCheck, Bell } from 'lucide-react';
import { useAuth, ROLE_ROUTES, ROLE_LABELS } from '../context/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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
      : '/';  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLanding
          ? scrolled
            ? 'bg-[#0A1628]/90 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-lg py-3'
            : 'bg-[#0A1628]/60 backdrop-blur-sm border-b border-[#D4AF37]/20 py-3.5'
          : scrolled
            ? 'bg-white/90 backdrop-blur-md border-b-2 border-[#475569]/15 shadow-md py-3'
            : 'bg-white border-b border-gray-100 py-3.5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand Logo (Left) */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group" onClick={() => setMobileOpen(false)}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-[#0A1628] border-2 border-amber-400 shadow-[2px_2px_0px_#060D17] group-hover:border-amber-300 transition-all duration-200">
            <ShieldCheck className="h-5 w-5 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-[#060D17]"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center leading-none">
              <span className={`text-xl font-black font-pixel tracking-wider uppercase ${isLanding ? 'text-white' : 'text-[#0A1628]'}`}>Land</span>
              <span className="text-xl font-black text-amber-400 font-pixel tracking-wider uppercase ml-0.5">Ledger</span>
            </div>
            <span className={`text-[10px] font-bold font-pixel uppercase tracking-widest leading-none mt-1 ${isLanding ? 'text-white/60' : 'text-gray-500'}`}>
              Govt. Registry
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (Center) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Links moved to sidebar for authenticated users */}
        </div>

        {/* Desktop Actions & Auth Controls (Right) */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className={`font-pixel text-xs sm:text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-all duration-150 ${
                  isLanding
                    ? 'text-white/90 hover:text-amber-400 hover:bg-white/10'
                    : 'text-gray-800 hover:text-[#0A1628] hover:bg-gray-100/80'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`group flex items-center gap-2 rounded-sm px-5 py-2.5 font-pixel text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                  isLanding
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#FDE047] text-[#0A1628] border border-[#D4AF37] shadow-[3px_3px_0px_#060D17] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#060D17]'
                    : 'bg-[#0A1628] text-white border-2 border-amber-500/50 shadow-[3px_3px_0px_rgba(212,175,55,0.4)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_rgba(212,175,55,0.6)]'
                }`}
              >
                <span>Get Started</span>
                <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${isLanding ? 'text-[#0A1628]' : 'text-amber-400'}`} />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <ConnectButton />

              {(user?.role === 'buyer' || user?.role === 'seller' || user?.role === 'both' || user?.role === 'admin' || user?.role === 'officer') && (
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(o => !o)}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-sm transition-all cursor-pointer ${
                      isLanding
                        ? 'border border-[#D4AF37]/40 bg-[#0D1B2A] text-amber-400 shadow-[2px_2px_0px_#060D17]'
                        : 'border-2 border-[#475569] bg-gray-50 text-[#0A1628] shadow-[2px_2px_0px_#475569] hover:bg-amber-50'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 min-w-4 h-4 px-1 rounded-sm bg-red-600 border border-white text-white text-[10px] leading-4 text-center font-bold font-pixel">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className={`flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-all ${
                    isLanding
                      ? 'border border-[#D4AF37]/40 bg-[#0D1B2A] text-white shadow-[2px_2px_0px_#060D17]'
                      : 'border-2 border-[#475569] bg-white text-[#0A1628] shadow-[2px_2px_0px_#475569] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-amber-400 border border-[#060D17] text-xs font-bold font-pixel text-[#0A1628]">
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold font-pixel uppercase max-w-[110px] truncate ${isLanding ? 'text-white' : 'text-[#0A1628]'}`}>{displayName}</p>
                    <p className={`text-[10px] font-sans leading-none ${isLanding ? 'text-amber-400/80' : 'text-gray-600'}`}>{ROLE_LABELS[user?.role] || user?.role}</p>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isLanding ? 'text-amber-400' : 'text-gray-600'} ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className={`absolute right-0 top-full mt-2 z-50 w-52 rounded-sm py-1.5 animate-fade-in ${
                    isLanding
                      ? 'bg-[#0D1B2A] border border-[#D4AF37]/40 shadow-[4px_4px_0px_#060D17]'
                      : 'bg-white border-2 border-[#475569] shadow-[4px_4px_0px_#475569]'
                  }`}>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 font-pixel text-xs font-bold uppercase transition-colors ${
                        isLanding ? 'text-white hover:bg-amber-400/10' : 'text-[#0A1628] hover:bg-amber-50'
                      }`}
                    >
                      <User className="h-4 w-4 text-amber-400" />
                      My Profile
                    </Link>
                    <hr className={isLanding ? 'border-t border-white/10 my-1' : 'border-t border-gray-200 my-1'} />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 font-pixel text-xs font-bold text-red-500 uppercase hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className={`md:hidden p-2 rounded-sm transition-colors ${
            isLanding
              ? 'bg-[#0D1B2A] text-amber-400 border border-[#D4AF37]/40 shadow-[2px_2px_0px_#060D17]'
              : 'border-2 border-[#475569] bg-white text-[#0A1628] shadow-[2px_2px_0px_#475569] hover:bg-gray-100'
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Glassmorphism Dropdown */}
      {mobileOpen && (
        <div className={`md:hidden animate-fade-in shadow-xl ${
          isLanding
            ? 'border-t border-[#D4AF37]/30 bg-[#0A1628]/98 backdrop-blur-xl'
            : 'border-t-2 border-[#475569] bg-white/98 backdrop-blur-xl'
        }`}>
          <div className="px-4 py-4 space-y-3">
            {!isAuthenticated ? (
              <>
                <MobileLink to="/login" label="Sign In" onClick={() => setMobileOpen(false)} isLanding={isLanding} />
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className={`flex w-full items-center justify-center gap-2 rounded-sm py-3 font-pixel text-xs font-bold uppercase transition-all ${
                    isLanding
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#FDE047] text-[#0A1628] shadow-[3px_3px_0px_#060D17]'
                      : 'bg-[#0A1628] text-white border-2 border-amber-500/50 shadow-[3px_3px_0px_rgba(212,175,55,0.4)]'
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight className={`h-4 w-4 ${isLanding ? 'text-[#0A1628]' : 'text-amber-400'}`} />
                </Link>
              </>
            ) : (
              <>
                <div className={`flex items-center gap-3 p-3 rounded-sm mb-3 ${
                  isLanding
                    ? 'bg-[#0D1B2A] border border-[#D4AF37]/40 shadow-[2px_2px_0px_#060D17]'
                    : 'bg-amber-50/70 border-2 border-[#475569] shadow-[2px_2px_0px_#475569]'
                }`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-amber-400 border border-[#060D17] text-sm font-bold font-pixel text-[#0A1628]">
                    {initials}
                  </div>
                  <div>
                    <p className={`text-xs font-bold font-pixel uppercase ${isLanding ? 'text-white' : 'text-[#0A1628]'}`}>{displayName}</p>
                    <p className={`text-[10px] font-sans ${isLanding ? 'text-amber-400/80' : 'text-gray-600'}`}>{ROLE_LABELS[user?.role]}</p>
                  </div>
                </div>
                <div className="px-1 mb-3">
                  <ConnectButton />
                </div>
                <hr className={isLanding ? 'border-t border-white/10 my-2' : 'border-t border-gray-200 my-2'} />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2.5 font-pixel text-xs font-bold text-red-500 uppercase hover:bg-red-500/10 transition-colors"
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
      className={`relative px-4 py-2 font-pixel text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
        isActive
          ? 'text-[#0A1628]'
          : 'text-gray-600 hover:text-[#0A1628]'
      }`}
    >
      {label}
      {isActive && (
        <span
          className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full"
          style={{ background: 'linear-gradient(90deg, #D4AF37, #FDE047)' }}
        />
      )}
    </Link>
  );
}

function MobileLink({ to, label, onClick, isLanding }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-sm px-3 py-2.5 font-pixel text-xs font-bold uppercase transition-colors ${
        isLanding
          ? isActive
            ? 'bg-amber-400/20 text-amber-400 border-l-4 border-amber-400'
            : 'text-white/80 hover:text-amber-400 hover:bg-white/10'
          : isActive
            ? 'bg-amber-100/80 text-[#0A1628] border-l-4 border-amber-500'
            : 'text-gray-700 hover:text-[#0A1628] hover:bg-gray-100/80'
      }`}
    >
      {label}
    </Link>
  );
}

