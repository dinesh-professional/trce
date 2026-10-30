import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  tag?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  tag,
  breadcrumb,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-200 ${className}`}
    >
      <div className="space-y-1.5 min-w-0">
        {breadcrumb && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            {breadcrumb}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-h1-fluid tracking-tight text-slate-900 font-bold truncate max-w-full">
            {title}
          </h1>
          {tag && (
            <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase tracking-wider shrink-0">
              {tag}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// Named alias export for consistent uppercase PascalCase import styles
export const HeaderPage = PageHeader;
