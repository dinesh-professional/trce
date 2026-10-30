'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Thermometer,
  Gauge,
  Zap,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/status-indicator';
import {
  evaluateTelemetryPayload,
  calculateBearingFailureProbability,
  OperationalThresholdStatus,
} from '@/lib/telemetry-engine';
import { operationalStore } from '@/lib/operational-store';

interface TelemetryStressPanelProps {
  machineId: string;
  initialVibration?: number;
  initialTemperature?: number;
  initialPressure?: number;
  initialRpm?: number;
}

export function TelemetryStressPanel({
  machineId,
  initialVibration = 8.7,
  initialTemperature = 78.0,
  initialPressure = 41.0,
  initialRpm = 1840,
}: TelemetryStressPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Slider States
  const [vibration, setVibration] = useState<number>(initialVibration);
  const [temperature, setTemperature] = useState<number>(initialTemperature);
  const [pressure, setPressure] = useState<number>(initialPressure);
  const [rpm, setRpm] = useState<number>(initialRpm);

  // Stream state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic evaluation using real-time telemetry engine
  const evaluation = evaluateTelemetryPayload({
    vibration,
    temperature,
    pressure,
    rpm,
  });

  const bearingProbability = calculateBearingFailureProbability(vibration, temperature);

  // Handler: Manual injection of current slider values
  const handleInjectTelemetry = (
    overrideVib = vibration,
    overrideTemp = temperature,
    overridePress = pressure,
    overrideRpm = rpm
  ) => {
    operationalStore.injectMachineTelemetry(machineId, {
      vibration: overrideVib,
      temperature: overrideTemp,
      pressure: overridePress,
      rpm: overrideRpm,
    });
  };

  // Presets
  const applyPreset = (preset: 'nominal' | 'warning' | 'critical') => {
    let v = 3.4;
    let t = 62.0;
    let p = 42.0;
    let r = 1820;

    if (preset === 'warning') {
      v = 6.8;
      t = 76.0;
      p = 44.0;
      r = 1840;
    } else if (preset === 'critical') {
      v = 8.9;
      t = 81.0;
      p = 48.0;
      r = 1850;
    }

    setVibration(v);
    setTemperature(t);
    setPressure(p);
    setRpm(r);
    handleInjectTelemetry(v, t, p, r);
  };

  // Stream toggle
  useEffect(() => {
    if (isStreaming) {
      streamIntervalRef.current = setInterval(() => {
        // Continuous real-time variation with subtle noise
        setVibration((prev) => {
          const delta = (Math.random() - 0.48) * 0.4;
          const updated = Number(Math.max(1.0, Math.min(14.0, prev + delta)).toFixed(1));
          return updated;
        });

        setTemperature((prev) => {
          const delta = (Math.random() - 0.48) * 0.6;
          const updated = Number(Math.max(35.0, Math.min(95.0, prev + delta)).toFixed(1));
          return updated;
        });

        // Inject point into operational store
        operationalStore.injectMachineTelemetry(machineId, {
          vibration: Number((vibration + (Math.random() - 0.48) * 0.3).toFixed(1)),
          temperature: Number((temperature + (Math.random() - 0.48) * 0.5).toFixed(1)),
          pressure,
          rpm,
        });
      }, 2500);
    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    }

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, [isStreaming, machineId, vibration, temperature, pressure, rpm]);

  const getStatusBadge = (status: OperationalThresholdStatus) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <Badge variant="critical" size="md">
            CRITICAL THRESHOLD BREACH
          </Badge>
        );
      case 'WARNING':
        return (
          <Badge variant="warning" size="md">
            OPERATIONAL WARNING
          </Badge>
        );
      case 'NOMINAL':
        return (
          <Badge variant="primary" size="md">
            NOMINAL ENVELOPE
          </Badge>
        );
    }
  };

  return (
    <Card className="border border-slate-200 bg-white overflow-hidden shadow-2xs">
      {/* Panel Header */}
      <CardHeader className="pb-3 border-b border-slate-200 bg-slate-50/80 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-sky-600" />
            <div>
              <CardTitle className="text-sm font-bold tracking-wider uppercase text-slate-900">
                TELEMETRY DIAGNOSTIC &amp; THRESHOLD INJECTION
              </CardTitle>
              <p className="text-[11px] text-slate-500 font-normal">
                Real-time sensor injection engine · ISO-10816 threshold evaluation · Component failure synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {getStatusBadge(evaluation.status)}
            <Button variant="ghost" size="sm" className="p-1 h-7 w-7 text-slate-400 hover:text-slate-600">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-5 space-y-6">
          {/* Quick Presets & Stream Controller */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Threshold Presets:
              </span>
              <button
                onClick={() => applyPreset('nominal')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors"
              >
                Nominal (3.4 mm/s)
              </button>
              <button
                onClick={() => applyPreset('warning')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
              >
                Warning (6.8 mm/s)
              </button>
              <button
                onClick={() => applyPreset('critical')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition-colors"
              >
                Critical (8.9 mm/s)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={isStreaming ? 'danger' : 'outline'}
                size="sm"
                onClick={() => setIsStreaming(!isStreaming)}
                leftIcon={isStreaming ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                className="text-xs flex-1 sm:flex-none justify-center bg-white"
              >
                {isStreaming ? 'Stop Sensor Stream' : 'Stream Telemetry'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleInjectTelemetry()}
                leftIcon={<Zap className="w-3.5 h-3.5" />}
                className="text-xs flex-1 sm:flex-none justify-center"
              >
                Inject Payload
              </Button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Vibration Slider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${vibration >= 8.0 ? 'text-rose-600' : vibration > 6.0 ? 'text-amber-600' : 'text-sky-600'}`} />
                  <span className="text-xs font-semibold text-slate-900">Vibration (mm/s)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold font-mono ${vibration >= 8.0 ? 'text-rose-600' : vibration > 6.0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {vibration.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-500">mm/s</span>
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="14.0"
                step="0.1"
                value={vibration}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVibration(val);
                  handleInjectTelemetry(val, temperature, pressure, rpm);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>0.0 (Nominal: &le; 6.0)</span>
                <span className="text-amber-700 font-semibold">Warning: &gt; 6.0</span>
                <span className="text-rose-600 font-semibold">Critical: &ge; 8.0</span>
                <span>14.0 mm/s</span>
              </div>
            </div>

            {/* 2. Temperature Slider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className={`w-4 h-4 ${temperature >= 77.0 ? 'text-rose-600' : temperature > 75.0 ? 'text-amber-600' : 'text-sky-600'}`} />
                  <span className="text-xs font-semibold text-slate-900">Temperature (°C)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold font-mono ${temperature >= 77.0 ? 'text-rose-600' : temperature > 75.0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {temperature.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-500">°C</span>
                </div>
              </div>

              <input
                type="range"
                min="35.0"
                max="105.0"
                step="0.5"
                value={temperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTemperature(val);
                  handleInjectTelemetry(vibration, val, pressure, rpm);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>35°C (Nominal: 40–75)</span>
                <span className="text-amber-700 font-semibold">Warning: &gt; 75°C</span>
                <span className="text-rose-600 font-semibold">Critical: &ge; 77°C</span>
                <span>105°C</span>
              </div>
            </div>
          </div>

          {/* Secondary Parameters (Pressure & RPM) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Hydraulic Pressure</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max="65"
                  value={pressure}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 41;
                    setPressure(val);
                    handleInjectTelemetry(vibration, temperature, val, rpm);
                  }}
                  className="w-16 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-right font-mono text-slate-900 shadow-2xs"
                />
                <span className="text-slate-500">bar (30–50)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Drive Speed</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1200"
                  max="2500"
                  value={rpm}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1840;
                    setRpm(val);
                    handleInjectTelemetry(vibration, temperature, pressure, val);
                  }}
                  className="w-18 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-right font-mono text-slate-900 shadow-2xs"
                />
                <span className="text-slate-500">RPM (1500–2200)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Component Failure Probability Meter (BRG-204) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-sky-600" />
                  DYNAMIC ROOT-CAUSE FAILURE PROBABILITY · BRG-204
                </span>
                <span className="text-[11px] text-slate-500">
                  Mathematical model: P = min(99.4, baseline + &Delta;V &times; 22.0 + &Delta;T &times; 2.5 + cross)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {bearingProbability}%
                </span>
                <StatusIndicator
                  status={
                    bearingProbability > 70
                      ? 'critical'
                      : bearingProbability > 25
                      ? 'warning'
                      : 'operational'
                  }
                  label={
                    bearingProbability > 70
                      ? 'High Failure Vector'
                      : bearingProbability > 25
                      ? 'Elevated Risk'
                      : 'Healthy'
                  }
                  size="sm"
                />
              </div>
            </div>

            {/* Gauge Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  bearingProbability > 70
                    ? 'bg-rose-500'
                    : bearingProbability > 25
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${bearingProbability}%` }}
              />
            </div>

            {/* Live Operational Action Context */}
            <div className="text-[11px] text-slate-600 flex items-start gap-2 pt-1 border-t border-slate-200">
              <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span>
                {evaluation.status === 'CRITICAL' ? (
                  <strong className="text-rose-700">
                    Crossing critical threshold automatically creates or escalates incident INC-204 and logs an automated audit event in /activity.
                  </strong>
                ) : evaluation.status === 'WARNING' ? (
                  <strong className="text-amber-800">
                    Parameters in warning range. Predictive maintenance ticket queued in operational store.
                  </strong>
                ) : (
                  <span className="text-emerald-700 font-medium">
                    Telemetry nominal. No incident escalation required.
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
