import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'Admin' | 'Developer' | 'DevOps Engineer' | 'User' | null;

interface User {
  username: string;
  role: UserRole;
}

interface UserContextType {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, role: UserRole) => {
    setUser({ username, role });
  };

  const logout = () => {
    setUser(null);
  };

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  return (
    <UserContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
