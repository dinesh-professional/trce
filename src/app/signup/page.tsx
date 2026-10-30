'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth';
import { AuthBackground } from '@/components/auth/auth-background';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const hasMinLength = password.length >= 8;

  const validate = (): boolean => {
    const nextErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
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
      const success = await signup(fullName.trim(), email.trim(), password);
      if (success) {
        router.push('/dashboard');
      } else {
        setErrors({ general: 'Failed to create account. Please check your details.' });
        setIsSubmitting(false);
      }
    } catch {
      setErrors({ general: 'Failed to create account. Please try again.' });
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
                Create an account
              </h1>
              <p
                style={{ color: '#E2E8F0' }}
                className="text-sm text-slate-200 !text-[#E2E8F0] mt-2 font-medium"
              >
                Get started with your operational workspace in seconds.
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold text-white uppercase tracking-wider">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-black/60 backdrop-blur-md border rounded-xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none transition-all ${
                    errors.fullName
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-white/25 hover:border-white/45 focus:border-white focus:ring-2 focus:ring-white/35 focus:bg-black/80'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs font-semibold text-rose-400 mt-1 pl-1">{errors.fullName}</p>
              )}
            </div>

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
                {password.length > 0 && (
                  <span
                    className={`text-[11px] font-bold flex items-center gap-1 ${
                      hasMinLength ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                    8+ characters
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-white uppercase tracking-wider">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  className={`block w-full pl-10 pr-11 py-2.5 bg-black/60 backdrop-blur-md border rounded-xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none transition-all ${
                    errors.confirmPassword
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-white/25 hover:border-white/45 focus:border-white focus:ring-2 focus:ring-white/35 focus:bg-black/80'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-rose-400 mt-1 pl-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Searing Incandescent White-Hot Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-sm font-black tracking-wide justify-center py-3 px-6 rounded-xl bg-white text-black hover:bg-slate-100 transition-all shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:shadow-[0_0_50px_rgba(255,255,255,0.75)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Bottom Sign In Navigation Link */}
          <div className="mt-8 pt-6 border-t border-white/15 text-center text-xs text-slate-300 font-medium">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="text-white hover:text-slate-100 font-bold transition-colors ml-1 focus-visible:outline-none underline underline-offset-4 decoration-white/50 hover:decoration-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
