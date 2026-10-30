'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  Boxes,
  Truck,
  Activity,
  Settings,
  X,
  PanelLeftClose,
  PanelLeft,
  Building2,
  LogOut,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { openCommandPalette } from '@/components/ui/CommandPalette';
import { Logo } from '@/components/ui/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isLinkActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-200 ease-in-out md:translate-x-0 shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-16' : 'md:w-64'} w-64`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-none"
            aria-label="Trce Dashboard"
          >
            {isCollapsed ? (
              <Logo variant="icon" size="md" className="shrink-0" />
            ) : (
              <Logo
                variant="full"
                size="md"
                className="h-7 w-auto shrink-0 transition-transform group-hover:scale-[1.02] text-slate-900"
              />
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Mobile Fast Command Search Trigger */}
          <div className="md:hidden px-1 pb-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                openCommandPalette();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Search / Command...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-500 font-mono shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* SECTION 1: OVERVIEW */}
          <div className="space-y-1">
            <Link
              href="/dashboard"
              prefetch={true}
              onClick={onClose}
              title={isCollapsed ? 'Overview' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                isLinkActive('/dashboard')
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isLinkActive('/dashboard') && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-md" />
              )}
              <LayoutDashboard
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isLinkActive('/dashboard')
                    ? 'text-emerald-600'
                    : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              {!isCollapsed && <span>Overview</span>}
            </Link>
          </div>

          {/* SECTION 2: OPERATIONS */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                Operations
              </div>
            )}

            {[
              { label: 'Machines', href: '/machines', icon: Cpu },
              { label: 'Incidents', href: '/incidents', icon: AlertTriangle },
              { label: 'Inventory', href: '/inventory', icon: Boxes },
              { label: 'Suppliers', href: '/suppliers', icon: Truck },
            ].map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-md" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active
                        ? 'text-emerald-600'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* SECTION 3: ACTIVITY */}
          <div className="space-y-1">
            <Link
              href="/activity"
              prefetch={true}
              onClick={onClose}
              title={isCollapsed ? 'Activity' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                isLinkActive('/activity')
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isLinkActive('/activity') && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-md" />
              )}
              <Activity
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isLinkActive('/activity')
                    ? 'text-emerald-600'
                    : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              {!isCollapsed && <span>Activity</span>}
            </Link>
          </div>

          {/* SECTION 4: WORKSPACE */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                Workspace
              </div>
            )}
            <Link
              href="/settings"
              prefetch={true}
              onClick={onClose}
              title={isCollapsed ? 'Settings' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                isLinkActive('/settings')
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isLinkActive('/settings') && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-md" />
              )}
              <Settings
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isLinkActive('/settings')
                    ? 'text-emerald-600'
                    : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>

        {/* BOTTOM: WORKSPACE & USER SECTION */}
        <div className="border-t border-slate-200 bg-slate-50/70 p-3 space-y-2">
          {/* Workspace Info */}
          {!isCollapsed ? (
            <Link
              href="/settings"
              title="Manage Workspace & Facility"
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-between text-xs shadow-2xs transition-all group cursor-pointer block"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-400 uppercase leading-none font-medium">
                    Workspace
                  </div>
                  <div className="font-semibold text-slate-800 truncate mt-0.5 group-hover:text-emerald-950">
                    {user?.organization ?? 'Apex Industrial Group'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ) : (
            <Link
              href="/settings"
              title={user?.organization ?? 'Apex Industrial Group'}
              className="flex justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-2xs transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
          )}

          {/* User Account / Signout */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white transition-colors">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 min-w-0 focus-visible:outline-none"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {user?.name ?? 'Account'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-medium">
                    {user?.role ?? 'Operator'}
                  </div>
                </div>
              )}
            </Link>

            <button
              onClick={() => logout()}
              type="button"
              title="Log out of TRCE"
              aria-label="Log out"
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
