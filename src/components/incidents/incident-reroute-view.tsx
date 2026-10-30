'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ShieldAlert,
  Bell,
  Compass,
  FileCheck2,
  ShieldCheck,
  ArrowDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useRerouteWorkflow } from '@/lib/reroute';
import { useOperationalStore } from '@/lib/operational-store';
import {
  evaluateTelemetryPayload,
  calculateBearingFailureProbability,
} from '@/lib/telemetry-engine';
import { SourcingFinancialImpact } from '@/components/inventory/sourcing-financial-impact';
import {
  generateDispatchManifest,
  DispatchManifestPayload,
} from '@/lib/crypto-manifest';
import { DispatchManifestModal } from './dispatch-manifest-modal';

interface IncidentRerouteViewProps {
  incidentId?: string;
}

export function IncidentRerouteView(props?: IncidentRerouteViewProps) {
  const [workflowState, actions] = useRerouteWorkflow();
  const activeIncidentId = props?.incidentId ?? workflowState.incidentId;

  const store = useOperationalStore();
  const linkedMachine =
    store.machines.find(
      (m) => m.id.toLowerCase() === workflowState.machineId.toLowerCase()
    ) || store.machines[0];

  const telemetryEvaluation = evaluateTelemetryPayload({
    vibration: linkedMachine.vibrationMmS,
    temperature: linkedMachine.temperatureC,
    pressure: linkedMachine.pressureBar,
    rpm: linkedMachine.rpm,
  });

  const failureProbability = calculateBearingFailureProbability(
    linkedMachine.vibrationMmS,
    linkedMachine.temperatureC
  );

  const isConfirmed = workflowState.status === 'IN_TRANSIT' || workflowState.status === 'DELIVERED';
  const isConfirming = workflowState.status === 'CONFIRMING';

  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [manifestData, setManifestData] = useState<DispatchManifestPayload | null>(null);

  const handleOpenManifest = async () => {
    if (!manifestData) {
      const generated = await generateDispatchManifest({
        transferId: workflowState.transferId || 'TRF-8841',
        partId: workflowState.partId,
        quantity: workflowState.quantity,
        origin: 'FAC-C Dispatch Bay 04',
        destination: 'FAC-A Receiving Dock 02',
      });
      setManifestData(generated);
    }
    setIsManifestOpen(true);
  };

  const handleConfirmTransfer = async () => {
    const generated = await generateDispatchManifest({
      transferId: 'TRF-8841',
      partId: workflowState.partId,
      quantity: workflowState.quantity,
      origin: 'FAC-C Dispatch Bay 04',
      destination: 'FAC-A Receiving Dock 02',
    });
    setManifestData(generated);
    actions.confirmTransfer(generated.sha256Hash);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar with Back Link and Restore Baseline Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Command Center
            </Button>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/incidents">
            <Button variant="ghost" size="sm">
              All Incidents
            </Button>
          </Link>
        </div>

        {/* Interactive Scenario Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.restoreBaseline}
            className="border-sky-300 hover:border-sky-500 text-sky-700 hover:text-sky-800 bg-white text-xs shadow-2xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restore Baseline State
          </Button>
          <span className="text-[11px] text-slate-500 font-medium">
            Operational Dispatch Center
          </span>
        </div>
      </div>

      {/* Incident Header & Core Anomaly Spec */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                {activeIncidentId}
              </h1>
              <Badge variant="critical" size="md">
                HIGH PRIORITY
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
              <Link href={`/machines/${workflowState.machineId}`} className="text-sky-600 hover:underline font-bold">
                {workflowState.machineId}
              </Link>
              <span>·</span>
              <strong className="text-slate-900">{workflowState.destinationFacility}</strong>
              <span>·</span>
              <span className="text-rose-600 font-semibold">Abnormal vibration</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/inventory/BRG-204">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-slate-200 hover:border-emerald-500 hover:text-emerald-700 bg-white"
                leftIcon={<Compass className="w-3.5 h-3.5" />}
              >
                Trace spare
              </Button>
            </Link>
            <StatusIndicator
              status={isConfirmed ? 'warning' : 'critical'}
              label={isConfirmed ? 'MITIGATION IN PROGRESS' : 'ACTIVE INCIDENT'}
              size="sm"
            />
          </div>
        </div>

        {/* Potential Component & Local Inventory Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Potential component
            </span>
            <div className="mt-1">
              <Link href="/inventory/BRG-204" className="text-base font-bold text-emerald-700 hover:underline">
                BRG-204
              </Link>
              <span className="text-xs text-slate-500 block">Bearing (Angular Contact)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-200">
            <span className="text-rose-700 block text-[10px] uppercase font-semibold">
              Local inventory
            </span>
            <div className="mt-1">
              <span className="text-base font-bold text-rose-600">0 units</span>
              <span className="text-[11px] text-rose-600 block">Depleted at {workflowState.destinationFacility}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Vibration Telemetry
              </span>
              <Link href={`/machines/${linkedMachine.id}`} className="text-[10px] text-sky-600 hover:underline font-semibold">
                Inject &rarr;
              </Link>
            </div>
            <div className="mt-1">
              <span
                className={`text-base font-bold font-mono ${
                  linkedMachine.vibrationMmS >= 8.0
                    ? 'text-rose-600'
                    : linkedMachine.vibrationMmS > 6.0
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {linkedMachine.vibrationMmS.toFixed(1)} mm/s
              </span>
              <span className="text-[11px] text-slate-500 block">
                {telemetryEvaluation.status} (Normal: 0–6.0)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Root Cause Probability
            </span>
            <div className="mt-1">
              <span
                className={`text-base font-bold font-mono ${
                  failureProbability > 70
                    ? 'text-rose-600'
                    : failureProbability > 25
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {failureProbability}%
              </span>
              <span className="text-[11px] text-slate-500 block">
                BRG-204 Spindle Vector
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-STAGE PIPELINE & NETWORK TRACE STEPS */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            INCIDENT RESOLUTION &amp; NETWORK TRACE PIPELINE
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold">
            {isConfirmed ? 'STAGE 3 ACTIVE · IN TRANSIT' : 'STAGE 2 PENDING CONFIRMATION'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Stage 1: Anomaly Ingestion */}
          <div className="flex-1 p-3.5 rounded-lg bg-rose-50/40 border border-rose-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Stage 1: Telemetry Anomaly
              </span>
              <Badge variant="critical" size="sm">CONFIRMED</Badge>
            </div>
            <div className="text-xs font-bold text-slate-900">M-204 Vibration Breach</div>
            <div className="text-[10px] text-slate-600">
              {linkedMachine.vibrationMmS.toFixed(1)} mm/s &middot; Bearing risk {failureProbability}%
            </div>
          </div>

          {/* Stepper Arrow */}
          <div className="flex justify-center md:px-1 py-0.5 md:py-0 text-slate-400">
            <ArrowDown className="w-4 h-4 md:hidden" />
            <ArrowRight className="w-4 h-4 hidden md:block" />
          </div>

          {/* Stage 2: Multi-Variable Routing */}
          <div className="flex-1 p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-300 space-y-1 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Stage 2: Sourcing Engine
              </span>
              <Badge variant="primary" size="sm">OPTIMAL: FAC-C</Badge>
            </div>
            <div className="text-xs font-bold text-slate-900">Multi-Variable Logistics</div>
            <div className="text-[10px] text-slate-600">
              183 km &middot; 4.3h ETA &middot; Net savings $50,565
            </div>
          </div>

          {/* Stepper Arrow */}
          <div className="flex justify-center md:px-1 py-0.5 md:py-0 text-slate-400">
            <ArrowDown className="w-4 h-4 md:hidden" />
            <ArrowRight className="w-4 h-4 hidden md:block" />
          </div>

          {/* Stage 3: Dispatch & Ledger Mutation */}
          <div className={`flex-1 p-3.5 rounded-lg border space-y-1 ${
            isConfirmed ? 'bg-sky-50/50 border-sky-300 shadow-xs' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-sky-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Stage 3: Cryptographic Dispatch
              </span>
              <Badge variant={isConfirmed ? 'primary' : 'neutral'} size="sm">
                {isConfirmed ? 'SEALED & IN TRANSIT' : 'READY TO DISPATCH'}
              </Badge>
            </div>
            <div className="text-xs font-bold text-slate-900">TRF-8841 SHA-256 Seal</div>
            <div className="text-[10px] text-sky-700 font-mono truncate font-medium">
              {isConfirmed ? '0x6e2e...993e verified' : 'Awaiting operator confirmation'}
            </div>
          </div>
        </div>
      </div>

      {/* SOURCING OPTIMIZATION & MULTI-VARIABLE FINANCIAL IMPACT */}
      <SourcingFinancialImpact partId="BRG-204" requiredQty={4} showActionLink={false} />

      {/* PRIMARY REROUTE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trace Status, Confirmation & Transit Display */}
        <div className="lg:col-span-8 space-y-6">
          {/* SUCCESS BANNER: Shown when confirmed */}
          {isConfirmed && (
            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-800 tracking-wider uppercase">
                    Transfer initiated · IN TRANSIT
                  </span>
                </div>
                <div className="text-xs text-slate-900 font-medium">
                  {workflowState.partId} · {workflowState.sourceFacility} → {workflowState.destinationFacility} · {workflowState.quantity} units · TRF-8841
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-sky-600" />
                  <span>Operations team notified · Dispatch tracking active · ETA {workflowState.eta}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenManifest}
                className="border-emerald-500 text-emerald-700 hover:bg-emerald-100/60 text-xs shrink-0 font-semibold bg-white"
                leftIcon={<FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />}
              >
                View Dispatch Manifest
              </Button>
            </div>
          )}

          {/* MAIN REROUTE PANEL */}
          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                    SPARE-PART REROUTE DISPATCH
                  </CardTitle>
                </div>
                <Badge
                  variant={isConfirmed ? 'secondary' : 'warning'}
                  size="sm"
                >
                  {isConfirmed ? 'IN TRANSIT' : 'RECOMMENDATION READY'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-6">
              {/* STATE 1: IDLE (Primary Flow) */}
              {!isConfirming && !isConfirmed && (
                <div className="space-y-6">
                  {/* Current Problem & Recommendation Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-lg bg-rose-50/40 border border-rose-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                        Local Stock ({workflowState.destinationFacility})
                      </span>
                      <span className="text-2xl font-bold text-rose-600 mt-1 block">
                        {workflowState.stockFacA} units
                      </span>
                      <span className="text-[10px] text-rose-600 mt-0.5 block font-medium">
                        Deficit: Line down risk
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-300 shadow-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                        Recommended Source
                      </span>
                      <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                        {workflowState.sourceFacility}
                      </span>
                      <span className="text-[10px] text-slate-600 mt-0.5 block">
                        {workflowState.sourceFacilityName}
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                        Available at Source
                      </span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {workflowState.stockFacC} units
                      </span>
                      <span className="text-[10px] text-sky-700 mt-0.5 block font-medium">
                        Distance: {workflowState.distance} · ETA: {workflowState.eta}
                      </span>
                    </div>
                  </div>

                  {/* Operational Context */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900 font-semibold">OPERATIONAL SUMMARY:</strong> Machine M-204 on Assembly Line 2 has zero local spare bearings. The Trce trace engine has identified {workflowState.sourceFacility} as the optimal source facility with {workflowState.stockFacC} available units, minimizing logistical lead time without depleting local buffers.
                  </div>

                  {/* Primary CTAs */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={actions.openConfirmation}
                      className="w-full sm:w-auto text-sm px-8 py-3.5 shadow-sm"
                      leftIcon={<Truck className="w-4 h-4" />}
                      rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                    >
                      INITIATE REROUTE
                    </Button>
                    <Link href="/inventory/BRG-204">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto text-sm px-6 py-3.5 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 bg-white"
                        leftIcon={<Compass className="w-4 h-4" />}
                      >
                        Trace spare
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* STATE 2: CONFIRMATION PANEL */}
              {isConfirming && (
                <div className="p-5 rounded-xl bg-white border border-emerald-500 shadow-md space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase">
                        Confirm Spare Transfer
                      </h3>
                    </div>
                    <Badge variant="primary" size="sm">
                      VERIFICATION REQUIRED
                    </Badge>
                  </div>

                  {/* Summary Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">PART</span>
                      <span className="text-sm font-bold text-emerald-700">{workflowState.partId}</span>
                      <span className="text-[10px] text-slate-600 block">{workflowState.quantity} units</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">FROM</span>
                      <span className="text-sm font-bold text-slate-900">{workflowState.sourceFacility}</span>
                      <span className="text-[10px] text-slate-600 block">Hyderabad Hub</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">TO</span>
                      <span className="text-sm font-bold text-slate-900">{workflowState.destinationFacility}</span>
                      <span className="text-[10px] text-slate-600 block">Assembly Line 2</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">ETA</span>
                      <span className="text-sm font-bold text-amber-600">{workflowState.eta}</span>
                      <span className="text-[10px] text-slate-600 block">183 km transit</span>
                    </div>
                  </div>

                  {/* Reason Block */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Reason
                    </span>
                    <p className="text-slate-800">
                      {workflowState.reason}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleConfirmTransfer}
                      className="text-xs font-semibold px-6"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Confirm Transfer
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={actions.cancelConfirmation}
                      className="text-xs bg-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* STATE 3: AFTER CONFIRMATION (TRANSFER IN PROGRESS) */}
              {isConfirmed && (
                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
                        Transfer initiated
                      </span>
                    </div>
                    <Badge variant="primary" size="sm">
                      IN TRANSIT · {workflowState.eta}
                    </Badge>
                  </div>

                  {/* Transfer State Card */}
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">STATE</span>
                        <span className="text-sm font-bold text-sky-700">IN TRANSIT</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">ETA</span>
                        <span className="text-sm font-bold text-amber-700">{workflowState.eta}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Component</span>
                        <span className="text-lg font-bold text-emerald-700 mt-0.5 block">{workflowState.partId}</span>
                        <span className="text-xs text-slate-600">{workflowState.partName}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Quantity</span>
                        <span className="text-lg font-bold text-slate-900 mt-0.5 block">{workflowState.quantity} units</span>
                        <span className="text-xs text-sky-700 font-medium">Expedited Carrier</span>
                      </div>
                    </div>

                    {/* Visual Routing Diagram: FAC-C ↓ FAC-A */}
                    <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-2 shadow-2xs">
                      <div className="px-6 py-2.5 rounded-md bg-slate-50 border border-slate-200 font-bold text-sm text-slate-800 w-full max-w-xs text-center shadow-2xs">
                        {workflowState.sourceFacility}
                      </div>

                      <div className="text-emerald-600 text-lg font-bold animate-bounce py-1">
                        ↓
                      </div>

                      <div className="px-6 py-2.5 rounded-md bg-emerald-50 border border-emerald-300 font-bold text-sm text-emerald-800 w-full max-w-xs text-center shadow-2xs">
                        {workflowState.destinationFacility}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Direct Distance</span>
                      <span className="font-bold text-sky-700">{workflowState.distance}</span>
                      <span className="text-slate-500">Estimated Transit</span>
                      <span className="font-bold text-amber-700">4h 20m</span>
                    </div>

                    {/* Cryptographic SHA-256 Manifest Status */}
                    <div className="p-3.5 rounded-lg bg-white border border-emerald-300 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>SHA-256 Cryptographic Verification Seal</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleOpenManifest}
                          className="text-[11px] text-sky-700 h-auto p-0 hover:underline font-semibold"
                        >
                          View Dispatch Manifest &rarr;
                        </Button>
                      </div>
                      <div className="font-mono text-[10px] text-slate-600 break-all select-all bg-slate-50 p-2 rounded border border-slate-200">
                        {workflowState.verificationHash || manifestData?.sha256Hash || '0x6e2e8e04b46999b829dc7da30b4277b068d8efca9ea00baebdf6d96a7efb993e'}
                      </div>
                    </div>
                  </div>

                  {/* STATE UPDATE CARD (FAC-C: 4 -> 0, FAC-A: 0 -> 4) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 tracking-wider uppercase block">
                      INVENTORY LEDGER REALLOCATION
                    </span>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 text-[10px] uppercase block font-semibold">
                          Source ({workflowState.sourceFacility}) Stock
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="line-through text-slate-400">4 units</span>
                          <span className="text-sm font-bold text-rose-600">→ 0 units</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Allocated to incident INC-204
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 text-[10px] uppercase block font-semibold">
                          Destination ({workflowState.destinationFacility}) Stock
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="line-through text-slate-400">0 units</span>
                          <span className="text-sm font-bold text-emerald-700">→ 4 units (In Transit)</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 mt-0.5 block font-medium">
                          Expected arrival in {workflowState.eta}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: INCIDENT TIMELINE */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="h-full flex flex-col justify-between border border-slate-200 bg-white shadow-2xs">
            <div>
              <CardHeader className="pb-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                      INCIDENT TIMELINE
                    </CardTitle>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    AUDIT LOG
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-11 before:w-px before:bg-slate-200">
                  {workflowState.timeline.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      <span className="w-9 text-xs font-bold text-sky-700 shrink-0 text-right pt-0.5">
                        {entry.time}
                      </span>

                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 z-10 mt-1.5 ${
                          entry.type === 'transit'
                            ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]'
                            : entry.type === 'reroute'
                            ? 'bg-emerald-500'
                            : entry.type === 'anomaly'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      />

                      <div className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-2xs">
                        <div className="font-semibold text-slate-900">
                          {entry.title}
                        </div>
                        {entry.detail && (
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {entry.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>

            {/* Enterprise Baseline Restoration Footer Card */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Operational Execution</span>
                <span className="text-emerald-700 font-bold">DISPATCH ENGINE</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.restoreBaseline}
                className="w-full justify-center text-xs bg-white border-slate-200"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Restore Baseline State
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bill of Lading & Work Order Modal */}
      {manifestData && (
        <DispatchManifestModal
          isOpen={isManifestOpen}
          onClose={() => setIsManifestOpen(false)}
          manifest={manifestData}
        />
      )}
    </div>
  );
}
