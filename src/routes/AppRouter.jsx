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
import NotFound from '../pages/NotFound';

// Buyer Pages
import BuyerDashboard from '../pages/BuyerDashboard';
import BuyerPurchases from '../pages/BuyerPurchases';
import BuyerWallet from '../pages/BuyerWallet';

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
      // Buyer
      {
        path: 'buyer',
        element: <ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>,
      },
      {
        path: 'buyer/purchases',
        element: <ProtectedRoute allowedRoles={['buyer']}><BuyerPurchases /></ProtectedRoute>,
      },
      {
        path: 'buyer/wallet',
        element: <ProtectedRoute allowedRoles={['buyer']}><BuyerWallet /></ProtectedRoute>,
      },
      {
        path: 'buyer/notifications',
        element: <ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>,
      },

      // Seller
      {
        path: 'seller',
        element: <ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>,
      },
      {
        path: 'seller/properties',
        element: <ProtectedRoute allowedRoles={['seller']}><SellerProperties /></ProtectedRoute>,
      },
      {
        path: 'seller/requests',
        element: <ProtectedRoute allowedRoles={['seller']}><SellerRequests /></ProtectedRoute>,
      },
      {
        path: 'seller/notifications',
        element: <ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>,
      },
      {
        path: 'register-property',
        element: <ProtectedRoute allowedRoles={['seller', 'admin']}><RegisterProperty /></ProtectedRoute>,
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
