'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { TableContainer } from '@/components/ui/table-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useOperationalStore } from '@/lib/operational-store';

type IncidentFilter = 'All' | 'Critical' | 'High' | 'Medium' | 'Resolved';

export default function IncidentsPage() {
  const [filter, setFilter] = useState<IncidentFilter>('All');
  const { incidents } = useOperationalStore();

  const uniqueIncidents = incidents;

  const filteredIncidents = uniqueIncidents.filter((inc) => {
    if (filter === 'All') return true;
    if (filter === 'Critical') return inc.severity === 'critical';
    if (filter === 'High') return inc.severity === 'high';
    if (filter === 'Medium') return inc.severity === 'medium';
    if (filter === 'Resolved') return inc.status === 'resolved';
    return true;
  });

  const filterCounts = {
    All: uniqueIncidents.length,
    Critical: uniqueIncidents.filter((i) => i.severity === 'critical').length,
    High: uniqueIncidents.filter((i) => i.severity === 'high').length,
    Medium: uniqueIncidents.filter((i) => i.severity === 'medium').length,
    Resolved: uniqueIncidents.filter((i) => i.status === 'resolved').length,
  };

  const filterOptions: IncidentFilter[] = ['All', 'Critical', 'High', 'Medium', 'Resolved'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents"
        description="Active thermal, mechanical, and operational anomalies across facilities."
        tag="INCIDENT QUEUE"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline-block font-medium">
              Auto-triage active
            </span>
          </div>
        }
      />

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {filterOptions.map((opt) => {
          const isSelected = filter === opt;
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 border ${
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

      {/* INCIDENT TABLE */}
      <TableContainer
        title="Incident Queue"
        subtitle={`Showing ${filteredIncidents.length} of ${uniqueIncidents.length} operational incidents`}
      >
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-sm font-bold text-slate-900">No incidents found.</div>
            <p className="text-slate-500">
              There are currently no incidents matching the {filter.toLowerCase()} filter criteria.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold uppercase text-[11px] tracking-wider">INCIDENT</th>
                <th className="py-3 px-4 font-semibold uppercase text-[11px] tracking-wider">MACHINE</th>
                <th className="py-3 px-4 font-semibold uppercase text-[11px] tracking-wider">FACILITY</th>
                <th className="py-3 px-4 font-semibold uppercase text-[11px] tracking-wider">ISSUE</th>
                <th className="py-3 px-4 font-semibold uppercase text-[11px] tracking-wider">SEVERITY</th>
                <th className="py-3 px-4 font-semibold uppercase text-[11px] tracking-wider">STATUS</th>
                <th className="py-3 px-4 font-semibold uppercase text-[11px] tracking-wider text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredIncidents.map((inc) => {
                const isCritical = inc.severity === 'critical' || inc.severity === 'high';
                const isWarning = inc.severity === 'medium';

                return (
                  <tr
                    key={inc.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isCritical ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      <Link href={`/incidents/${inc.id}`} className="hover:underline flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
                        {inc.id}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link href={`/machines/${inc.machineId ?? 'M-204'}`} className="hover:text-emerald-700 transition-colors">
                        {inc.machineId ?? 'M-204'}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {inc.facilityId ?? 'FAC-A'}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <span className="font-semibold text-slate-900 block truncate">{inc.title}</span>
                      <span className="text-xs text-slate-500 truncate block mt-0.5">{inc.description}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={isCritical ? 'critical' : isWarning ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {inc.severity.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusIndicator
                        status={
                          inc.status === 'resolved'
                            ? 'operational'
                            : inc.status === 'mitigated'
                            ? 'warning'
                            : 'critical'
                        }
                        label={inc.status}
                        size="sm"
                      />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/incidents/${inc.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ArrowUpRight className="w-3 h-3" />}
                        >
                          Triage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableContainer>
    </div>
  );
}
