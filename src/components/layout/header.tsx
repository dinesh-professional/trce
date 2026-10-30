'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { operationalStore } from '@/lib/operational-store';
import { openCommandPalette } from '@/components/ui/CommandPalette';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getGreeting();

  const getPageTitle = (path: string): string => {
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/machines')) return 'Machines';
    if (path.startsWith('/incidents')) return 'Incidents';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/suppliers')) return 'Suppliers';
    if (path.startsWith('/activity')) return 'Activity';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const pageTitle = getPageTitle(pathname);
  const personalizedGreeting = user?.name ? `${greeting}, ${user.name}` : greeting;

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shadow-xs">
      {/* Left: Mobile Toggle & Page Title / Contextual Greeting */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-bold text-slate-900 leading-tight">
            {pageTitle}
          </h1>
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            {personalizedGreeting}
          </span>
        </div>
      </div>

      {/* Right: Search, Notifications & Account */}
      <div className="flex items-center gap-3">
        {/* Search / Command Trigger */}
        <div className="relative hidden sm:flex items-center">
          <button
            type="button"
            onClick={openCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer w-48 lg:w-64 text-left"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span className="flex-1 truncate">Search / Command...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-500 font-sans font-medium shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Mobile Search Trigger Icon */}
        <button
          type="button"
          onClick={openCommandPalette}
          aria-label="Open Command Search"
          className="sm:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Enterprise State Restoration */}
        <button
          type="button"
          onClick={() => operationalStore.restoreBaseline()}
          title="Restore Baseline State"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3 h-3 text-emerald-600" />
          <span className="hidden sm:inline">Reset demo data</span>
        </button>
      </div>
    </header>
  );
}
