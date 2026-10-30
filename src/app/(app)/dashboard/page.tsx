'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  AlertTriangle,
  Boxes,
  Truck,
  ArrowRight,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Layers,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOperationalMetrics, Incident } from '@/lib/operational-store';

export default function DashboardPage() {
  const [incidentFilter] = useState<'all' | 'resolved'>('all');
  const metrics = useOperationalMetrics();

  const {
    machines,
    machinesCount,
    attentionMachines,
    criticalMachines,
    warningMachines,
    healthyMachines,
    activeIncidents,
    activeIncidentsCount,
    criticalIncidentsCount,
    totalStockUnits,
    lowStockCount,
    suppliersCount,
    activeSuppliers,
    auditEvents,
    primaryTransferOrder,
  } = metrics;

  // Recent activities mapped dynamically from store audit events
  const recentActivities = auditEvents.slice(0, 4).map((evt) => {
    let icon = <Layers className="w-3.5 h-3.5 text-sky-600" />;
    if (evt.category === 'TELEMETRY') {
      icon = <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
    } else if (evt.category === 'INVENTORY') {
      icon = <Boxes className="w-3.5 h-3.5 text-amber-600" />;
    } else if (evt.category === 'DISPATCH') {
      icon = <Truck className="w-3.5 h-3.5 text-emerald-600" />;
    }

    return {
      id: evt.id,
      title: evt.action,
      time: evt.timestamp,
      target: evt.target,
      icon,
    };
  });

  const displayedIncidents: Incident[] =
    incidentFilter === 'resolved' ? [] : activeIncidents;

  // Primary priority incident (critical severity preferred)
  const priorityIncident: Incident | undefined =
    activeIncidents.find((i) => i.severity === 'critical') ?? activeIncidents[0];

  // Dynamic health percentage calculations
  const healthyPercent =
    machinesCount > 0 ? ((healthyMachines / machinesCount) * 100).toFixed(1) : '100';
  const warningPercent =
    machinesCount > 0 ? ((warningMachines / machinesCount) * 100).toFixed(1) : '0';
  const criticalPercent =
    machinesCount > 0 ? ((criticalMachines / machinesCount) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* 1. TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Overview
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              Operational Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Live operational intelligence overview across regional manufacturing hubs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">System active</span>
          </div>
          <Link href="/scenario">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-slate-200 text-slate-800 bg-white hover:bg-slate-50 shadow-2xs"
            >
              Operational Scenario
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. DYNAMIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Machines */}
        <MetricCard
          title="MACHINES"
          value={String(machinesCount)}
          subtext={`${attentionMachines} requiring attention`}
          accent="primary"
          icon={<Cpu className="w-4 h-4 text-emerald-600" />}
        />

        {/* Active Incidents */}
        <MetricCard
          title="ACTIVE INCIDENTS"
          value={String(activeIncidentsCount)}
          subtext={`${criticalIncidentsCount} critical`}
          accent="critical"
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
        />

        {/* Spare Parts */}
        <MetricCard
          title="SPARE PARTS"
          value={String(totalStockUnits)}
          subtext={`${lowStockCount} low stock`}
          accent="warning"
          icon={<Boxes className="w-4 h-4 text-amber-600" />}
        />

        {/* Suppliers */}
        <MetricCard
          title="SUPPLIERS"
          value={String(suppliersCount)}
          subtext={`${activeSuppliers} active feeds`}
          accent="secondary"
          icon={<Truck className="w-4 h-4 text-sky-600" />}
        />
      </div>

      {/* 3. PRIORITY INCIDENT & RECOMMENDED ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PRIORITY INCIDENT CARD (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="border-red-200/90 bg-red-50/30 relative overflow-hidden h-full flex flex-col justify-between shadow-xs rounded-xl">
            <div className="p-5 space-y-4">
              {/* Card Header Tag */}
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-red-900 tracking-wider uppercase">
                    PRIORITY INCIDENT
                  </span>
                </div>
                <Badge
                  variant={priorityIncident?.severity === 'critical' ? 'critical' : 'warning'}
                  size="sm"
                >
                  {priorityIncident?.severity
                    ? `${priorityIncident.severity.toUpperCase()} PRIORITY`
                    : 'HIGH PRIORITY'}
                </Badge>
              </div>

              {/* Machine & Telemetry Breach */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {priorityIncident?.machineId ?? 'M-204'}
                    </span>
                    <span className="text-xs text-slate-500">
                      · {priorityIncident?.facilityName ?? 'Assembly Line 2'}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-red-600 mt-0.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {priorityIncident?.title ?? 'Abnormal vibration'}
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-400 block text-[11px] font-medium">Facility</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {priorityIncident?.facilityId ?? 'FAC-A'}
                  </span>
                </div>
              </div>

              {/* Component & Local Stock Status */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-white border border-red-100 text-xs shadow-2xs">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Potential component:
                  </span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {priorityIncident?.componentId ?? 'BRG-204'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {priorityIncident?.componentName ?? 'Angular Contact Bearing'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Local availability:
                  </span>
                  <span className="text-base font-bold text-red-600 mt-0.5 block">
                    {metrics.facilityStocks.find(
                      (s) =>
                        s.facilityId === priorityIncident?.facilityId &&
                        s.partId === priorityIncident?.componentId
                    )?.quantity ?? 0}
                  </span>
                  <span className="text-[11px] text-red-600 font-medium">
                    Stockout at {priorityIncident?.facilityId ?? 'FAC-A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Incident Action Footer */}
            <div className="p-4 border-t border-red-100 bg-white/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-medium">
                {priorityIncident?.metricBreach ?? 'ISO-10816 threshold breached (8.7 mm/s)'}
              </span>
              <Link href={`/incidents/${priorityIncident?.id ?? 'INC-204'}`} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto text-xs font-semibold justify-center"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View incident
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* RECOMMENDED ACTION CARD (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border-emerald-200/90 bg-emerald-50/30 relative overflow-hidden h-full flex flex-col justify-between shadow-xs rounded-xl">
            <div className="p-5 space-y-4">
              {/* Card Header Tag */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
                    Recommended action
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                  {primaryTransferOrder?.status === 'IN_TRANSIT' ? 'IN TRANSIT' : 'DISPATCH READY'}
                </span>
              </div>

              {/* Reroute Directive */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  TRANSFER DIRECTIVE
                </div>
                <div className="text-lg font-bold text-slate-900">
                  Move {primaryTransferOrder?.partId ?? 'BRG-204'}
                </div>
              </div>

              {/* Route Specification */}
              <div className="p-3.5 rounded-lg bg-white border border-emerald-100 space-y-2 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Route:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {primaryTransferOrder?.sourceFacility ?? 'FAC-C'} →{' '}
                    {primaryTransferOrder?.destinationFacility ?? 'FAC-A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Available at source:</span>
                  <span className="font-semibold text-slate-900">
                    {metrics.facilityStocks.find(
                      (s) =>
                        s.facilityId === (primaryTransferOrder?.sourceFacility ?? 'FAC-C') &&
                        s.partId === (primaryTransferOrder?.partId ?? 'BRG-204')
                    )?.quantity ?? 4}{' '}
                    units available
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-sky-600" />
                    Estimated Transit:
                  </span>
                  <span className="font-bold text-sky-700">
                    ETA {primaryTransferOrder?.eta ?? '4h 20m'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="p-4 border-t border-emerald-100 bg-white/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                Preserves safety buffer at {primaryTransferOrder?.sourceFacility ?? 'FAC-C'}
              </span>
              <Link href={`/incidents/${priorityIncident?.id ?? 'INC-204'}`} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 justify-center shadow-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Review transfer
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. MACHINE HEALTH & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MACHINE HEALTH COMPACT VISUALIZATION (6 Cols) */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col justify-between bg-white border-slate-200/90 shadow-2xs rounded-xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm tracking-wider uppercase text-slate-900 font-bold">
                    MACHINE HEALTH
                  </CardTitle>
                </div>
                <Link href="/machines">
                  <span className="text-xs text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors">
                    Fleet details <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-5">
              {/* Proportional Segmented Status Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 font-medium">Fleet Operating Status</span>
                  <span className="text-slate-900 font-bold">{machinesCount} Total Assets</span>
                </div>
                <div className="h-3 w-full rounded-md bg-slate-100 overflow-hidden flex border border-slate-200">
                  {/* Healthy */}
                  <div
                    style={{ width: `${healthyPercent}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Healthy: ${healthyMachines}`}
                  />
                  {/* Warning */}
                  <div
                    style={{ width: `${warningPercent}%` }}
                    className="bg-amber-500 h-full transition-all"
                    title={`Warning: ${warningMachines}`}
                  />
                  {/* Critical */}
                  <div
                    style={{ width: `${criticalPercent}%` }}
                    className="bg-red-500 h-full transition-all"
                    title={`Critical: ${criticalMachines}`}
                  />
                </div>
              </div>

              {/* Status Breakdown Counters */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
                  <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold">Healthy</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{healthyMachines}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{healthyPercent}% fleet</div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center gap-1.5 text-amber-800 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold">Warning</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-700">{warningMachines}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {machines.filter((m) => m.status === 'warning').map((m) => m.id).join(', ') || 'None'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-red-50/70 border border-red-200/80">
                  <div className="flex items-center gap-1.5 text-red-700 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-semibold">Critical</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{criticalMachines}</div>
                  <div className="text-[10px] text-red-600 mt-0.5">
                    {machines.filter((m) => m.status === 'critical').map((m) => m.id).join(', ') || 'None'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Telemetry Ingestion: Active</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Edge Connectivity
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT ACTIVITY STREAM (6 Cols) */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col justify-between bg-white border-slate-200/90 shadow-2xs rounded-xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <CardTitle className="text-sm tracking-wider uppercase text-slate-900 font-bold">
                    RECENT ACTIVITY
                  </CardTitle>
                </div>
                <Link href="/activity">
                  <span className="text-xs text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors">
                    Full log <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-xs">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-slate-900 font-medium">No recent activity.</div>
                  <p className="text-slate-500">
                    Operational events and telemetry alerts will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {act.icon}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {act.title}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {act.target}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {act.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. ACTIVE INCIDENTS QUEUE */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-xl">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <CardTitle className="text-sm tracking-wider uppercase text-slate-900 font-bold">
                ACTIVE INCIDENT QUEUE
              </CardTitle>
            </div>
            <Link href="/incidents">
              <span className="text-xs text-sky-700 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors">
                Manage all incidents <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {displayedIncidents.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-xs border border-dashed border-slate-200 rounded-lg bg-slate-50">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">No active incidents.</div>
              <p className="text-slate-500 max-w-sm mx-auto">
                All machine thresholds, telemetry streams, and inventory buffers are operating within normal limits.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayedIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {inc.machineId}
                      </span>
                      <span className="text-slate-500">· {inc.machineName}</span>
                      <span className="text-slate-400">({inc.facilityId})</span>
                      <Badge
                        variant={
                          inc.severity === 'critical'
                            ? 'critical'
                            : inc.severity === 'medium' || inc.severity === 'high'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {inc.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-slate-600 flex items-center gap-2 flex-wrap">
                      <span>{inc.title}:</span>
                      <span className="text-slate-900 font-medium">{inc.metricBreach}</span>
                      <span>
                        · Component: <strong className="text-slate-900">{inc.componentId}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="text-left sm:text-right text-[11px] text-slate-500">
                      <span>
                        Source: <strong className="text-emerald-700 font-semibold">{inc.recommendedSource}</strong>
                      </span>
                      <span className="block text-slate-400">ETA: {inc.eta}</span>
                    </div>
                    <Link href={`/incidents/${inc.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Triage →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
