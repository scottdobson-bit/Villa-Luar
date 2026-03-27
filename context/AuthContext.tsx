import React, { createContext, useState, useContext, useCallback } from 'react';
import { ADMIN_PASSWORD_HASH } from '../constants';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('isLoggedIn') === 'true');

  const login = useCallback(async (password: string): Promise<boolean> => {
    const hash = await hashPassword(password);
    if (hash === ADMIN_PASSWORD_HASH) {
      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
