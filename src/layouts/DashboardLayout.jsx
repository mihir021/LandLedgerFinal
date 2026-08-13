/**
 * DashboardLayout — wraps authenticated dashboard pages.
 * Features an interactive full-page Live Canvas background across all Admin, Officer, Buyer, and Seller pages.
 */
import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardLiveCanvas from '../components/DashboardLiveCanvas';
import { useAuth } from '../context/AuthContext';
import {
  LoaderCircle, LayoutDashboard, Search, FileText, Wallet, Bell,
  Home, FilePlus, ArrowLeftRight, Users, ShieldCheck, MessageSquare,
  Settings, BarChart3
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
        { to: '/buyer/properties', icon: Home, label: 'My Properties', end: true },
        { to: '/buyer/purchases', icon: FileText, label: 'My Purchases', end: true },
        { to: '/buyer/wallet', icon: Wallet, label: 'Wallet', end: true },
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
        { to: '/seller/properties', icon: Home, label: 'My Properties', end: true },
        { to: '/register-property', icon: FilePlus, label: 'Register New Property', end: true },
        { to: '/seller/requests', icon: ArrowLeftRight, label: 'Purchase Requests', end: true },
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
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { to: '/admin/settings', icon: Settings, label: 'Settings', end: true },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', end: true },
      ]
    }
  ]
};

export function navItemsForRole(user, mode) {
  if (!user) return NAV_BY_ROLE.buyer;
  if (user.role === 'both') {
    return NAV_BY_ROLE[mode === 'seller' ? 'seller' : 'buyer'];
  }
  return NAV_BY_ROLE[user.role] || NAV_BY_ROLE.buyer;
}

export default function DashboardLayout() {
  const { initializing, user, mode } = useAuth();

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-1">
        <LoaderCircle className="h-8 w-8 text-blue-800 animate-spin" />
      </div>
    );
  }

  const navItems = navItemsForRole(user, mode);

  return (
    <div className="relative min-h-screen dashboard-lego-bg overflow-x-hidden">
      {/* Global Interactive Background for Admin, Officer, Buyer, Seller */}
      <DashboardLiveCanvas />

      <Navbar />
      <Sidebar navItems={navItems} />
      
      {/* Main content layer */}
      <main className="relative z-10 ml-[64px] pt-16 min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
