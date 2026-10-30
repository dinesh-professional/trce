'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { traceSparePart, TraceResult } from '@/lib/inventory/trace';

interface ItemTraceSectionProps {
  partId: string;
  defaultDestination?: string;
}

export function ItemTraceSection({
  partId,
  defaultDestination = 'FAC-A',
}: ItemTraceSectionProps) {
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTrace = () => {
    const result = traceSparePart(partId, defaultDestination);
    setTraceResult(result);
    setIsSearching(false);
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-2xs">
      <CardHeader className="pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
            Network Trace Engine
          </CardTitle>
          <span className="text-[10px] text-emerald-700 font-bold">
            DETERMINISTIC ROUTING
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-xs">
        <p className="text-slate-600 leading-relaxed">
          Evaluate cross-facility inventory and calculate optimal inter-plant routing for {partId}.
        </p>

        <Button
          variant="primary"
          size="sm"
          onClick={handleTrace}
          className="w-full justify-center font-bold"
          leftIcon={<Compass className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />}
        >
          {isSearching ? 'Searching network inventory...' : 'Trace availability'}
        </Button>

        {isSearching && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-2">
            <Compass className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
            <div className="text-xs font-bold text-slate-900">
              Searching network inventory...
            </div>
            <div className="text-[11px] text-slate-500">
              Scanning distributed ledgers across FAC-A, FAC-B, FAC-C, and FAC-D
            </div>
          </div>
        )}

        {!isSearching && traceResult && traceResult.success && (
          <div className="space-y-3 pt-2">
            {/* Candidate Inventory List */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                Network Candidates
              </span>
              {traceResult.candidateSources
                .filter((c) => !c.isDestination)
                .map((candidate) => (
                  <div
                    key={candidate.facility}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      candidate.isRecommended
                        ? 'border-emerald-300 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">
                      {candidate.facility}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          candidate.isRecommended ? 'text-emerald-800' : 'text-slate-900'
                        }`}
                      >
                        {candidate.quantity} available
                      </span>
                      {candidate.isRecommended && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Recommended Source Card */}
            {traceResult.recommendedSource && (
              <div className="p-3.5 rounded-lg bg-white border border-emerald-300 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recommended source</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Source</span>
                    <span className="font-bold text-base text-emerald-700">
                      {traceResult.recommendedSource.facility}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Units</span>
                    <span className="font-bold text-base text-slate-900">
                      {traceResult.recommendedSource.quantity} units
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Distance</span>
                    <span className="font-bold text-base text-sky-700">
                      {traceResult.recommendedSource.distanceKm} km
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">ETA</span>
                    <span className="font-bold text-base text-amber-700">
                      {traceResult.recommendedSource.estimatedTransitTime}
                    </span>
                  </div>
                </div>

                {partId === 'BRG-204' && (
                  <Link href="/incidents/INC-204" className="block pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center border-slate-200 hover:border-emerald-500 text-emerald-700 bg-white"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Connect to Incident Reroute
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
