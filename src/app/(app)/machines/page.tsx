'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowUpRight, AlertTriangle, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataTable } from '@/components/ui/ResponsiveDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOperationalMetrics, operationalStore, Machine } from '@/lib/operational-store';
import { evaluateMachineAnomaly } from '@/lib/anomaly';

export default function MachinesPage() {
  const {
    machines,
    machinesCount,
    attentionMachines,
    criticalMachines,
    warningMachines,
    healthyMachines,
  } = useOperationalMetrics();

  // Evaluate each machine from the active operational store (deduplicated by machine id)
  const seenIds = new Set<string>();
  const evaluatedMachines = machines
    .filter((m: Machine) => {
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return true;
    })
    .map((m: Machine) => {
      const evaluation = evaluateMachineAnomaly(m.id, {
        temperature: m.temperatureC,
        vibration: m.vibrationMmS,
        pressure: m.pressureBar,
        rpm: m.rpm,
      });

      return {
        ...m,
        evaluation,
      };
    });

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <PageHeader
        title="Machines"
        description={`${machinesCount} total · ${attentionMachines} requiring attention`}
        tag="FLEET OVERVIEW"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline-block font-medium">
              Edge Telemetry Synchronized
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => operationalStore.restoreBaseline()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Sync Baseline
            </Button>
          </div>
        }
      />

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500 bg-white border-slate-200 shadow-2xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                Critical Attention
              </div>
              <div className="text-2xl font-extrabold text-red-600 mt-1">
                {criticalMachines}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {(() => {
                  const crit = machines.find((m) => m.status === 'critical');
                  return crit
                    ? `${crit.id} (Vibration ${crit.vibrationMmS.toFixed(1)} mm/s)`
                    : 'All fleet assets nominal';
                })()}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-white border-slate-200 shadow-2xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                Warning Anomalies
              </div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {warningMachines}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {machines.filter((m) => m.status === 'warning').map((m) => m.id).join(', ') || 'None'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-white border-slate-200 shadow-2xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                Healthy Machines
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {healthyMachines}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Operating within normal envelope
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. RESPONSIVE TABLE */}
      <ResponsiveDataTable
        title="Fleet Status Table"
        subtitle={`${machinesCount} total assets across 4 regional manufacturing hubs`}
        data={evaluatedMachines}
        keyExtractor={(m) => m.id}
        columns={[
          {
            key: 'machine',
            header: 'Machine',
            sticky: true,
            render: (m) => (
              <Link
                href={`/machines/${m.id}`}
                className="group flex flex-col font-bold"
              >
                <span className="text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-600" />
                  {m.id}
                </span>
                <span className="font-sans font-normal text-xs text-slate-500 mt-0.5">
                  {m.name}
                </span>
              </Link>
            ),
          },
          {
            key: 'location',
            header: 'Location',
            render: (m) => (
              <div>
                <div className="font-semibold text-slate-900">{m.facilityId}</div>
                <div className="text-xs text-slate-500">{m.line}</div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (m) => {
              const isCritical = m.status === 'critical' || m.evaluation.severity === 'HIGH';
              const isWarning = m.status === 'warning' || m.evaluation.severity === 'WARNING';
              const statusText = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy';
              return (
                <Badge
                  variant={isCritical ? 'critical' : isWarning ? 'warning' : 'primary'}
                  size="sm"
                >
                  {statusText}
                </Badge>
              );
            },
          },
          {
            key: 'temperature',
            header: 'Temperature',
            render: (m) => (
              <span className={`font-mono font-bold ${m.temperatureC > 75 ? 'text-amber-600' : 'text-slate-800'}`}>
                {m.temperatureC}°C
              </span>
            ),
          },
          {
            key: 'vibration',
            header: 'Vibration',
            render: (m) => (
              <span className={`font-mono font-bold ${m.vibrationMmS > 6 ? 'text-red-600' : 'text-slate-800'}`}>
                {m.vibrationMmS.toFixed(1)} mm/s
              </span>
            ),
          },
          {
            key: 'lastUpdate',
            header: 'Last update',
            className: 'text-slate-500 font-medium',
            render: (m) => m.lastUpdate,
          },
          {
            key: 'action',
            header: 'Action',
            align: 'right',
            render: (m) => (
              <Link href={`/machines/${m.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Inspect
                </Button>
              </Link>
            ),
          },
        ]}
        renderMobileCard={(m) => {
          const isCritical = m.status === 'critical' || m.evaluation.severity === 'HIGH';
          const isWarning = m.status === 'warning' || m.evaluation.severity === 'WARNING';
          const statusText = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy';

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Link href={`/machines/${m.id}`} className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900">{m.id}</span>
                    <span className="block text-xs text-slate-500">{m.name}</span>
                  </div>
                </Link>
                <Badge
                  variant={isCritical ? 'critical' : isWarning ? 'warning' : 'primary'}
                  size="sm"
                >
                  {statusText}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Location</span>
                  <span className="font-semibold text-slate-800">{m.facilityId} · {m.line}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Vibration / Temp</span>
                  <span className={`font-mono font-bold ${m.vibrationMmS > 6 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {m.vibrationMmS.toFixed(1)} mm/s · {m.temperatureC}°C
                  </span>
                </div>
              </div>

              <Link href={`/machines/${m.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                  Inspect Diagnostics →
                </Button>
              </Link>
            </div>
          );
        }}
      />
    </div>
  );
}
