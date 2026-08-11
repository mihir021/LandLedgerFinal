/**
 * AuthContext
 * Provides real authentication state with JWT persistence.
 * Connects to the Express backend auth endpoints.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

/** Available user roles */
export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

/** Route map for role-based redirects */
export const ROLE_ROUTES = {
  buyer: '/buyer',
  seller: '/seller',
  officer: '/officer',
  registrar: '/officer', // Map DB role 'registrar' to the frontend officer dashboard
  admin: '/admin',
};

/**
 * AuthProvider wraps the app and provides auth state + actions.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

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
      } catch {
        // Token invalid or expired — clean up
        localStorage.removeItem('ll_token');
        localStorage.removeItem('ll_user');
      } finally {
        setInitializing(false);
      }
    };

    rehydrate();
  }, []);

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
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, initializing, login, register, logout, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume auth context.
 * @returns {{ user, isAuthenticated, initializing, login, register, logout, ROLES }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
