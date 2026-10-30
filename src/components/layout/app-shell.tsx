'use client';

import React, { useState, Suspense } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { FlamyBackground } from '@/components/ui/flamy-background';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex selection:bg-[#00C896] selection:text-white relative">
      {/* Black & White Flamy Background with Organic Blur Effect */}
      <FlamyBackground theme="light" intensity="subtle" />

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette />

      {/* Sidebar navigation */}
      <Suspense fallback={<div className="hidden md:block w-64 bg-white border-r border-slate-200" />}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </Suspense>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out relative z-10 ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white/90" />}>
          <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        </Suspense>
        <main className="flex-1 px-3 sm:px-5 py-4 md:px-6 md:pt-4 md:pb-8 lg:px-8 lg:pt-5 lg:pb-10 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
