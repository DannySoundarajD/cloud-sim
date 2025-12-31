/**
 * Enhanced User Context with Backend Authentication
 * 
 * DESIGN DECISIONS:
 * -----------------
 * 1. Combines local state with localStorage persistence
 *    - User stays logged in on page refresh
 *    - Token validation on app load
 * 
 * 2. Role mapping from backend
 *    - Backend stores simple user data
 *    - Frontend maps to UI roles (Admin, Developer, etc.)
 *    - Future: Roles should come from backend
 * 
 * 3. Loading state
 *    - Prevents flash of login screen on refresh
 *    - Shows loading while validating stored token
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';

/* eslint-disable react-refresh/only-export-components */

// UI Roles - matches existing app structure
export type UserRole = 'Admin' | 'Developer' | 'DevOps Engineer' | 'User' | null;

// User interface combining backend data with UI role
interface User {
  id?: number;
  username: string;  // email from backend
  role: UserRole;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Backward compatibility with App.tsx
  login: (username: string, role: UserRole) => void;

  // Tester mode (mock auth)
  loginAsTester: (username: string, role: UserRole) => void;

  // Production mode (real backend auth)
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;

  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const backendUser = await authApi.getCurrentUser();
          setUser({
            id: backendUser.id,
            username: backendUser.email,
            email: backendUser.email,
            role: backendUser.role as UserRole,
          });
        } catch {
          // Token invalid/expired
          authApi.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Tester mode login (mock, no backend)
  const loginAsTester = useCallback((username: string, role: UserRole) => {
    setUser({ username, role });
    setError(null);
  }, []);

  // Production login with backend
  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.login(email, password);
      const backendUser = await authApi.getCurrentUser();

      // Map backend user to frontend User - role comes from backend
      setUser({
        id: backendUser.id,
        username: backendUser.email,
        email: backendUser.email,
        role: backendUser.role as UserRole,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register new account
  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.register({ email, password });
      // Auto-login after registration
      await loginWithCredentials(email, password);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [loginWithCredentials]);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setError(null);
  }, []);

  const hasRole = useCallback((role: UserRole) => {
    return user?.role === role;
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      login: loginAsTester,  // Backward compatibility alias
      loginAsTester,
      loginWithCredentials,
      register,
      logout,
      hasRole,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Backwards compatibility export
export { useUser as useAuth };
