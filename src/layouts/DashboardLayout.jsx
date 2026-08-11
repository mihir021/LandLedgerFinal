/**
 * DashboardLayout — wraps authenticated dashboard pages.
 * Light background, Navbar + collapsible hover-expand Sidebar.
 */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  LoaderCircle, LayoutDashboard, Search, FileText, Wallet, Bell, 
  Home, FilePlus, ArrowLeftRight, Users, ShieldCheck, MessageSquare, 
  BookOpen, Settings 
} from 'lucide-react';

export const NAV_BY_ROLE = {
  buyer: [
    {
      title: 'MAIN',
      items: [
        { to: '/buyer', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/search', icon: Search, label: 'Search Properties', end: true },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { to: '/buyer/purchases', icon: FileText, label: 'My Purchases', end: true },
        { to: '/buyer/wallet', icon: Wallet, label: 'Wallet', end: true },
        { to: '/buyer/notifications', icon: Bell, label: 'Notifications', end: true },
      ]
    }
  ],
  seller: [
    {
      title: 'MAIN',
      items: [
        { to: '/seller', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/search', icon: Search, label: 'Search Properties', end: true },
      ]
    },
    {
      title: 'PROPERTIES',
      items: [
        {
          label: 'Properties',
          icon: Home,
          children: [
            { to: '/seller/properties', label: 'My Properties', end: true },
            { to: '/register-property', label: 'Register New', end: true },
          ]
        },
        { to: '/seller/requests', icon: ArrowLeftRight, label: 'Purchase Requests', end: true },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { to: '/seller/notifications', icon: Bell, label: 'Notifications', end: true },
      ]
    }
  ],
  officer: [
    {
      title: 'MAIN',
      items: [
        { to: '/officer', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/search', icon: Search, label: 'Search Properties', end: true },
      ]
    },
    {
      title: 'TASKS',
      items: [
        { to: '/officer/users', icon: Users, label: 'User Verification', end: true },
        { to: '/officer/properties', icon: ShieldCheck, label: 'Property Review', end: true },
        { to: '/officer/transfers', icon: ArrowLeftRight, label: 'Transfers', end: true },
        { to: '/officer/inquiries', icon: MessageSquare, label: 'Inquiries', end: true },
      ]
    }
  ],
  admin: [
    {
      title: 'MAIN',
      items: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/search', icon: Search, label: 'Search Properties', end: true },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { to: '/admin/users', icon: Users, label: 'Manage Users', end: true },
        { to: '/admin/properties', icon: ShieldCheck, label: 'Properties', end: true },
        { to: '/admin/transfers', icon: ArrowLeftRight, label: 'Transfers', end: true },
        { to: '/admin/officers', icon: BookOpen, label: 'Officers', end: true },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { to: '/admin/settings', icon: Settings, label: 'Settings', end: true },
      ]
    }
  ]
};

export default function DashboardLayout() {
  const { initializing, user } = useAuth();

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-1">
        <LoaderCircle className="h-8 w-8 text-blue-800 animate-spin" />
      </div>
    );
  }

  const role = user?.role || 'buyer';
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.buyer;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-1)' }}>
      <Navbar />
      <Sidebar navItems={navItems} />
      {/* Main content: offset for fixed navbar (h-16) + sidebar collapsed width (64px) */}
      {/* The sidebar will overlay on hover without pushing the main content */}
      <main className="ml-[64px] pt-16 min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
