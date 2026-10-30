'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth';
import { AuthBackground } from '@/components/auth/auth-background';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(undefined);

    try {
      await forgotPassword(email.trim());
      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4 py-12 selection:bg-white selection:text-black overflow-x-hidden">
      {/* 60fps WebGL Real Black & White Flaming Engine */}
      <AuthBackground />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Navigation back to login */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-white hover:text-slate-200 font-semibold transition-colors py-1.5 px-3.5 rounded-full bg-black/60 border border-white/30 backdrop-blur-md hover:bg-black/80 hover:border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
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
                Reset password
              </h1>
              <p
                style={{ color: '#E2E8F0' }}
                className="text-sm text-slate-200 !text-[#E2E8F0] mt-2 font-medium"
              >
                Enter your email address to receive reset instructions.
              </p>
            </div>
          </div>

          {submitted ? (
            /* SUCCESS STATE */
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 text-white border border-white/30 flex items-center justify-center mx-auto shadow-lg shadow-white/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">
                  Check your inbox
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto font-medium">
                  If an account exists for this email, you&apos;ll receive password reset instructions.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/login" className="block">
                  <button
                    type="button"
                    className="w-full text-xs font-bold justify-center py-2.5 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Return to sign in
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                      if (error) setError(undefined);
                    }}
                    className={`block w-full pl-10 pr-3.5 py-2.5 bg-black/60 backdrop-blur-md border rounded-xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none transition-all ${
                      error
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-white/25 hover:border-white/45 focus:border-white focus:ring-2 focus:ring-white/35 focus:bg-black/80'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {error && (
                  <p className="text-xs font-semibold text-rose-400 mt-1 pl-1">{error}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-sm font-black tracking-wide justify-center py-3 px-6 rounded-xl bg-white text-black hover:bg-slate-100 transition-all shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:shadow-[0_0_50px_rgba(255,255,255,0.75)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Sending instructions...' : 'Send reset link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Return link */}
          <div className="mt-8 pt-6 border-t border-white/15 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-white hover:text-slate-200 font-bold transition-colors focus-visible:outline-none underline underline-offset-4 decoration-white/40 hover:decoration-white"
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
