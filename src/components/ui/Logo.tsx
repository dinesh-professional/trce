'use client';

import React, { useId } from 'react';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const iconSizes: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
  xl: 'w-12 h-12',
};

const fullSizes: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'h-5 w-auto max-w-[64px]',
  md: 'h-7 w-auto max-w-[96px]',
  lg: 'h-9 w-auto max-w-[124px]',
  xl: 'h-12 w-auto max-w-[160px]',
};

export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  ...props
}: LogoProps) {
  const rawId = useId();
  // Sanitize React 19's :r...: syntax to create a strictly valid SVG identifier
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const iconGradId = `trce-grad-${safeId}`;

  const sizeClass = variant === 'icon' ? iconSizes[size] : fullSizes[size];
  const combinedClassName = className ? `${sizeClass} ${className}` : sizeClass;

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClassName}
        aria-label="Trce Icon"
        role="img"
        {...props}
      >
        <defs>
          <linearGradient
            id={iconGradId}
            x1="20"
            y1="20"
            x2="105"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <path
          d="M27 40H51L65 26H93"
          stroke={`url(#${iconGradId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27 62H77L93 78"
          stroke={`url(#${iconGradId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M51 40V80L65 94H93"
          stroke={`url(#${iconGradId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="27" cy="40" r="5.5" fill="#0B0D13" stroke="#10B981" strokeWidth="3.5" />
        <circle cx="93" cy="26" r="5.5" fill="#06B6D4" />
        <circle cx="27" cy="62" r="5.5" fill="#10B981" />
        <circle cx="93" cy="78" r="5.5" fill="#0B0D13" stroke="#06B6D4" strokeWidth="3.5" />
        <circle cx="93" cy="94" r="5.5" fill="#06B6D4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 360 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={combinedClassName}
      aria-label="Trce"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient
          id={iconGradId}
          x1="20"
          y1="20"
          x2="105"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      {/* Circuit Nodes */}
      <path
        d="M27 40H51L65 26H93"
        stroke={`url(#${iconGradId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 62H77L93 78"
        stroke={`url(#${iconGradId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M51 40V80L65 94H93"
        stroke={`url(#${iconGradId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="40" r="5.5" fill="#0B0D13" stroke="#10B981" strokeWidth="3.5" />
      <circle cx="93" cy="26" r="5.5" fill="#06B6D4" />
      <circle cx="27" cy="62" r="5.5" fill="#10B981" />
      <circle cx="93" cy="78" r="5.5" fill="#0B0D13" stroke="#06B6D4" strokeWidth="3.5" />
      <circle cx="93" cy="94" r="5.5" fill="#06B6D4" />

      {/* Wordmark Typography */}
      <text
        x="122"
        y="78"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: '68px',
          letterSpacing: '-0.04em',
        }}
      >
        trce
      </text>
    </svg>
  );
}

export default Logo;
