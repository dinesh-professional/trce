'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Activity,
  ShieldAlert,
  Layers,
  CheckCircle2,
  Menu,
  X,
  Compass,
  Wrench,
  Factory,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/Logo';
import { RoboticSpotlightHero } from '@/components/landing/RoboticSpotlightHero';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(1);

  const showcaseStages = [
    {
      id: 1,
      title: 'Machine anomaly',
      code: 'M-204',
      tag: 'TELEMETRY SPIKE',
      desc: 'Edge sensor flags high-frequency vibration exceeding ISO-10816 operating envelopes.',
      metricLabel: 'Vibration',
      metricVal: '8.7 mm/s',
      metricNormal: 'Normal: 0.0 – 6.0 mm/s',
      status: 'CRITICAL THRESHOLD',
      color: 'critical',
    },
    {
      id: 2,
      title: 'Component identified',
      code: 'BRG-204',
      tag: 'BOM CORRELATION',
      desc: 'Dynamic asset graph maps the abnormal telemetry signature to spindle bearing degradation.',
      metricLabel: 'Part Model',
      metricVal: 'Angular Bearing (SKF-BRG-204)',
      metricNormal: 'Machine: CNC Assembly Line 2',
      status: 'HIGH WEAR RISK',
      color: 'warning',
    },
    {
      id: 3,
      title: 'Inventory searched',
      code: '4 SITES',
      tag: 'DISTRIBUTED AUDIT',
      desc: 'Simultaneous inventory query audits on-hand stock and safety buffers across all facilities.',
      metricLabel: 'Local Facility Stock',
      metricVal: '0 units (FAC-A)',
      metricNormal: 'FAC-B: 2 · FAC-C: 4 · FAC-D: 7',
      status: 'LOCAL STOCKOUT',
      color: 'info',
    },
    {
      id: 4,
      title: 'Best source found',
      code: 'FAC-C',
      tag: 'TRANSIT OPTIMIZATION',
      desc: 'Route optimization algorithm evaluates distance, transit latency, and regional safety stock buffers.',
      metricLabel: 'Optimal Source',
      metricVal: 'FAC-C (183 km)',
      metricNormal: 'Estimated Transit: 4h 20m',
      status: 'ROUTE VERIFIED',
      color: 'primary',
    },
    {
      id: 5,
      title: 'Transfer recommended',
      code: 'TR-8921',
      tag: 'DISPATCH READY',
      desc: 'Actionable transfer order generated with verified bill of lading and real-time transit tracking.',
      metricLabel: 'Action Dispatch',
      metricVal: '4 units (FAC-C → FAC-A)',
      metricNormal: 'Priority: High · ETA: 4h 20m',
      status: 'READY FOR TRANSFER',
      color: 'primary',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080B0F] text-[#F5F7FA] flex flex-col justify-between selection:bg-[#00C896] selection:text-[#080B0F]">
      {/* 1. NAVBAR */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between border-b border-[#1E293B] bg-[#0D1218]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center group focus-visible:outline-none" aria-label="Trce Home">
            <Logo variant="full" size="md" className="h-7 w-auto transition-transform group-hover:scale-[1.02] text-white" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#CBD5E1]">
            <a href="#capabilities" className="hover:text-white transition-colors">
              Product
            </a>
            <a href="#use-cases" className="hover:text-white transition-colors">
              Solutions
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#showcase" className="hover:text-white transition-colors">
              Resources
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline-flex">
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-semibold !bg-white/[0.08] !border-white/20 !text-white hover:!bg-white/[0.16] hover:!border-white/40 hover:!text-white transition-all shadow-xs"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-semibold bg-[#00C896] text-[#080B0F] hover:bg-[#00B386]"
            >
              Get started
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-sm border border-[#1E293B] text-[#CBD5E1] hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E293B] bg-[#0D1218] px-6 py-4 space-y-3 text-xs">
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#CBD5E1] hover:text-[#00C896]"
          >
            Product
          </a>
          <a
            href="#use-cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#CBD5E1] hover:text-[#00C896]"
          >
            Solutions
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#CBD5E1] hover:text-[#00C896]"
          >
            How it works
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#CBD5E1] hover:text-[#00C896]"
          >
            Resources
          </a>
          <div className="pt-2 border-t border-[#1E293B] flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-xs font-semibold !bg-white/[0.08] !border-white/20 !text-white hover:!bg-white/[0.16]"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full justify-center text-xs font-semibold">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative px-6 pt-4 pb-12 sm:pt-6 sm:pb-16 md:pt-8 md:pb-20 max-w-7xl mx-auto saas-grid">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* HERO LEFT COLUMN */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 lg:pr-4">
              <h1 className="text-[2.25rem] sm:text-[2.85rem] lg:text-[3.5rem] xl:text-[3.85rem] font-extrabold tracking-tight text-white leading-[1.08]">
                See what’s happening across your operations.
              </h1>

              <p className="text-base sm:text-[1.125rem] text-[#CBD5E1] max-w-xl leading-relaxed font-normal">
                Trce brings machines, inventory, suppliers, and operational events into one clear workspace.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-sm px-8 py-3.5 font-semibold bg-[#00C896] text-[#080B0F] hover:bg-[#00B386] transition-all glow-primary"
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                  >
                    Get started
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-sm px-8 py-3.5 border-[#00C896]/40 text-[#00C896] hover:text-[#00E5A0] hover:border-[#00C896] hover:bg-[#00C896]/10 transition-all font-semibold"
                  >
                    Explore the platform
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-2 text-xs sm:text-sm font-medium text-[#CBD5E1]">
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  <span>Real-time telemetry</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  <span>Multi-plant inventory</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  <span>Zero setup delay</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT COLUMN: 3D SPOTLIGHT ROBOT VISUAL WITH TRCE FLAG */}
            <div className="lg:col-span-5 min-w-0 max-w-full flex items-center justify-center">
              <RoboticSpotlightHero />
            </div>

          </div>
        </section>

        {/* 3. SOCIAL PROOF / CREDIBILITY STRIP */}
        <section className="border-y border-[#1E293B] bg-[#0D1218]/60 px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1] shrink-0 text-center md:text-left">
              Built for teams managing
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-white">
              <span className="px-3.5 py-1.5 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center gap-2 font-medium">
                <Factory className="w-3.5 h-3.5 text-[#00C896]" />
                Production
              </span>
              <span className="px-3.5 py-1.5 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center gap-2 font-medium">
                <Wrench className="w-3.5 h-3.5 text-[#38BDF8]" />
                Maintenance
              </span>
              <span className="px-3.5 py-1.5 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center gap-2 font-medium">
                <Boxes className="w-3.5 h-3.5 text-[#F59E0B]" />
                Inventory
              </span>
              <span className="px-3.5 py-1.5 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center gap-2 font-medium">
                <FileCheck2 className="w-3.5 h-3.5 text-[#CBD5E1]" />
                Procurement
              </span>
              <span className="px-3.5 py-1.5 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center gap-2 font-medium">
                <Activity className="w-3.5 h-3.5 text-[#00C896]" />
                Operations
              </span>
            </div>
          </div>
        </section>

        {/* 4. CAPABILITIES SECTION */}
        <section id="capabilities" className="px-6 py-14 md:py-16 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase text-[#00C896] tracking-wider block mb-2">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One operational view. Fewer blind spots.
            </h2>
            <p className="text-sm sm:text-base text-[#CBD5E1] mt-3 font-normal leading-relaxed">
              Industrial operations generate high volumes of uncoordinated data. Trce brings critical telemetry, distributed catalogs, and logistics together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Capability 1: Machine Health */}
            <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3.5 hover:border-[#334155] transition-all">
              <div className="w-10 h-10 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center justify-center text-[#EF4444]">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Machine Health</h3>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                Monitor machine conditions and surface unusual behavior before it becomes an operational disruption.
              </p>
              <div className="pt-2 text-[11px] text-[#94A3B8] font-medium">
                Vibration · Temp · Pressure · RPM
              </div>
            </div>

            {/* Capability 2: Spare-Part Trace */}
            <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3.5 hover:border-[#334155] transition-all">
              <div className="w-10 h-10 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center justify-center text-[#38BDF8]">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Spare-Part Trace</h3>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                See where critical parts are located across facilities and identify available sources quickly.
              </p>
              <div className="pt-2 text-[11px] text-[#94A3B8] font-medium">
                Multi-facility safety buffers
              </div>
            </div>

            {/* Capability 3: Supplier Data */}
            <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3.5 hover:border-[#334155] transition-all">
              <div className="w-10 h-10 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center justify-center text-[#F59E0B]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Supplier Data</h3>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                Bring inconsistent supplier files into a common operational format.
              </p>
              <div className="pt-2 text-[11px] text-[#94A3B8] font-medium">
                Automated schema mapping
              </div>
            </div>

            {/* Capability 4: Incident Response */}
            <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3.5 hover:border-[#334155] transition-all">
              <div className="w-10 h-10 rounded-sm bg-[#111820] border border-[#1E293B] flex items-center justify-center text-[#00C896]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Incident Response</h3>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                Connect operational signals to the action your team needs to take next.
              </p>
              <div className="pt-2 text-[11px] text-[#94A3B8] font-medium">
                Direct reroute dispatch
              </div>
            </div>
          </div>
        </section>

        {/* 5. PRODUCT SHOWCASE SECTION: "From signal to action." */}
        <section id="showcase" className="px-6 py-14 md:py-16 border-t border-[#1E293B] bg-[#0D1218]/40">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold uppercase text-[#00C896] tracking-wider block mb-2">
                Operational Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                From signal to action.
              </h2>
              <p className="text-sm sm:text-base text-[#CBD5E1] mt-2 font-normal leading-relaxed">
                Follow an operational signal from telemetry breach to warehouse dispatch.
              </p>
            </div>

            {/* Stage Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#1E293B] pb-4">
              {showcaseStages.map((stage) => {
                const isSelected = activeStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className={`px-4 py-2 rounded-sm text-xs sm:text-sm transition-all flex items-center gap-2 border font-medium ${
                      isSelected
                        ? 'bg-[#111820] text-[#00C896] border-[#00C896]'
                        : 'bg-[#080B0F] text-[#CBD5E1] border-[#1E293B] hover:text-white'
                    }`}
                  >
                    <span className="font-bold opacity-75">0{stage.id}</span>
                    <span>{stage.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Display Card */}
            <div className="p-6 md:p-8 rounded-sm bg-[#0D1218] border border-[#1E293B] shadow-xl">
              {showcaseStages
                .filter((s) => s.id === activeStage)
                .map((stage) => (
                  <div key={stage.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#00C896] font-bold">STAGE 0{stage.id}</span>
                        <span className="text-[#94A3B8]">·</span>
                        <Badge variant="neutral" size="sm">
                          {stage.tag}
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold text-white">{stage.title}</h3>
                      <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed font-normal">{stage.desc}</p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1E293B] text-xs">
                        <div>
                          <span className="text-[#94A3B8] block text-xs font-medium">{stage.metricLabel}</span>
                          <span className="text-lg font-bold text-white mt-0.5 block">{stage.metricVal}</span>
                        </div>
                        <div>
                          <span className="text-[#94A3B8] block text-xs font-medium">System Status</span>
                          <span className="text-xs font-bold text-[#00C896] mt-1 block">{stage.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 p-5 rounded-sm bg-[#111820] border border-[#1E293B] space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                        <span className="text-[#94A3B8] text-xs font-medium">TARGET CODE</span>
                        <span className="font-bold text-white text-sm">{stage.code}</span>
                      </div>
                      <div className="text-xs text-[#CBD5E1] leading-relaxed font-medium">
                        {stage.metricNormal}
                      </div>

                      {/* Mini visual indicator based on stage */}
                      {stage.id === 1 && (
                        <div className="p-3 rounded-xs bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-xs font-medium">
                          Vibration threshold 6.0 mm/s exceeded (Current: 8.7 mm/s). Immediate bearing inspection triggered.
                        </div>
                      )}
                      {stage.id === 2 && (
                        <div className="p-3 rounded-xs bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-medium">
                          Asset topology linked to high-speed angular contact bearing BRG-204 on Drive Axis 2.
                        </div>
                      )}
                      {stage.id === 3 && (
                        <div className="p-3 rounded-xs bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-medium">
                          Zero on-hand units in plant FAC-A. Cross-facility lookup verified 4 units at FAC-C.
                        </div>
                      )}
                      {stage.id === 4 && (
                        <div className="p-3 rounded-xs bg-[#00C896]/15 border border-[#00C896]/40 text-[#00C896] text-xs font-medium">
                          FAC-C designated optimal origin (183 km, 4h 20m). Retains necessary reserve buffer at source.
                        </div>
                      )}
                      {stage.id === 5 && (
                        <div className="p-3 rounded-xs bg-[#00C896]/15 border border-[#00C896]/40 text-[#00C896] text-xs font-medium">
                          Dispatch manifest generated. Truck carrier assigned with scheduled arrival window.
                        </div>
                      )}

                      <div className="pt-2 flex justify-between items-center text-xs text-[#CBD5E1]">
                        <span>Step {stage.id} of 5</span>
                        <div className="flex gap-1.5">
                          {showcaseStages.map((s) => (
                            <span
                              key={s.id}
                              className={`w-2 h-2 rounded-full ${
                                s.id === activeStage ? 'bg-[#00C896]' : 'bg-[#1E293B]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="px-6 py-14 md:py-16 border-t border-[#1E293B]">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs uppercase text-[#00C896] tracking-wider block mb-2 font-bold">
                Operational Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How it works
              </h2>
              <p className="text-sm sm:text-base text-[#CBD5E1] mt-2 font-normal leading-relaxed">
                Three direct stages from initial signal capture to plant resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 01 */}
              <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-4 relative hover:border-[#334155] transition-all">
                <span className="text-3xl font-extrabold text-[#00C896] block">01</span>
                <h3 className="text-lg font-bold text-white">
                  Connect your operational data.
                </h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                  Ingest machine telemetry protocols, facility inventory databases, and external supplier CSV catalogs without complex API migrations.
                </p>
                {/* Visual diagram */}
                <div className="p-3 rounded-xs bg-[#111820] border border-[#1E293B] space-y-1.5 text-xs text-[#CBD5E1]">
                  <div className="flex items-center justify-between text-[#CBD5E1]">
                    <span>Telemetry Ingestion</span>
                    <span className="text-[#00C896] font-semibold">MQTT · Modbus</span>
                  </div>
                  <div className="flex items-center justify-between text-[#CBD5E1]">
                    <span>Supplier Catalogs</span>
                    <span className="text-[#38BDF8] font-semibold">CSV · REST</span>
                  </div>
                </div>
              </div>

              {/* Step 02 */}
              <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-4 relative hover:border-[#334155] transition-all">
                <span className="text-3xl font-extrabold text-[#00C896] block">02</span>
                <h3 className="text-lg font-bold text-white">
                  Trce organizes signals, inventory, and events.
                </h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                  The correlation engine maps real-time machine threshold excursions directly to bills of materials and multi-hub stock balances.
                </p>
                {/* Visual diagram */}
                <div className="p-3 rounded-xs bg-[#111820] border border-[#1E293B] space-y-1.5 text-xs text-[#CBD5E1]">
                  <div className="flex items-center justify-between text-[#CBD5E1]">
                    <span>BOM Correlation</span>
                    <span className="text-[#00C896] font-semibold">Asset ↔ Part</span>
                  </div>
                  <div className="flex items-center justify-between text-[#CBD5E1]">
                    <span>Multi-Hub Graph</span>
                    <span className="text-[#F59E0B] font-semibold">Stock Trace</span>
                  </div>
                </div>
              </div>

              {/* Step 03 */}
              <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-4 relative hover:border-[#334155] transition-all">
                <span className="text-3xl font-extrabold text-[#00C896] block">03</span>
                <h3 className="text-lg font-bold text-white">
                  Your team gets a clear next action.
                </h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                  Instead of noisy alerts, maintenance coordinators receive specific transfer recommendations with exact transit windows and verified inventory.
                </p>
                {/* Visual diagram */}
                <div className="p-3 rounded-xs bg-[#111820] border border-[#00C896]/40 space-y-1.5 text-xs text-[#00C896]">
                  <div className="flex items-center justify-between">
                    <span>Transfer Action</span>
                    <span className="font-bold">FAC-C → FAC-A</span>
                  </div>
                  <div className="flex items-center justify-between text-[#CBD5E1]">
                    <span>Dispatch Ready</span>
                    <span className="font-semibold">ETA: 4h 20m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. USE CASES SECTION */}
        <section id="use-cases" className="px-6 py-14 md:py-16 border-t border-[#1E293B] bg-[#0D1218]/40">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs uppercase text-[#00C896] tracking-wider block mb-2 font-bold">
                Operational Teams
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Designed for the reality of plant floors
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Maintenance Teams */}
              <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3 hover:border-[#334155] transition-all">
                <div className="text-xs text-[#00C896] font-bold uppercase tracking-wider">MAINTENANCE</div>
                <h3 className="text-base font-bold text-white">Maintenance Teams</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                  Catch unusual machine behavior before it becomes downtime.
                </p>
              </div>

              {/* Card 2: Inventory Teams */}
              <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3 hover:border-[#334155] transition-all">
                <div className="text-xs text-[#38BDF8] font-bold uppercase tracking-wider">INVENTORY</div>
                <h3 className="text-base font-bold text-white">Inventory Teams</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                  Locate critical parts across distributed facilities.
                </p>
              </div>

              {/* Card 3: Procurement Teams */}
              <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3 hover:border-[#334155] transition-all">
                <div className="text-xs text-[#F59E0B] font-bold uppercase tracking-wider">PROCUREMENT</div>
                <h3 className="text-base font-bold text-white">Procurement Teams</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                  Standardize supplier data without manual cleanup.
                </p>
              </div>

              {/* Card 4: Operations Teams */}
              <div className="p-6 rounded-sm bg-[#0D1218] border border-[#1E293B] space-y-3 hover:border-[#334155] transition-all">
                <div className="text-xs text-[#00C896] font-bold uppercase tracking-wider">OPERATIONS</div>
                <h3 className="text-base font-bold text-white">Operations Teams</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal">
                  Turn scattered signals into one operational view.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className="px-6 py-16 md:py-20 border-t border-[#1E293B] text-center max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Your operations already generate the data.<br />
            <span className="text-[#00C896]">Trce makes it usable.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-lg mx-auto mb-8 font-normal leading-relaxed">
            Equip your industrial teams with continuous machine monitoring, cross-facility inventory tracing, and verified dispatch workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full sm:w-auto font-semibold px-8 py-3.5 bg-[#00C896] text-[#080B0F] hover:bg-[#00B386]"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Get started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-semibold px-8 py-3.5 border-[#00C896]/40 text-[#00C896] hover:text-[#00E5A0] hover:border-[#00C896] hover:bg-[#00C896]/10 transition-all"
              >
                Explore the platform
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="border-t border-[#1E293B] bg-[#080B0F] px-6 md:px-12 py-12 text-xs text-[#CBD5E1]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <div className="col-span-2 space-y-3">
              <Logo variant="full" size="md" className="h-7 w-auto" />
              <p className="text-[#CBD5E1] text-xs sm:text-sm max-w-xs leading-relaxed font-normal">
                Operational intelligence for modern industrial teams.
              </p>
            </div>


            <div className="space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Product</div>
              <ul className="space-y-2">
                <li><a href="#capabilities" className="hover:text-white transition-colors">Overview</a></li>
                <li><a href="#capabilities" className="hover:text-white transition-colors">Machine Health</a></li>
                <li><a href="#capabilities" className="hover:text-white transition-colors">Spare Tracing</a></li>
                <li><a href="#capabilities" className="hover:text-white transition-colors">Supplier Ingest</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Solutions</div>
              <ul className="space-y-2">
                <li><a href="#use-cases" className="hover:text-white transition-colors">Maintenance</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Inventory</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Procurement</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Operations</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Company</div>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Console</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Legal</div>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <div>© 2026 Trce. All rights reserved.</div>
            <div className="flex items-center gap-4 text-[#CBD5E1]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C896]" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
