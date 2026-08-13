/**
 * AppRouter
 * Central routing configuration for LandLedger.
 * Defines public, protected, and catch-all routes.
 */
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PropertySearch from '../pages/PropertySearch';
import PropertyDetails from '../pages/PropertyDetails';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import ContactSupport from '../pages/ContactSupport';
import NotFound from '../pages/NotFound';

// Buyer Pages
import BuyerDashboard from '../pages/BuyerDashboard';
import BuyerPurchases from '../pages/BuyerPurchases';
import BuyerProperties from '../pages/BuyerProperties';
import BuyerWallet from '../pages/BuyerWallet';
import NotificationsPage from '../pages/NotificationsPage';

// Seller Pages
import SellerDashboard from '../pages/SellerDashboard';
import SellerProperties from '../pages/SellerProperties';
import SellerRequests from '../pages/SellerRequests';
import RegisterProperty from '../pages/RegisterProperty';

// Officer / Admin Pages
import OfficerDashboard from '../pages/OfficerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminProperties from '../pages/AdminProperties';
import AdminTransfers from '../pages/AdminTransfers';

import Profile from '../pages/Profile';
import AdminSettings from '../pages/AdminSettings';

// Route Protection
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    // ── Public Routes ──
    element: <MainLayout />,
    children: [
      { index: true,            element: <Landing /> },
      { path: 'login',          element: <Login /> },
      { path: 'register',       element: <Register /> },
      { path: 'search',         element: <PropertySearch /> },
      { path: 'property/:id',   element: <PropertyDetails /> },
      { path: 'privacy',        element: <PrivacyPolicy /> },
      { path: 'terms',          element: <TermsOfService /> },
      { path: 'support',        element: <ContactSupport /> },
    ],
  },
  {
    // ── Protected Dashboard Routes ──
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },

      // Buyer (also available to 'both' accounts)
      {
        path: 'buyer',
        element: <ProtectedRoute allowedRoles={['buyer', 'both']}><BuyerDashboard /></ProtectedRoute>,
      },
      {
        path: 'buyer/purchases',
        element: <ProtectedRoute allowedRoles={['buyer', 'both']}><BuyerPurchases /></ProtectedRoute>,
      },
      {
        path: 'buyer/properties',
        element: <ProtectedRoute allowedRoles={['buyer', 'both']}><BuyerProperties /></ProtectedRoute>,
      },
      {
        path: 'buyer/wallet',
        element: <ProtectedRoute allowedRoles={['buyer', 'both']}><BuyerWallet /></ProtectedRoute>,
      },
      {
        path: 'buyer/notifications',
        element: <ProtectedRoute allowedRoles={['buyer', 'both']}><NotificationsPage backTo="/buyer" role="buyer" /></ProtectedRoute>,
      },

      // Seller (also available to 'both' accounts)
      {
        path: 'seller',
        element: <ProtectedRoute allowedRoles={['seller', 'both']}><SellerDashboard /></ProtectedRoute>,
      },
      {
        path: 'seller/properties',
        element: <ProtectedRoute allowedRoles={['seller', 'both']}><SellerProperties /></ProtectedRoute>,
      },
      {
        path: 'seller/requests',
        element: <ProtectedRoute allowedRoles={['seller', 'both']}><SellerRequests /></ProtectedRoute>,
      },
      {
        path: 'seller/notifications',
        element: <ProtectedRoute allowedRoles={['seller', 'both']}><NotificationsPage backTo="/seller" role="seller" /></ProtectedRoute>,
      },
      {
        path: 'register-property',
        element: <ProtectedRoute allowedRoles={['seller', 'both', 'admin']}><RegisterProperty /></ProtectedRoute>,
      },

      // Officer
      {
        path: 'officer',
        element: <ProtectedRoute allowedRoles={['officer']}><OfficerDashboard /></ProtectedRoute>,
      },
      {
        path: 'officer/users',
        element: <ProtectedRoute allowedRoles={['officer', 'admin']}><AdminUsers /></ProtectedRoute>,
      },
      {
        path: 'officer/properties',
        element: <ProtectedRoute allowedRoles={['officer', 'admin']}><AdminProperties /></ProtectedRoute>,
      },
      {
        path: 'officer/transfers',
        element: <ProtectedRoute allowedRoles={['officer', 'admin']}><AdminTransfers /></ProtectedRoute>,
      },
      {
        path: 'officer/inquiries',
        element: <ProtectedRoute allowedRoles={['officer', 'admin']}><OfficerDashboard /></ProtectedRoute>,
      },

      // Admin
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>,
      },
      {
        path: 'admin/users',
        element: <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>,
      },
      {
        path: 'admin/properties',
        element: <ProtectedRoute allowedRoles={['admin', 'officer']}><AdminProperties /></ProtectedRoute>,
      },
      {
        path: 'admin/transfers',
        element: <ProtectedRoute allowedRoles={['admin', 'officer']}><AdminTransfers /></ProtectedRoute>,
      },
      {
        path: 'admin/officers',
        element: <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>,
      },
      {
        path: 'admin/settings',
        element: <ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
