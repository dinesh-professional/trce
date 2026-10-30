import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { masterInventoryRecords, PART_METADATA, FACILITY_LOCATIONS } from '@/lib/inventory/trace';
import { ItemTraceSection } from '@/components/inventory/item-trace-section';
import { SourcingFinancialImpact } from '@/components/inventory/sourcing-financial-impact';

export function generateStaticParams() {
  const uniqueParts = Array.from(new Set(masterInventoryRecords.map((r) => r.partId)));
  return uniqueParts.map((partId) => ({
    id: partId,
  }));
}

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partId = id.toUpperCase();
  const metadata = PART_METADATA[partId];

  if (!metadata) {
    notFound();
  }

  // Find all facility distribution for this part
  const facilityRecords = masterInventoryRecords.filter((r) => r.partId === partId);
  const totalStock = facilityRecords.reduce((acc, r) => acc + r.quantity, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Inventory Ledger
          </Button>
        </Link>
        <span className="text-xs text-slate-500">
          SKU: <strong className="text-slate-900 font-mono">{metadata.sku}</strong>
        </span>
      </div>

      {/* Item Page Header */}
      <PageHeader
        title={`${partId} — ${metadata.name}`}
        description={`Category: ${metadata.category} · Minimum buffer threshold: ${metadata.minBuffer} units`}
        tag={metadata.category}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md">
              {totalStock} TOTAL UNITS
            </Badge>
          </div>
        }
      />

      {/* Network Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {facilityRecords.map((item) => {
          const loc = FACILITY_LOCATIONS[item.facility];
          const isCritical = item.quantity === 0;
          const isLow = item.quantity <= 2 && item.quantity > 0;

          return (
            <Card
              key={item.facility}
              className={`border ${
                isCritical
                  ? 'border-rose-300 bg-rose-50/50'
                  : isLow
                  ? 'border-amber-300 bg-amber-50/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {item.facility}
                  </span>
                  <Badge variant={isCritical ? 'critical' : isLow ? 'warning' : 'primary'} size="sm">
                    {item.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500">
                  {loc ? `${loc.city}, ${loc.state}` : 'Regional Facility'}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl font-bold text-slate-900">
                  {item.quantity}{' '}
                  <span className="text-xs font-normal text-slate-500">units</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Updated: {item.lastUpdated}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Part Specifications & Trace Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-200">
              <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                Technical Specifications &amp; Procurement Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Component Name</span>
                <span className="text-slate-900 font-bold">{metadata.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Manufacturer SKU</span>
                <span className="text-slate-800 font-mono">{metadata.sku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Primary Application</span>
                <span className="text-sky-700 font-medium">Precision Assembly &amp; Spindle Lines</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Installed Asset</span>
                <Link href="/machines/M-204" className="text-emerald-700 hover:underline font-bold">
                  M-204 (Precision Spindle) →
                </Link>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Active Incident</span>
                <Link href="/incidents/INC-204" className="text-rose-600 hover:underline font-bold">
                  INC-204 (Abnormal vibration) →
                </Link>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Dispatch SLA</span>
                <span className="text-emerald-700 font-semibold">Expedited Inter-Facility Routing Available</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <ItemTraceSection partId={partId} defaultDestination="FAC-A" />
        </div>
      </div>

      {/* SOURCING OPTIMIZATION & MULTI-VARIABLE FINANCIAL IMPACT */}
      <SourcingFinancialImpact partId={partId} requiredQty={4} />
    </div>
  );
}
