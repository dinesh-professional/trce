import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'primary' | 'secondary' | 'warning' | 'critical';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className = '',
  variant = 'neutral',
  size = 'md',
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-sans font-semibold uppercase tracking-wider',
    md: 'text-sm px-2.5 py-0.5 font-sans font-semibold uppercase tracking-wider',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    secondary: 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    critical: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
