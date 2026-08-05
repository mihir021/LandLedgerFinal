/**
 * AppRouter
 * Central routing configuration using React Router v6.
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

// Dashboard Pages
import SellerDashboard from '../pages/SellerDashboard';
import BuyerDashboard from '../pages/BuyerDashboard';
import OfficerDashboard from '../pages/OfficerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import RegisterProperty from '../pages/RegisterProperty';

// Route Protection
import ProtectedRoute from './ProtectedRoute';

/**
 * Route tree definition.
 * - Public routes use MainLayout (Navbar only)
 * - Dashboard routes use DashboardLayout (Navbar + Sidebar)
 * - All dashboard routes are wrapped with ProtectedRoute
 */
const router = createBrowserRouter([
  {
    // ── Public Routes ──
    element: <MainLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'search', element: <PropertySearch /> },
      { path: 'property/:id', element: <PropertyDetails /> },
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
        path: 'seller',
        element: (
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'buyer',
        element: (
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'officer',
        element: (
          <ProtectedRoute allowedRoles={['officer']}>
            <OfficerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register-property',
        element: (
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <RegisterProperty />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    // ── 404 Catch-all ──
    path: '*',
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
