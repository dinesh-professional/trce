'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Thermometer,
  Activity,
  Boxes,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { TelemetryChart } from '@/components/machines/telemetry-chart';
import { TelemetryStressPanel } from '@/components/machines/telemetry-stress-panel';
import { useOperationalStore, operationalStore, Machine } from '@/lib/operational-store';
import {
  evaluateTelemetryPayload,
  calculateBearingFailureProbability,
  TELEMETRY_THRESHOLDS,
} from '@/lib/telemetry-engine';

interface MachineDetailViewProps {
  initialMachineId: string;
}

export function MachineDetailView({ initialMachineId }: MachineDetailViewProps) {
  const store = useOperationalStore();

  // Find machine dynamically from active operational store
  const machine = useMemo(() => {
    return (
      store.machines.find(
        (m: Machine) => m.id.toLowerCase() === initialMachineId.toLowerCase()
      ) || null
    );
  }, [store.machines, initialMachineId]);

  if (!machine) {
    notFound();
  }

  // Dynamic evaluation using live telemetry values
  const evaluation = useMemo(() => {
    return evaluateTelemetryPayload({
      vibration: machine.vibrationMmS,
      temperature: machine.temperatureC,
      pressure: machine.pressureBar,
      rpm: machine.rpm,
    });
  }, [machine.vibrationMmS, machine.temperatureC, machine.pressureBar, machine.rpm]);

  const bearingFailureProbability = calculateBearingFailureProbability(
    machine.vibrationMmS,
    machine.temperatureC
  );

  const isCritical = evaluation.status === 'CRITICAL';
  const isWarning = evaluation.status === 'WARNING';

  const vibAnomaly = machine.vibrationMmS > TELEMETRY_THRESHOLDS.vibration.nominalMax;
  const tempAnomaly = machine.temperatureC > TELEMETRY_THRESHOLDS.temperature.nominalMax;
  const pressAnomaly =
    machine.pressureBar < TELEMETRY_THRESHOLDS.pressure.nominalMin ||
    machine.pressureBar > TELEMETRY_THRESHOLDS.pressure.nominalMax;
  const rpmAnomaly =
    machine.rpm < TELEMETRY_THRESHOLDS.rpm.nominalMin ||
    machine.rpm > TELEMETRY_THRESHOLDS.rpm.nominalMax;

  // Active incident in operational store linked to this machine
  const activeIncident = useMemo(() => {
    const incId = machine.id === 'M-204' ? 'INC-204' : `INC-${machine.id.replace(/^M-?/, '')}`;
    return store.incidents.find(
      (inc) =>
        inc.id === incId ||
        inc.machineId.toLowerCase() === machine.id.toLowerCase()
    );
  }, [store.incidents, machine.id]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. TOP NAV & LIVE TIME STATUS */}
      <div className="flex items-center justify-between">
        <Link href="/machines">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Machine Fleet
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => operationalStore.restoreBaseline()}
            className="text-xs border-slate-200 hover:border-sky-500 text-slate-600 hover:text-sky-700 bg-white"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restore Baseline
          </Button>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Live continuous sensor stream</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN PAGE HEADER */}
      <PageHeader
        title={`${machine.id} — ${machine.name}`}
        description={`${machine.line} · ${machine.facilityId} (${machine.facilityName})`}
        tag={machine.facilityId}
        actions={
          <div className="flex items-center gap-2">
            <Badge
              variant={isCritical ? 'critical' : isWarning ? 'warning' : 'primary'}
              size="md"
            >
              {evaluation.status} THRESHOLD
            </Badge>
            <StatusIndicator
              status={
                isCritical
                  ? 'critical'
                  : isWarning
                  ? 'warning'
                  : 'operational'
              }
              label={evaluation.machineStatus.toUpperCase()}
              size="md"
            />
          </div>
        }
      />

      {/* 3. ACTIVE INCIDENT BANNER */}
      {(isCritical || (activeIncident && activeIncident.status !== 'resolved')) && (
        <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-300 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-rose-100 text-rose-600 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-rose-700">
                    {activeIncident?.id ?? (machine.id === 'M-204' ? 'INC-204' : `INC-${machine.id.replace(/^M-?/, '')}`)}
                  </span>
                  <Badge variant="critical" size="sm">
                    {activeIncident?.status.toUpperCase() ?? 'ACTIVE'}
                  </Badge>
                  <span className="text-[11px] text-slate-600">
                    Threshold deviation: Vibration {machine.vibrationMmS} mm/s &middot; Temp {machine.temperatureC}&deg;C
                  </span>
                </div>
                <div className="text-xs text-slate-900 mt-1">
                  Machine: <strong className="text-sky-700">{machine.id}</strong> &middot; Failure Probability: <strong className="text-rose-600 font-bold">{bearingFailureProbability}%</strong> &middot; Suspected: <strong className="text-emerald-700">BRG-204 Spindle Bearing</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/incidents/${activeIncident?.id ?? 'INC-204'}`}>
                <Button variant="danger" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Incident &amp; Reroute Workflow
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOUR TELEMETRY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vibration Card */}
        <div
          className={`p-4 rounded-xl border bg-white shadow-2xs transition-colors ${
            machine.vibrationMmS >= 8.0
              ? 'border-rose-400 bg-rose-50/40 shadow-xs'
              : machine.vibrationMmS > 6.0
              ? 'border-amber-300 bg-amber-50/30'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Vibration (ISO-10816)</span>
            <Activity className={`w-4 h-4 ${machine.vibrationMmS >= 8.0 ? 'text-rose-600' : machine.vibrationMmS > 6.0 ? 'text-amber-600' : 'text-sky-600'}`} />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span
              className={`text-3xl font-bold font-mono ${
                machine.vibrationMmS >= 8.0
                  ? 'text-rose-600'
                  : machine.vibrationMmS > 6.0
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}
            >
              {machine.vibrationMmS.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">mm/s</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] flex justify-between">
            <span className="text-slate-500">Normal:</span>
            <span className={vibAnomaly ? (machine.vibrationMmS >= 8.0 ? 'text-rose-600 font-semibold' : 'text-amber-600 font-semibold') : 'text-slate-500 font-medium'}>
              0–6.0 mm/s
            </span>
          </div>
        </div>

        {/* Temperature Card */}
        <div
          className={`p-4 rounded-xl border bg-white shadow-2xs transition-colors ${
            machine.temperatureC >= 77.0
              ? 'border-rose-400 bg-rose-50/40 shadow-xs'
              : machine.temperatureC > 75.0
              ? 'border-amber-300 bg-amber-50/30'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Temperature (Core)</span>
            <Thermometer className={`w-4 h-4 ${machine.temperatureC >= 77.0 ? 'text-rose-600' : machine.temperatureC > 75.0 ? 'text-amber-600' : 'text-sky-600'}`} />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span
              className={`text-3xl font-bold font-mono ${
                machine.temperatureC >= 77.0
                  ? 'text-rose-600'
                  : machine.temperatureC > 75.0
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}
            >
              {machine.temperatureC.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">&deg;C</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] flex justify-between">
            <span className="text-slate-500">Normal:</span>
            <span className={tempAnomaly ? (machine.temperatureC >= 77.0 ? 'text-rose-600 font-semibold' : 'text-amber-600 font-semibold') : 'text-slate-500 font-medium'}>
              40–75&deg;C
            </span>
          </div>
        </div>

        {/* Pressure Card */}
        <div
          className={`p-4 rounded-xl border bg-white shadow-2xs transition-colors ${
            pressAnomaly ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Hydraulic Pressure</span>
            <span className="text-[10px] text-sky-700 font-semibold">bar</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span
              className={`text-3xl font-bold font-mono ${
                pressAnomaly ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {machine.pressureBar.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">bar</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] flex justify-between">
            <span className="text-slate-500">Normal:</span>
            <span className={pressAnomaly ? 'text-amber-600 font-semibold' : 'text-slate-500 font-medium'}>
              30–50 bar
            </span>
          </div>
        </div>

        {/* RPM Card */}
        <div
          className={`p-4 rounded-xl border bg-white shadow-2xs transition-colors ${
            rpmAnomaly ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Drive Spindle Speed</span>
            <span className="text-[10px] text-sky-700 font-semibold">spd</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {machine.rpm}
            </span>
            <span className="text-xs text-slate-500">RPM</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] flex justify-between">
            <span className="text-slate-500">Normal:</span>
            <span className={rpmAnomaly ? 'text-amber-600 font-semibold' : 'text-slate-500 font-medium'}>
              1500–2200
            </span>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE TELEMETRY STRESS-TEST & THRESHOLD INJECTION PANEL */}
      <TelemetryStressPanel
        machineId={machine.id}
        initialVibration={machine.vibrationMmS}
        initialTemperature={machine.temperatureC}
        initialPressure={machine.pressureBar}
        initialRpm={machine.rpm}
      />

      {/* 6. HISTORICAL RECHARTS TELEMETRY CHART */}
      <Card className="border border-slate-200 bg-white shadow-2xs">
        <CardHeader className="pb-2 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                TELEMETRY SENSOR HISTORY
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuous sensor stream showing live appended telemetry points against safety thresholds
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              {machine.history?.length ?? 0} RECORDED INTERVALS
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <TelemetryChart data={machine.history || []} machineId={machine.id} />
        </CardContent>
      </Card>

      {/* 7. OPERATIONAL INTERPRETATION / TRCE ANALYSIS */}
      <Card className="border border-slate-200 bg-white shadow-2xs">
        <CardHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCritical
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                    : isWarning
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                    : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                }`}
              />
              <CardTitle className="text-sm tracking-widest uppercase text-slate-900">
                TRCE ANALYSIS &amp; ROOT CAUSE SYNTHESIS
              </CardTitle>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase">
              Automated Root Cause Synthesis
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* Finding statement */}
          <div className="text-base font-medium text-slate-900 leading-relaxed">
            {evaluation.diagnosticSummary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Potential Component & Dynamic Failure Probability */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                  Potential Component Vector
                </span>
                <span className="text-xs font-mono font-bold text-sky-700">
                  {bearingFailureProbability}% Probability
                </span>
              </div>
              <div className="text-sm font-bold text-emerald-700">
                {evaluation.primaryComponent.name} ({evaluation.primaryComponent.id})
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {evaluation.primaryComponent.reason}
              </p>
            </div>

            {/* Recommended Next Step */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                  Recommended Operational Step
                </span>
                <div className="text-sm font-semibold text-slate-900">
                  {evaluation.recommendedAction}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Link href="/inventory/BRG-204">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs w-full sm:w-auto"
                    leftIcon={<Boxes className="w-3.5 h-3.5" />}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Check Spare Availability (BRG-204)
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Operational Engine Notice */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span>Real-time anomaly evaluation calculated from ISO-10816 vibrational and thermal thresholds.</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Active operational telemetry monitored continuously by Trce diagnostic edge engine.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
