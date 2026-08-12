/**
 * ProtectedRoute
 * Route guard component that checks authentication.
 * Shows a loading spinner while auth state is initializing.
 * Redirects to /login if the user is not authenticated.
 * Optionally checks for allowed roles (capability-based, so 'both'
 * accounts pass buyer/seller guards).
 */
import { Navigate } from 'react-router-dom';
import { useAuth, ROLE_ROUTES, hasRoleCapability } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, initializing, user } = useAuth();

  // Still checking stored token — show spinner, don't redirect
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center hero-gradient">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check (if allowedRoles is specified) — capability-based
  if (allowedRoles && !hasRoleCapability(user?.role, allowedRoles)) {
    // Redirect to the user's own dashboard instead of login
    const fallback = ROLE_ROUTES[user?.role] || '/login';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
