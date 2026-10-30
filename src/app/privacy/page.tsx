import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: 'Privacy Policy — Trce',
  description: 'Trce privacy policy and industrial telemetry security.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080B0F] text-[#F5F7FA] selection:bg-[#00C896] selection:text-[#080B0F]">
      <header className="h-16 px-6 md:px-12 flex items-center justify-between border-b border-[#1D2630] bg-[#0D1218]/90 sticky top-0 z-50">
        <Link href="/" className="flex items-center group focus-visible:outline-none" aria-label="Trce Home">
          <Logo variant="full" size="md" className="h-7 w-auto transition-transform group-hover:scale-[1.02]" />
        </Link>

        <Link href="/signup">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Signup
          </Button>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs text-[#00C896] uppercase tracking-wider block mb-2 font-semibold">
            DATA GOVERNANCE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#687382] mt-2">Last updated: January 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#A3ACB8] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#F5F7FA]">1. Information We Ingest</h2>
            <p>
              We collect operator contact information (name, work email, organization), sensor readings (vibration, temperature, pressure, RPM), and warehouse stock levels necessary to execute operational trace and reroute workflows.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#F5F7FA]">2. Data Isolation &amp; Multi-Tenancy</h2>
            <p>
              All machine telemetry streams, inventory balances, and supplier catalogs are isolated per workspace. Trce does not share, monetize, or disclose industrial operational data across tenant organizations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#F5F7FA]">3. Retention &amp; Security Standards</h2>
            <p>
              Operational events and dispatch records are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption. Audit logs are preserved for compliance and facility traceability.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#F5F7FA]">4. Contact Our Data Governance Team</h2>
            <p>
              For enterprise data governance inquiries or compliance verifications, contact our security controllers at security@trce.io.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-[#1D2630] flex items-center justify-between text-xs text-[#687382]">
          <span>© 2026 Trce. All rights reserved.</span>
          <Link href="/terms" className="text-[#00C896] hover:underline">
            Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
