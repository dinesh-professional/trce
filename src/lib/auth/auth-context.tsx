'use client';

import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'trce_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // STRICT: User is null by default until genuinely logged in or signed up
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  // 1. Password Login: Strictly authenticates against registered credentials
  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
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

      setIsLoading(false);
      return false;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  // 2. Sign Up: Genuinely creates an account in Supabase database
  const signup = async (name: string, email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        const registeredUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          organization: data.user.organization,
        };
        setUser(registeredUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(registeredUser));
        document.cookie = `trce_auth_user_v1=${encodeURIComponent(JSON.stringify(registeredUser))}; path=/; max-age=604800; SameSite=Lax`;
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  // 3. Email OTP Dispatch: Strictly requires an existing registered account
  const sendOtp = async (email: string): Promise<{ success: boolean; error?: string; demoCode?: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'No registered account found with this email. Please sign up first.',
        };
      }

      if (data.challengeToken) {
        setChallengeToken(data.challengeToken);
        try {
          sessionStorage.setItem('trce_challenge_token', data.challengeToken);
        } catch {}
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error requesting OTP.' };
    }
  };

  // 4. Email OTP Verification: Verifies code for the registered account
  const verifyOtp = async (email: string, token: string): Promise<boolean> => {
    setIsLoading(true);
    const savedChallenge =
      challengeToken ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('trce_challenge_token') : null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: token.trim(),
          challengeToken: savedChallenge,
        }),
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

    setIsLoading(false);
    return false;
  };

  // 5. Logout: Clears all authentication state and cookies
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem('trce_challenge_token');
      document.cookie = 'trce_auth_user_v1=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    setIsLoading(false);

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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
