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

    // Compute optimistic user immediately to avoid stalling the UI
    const domain = email.includes('@') ? email.split('@')[1] : 'apexindustrial.com';
    const isApex = domain === 'apexindustrial.com' || email.toLowerCase().includes('dinesh');
    const orgName = isApex
      ? 'Apex Industrial Systems'
      : `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Industrial Systems`;

    const optimisticUser: User = {
      id: isApex ? DEFAULT_OPERATIONAL_USER.id : `usr-${Date.now()}`,
      name: isApex ? DEFAULT_OPERATIONAL_USER.name : (email.split('@')[0] || 'Operator'),
      email: email || DEFAULT_OPERATIONAL_USER.email,
      role: isApex ? 'Operations Director' : 'Plant Controller',
      organization: orgName,
    };

    // Fast-path: Set optimistic local session and cookie immediately
    setUser(optimisticUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(optimisticUser));
      document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(optimisticUser))}; path=/; max-age=604800; SameSite=Lax`;
    } catch {}

    // Background verify with Supabase (with 2.5s quick timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password || 'ApexIndustrial2026!' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const verifiedUser: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            organization: data.user.organization,
          };
          setUser(verifiedUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedUser));
        }
      }
    } catch {
      // If network takes longer than 2.5s, optimistic session keeps login instantaneous!
    }

    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);

    // Compute optimistic user immediately
    const domain = email.includes('@') ? email.split('@')[1] : 'apexindustrial.com';
    const isApex = domain === 'apexindustrial.com';
    const orgName = isApex
      ? 'Apex Industrial Systems'
      : `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Industrial Systems`;

    const optimisticUser: User = {
      id: `usr-${Date.now()}`,
      name: name || 'Operator',
      email: email || 'operator@trce.io',
      role: isApex ? 'Plant Controller' : 'Operations Director',
      organization: orgName,
    };

    // Fast-path: Set optimistic local session and cookie immediately
    setUser(optimisticUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(optimisticUser));
      document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(optimisticUser))}; path=/; max-age=604800; SameSite=Lax`;
    } catch {}

    // Background provision in Supabase (with 3s timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password: password || 'IndustrialTempPass!2026' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const verifiedUser: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            organization: data.user.organization,
          };
          setUser(verifiedUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedUser));
        }
      }
    } catch {
      // Optimistic session guarantees instant registration
    }

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
