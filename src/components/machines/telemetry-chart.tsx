'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { TelemetryPoint } from '@/lib/data/monitored-machines';
import { NORMAL_RANGES } from '@/lib/anomaly';

interface TelemetryChartProps {
  data: TelemetryPoint[];
  machineId: string;
}

export function TelemetryChart({ data, machineId }: TelemetryChartProps) {
  const [activeMetric, setActiveMetric] = useState<'vibration' | 'temperature' | 'all'>('all');

  return (
    <div className="space-y-4">
      {/* Metric Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-sans">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              activeMetric === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sensors
          </button>
          <button
            onClick={() => setActiveMetric('vibration')}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              activeMetric === 'vibration'
                ? 'bg-white text-rose-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vibration (mm/s)
          </button>
          <button
            onClick={() => setActiveMetric('temperature')}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              activeMetric === 'temperature'
                ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Temperature (°C)
          </button>
        </div>

        <div className="text-[11px] font-sans text-slate-500 font-medium">
          Telemetry interval: 10m · Node: {machineId}
        </div>
      </div>

      {/* Chart Canvas: fluid height 220px on mobile, 320px on desktop with overflow protection */}
      <div className="w-full h-[220px] sm:h-[280px] lg:h-[320px] bg-slate-50/80 rounded-lg border border-slate-200 p-2 sm:p-3 pt-4 sm:pt-6 min-w-0 max-w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.6} />
            <XAxis
              dataKey="time"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              domain={[0, 'auto']}
              width={35}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-sans text-xs shadow-md space-y-1">
                    <div className="text-slate-500 pb-1 border-b border-slate-100 font-medium">
                      Time: {label}
                    </div>
                    {payload.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {entry.value} {entry.name === 'Vibration' ? 'mm/s' : '°C'}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />

            {/* Threshold References */}
            {(activeMetric === 'all' || activeMetric === 'vibration') && (
              <ReferenceLine
                y={NORMAL_RANGES.vibration.max}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: 'Vibration Max (6 mm/s)',
                  fill: '#EF4444',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'temperature') && (
              <ReferenceLine
                y={NORMAL_RANGES.temperature.max}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: 'Temp Max (75°C)',
                  fill: '#F59E0B',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'vibration') && (
              <Line
                type="monotone"
                dataKey="vibration"
                name="Vibration"
                stroke="#EF4444"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#EF4444' }}
                activeDot={{ r: 5, fill: '#EF4444', stroke: '#FFFFFF' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'temperature') && (
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 3, fill: '#F59E0B' }}
                activeDot={{ r: 5, fill: '#F59E0B', stroke: '#FFFFFF' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
