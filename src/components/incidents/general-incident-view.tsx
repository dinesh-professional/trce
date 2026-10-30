'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
  Thermometer,
  Gauge,
  Boxes,
  Cpu,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useOperationalStore } from '@/lib/operational-store';
import {
  evaluateTelemetryPayload,
  calculateBearingFailureProbability,
} from '@/lib/telemetry-engine';
import { SourcingFinancialImpact } from '@/components/inventory/sourcing-financial-impact';

interface GeneralIncidentViewProps {
  incidentId: string;
}

export function GeneralIncidentView({ incidentId }: GeneralIncidentViewProps) {
  const store = useOperationalStore();

  const incident = store.incidents.find(
    (item) => item.id.toLowerCase() === incidentId.toLowerCase() || item.machineId.toLowerCase() === incidentId.toLowerCase()
  );

  const machineId = incident?.machineId ?? incidentId;
  const machine = store.machines.find(
    (m) => m.id.toLowerCase() === machineId.toLowerCase()
  );

  const telemetry = machine
    ? {
        vibration: machine.vibrationMmS,
        temperature: machine.temperatureC,
        pressure: machine.pressureBar,
        rpm: machine.rpm,
      }
    : { vibration: 6.8, temperature: 76.0, pressure: 41.0, rpm: 1840 };

  const evaluation = evaluateTelemetryPayload(telemetry);
  const failureProbability = calculateBearingFailureProbability(
    telemetry.vibration,
    telemetry.temperature
  );

  const isCritical = incident?.severity === 'critical' || incident?.severity === 'high' || evaluation.status === 'CRITICAL';
  const isWarning = incident?.severity === 'medium' || evaluation.status === 'WARNING';

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/incidents">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Incidents
          </Button>
        </Link>
      </div>

      <PageHeader
        title={incident ? `${incident.machineId}: ${incident.title}` : `Incident ${incidentId}`}
        description={incident?.description ?? evaluation.diagnosticSummary}
        tag={`ASSET: ${machineId}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={isCritical ? 'critical' : isWarning ? 'warning' : 'secondary'}>
              {(incident?.severity ?? evaluation.severityLevel).toUpperCase()} PRIORITY
            </Badge>
            <StatusIndicator
              status={
                incident?.status === 'resolved'
                  ? 'operational'
                  : incident?.status === 'mitigated'
                  ? 'warning'
                  : 'critical'
              }
              label={incident?.status ?? 'active'}
              size="sm"
            />
          </div>
        }
      />

      {/* METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Asset Node</span>
          <div className="text-lg font-bold text-slate-900 mt-1">{machineId}</div>
          <span className="text-xs text-slate-500 block">{incident?.facilityName ?? 'Active Hub'}</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Live Vibration</span>
            <Activity className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-lg font-bold font-mono text-red-600 mt-1">
            {telemetry.vibration.toFixed(1)} mm/s
          </div>
          <span className="text-xs text-slate-500 block">Threshold: 6.0 mm/s</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Core Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-600 mt-1">
            {telemetry.temperature.toFixed(1)}°C
          </div>
          <span className="text-xs text-slate-500 block">Threshold: 75.0°C</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Failure Probability</span>
            <Gauge className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-lg font-bold font-mono text-sky-700 mt-1">
            {failureProbability}%
          </div>
          <span className="text-xs text-slate-500 block">Component: BRG-204</span>
        </div>
      </div>

      {/* DETAILED RECORD & ACTION */}
      <Card className="border border-slate-200/90 bg-white shadow-2xs rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>INCIDENT TELEMETRY RECORD &amp; DIAGNOSTIC SYNTHESIS</span>
          </div>
          <CardTitle className="pt-1 text-base text-slate-900 font-bold">
            {incident?.title ?? 'Operational Incident'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900">Operational Diagnostic Summary:</div>
            <p className="text-slate-600 leading-relaxed">
              {evaluation.diagnosticSummary}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-slate-500">Breached Metric: </span>
                <span className="text-red-600 font-bold">{incident?.metricBreach ?? `Vibration ${telemetry.vibration} mm/s`}</span>
              </div>
              <div>
                <span className="text-slate-500">Suspected Component: </span>
                <span className="text-emerald-700 font-bold">{incident?.componentName ?? 'BRG-204 Bearing'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/machines/${machineId}`}>
              <Button variant="primary" size="sm" leftIcon={<Cpu className="w-3.5 h-3.5" />}>
                Open Machine Diagnostics &amp; Stress Panel
              </Button>
            </Link>
            <Link href="/inventory/BRG-204">
              <Button variant="outline" size="sm" leftIcon={<Boxes className="w-3.5 h-3.5" />}>
                Check Spare Part Availability
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* SOURCING OPTIMIZATION & MULTI-VARIABLE FINANCIAL IMPACT */}
      <SourcingFinancialImpact partId="BRG-204" requiredQty={4} showActionLink={true} />
    </div>
  );
}
