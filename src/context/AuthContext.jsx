/**
 * AuthContext
 * Provides real authentication state with JWT persistence.
 * Connects to the Express backend auth endpoints.
 *
 * A single account may act as Buyer and/or Seller (role: 'both').
 * The `mode` ('buyer' | 'seller') picks which portal is shown and is
 * persisted in localStorage so the choice survives a page refresh.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

/** Available user roles */
export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  BOTH: 'both',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

/** Route map for role-based redirects */
export const ROLE_ROUTES = {
  buyer: '/buyer',
  seller: '/seller',
  both: '/buyer', // 'both' accounts land on the buyer portal by default
  officer: '/officer',
  registrar: '/officer', // Map DB role 'registrar' to the frontend officer dashboard
  admin: '/admin',
};

/**
 * Expand a role into the set of capabilities it grants.
 * 'both' accounts can act as buyer AND seller.
 * @param {string} role
 * @returns {string[]}
 */
export const roleCapabilities = (role) => {
  if (role === 'both') return ['buyer', 'seller'];
  if (role === 'registrar') return ['officer'];
  return role ? [role] : [];
};

/**
 * Check whether a user role may access routes that allow the given roles.
 * @param {string} role
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export const hasRoleCapability = (role, allowedRoles = []) =>
  roleCapabilities(role).some((cap) => allowedRoles.includes(cap));

/** Human-friendly account labels */
export const ROLE_LABELS = {
  buyer: 'Buyer',
  seller: 'Seller',
  both: 'Buyer & Seller',
  officer: 'Govt. Officer',
  registrar: 'Govt. Officer',
  admin: 'Administrator',
};

const MODE_KEY = 'll_mode';

/**
 * AuthProvider wraps the app and provides auth state + actions.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [mode, setModeState] = useState(() => localStorage.getItem(MODE_KEY) || 'buyer');

  /**
   * On mount — rehydrate auth state from localStorage.
   * If a token exists, validate it by calling GET /api/auth/me.
   */
  useEffect(() => {
    const rehydrate = async () => {
      const token = localStorage.getItem('ll_token');
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const userData = await authService.getMe();
        setUser(userData);
        setIsAuthenticated(true);
        // Align mode with the account's actual capabilities
        setModeState((prev) =>
          roleCapabilities(userData.role).includes(prev) ? prev : (userData.role === 'seller' ? 'seller' : 'buyer')
        );
      } catch {
        // Token invalid or expired — clean up
        localStorage.removeItem('ll_token');
        localStorage.removeItem('ll_user');
        localStorage.removeItem(MODE_KEY);
      } finally {
        setInitializing(false);
      }
    };

    rehydrate();
  }, []);

  /** Switch the active Buyer/Seller mode (only meaningful for 'both' accounts). */
  const setMode = useCallback((nextMode) => {
    if (!['buyer', 'seller'].includes(nextMode)) return;
    setModeState(nextMode);
    localStorage.setItem(MODE_KEY, nextMode);
  }, []);

  /** Effective mode for the current account (single-role accounts are locked). */
  const effectiveMode = user
    ? roleCapabilities(user.role).includes(mode) ? mode : (user.role === 'seller' ? 'seller' : 'buyer')
    : 'buyer';

  /** Can this account use buyer features? */
  const canBuy = !!user && roleCapabilities(user.role).includes('buyer');

  /** Can this account use seller features? */
  const canSell = !!user && roleCapabilities(user.role).includes('seller');

  /** Default dashboard route based on the active mode. */
  const defaultRoute = effectiveMode === 'seller' ? '/seller' : '/buyer';

  /**
   * Login — calls backend, stores JWT + user.
   * @returns {Object} user data from response
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.loginUser(email, password);
    localStorage.setItem('ll_token', data.token);
    localStorage.setItem('ll_user', JSON.stringify(data));
    setUser(data);
    setIsAuthenticated(true);
    // Reset to a sensible mode for the account on login
    setModeState(data.role === 'seller' ? 'seller' : 'buyer');
    localStorage.setItem(MODE_KEY, data.role === 'seller' ? 'seller' : 'buyer');
    return data;
  }, []);

  /**
   * Register — calls backend, stores JWT + user.
   * @returns {Object} user data from response
   */
  const register = useCallback(async (payload) => {
    const data = await authService.registerUser(payload);
    // Do NOT auto-login. The user must proceed to the login screen.
    return data;
  }, []);

  /** Clear auth state and localStorage. */
  const logout = useCallback(() => {
    localStorage.removeItem('ll_token');
    localStorage.removeItem('ll_user');
    localStorage.removeItem(MODE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        initializing,
        login,
        register,
        logout,
        ROLES,
        mode: effectiveMode,
        setMode,
        canBuy,
        canSell,
        defaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume auth context.
 * @returns {{ user, isAuthenticated, initializing, login, register, logout, ROLES, mode, setMode, canBuy, canSell, defaultRoute }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
