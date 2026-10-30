'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  Truck,
  Cpu,
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  Download,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOperationalStore, operationalStore, AuditEvent } from '@/lib/operational-store';
import { exportAuditAsCsv, exportAuditAsJson } from '@/lib/crypto-manifest';

type ActivityCategory = 'All' | 'Machines' | 'Inventory' | 'Suppliers' | 'Transfers';

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  primaryTarget: string;
  secondaryTarget?: string;
  route?: string;
  category: 'Machines' | 'Inventory' | 'Suppliers' | 'Transfers';
  status: 'operational' | 'critical' | 'warning' | 'in_transit';
  statusLabel: string;
  description: string;
  link?: string;
  linkText?: string;
}

export function ActivityView() {
  const [filter, setFilter] = useState<ActivityCategory>('All');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const state = useOperationalStore();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleReset = () => {
    operationalStore.restoreBaseline();
    setResetMessage('Baseline operational state restored.');
    setTimeout(() => {
      setResetMessage(null);
    }, 3000);
  };

  // Convert AuditEvents from operationalStore into TimelineEvents
  const events: TimelineEvent[] = state.auditEvents.map((audit: AuditEvent) => {
    let cat: 'Machines' | 'Inventory' | 'Suppliers' | 'Transfers' = 'Inventory';
    if (audit.category === 'TELEMETRY') cat = 'Machines';
    else if (audit.category === 'DISPATCH') cat = 'Transfers';
    else if (audit.category === 'SYSTEM') cat = 'Suppliers';
    else if (audit.category === 'INVENTORY') cat = 'Inventory';
    else cat = 'Machines';

    let status: 'operational' | 'critical' | 'warning' | 'in_transit' = 'operational';
    let statusLabel = 'VERIFIED';

    if (audit.status === 'CRITICAL') {
      status = 'critical';
      statusLabel = 'CRITICAL ALERT';
    } else if (audit.status === 'WARNING') {
      status = 'warning';
      statusLabel = 'NORMALIZED';
    } else if (audit.category === 'DISPATCH' && audit.action.includes('transfer')) {
      const isTransit = state.transferOrders.some((o) => o.status === 'IN_TRANSIT');
      status = isTransit ? 'in_transit' : 'operational';
      statusLabel = isTransit ? 'IN TRANSIT' : 'COMPLETED';
    } else if (audit.category === 'SYSTEM') {
      statusLabel = 'HARMONIZED';
    }

    return {
      id: audit.id,
      timestamp: audit.timestamp,
      title: audit.action,
      primaryTarget: audit.target,
      secondaryTarget: audit.facility,
      route: audit.category === 'DISPATCH' ? audit.facility : undefined,
      category: cat,
      status,
      statusLabel,
      description: audit.details,
      link: audit.link,
      linkText: audit.linkText,
    };
  });

  const filteredEvents = events.filter((e) => {
    if (filter === 'All') return true;
    return e.category === filter;
  });

  const filterCounts = {
    All: events.length,
    Machines: events.filter((e) => e.category === 'Machines').length,
    Inventory: events.filter((e) => e.category === 'Inventory').length,
    Suppliers: events.filter((e) => e.category === 'Suppliers').length,
    Transfers: events.filter((e) => e.category === 'Transfers').length,
  };

  const filterOptions: ActivityCategory[] = ['All', 'Machines', 'Inventory', 'Suppliers', 'Transfers'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Transfers':
        return <Truck className="w-4 h-4 text-sky-600" />;
      case 'Machines':
        return <Cpu className="w-4 h-4 text-red-600" />;
      case 'Suppliers':
        return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      case 'Inventory':
        return <Boxes className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner & Reset Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>OPERATIONAL TIMELINE</span>
            <span className="text-xs font-normal text-slate-500">· Real-time event log</span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable record of anomalies, inventory updates, and inter-facility transfers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAuditAsCsv(state.auditEvents)}
            className="border-slate-200 hover:border-emerald-500 text-emerald-700 text-xs"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Download Audit CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAuditAsJson(state.auditEvents)}
            className="border-slate-200 hover:border-sky-500 text-sky-700 text-xs"
            leftIcon={<Download className="w-3.5 h-3.5 text-sky-600" />}
          >
            Download Audit JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-slate-200 hover:border-emerald-500 text-slate-700 text-xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Reset Demo State
          </Button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex overflow-x-auto no-scrollbar items-center gap-2 border-b border-slate-200 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        {filterOptions.map((opt) => {
          const isSelected = filter === opt;
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 border shrink-0 whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <span>{opt}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {filterCounts[opt]}
              </span>
            </button>
          );
        })}
      </div>

      {/* TIMELINE LIST */}
      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const isCritical = event.status === 'critical';
          const isWarning = event.status === 'warning';
          const isInTransit = event.status === 'in_transit';

          return (
            <div
              key={event.id}
              className={`p-4 sm:p-5 rounded-xl border bg-white shadow-2xs transition-all hover:border-slate-300 ${
                isInTransit
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : isCritical
                  ? 'border-red-200 bg-red-50/15'
                  : isWarning
                  ? 'border-amber-200 bg-amber-50/15'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                      isInTransit
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCritical
                        ? 'bg-red-100 text-red-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {getCategoryIcon(event.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {event.title}
                      </span>
                      <Badge
                        variant={
                          isInTransit
                            ? 'primary'
                            : isCritical
                            ? 'critical'
                            : isWarning
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {event.statusLabel}
                      </Badge>
                    </div>

                    {/* Targets / Route */}
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                      <strong className="text-emerald-700 font-bold">
                        {event.primaryTarget}
                      </strong>
                      {event.secondaryTarget && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-700 font-medium">{event.secondaryTarget}</span>
                        </>
                      )}
                      {event.route && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-sky-700 font-bold px-1.5 py-0.5 rounded-md bg-sky-50 border border-sky-200">
                            {event.route}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                      {event.description}
                    </p>

                    {event.description.includes('SHA-256') && (() => {
                      const hash = event.description.split('SHA-256 Manifest: ')[1] || '0x6e2e8e04b46999b829dc7da30b4277b068d8efca9ea00baebdf6d96a7efb993e';
                      const isCopied = copiedHash === hash;
                      return (
                        <div className="mt-2.5 p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-emerald-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            <span className="text-slate-500 uppercase shrink-0 font-sans font-semibold">VERIFIED SHA-256:</span>
                            <span className="truncate max-w-[180px] sm:max-w-[280px] lg:max-w-none select-all text-emerald-800 font-semibold">
                              {hash}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyHash(hash)}
                            className="self-end sm:self-auto shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-colors text-[10px] font-sans font-semibold"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-emerald-700" />
                                <span>Copy Hash</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Side: Timestamp & Action */}
                <div className="sm:text-right shrink-0 text-xs space-y-2 pt-1 sm:pt-0 pl-11 sm:pl-0">
                  <div className="flex items-center sm:justify-end gap-1.5 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.timestamp}</span>
                  </div>

                  {event.link && (
                    <div>
                      <Link href={event.link}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 h-auto font-semibold"
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                        >
                          {event.linkText ?? 'Inspect'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
