'use client';

import React from 'react';
import { Sparkles, Layers } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { TableContainer } from '@/components/ui/table-container';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useOperationalStore } from '@/lib/operational-store';
import { SupplierHarmonizationView } from '@/components/suppliers/supplier-harmonization-view';

export default function SuppliersPage() {
  const { suppliers } = useOperationalStore();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Supplier Data Harmonization"
        description="Convert disparate, non-standard supplier inventory feeds into the unified Trce Common Data Model."
        tag="SUPPLIER INTELLIGENCE"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              STANDARD MAPPING ACTIVE
            </Badge>
          </div>
        }
      />

      {/* Interactive Supplier Normalization Suite */}
      <SupplierHarmonizationView />

      {/* Connected Vendor Network Directory (from Operational Store) */}
      <div className="pt-4">
        <TableContainer
          title="Connected Supplier Network Directory"
          subtitle={`Vendor performance scores, integration statuses, and delivery SLAs (${suppliers.length} active vendors)`}
        >
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">SUPPLIER CODE</th>
                <th className="py-3 px-4 font-semibold">VENDOR NAME</th>
                <th className="py-3 px-4 font-semibold">TIER</th>
                <th className="py-3 px-4 font-semibold">ON-TIME DELIVERY</th>
                <th className="py-3 px-4 font-semibold">RISK SCORE</th>
                <th className="py-3 px-4 font-semibold">FEED SCHEMA</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{sup.code}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-sans font-medium text-sm text-slate-900">
                      {sup.name}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Contact: {sup.primaryContact} ({sup.email})
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="neutral">Tier {sup.tier}</Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {sup.onTimeDeliveryRate}%
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        sup.riskScore === 'low'
                          ? 'primary'
                          : sup.riskScore === 'medium'
                          ? 'secondary'
                          : 'warning'
                      }
                    >
                      {sup.riskScore}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sky-700 font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Auto-Harmonized
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusIndicator
                      status={sup.status === 'active' ? 'operational' : 'warning'}
                      label={sup.status}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </div>
    </div>
  );
}
