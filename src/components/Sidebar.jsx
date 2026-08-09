/**
 * Sidebar Component
 * Responsive sidebar navigation for dashboard pages.
 * Collapses on mobile, supports role-based nav items.
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import {
  FiHome, FiFileText, FiSearch, FiUsers, FiShield,
  FiActivity, FiPlusCircle, FiBell, FiSettings, FiLogOut,
  FiDollarSign, FiAlertTriangle, FiDatabase, FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/** Navigation items mapped by role */
const navItemsByRole = {
  seller: [
    { to: '/seller', icon: FiHome, label: 'Dashboard' },
    { to: '/register-property', icon: FiPlusCircle, label: 'Register Property' },
    { to: '/search', icon: FiSearch, label: 'Search Properties' },
    { to: '/seller', icon: FiFileText, label: 'My Properties', end: false },
    { to: '/seller', icon: FiActivity, label: 'Transfer Requests', end: false },
  ],
  buyer: [
    { to: '/buyer', icon: FiHome, label: 'Dashboard' },
    { to: '/search', icon: FiSearch, label: 'Search Properties' },
    { to: '/buyer', icon: FiFileText, label: 'My Purchases', end: false },
    { to: '/buyer', icon: FiDollarSign, label: 'Wallet', end: false },
    { to: '/buyer', icon: FiBell, label: 'Notifications', end: false },
  ],
  officer: [
    { to: '/officer', icon: FiHome, label: 'Dashboard' },
    { to: '/officer', icon: FiUsers, label: 'User Verification', end: false },
    { to: '/officer', icon: FiCheckCircle, label: 'Property Verification', end: false },
    { to: '/officer', icon: FiActivity, label: 'Transfers', end: false },
    { to: '/officer', icon: FiAlertTriangle, label: 'Disputes', end: false },
    { to: '/search', icon: FiSearch, label: 'Search Properties' },
  ],
  admin: [
    { to: '/admin', icon: FiHome, label: 'Dashboard' },
    { to: '/admin', icon: FiUsers, label: 'Manage Users', end: false },
    { to: '/admin', icon: FiShield, label: 'Officers', end: false },
    { to: '/admin', icon: FiDatabase, label: 'Blockchain Status', end: false },
    { to: '/admin', icon: FiActivity, label: 'Audit Logs', end: false },
    { to: '/search', icon: FiSearch, label: 'Search Properties' },
    { to: '/admin', icon: FiSettings, label: 'Settings', end: false },
  ],
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'buyer';
  const items = navItemsByRole[role] || navItemsByRole.buyer;
  const displayName = user?.fullName || user?.name || 'User';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r border-white/10 bg-navy-900/95 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* ── Toggle Button ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-navy-800 text-xs text-navy-300 transition-colors hover:bg-navy-700 hover:text-white"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
      </button>

      {/* ── User Info ── */}
      <div className={`border-b border-white/5 px-4 py-5 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs capitalize text-navy-400">{role}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map((item, idx) => (
            <li key={idx}>
              <NavLink
                to={item.to}
                end={item.end !== false}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'text-navy-400 hover:bg-white/5 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-white/5 px-3 py-4">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-400 transition-colors hover:bg-red-500/10 hover:text-red-400 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <FiLogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
