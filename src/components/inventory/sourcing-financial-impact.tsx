'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  calculateSourcingOptimization,
  formatCurrency,
  formatTransitEta,
} from '@/lib/routing-engine';
import { useOperationalStore } from '@/lib/operational-store';

interface SourcingFinancialImpactProps {
  partId?: string;
  requiredQty?: number;
  showActionLink?: boolean;
}

export function SourcingFinancialImpact({
  partId = 'BRG-204',
  requiredQty = 4,
  showActionLink = true,
}: SourcingFinancialImpactProps) {
  const store = useOperationalStore();

  // Extract live stock per facility from active operational store
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    store.facilityStocks
      .filter((s) => s.partId.toLowerCase() === partId.toLowerCase())
      .forEach((s) => {
        map[s.facilityId] = s.quantity;
      });
    return map;
  }, [store.facilityStocks, partId]);

  // Compute multi-variable logistics and financial exposure dynamically
  const result = useMemo(() => {
    return calculateSourcingOptimization(stockMap, partId, requiredQty);
  }, [stockMap, partId, requiredQty]);

  const { optimalRoute, nextBestRoute, oemBaseline, routes } = result;

  return (
    <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-slate-200 bg-slate-50/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold tracking-wider uppercase text-slate-900">
                SOURCING OPTIMIZATION &amp; MULTI-VARIABLE FINANCIAL IMPACT
              </CardTitle>
              <Badge variant="primary" size="sm">
                DYNAMIC LOGISTICS
              </Badge>
            </div>
            <p className="text-[11px] text-slate-600">
              Automated algorithmic routing calculating downtime cost, carrier freight, and net operational savings for {partId}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-sm bg-white border border-slate-200 text-slate-600 shadow-2xs">
              Downtime Rate: <strong className="text-rose-600 font-mono">$14,500/hr</strong>
            </div>
            <div className="px-2.5 py-1 rounded-sm bg-white border border-slate-200 text-slate-600 shadow-2xs">
              Required: <strong className="text-slate-900 font-mono">{requiredQty} units</strong>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* KPI BANNER: SAVINGS HIGHLIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-xs">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
              Optimal Sourcing Node
            </span>
            <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-baseline gap-1.5">
              <span>{optimalRoute?.facilityId ?? 'FAC-C'}</span>
              <span className="text-xs font-normal text-slate-600">
                ({optimalRoute?.city ?? 'Hyderabad'})
              </span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>ETA: <strong className="text-slate-900">{optimalRoute?.formattedEta ?? '4h 20m'}</strong> (183 km)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Net Savings vs Next Best ({nextBestRoute?.facilityId ?? 'FAC-D'})
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              +{formatCurrency(result.totalNetSavings)}
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Saves {formatTransitEta((nextBestRoute?.transitHours ?? 9.7) - (optimalRoute?.transitHours ?? 4.3))} of critical production downtime
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Net Savings vs Standard OEM (24h)
            </span>
            <div className="text-2xl font-bold font-mono text-sky-600 mt-1">
              +{formatCurrency(optimalRoute?.netSavingsVsOem ?? 284954)}
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Prevents $348,000 in extended assembly line shutdown
            </span>
          </div>
        </div>

        {/* HIGH-DENSITY COMPARISON: DUAL-MODE RESPONSIVE TABLE */}
        {/* 1. Mobile Card Stack View (<sm) */}
        <div className="block sm:hidden space-y-3">
          {routes.map((route) => {
            const isOptimal = route.isOptimal;
            const isInsufficient = route.viabilityStatus === 'INSUFFICIENT';

            return (
              <div
                key={route.facilityId}
                className={`p-4 rounded-lg border space-y-3 ${
                  isOptimal
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : isInsufficient
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOptimal && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isInsufficient && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    <div>
                      <span className={`font-bold text-sm ${isOptimal ? 'text-emerald-800' : 'text-slate-900'}`}>
                        {route.facilityId}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{route.facilityName}</span>
                    </div>
                  </div>
                  <div>
                    {isOptimal ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                        OPTIMAL NODE
                      </span>
                    ) : isInsufficient ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">
                        INSUFFICIENT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold uppercase">
                        VIABLE BACKUP
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-md bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Stock / Required</span>
                    <span className={`font-mono font-bold ${route.stockQty >= route.requiredQty ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {route.stockQty} / {route.requiredQty} units
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Transit SLA</span>
                    <span className="font-mono font-bold text-slate-900">{route.formattedEta} ({route.distanceKm} km)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Freight Cost</span>
                    <span className="font-mono text-slate-600">{formatCurrency(route.freightCost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Downtime Exposure</span>
                    <span className="font-mono font-bold text-rose-600">{formatCurrency(route.downtimeCost)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                  <span className="text-slate-600">Total Financial Impact:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(route.totalFinancialExposure)}</span>
                    {isOptimal && (
                      <span className="block text-[11px] font-bold text-emerald-700">
                        +{formatCurrency(route.netSavingsVsNextBest)} net savings
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Tablet & Desktop Sticky Column Table (>=sm) */}
        <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-200 relative">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 sticky left-0 z-10 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-slate-200 font-semibold">Facility Node</th>
                <th className="py-3 px-3 font-semibold">Available Stock</th>
                <th className="py-3 px-3 font-semibold">Viability Status</th>
                <th className="py-3 px-3 font-semibold">Distance &amp; Speed</th>
                <th className="py-3 px-3 font-semibold">Transit ETA</th>
                <th className="py-3 px-3 font-semibold">Freight Cost</th>
                <th className="py-3 px-3 font-semibold">Downtime Exposure</th>
                <th className="py-3 px-3 font-semibold">Total Exposure</th>
                <th className="py-3 px-3 text-right font-semibold">Net Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {routes.map((route) => {
                const isOptimal = route.isOptimal;
                const isInsufficient = route.viabilityStatus === 'INSUFFICIENT';

                return (
                  <tr
                    key={route.facilityId}
                    className={`transition-colors ${
                      isOptimal
                        ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500'
                        : isInsufficient
                        ? 'bg-rose-50/20 hover:bg-rose-50/40'
                        : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    {/* 1. Facility Node (Sticky Left) */}
                    <td className={`py-3 px-3.5 font-sans font-bold sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-slate-200 ${
                      isOptimal ? 'bg-emerald-50/80' : 'bg-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        {isOptimal && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isInsufficient && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                        <div>
                          <span className={isOptimal ? 'text-emerald-800' : 'text-slate-900'}>
                            {route.facilityId}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal block font-sans">
                            {route.facilityName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Stock Qty */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          route.stockQty >= route.requiredQty ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {route.stockQty} / {route.requiredQty}
                      </span>
                    </td>

                    {/* 3. Viability Status */}
                    <td className="py-3 px-3 font-sans">
                      {isOptimal ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase">
                          OPTIMAL NODE
                        </span>
                      ) : isInsufficient ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold uppercase">
                            INSUFFICIENT
                          </span>
                          <span className="text-[9px] text-rose-600 block font-sans">
                            Partial replace risks failure
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[9px] font-bold uppercase">
                          VIABLE BACKUP
                        </span>
                      )}
                    </td>

                    {/* 4. Distance */}
                    <td className="py-3 px-3 text-slate-600">
                      {route.distanceKm} km
                    </td>

                    {/* 5. Transit ETA */}
                    <td className="py-3 px-3 text-slate-900 font-bold">
                      {route.formattedEta}
                    </td>

                    {/* 6. Freight Cost */}
                    <td className="py-3 px-3 text-slate-600">
                      {formatCurrency(route.freightCost)}
                    </td>

                    {/* 7. Downtime Exposure */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatCurrency(route.downtimeCost)}
                    </td>

                    {/* 8. Total Exposure */}
                    <td className="py-3 px-3 font-bold">
                      <span className={isOptimal ? 'text-emerald-700' : 'text-slate-900'}>
                        {formatCurrency(route.totalFinancialExposure)}
                      </span>
                    </td>

                    {/* 9. Net Savings */}
                    <td className="py-3 px-3 text-right font-bold">
                      {isOptimal ? (
                        <span className="text-emerald-600">
                          +{formatCurrency(route.netSavingsVsNextBest)}
                        </span>
                      ) : isInsufficient ? (
                        <span className="text-rose-600 text-[10px] font-sans font-medium">
                          Disqualified
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-sans font-medium">
                          Baseline Alternative
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Standard OEM Baseline Reference Row */}
              <tr className="bg-slate-50/70 text-slate-600 border-t-2 border-t-slate-200">
                <td className="py-3 px-3.5 font-sans bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-900">Standard OEM Backorder</span>
                      <span className="text-[10px] text-slate-500 block font-sans">
                        External Tier-1 Supplier
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">Available</td>
                <td className="py-3 px-3 font-sans">
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-semibold uppercase">
                    EXTERNAL LEAD
                  </span>
                </td>
                <td className="py-3 px-3">—</td>
                <td className="py-3 px-3 font-bold text-rose-600">
                  {oemBaseline.formattedEta}
                </td>
                <td className="py-3 px-3 text-slate-600">
                  {formatCurrency(oemBaseline.freightCost)}
                </td>
                <td className="py-3 px-3 text-rose-600 font-bold">
                  {formatCurrency(oemBaseline.downtimeCost)}
                </td>
                <td className="py-3 px-3 text-rose-600 font-bold">
                  {formatCurrency(oemBaseline.totalExposure)}
                </td>
                <td className="py-3 px-3 text-right text-[10px] text-slate-500 font-sans">
                  Reference Baseline
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Callout */}
        {showActionLink && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-600">
              Algorithmic recommendation confirms <strong className="text-emerald-700 font-semibold">FAC-C</strong> minimizes downtime exposure by <strong className="text-emerald-700 font-semibold">{formatCurrency(result.totalNetSavings)}</strong> over next best option.
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/incidents/INC-204">
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Proceed to Dispatch Reroute
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
