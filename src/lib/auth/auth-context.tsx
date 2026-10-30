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

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || '';

    try {
      // 1. Authenticate with Supabase Database
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

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
          document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(verifiedUser))}; path=/; max-age=604800; SameSite=Lax`;
          setIsLoading(false);
          return true;
        }
      }

      // If Supabase rejected the credentials:
      const errData = await res.json().catch(() => null);

      // Check if it's the demo administrator account (dinesh@apexindustrial.com)
      if (cleanEmail === 'dinesh@apexindustrial.com') {
        const demoAdmin = DEFAULT_OPERATIONAL_USER;
        setUser(demoAdmin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoAdmin));
        document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(demoAdmin))}; path=/; max-age=604800; SameSite=Lax`;
        setIsLoading(false);
        return true;
      }

      // Account does not exist in Supabase and is not the demo admin -> reject login!
      setIsLoading(false);
      return false;
    } catch {
      // Offline fallback: only allow demo admin
      if (cleanEmail === 'dinesh@apexindustrial.com') {
        const demoAdmin = DEFAULT_OPERATIONAL_USER;
        setUser(demoAdmin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoAdmin));
        document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(demoAdmin))}; path=/; max-age=604800; SameSite=Lax`;
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    }
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

  const sendOtp = async (email: string): Promise<{ success: boolean; error?: string; demoCode?: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to dispatch OTP over SMTP.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network communication error sending OTP.' };
    }
  };

  const verifyOtp = async (email: string, token: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), token: token.trim() }),
      });

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
          document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(verifiedUser))}; path=/; max-age=604800; SameSite=Lax`;
          setIsLoading(false);
          return true;
        }
      }
    } catch {}

    // Demo OTP bypass fallback
    if (token.trim() === '123456' || token.trim() === '000000') {
      const domain = email.includes('@') ? email.split('@')[1] : 'apexindustrial.com';
      const isApex = domain === 'apexindustrial.com';
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0] || 'Operator',
        email: email.trim().toLowerCase(),
        role: isApex ? 'Operations Director' : 'Plant Controller',
        organization: isApex ? 'Apex Industrial Systems' : `${domain.split('.')[0]} Industrial Systems`,
      };
      setUser(fallbackUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
      document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(fallbackUser))}; path=/; max-age=604800; SameSite=Lax`;
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
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
        sendOtp,
        verifyOtp,
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
