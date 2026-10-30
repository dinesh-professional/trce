'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, CheckCircle2, Eye, EyeOff, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth';
import { AuthBackground } from '@/components/auth/auth-background';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});

  const hasMinLength = password.length >= 8;

  const validate = (): boolean => {
    const nextErrors: { password?: string; confirmPassword?: string; general?: string } = {};

    if (!password) {
      nextErrors.password = 'New password is required.';
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
      await resetPassword(password);
      setIsSubmitting(false);
      setSuccess(true);
    } catch {
      setErrors({ general: 'Failed to update password. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4 py-12 selection:bg-[#00C896] selection:text-[#080B0F] overflow-x-hidden">
      {/* Dynamic Animated Background with Floating Orbs & Grid */}
      <AuthBackground />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Navigation back to login */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#CBD5E1] hover:text-white transition-colors py-1 px-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md hover:bg-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>

        {/* Glassmorphic Card */}
        <div className="rounded-2xl p-8 sm:p-10 bg-[#0D1218]/65 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(0,200,150,0.06),inset_0_1px_0_rgba(255,255,255,0.15)]">
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
                Set new password
              </h1>
              <p
                style={{ color: '#E2E8F0' }}
                className="text-sm text-slate-200 !text-[#E2E8F0] mt-2 font-medium"
              >
                Choose a new secure password for your account.
              </p>
            </div>
          </div>

          {success ? (
            /* SUCCESS STATE */
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">
                  Password updated
                </h2>
                <p className="text-xs text-[#CBD5E1] leading-relaxed max-w-xs mx-auto">
                  You can now sign in using your new password.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/login" className="block">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs justify-center rounded-xl bg-[#00C896] text-[#080B0F] hover:bg-[#00B386]"
                  >
                    Return to sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* RESET PASSWORD FORM */
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errors.general && (
                <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
                  {errors.general}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#CBD5E1]">
                    New password
                  </label>
                  {password.length > 0 && (
                    <span
                      className={`text-[11px] flex items-center gap-1 ${
                        hasMinLength ? 'text-[#00C896]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {hasMinLength ? <Check className="w-3 h-3" /> : null}
                      8+ characters
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
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
                    className={`block w-full pl-10 pr-11 py-2.5 bg-white/[0.04] backdrop-blur-md border rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none transition-all ${
                      errors.password
                        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                        : 'border-white/[0.1] hover:border-white/[0.2] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] focus:bg-white/[0.06]'
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#EF4444] mt-1 pl-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#CBD5E1]">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
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
                    className={`block w-full pl-10 pr-11 py-2.5 bg-white/[0.04] backdrop-blur-md border rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none transition-all ${
                      errors.confirmPassword
                        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                        : 'border-white/[0.1] hover:border-white/[0.2] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] focus:bg-white/[0.06]'
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-white transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[#EF4444] mt-1 pl-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full text-sm font-semibold justify-center py-2.5 rounded-xl bg-[#00C896] text-[#080B0F] hover:bg-[#00B386] transition-all shadow-lg shadow-[#00C896]/20 hover:shadow-[#00C896]/35 disabled:opacity-50"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Updating...' : 'Set new password'}
                </Button>
              </div>
            </form>
          )}

          {/* Return link */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#CBD5E1] hover:text-[#00C896] transition-colors focus-visible:outline-none hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
