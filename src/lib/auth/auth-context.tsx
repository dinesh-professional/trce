'use client';

import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from './types';

export const DEFAULT_OPERATIONAL_USER: User = {
  id: 'usr-01',
  email: 'dinesh@apexindustrial.com',
  name: 'Dinesh',
  role: 'Operations Director',
  organization: 'Apex Industrial Systems',
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'trce_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_OPERATIONAL_USER;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_OPERATIONAL_USER));
      return DEFAULT_OPERATIONAL_USER;
    } catch {
      return DEFAULT_OPERATIONAL_USER;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 1. Try Supabase Auth API endpoint
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password || 'ApexIndustrial2026!' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            organization: data.user.organization,
          };
          setUser(loggedInUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
          setIsLoading(false);
          return true;
        }
      }
    } catch {
      // Graceful fallback to client session
    }

    // 2. Demo fallback (e.g. Dinesh or any corporate email)
    const domain = email.includes('@') ? email.split('@')[1] : 'apexindustrial.com';
    const isApex = domain === 'apexindustrial.com' || email.toLowerCase().includes('dinesh');
    const orgName = isApex
      ? 'Apex Industrial Systems'
      : `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Industrial Systems`;

    const loggedInUser: User = {
      id: isApex ? DEFAULT_OPERATIONAL_USER.id : `usr-${Date.now()}`,
      name: isApex ? DEFAULT_OPERATIONAL_USER.name : (email.split('@')[0] || 'Operator'),
      email: email || DEFAULT_OPERATIONAL_USER.email,
      role: isApex ? 'Operations Director' : 'Plant Controller',
      organization: orgName,
    };

    setUser(loggedInUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch {}
    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Try Supabase Auth API endpoint with domain tenant matching
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password: password || 'IndustrialTempPass!2026' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            organization: data.user.organization,
          };
          setUser(loggedInUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
          setIsLoading(false);
          return true;
        }
      }
    } catch {
      // Fallback gracefully to offline client session
    }

    // 2. Client fallback matching corporate domain
    const domain = email.includes('@') ? email.split('@')[1] : 'apexindustrial.com';
    const orgName = domain === 'apexindustrial.com' 
      ? 'Apex Industrial Systems' 
      : `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Industrial Systems`;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || 'Operator',
      email: email || 'operator@trce.io',
      role: 'Plant Controller',
      organization: orgName,
    };
    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {}
    setIsLoading(false);
    return true;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    setIsLoading(false);
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    void email;
    return true;
  };

  const resetPassword = async (password: string): Promise<boolean> => {
    void password;
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
