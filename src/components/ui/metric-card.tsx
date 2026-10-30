import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  accent?: 'primary' | 'secondary' | 'warning' | 'critical' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  subtext,
  accent = 'neutral',
  icon,
  className = '',
}: MetricCardProps) {
  const accentBorder = {
    neutral: 'border-l-4 border-l-slate-300',
    primary: 'border-l-4 border-l-emerald-500',
    secondary: 'border-l-4 border-l-sky-500',
    warning: 'border-l-4 border-l-amber-500',
    critical: 'border-l-4 border-l-red-500',
  };

  const trendColor = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-slate-500',
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl p-4 relative overflow-hidden transition-all hover:shadow-xs hover:border-slate-300 ${accentBorder[accent]} ${className}`}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          {title}
        </span>
        {icon && (
          <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 pt-1">
        <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>

        {change && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              trend ? trendColor[trend] : 'text-slate-500'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>
      )}
    </div>
  );
}
