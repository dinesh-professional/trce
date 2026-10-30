import React from 'react';

export type StatusType = 'operational' | 'warning' | 'critical' | 'offline' | 'degraded' | 'maintenance';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  label?: string;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({
  status,
  label,
  showPulse = true,
  size = 'md',
  className = '',
  ...props
}: StatusIndicatorProps) {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const statusColors: Record<StatusType, { dot: string; glow: string; text: string; defaultLabel: string }> = {
    operational: {
      dot: 'bg-[#10B981]',
      glow: 'shadow-[0_0_8px_#10B981]',
      text: 'text-[#10B981]',
      defaultLabel: 'Operational',
    },
    warning: {
      dot: 'bg-[#F59E0B]',
      glow: 'shadow-[0_0_8px_#F59E0B]',
      text: 'text-[#F59E0B]',
      defaultLabel: 'Warning',
    },
    critical: {
      dot: 'bg-[#EF4444]',
      glow: 'shadow-[0_0_8px_#EF4444]',
      text: 'text-[#EF4444]',
      defaultLabel: 'Critical Alert',
    },
    degraded: {
      dot: 'bg-[#F59E0B]',
      glow: 'shadow-[0_0_8px_#F59E0B]',
      text: 'text-[#F59E0B]',
      defaultLabel: 'Degraded',
    },
    offline: {
      dot: 'bg-[#52525B]',
      glow: '',
      text: 'text-[#52525B]',
      defaultLabel: 'Offline',
    },
    maintenance: {
      dot: 'bg-[#F59E0B]',
      glow: 'shadow-[0_0_8px_#F59E0B]',
      text: 'text-[#F59E0B]',
      defaultLabel: 'Maintenance',
    },
  };

  const current = statusColors[status] || statusColors.offline;
  const displayLabel = label ?? current.defaultLabel;

  return (
    <div
      className={`inline-flex items-center gap-2 font-sans ${className}`}
      {...props}
    >
      <span className="relative flex items-center justify-center">
        {showPulse && status !== 'offline' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dot}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${dotSize[size]} ${current.dot} ${current.glow}`}
        />
      </span>
      {displayLabel && (
        <span className={`text-xs font-medium tracking-wide ${current.text}`}>
          {displayLabel}
        </span>
      )}
    </div>
  );
}
