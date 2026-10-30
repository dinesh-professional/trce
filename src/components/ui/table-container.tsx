import React from 'react';

export interface TableContainerProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function TableContainer({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: TableContainerProps) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="w-full overflow-x-auto text-slate-800">
        {children}
      </div>
    </div>
  );
}
