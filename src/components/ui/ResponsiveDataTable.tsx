'use client';

import React from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sticky?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
  mobileHidden?: boolean;
}

export interface ResponsiveDataTableProps<T> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveDataTable<T>({
  title,
  subtitle,
  actions,
  columns,
  data,
  keyExtractor,
  renderMobileCard,
  emptyMessage = 'No operational records found.',
  className = '',
}: ResponsiveDataTableProps<T>) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs ${className}`}
    >
      {/* Header bar */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
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
          {actions && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* 1. Mobile Card Stack View (<sm / <640px) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {data.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, index) => {
            const key = keyExtractor(row, index);

            if (renderMobileCard) {
              return (
                <div key={key} className="p-4 bg-white">
                  {renderMobileCard(row, index)}
                </div>
              );
            }

            // Fallback automated high-density mobile card
            const primaryCol = columns[0];
            const secondaryCols = columns.slice(1).filter((c) => !c.mobileHidden);

            return (
              <div key={key} className="p-4 bg-white space-y-2.5">
                {/* Card Primary Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="font-bold text-sm text-slate-900">
                    {primaryCol.render
                      ? primaryCol.render(row, index)
                      : String((row as Record<string, unknown>)[primaryCol.key] ?? '')}
                  </span>
                  <span className="text-[10px] uppercase font-sans font-semibold text-slate-400">
                    {primaryCol.header}
                  </span>
                </div>

                {/* Key-Value Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {secondaryCols.map((col) => (
                    <div key={col.key} className="space-y-0.5">
                      <span className="text-[10px] uppercase text-slate-400 block font-medium">
                        {col.header}
                      </span>
                      <div className="text-slate-700 font-semibold truncate">
                        {col.render
                          ? col.render(row, index)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Tablet & Desktop Sticky Column + Horizontal Scroll Table (>=sm) */}
      <div className="hidden sm:block w-full overflow-x-auto relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 whitespace-nowrap ${
                    col.sticky
                      ? 'sticky left-0 z-10 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-slate-200'
                      : ''
                  } ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-xs text-slate-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const key = keyExtractor(row, index);

                return (
                  <tr
                    key={key}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 whitespace-nowrap ${
                          col.sticky
                            ? 'sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.04)] font-bold text-slate-900'
                            : ''
                        } ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.className ?? ''}`}
                      >
                        {col.render
                          ? col.render(row, index)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
