import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-sm border border-dashed border-slate-300 bg-slate-50/80 shadow-2xs ${className}`}
    >
      <div className="w-12 h-12 rounded-sm bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-500 mb-4">
        {icon ?? <Inbox className="w-6 h-6 text-slate-500" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-900 tracking-wide mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-600 max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
