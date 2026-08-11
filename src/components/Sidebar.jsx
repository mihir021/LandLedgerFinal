/**
 * Sidebar — light theme, role-aware dashboard navigation.
 * White background, navy active state, collapsible.
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, LogOut,
  LayoutDashboard, Search, FilePlus, FileText,
  Users, ShieldCheck, ArrowLeftRight, Bell, Wallet,
  Settings, MessageSquare, Home, BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  buyer: [
    { to: '/buyer',             icon: LayoutDashboard, label: 'Dashboard',         end: true },
    { to: '/search',            icon: Search,          label: 'Search Properties',  end: true },
    { to: '/buyer/purchases',   icon: FileText,        label: 'My Purchases',       end: true },
    { to: '/buyer/wallet',      icon: Wallet,          label: 'Wallet',             end: true },
    { to: '/buyer/notifications', icon: Bell,          label: 'Notifications',      end: true },
  ],
  seller: [
    { to: '/seller',              icon: LayoutDashboard,label: 'Dashboard',          end: true },
    { to: '/seller/properties',   icon: Home,           label: 'My Properties',      end: true },
    { to: '/register-property',   icon: FilePlus,       label: 'Register Property',  end: true },
    { to: '/seller/requests',     icon: ArrowLeftRight, label: 'Purchase Requests',  end: true },
    { to: '/search',              icon: Search,         label: 'Search',             end: true },
    { to: '/seller/notifications', icon: Bell,          label: 'Notifications',      end: true },
  ],
  officer: [
    { to: '/officer',             icon: LayoutDashboard,label: 'Dashboard',          end: true },
    { to: '/officer/users',       icon: Users,          label: 'User Verification',  end: true },
    { to: '/officer/properties',  icon: ShieldCheck,    label: 'Property Review',    end: true },
    { to: '/officer/transfers',   icon: ArrowLeftRight, label: 'Transfers',          end: true },
    { to: '/officer/inquiries',   icon: MessageSquare,  label: 'Inquiries',          end: true },
    { to: '/search',              icon: Search,         label: 'Search',             end: true },
  ],
  admin: [
    { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard',           end: true },
    { to: '/admin/users',       icon: Users,           label: 'Manage Users',        end: true },
    { to: '/admin/properties',  icon: ShieldCheck,     label: 'Properties',          end: true },
    { to: '/admin/transfers',   icon: ArrowLeftRight,  label: 'Transfers',           end: true },
    { to: '/admin/officers',    icon: BookOpen,        label: 'Officers',            end: true },
    { to: '/search',            icon: Search,          label: 'Search',              end: true },
    { to: '/admin/settings',    icon: Settings,        label: 'Settings',            end: true },
  ],
};

const ROLE_LABELS = {
  buyer: 'Buyer Portal',
  seller: 'Seller Portal',
  officer: 'Officer Portal',
  admin: 'Admin Portal',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'buyer';
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.buyer;
  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside
      className={`fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
      style={{ boxShadow: '1px 0 4px rgba(30,58,95,0.04)' }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-blue-800 hover:border-blue-300 shadow-sm transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* User card */}
      <div className={`border-b border-gray-100 px-3 py-4 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[role]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {items.map((item, idx) => (
            <li key={idx}>
              <NavLink
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-800' : 'text-gray-400'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-2 py-3">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
