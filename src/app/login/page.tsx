'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth';
import { AuthBackground } from '@/components/auth/auth-background';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string; general?: string } = {};

    if (!email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.push('/dashboard');
      } else {
        setErrors({ general: 'Invalid email or password.' });
        setIsSubmitting(false);
      }
    } catch {
      setErrors({ general: 'Invalid email or password.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4 py-12 selection:bg-white selection:text-black overflow-x-hidden">
      {/* 60fps WebGL Real Black & White Flaming Engine */}
      <AuthBackground />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Navigation back to landing */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white hover:text-slate-200 font-semibold transition-colors py-1.5 px-3.5 rounded-full bg-black/60 border border-white/30 backdrop-blur-md hover:bg-black/80 hover:border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* High-Contrast Obsidian Glass Card */}
        <div className="rounded-2xl p-8 sm:p-10 bg-[#090C12]/95 backdrop-blur-3xl border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.9),0_20px_50px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.25)]">
          {/* Brand Header */}
          <div className="text-center space-y-3 mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center group focus-visible:outline-none"
              aria-label="Trce Home"
            >
              <Logo
                variant="full"
                size="lg"
                className="h-8 w-auto text-white transition-transform group-hover:scale-[1.03]"
              />
            </Link>
            <div>
              <h1
                style={{ color: '#FFFFFF' }}
                className="text-3xl font-black tracking-tight text-white !text-[#FFFFFF] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
              >
                Welcome back
              </h1>
              <p
                style={{ color: '#E2E8F0' }}
                className="text-sm text-slate-200 !text-[#E2E8F0] mt-2 font-medium"
              >
                Sign in to access your operational workspace.
              </p>
            </div>
          </div>

          {/* General Error Alert */}
          {errors.general && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center gap-2.5 text-xs font-semibold text-rose-300 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-white uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-black/60 backdrop-blur-md border rounded-xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none transition-all ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-white/25 hover:border-white/45 focus:border-white focus:ring-2 focus:ring-white/35 focus:bg-black/80'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-rose-400 mt-1 pl-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-white uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-white hover:text-slate-200 transition-colors font-bold underline underline-offset-4 decoration-white/40 hover:decoration-white focus-visible:outline-none"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`block w-full pl-10 pr-11 py-2.5 bg-black/60 backdrop-blur-md border rounded-xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none transition-all ${
                    errors.password
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-white/25 hover:border-white/45 focus:border-white focus:ring-2 focus:ring-white/35 focus:bg-black/80'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-rose-400 mt-1 pl-1">{errors.password}</p>
              )}
            </div>

            {/* Searing Incandescent White-Hot Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-sm font-black tracking-wide justify-center py-3 px-6 rounded-xl bg-white text-black hover:bg-slate-100 transition-all shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:shadow-[0_0_50px_rgba(255,255,255,0.75)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Bottom Signup Navigation Link */}
          <div className="mt-8 pt-6 border-t border-white/15 text-center text-xs text-slate-300 font-medium">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="text-white hover:text-slate-100 font-bold transition-colors ml-1 focus-visible:outline-none underline underline-offset-4 decoration-white/50 hover:decoration-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
