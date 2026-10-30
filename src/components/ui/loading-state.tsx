import React from 'react';
import { Activity } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export function LoadingState({
  message = 'Synchronizing Operational Telemetry...',
  subtext = 'Querying distributed factory nodes and active sensor streams',
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-sm border border-slate-200 bg-white shadow-2xs ${className}`}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-amber-600 rounded-full animate-spin" />
        <Activity className="w-4 h-4 text-amber-600 absolute" />
      </div>
      <p className="text-xs font-semibold text-slate-900 tracking-wider uppercase mb-1">
        {message}
      </p>
      {subtext && (
        <p className="text-[11px] text-slate-600 max-w-sm">
          {subtext}
        </p>
      )}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-slate-200 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded-sm"
          style={{ width: `${Math.max(20, 100 / cols - 5)}%` }}
        />
      ))}
    </div>
  );
}
