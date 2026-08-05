/**
 * AuthContext
 * Provides mock authentication state and actions across the application.
 * In production, this would connect to a real auth service / blockchain wallet.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/** Available user roles */
export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

/**
 * AuthProvider wraps the app and provides auth state + actions.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /** Mock login – accepts any email/password and assigns the given role. */
  const login = useCallback((email, password, role = ROLES.BUYER) => {
    const mockUser = {
      id: 'USR-' + Date.now(),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role,
      avatar: null,
      joinDate: new Date().toISOString(),
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    return mockUser;
  }, []);

  /** Mock register – creates user with the selected role. */
  const register = useCallback((name, email, password, role) => {
    const mockUser = {
      id: 'USR-' + Date.now(),
      name,
      email,
      role,
      avatar: null,
      joinDate: new Date().toISOString(),
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    return mockUser;
  }, []);

  /** Clear auth state. */
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume auth context.
 * @returns {{ user, isAuthenticated, login, register, logout, ROLES }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
