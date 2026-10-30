'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Boxes,
  CheckCircle2,
  X,
  Compass,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  masterInventoryRecords,
  traceSparePart,
  TraceResult,
  FACILITY_LOCATIONS,
  PART_METADATA,
} from '@/lib/inventory/trace';
import { useOperationalStore } from '@/lib/operational-store';

export function InventoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Drawer states
  const [activeTrace, setActiveTrace] = useState<TraceResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPartModal, setSelectedPartModal] = useState<string | null>(null);

  const { facilityStocks } = useOperationalStore();

  const activeRecords = useMemo(() => {
    if (!facilityStocks || facilityStocks.length === 0) return masterInventoryRecords;
    return facilityStocks.map((s) => ({
      partId: s.partId,
      sku: s.sku,
      name: s.partName,
      description: PART_METADATA[s.partId]?.description ?? `${s.partName} - ${s.category}`,
      category: s.category,
      facility: s.facilityId,
      facilityCity: s.city,
      quantity: s.quantity,
      status: s.status,
      lastUpdated: s.lastUpdated,
    }));
  }, [facilityStocks]);

  // Filtered Inventory List
  const filteredRecords = useMemo(() => {
    return activeRecords.filter((item) => {
      const matchesSearch =
        item.partId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFacility =
        facilityFilter === 'ALL' || item.facility === facilityFilter;

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesFacility && matchesStatus;
    });
  }, [activeRecords, searchTerm, facilityFilter, statusFilter]);

  // Handle Trace Action (Immediate reactive trace)
  const handleOpenTrace = (partId: string, destination: string = 'FAC-A') => {
    const result = traceSparePart(partId, destination);
    setActiveTrace(result);
    setIsSearching(false);
  };

  // Part Detail breakdown across facilities
  const partDetailData = useMemo(() => {
    if (!selectedPartModal) return null;
    const records = activeRecords.filter(
      (r) => r.partId.toUpperCase() === selectedPartModal.toUpperCase()
    );
    if (!records.length) return null;

    const totalStock = records.reduce((acc, r) => acc + r.quantity, 0);
    const facilities = ['FAC-A', 'FAC-B', 'FAC-C', 'FAC-D'].map((facId) => {
      const match = records.find((r) => r.facility === facId);
      return {
        facility: facId,
        city: FACILITY_LOCATIONS[facId]?.city ?? facId,
        quantity: match ? match.quantity : 0,
        status: match ? match.status : ('CRITICAL' as const),
      };
    });

    return {
      partId: selectedPartModal,
      name: records[0].name,
      sku: records[0].sku,
      description: records[0].description,
      category: records[0].category,
      totalStock,
      facilities,
    };
  }, [selectedPartModal, activeRecords]);

  return (
    <div className="space-y-6">
      {/* 1. TOP CONTROLS: Search, Facility Filter, Status Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search part ID (e.g. BRG-204), SKU, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Facility & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Facility:</span>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="ALL">All Facilities</option>
              <option value="FAC-A">FAC-A (Chennai)</option>
              <option value="FAC-B">FAC-B (Bengaluru)</option>
              <option value="FAC-C">FAC-C (Hyderabad)</option>
              <option value="FAC-D">FAC-D (Pune)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical (0 units)</option>
              <option value="LOW STOCK">Low Stock (≤2 units)</option>
              <option value="AVAILABLE">Available (&gt;2 units)</option>
            </select>
          </div>

          {/* Quick Trace Trigger */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenTrace('BRG-204', 'FAC-A')}
            leftIcon={<Compass className="w-3.5 h-3.5" />}
          >
            Trace availability
          </Button>
        </div>
      </div>

      {/* 2. DISTRIBUTED INVENTORY SPOTLIGHT (BRG-204) */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Distributed Inventory</div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              <Link href="/inventory/BRG-204" className="text-emerald-700 hover:underline">
                BRG-204
              </Link>
              <span className="text-xs font-normal text-slate-500">— Bearing (Angular Contact)</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenTrace('BRG-204', 'FAC-A')}
            leftIcon={<Compass className="w-3.5 h-3.5" />}
          >
            Trace availability
          </Button>
        </div>

        {(() => {
          const stockA = facilityStocks.find((s) => s.partId === 'BRG-204' && s.facilityId === 'FAC-A')?.quantity ?? 0;
          const stockB = facilityStocks.find((s) => s.partId === 'BRG-204' && s.facilityId === 'FAC-B')?.quantity ?? 0;
          const stockC = facilityStocks.find((s) => s.partId === 'BRG-204' && s.facilityId === 'FAC-C')?.quantity ?? 0;
          const stockD = facilityStocks.find((s) => s.partId === 'BRG-204' && s.facilityId === 'FAC-D')?.quantity ?? 0;

          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-200 flex items-center justify-between">
                <span className="font-bold text-slate-900">FAC-A</span>
                <span className={`font-extrabold text-base ${stockA === 0 ? 'text-red-600' : 'text-emerald-600'}`}>{stockA} units</span>
              </div>
              <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                <span className="font-bold text-slate-900">FAC-B</span>
                <span className={`font-extrabold text-base ${stockB <= 2 ? 'text-amber-600' : 'text-slate-900'}`}>{stockB} units</span>
              </div>
              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-300 flex items-center justify-between">
                <span className="font-bold text-emerald-800">FAC-C</span>
                <span className="font-extrabold text-base text-emerald-700">{stockC} units</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-900">FAC-D</span>
                <span className="font-extrabold text-base text-slate-800">{stockD} units</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-wider">
              DISTRIBUTED SPARE PARTS LEDGER ({filteredRecords.length} RECORDS)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click any part code to inspect network distribution
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Part</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.map((item, idx) => {
                const isCritical = item.status === 'CRITICAL';
                const isLow = item.status === 'LOW STOCK';

                return (
                  <tr
                    key={`${item.partId}-${item.facility}-${idx}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCritical ? 'bg-red-50/20' : ''
                    }`}
                  >
                    {/* Part */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedPartModal(item.partId)}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1.5 text-left group"
                      >
                        <span>{item.partId}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-600">
                          ({item.sku})
                        </span>
                      </button>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <span className="font-semibold text-slate-900 mr-1.5">
                        {item.name}
                      </span>
                      <span className="text-slate-500 text-xs">
                        — {item.description}
                      </span>
                    </td>

                    {/* Facility */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{item.facility}</span>
                      <span className="text-slate-500 text-xs ml-1 font-medium">
                        ({item.facilityCity})
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 font-bold text-sm">
                      <span
                        className={
                          isCritical
                            ? 'text-red-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }
                      >
                        {item.quantity} units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          isCritical ? 'critical' : isLow ? 'warning' : 'primary'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {item.lastUpdated}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={isCritical ? 'danger' : 'outline'}
                        size="sm"
                        onClick={() => handleOpenTrace(item.partId, item.facility)}
                        className="text-xs"
                      >
                        Trace availability
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TRACE SPARE MODAL */}
      {activeTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Compass className={`w-5 h-5 text-emerald-600 ${isSearching ? 'animate-spin' : ''}`} />
                <div>
                  <h3 className="text-base font-bold tracking-wider text-slate-900">
                    NETWORK INVENTORY TRACE
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Deterministic cross-facility routing &amp; stock allocation
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTrace(null)}
                aria-label="Close trace dialog"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSearching ? (
              <div className="p-12 text-center space-y-3">
                <Compass className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-900">
                  Searching network inventory...
                </div>
                <p className="text-xs text-slate-500">
                  Scanning distributed plant ledgers across regional hubs...
                </p>
              </div>
            ) : !activeTrace.success ? (
              <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <div className="text-base font-bold text-red-700">
                  {activeTrace.error ?? 'No matching spare found'}
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  The requested part code has no active stock registration in the distributed ledger.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenTrace('BRG-204', 'FAC-A')}
                >
                  Test Valid Part (BRG-204)
                </Button>
              </div>
            ) : (
              <>
                {/* Destination & Required Part */}
                <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-700">
                        {activeTrace.destinationFacility}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        ({activeTrace.destinationCity})
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 mt-0.5">
                      Required: <strong className="text-emerald-700">{activeTrace.partId}</strong> ({activeTrace.partName})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      Local Stock
                    </span>
                    <span className="text-base font-bold text-red-600">
                      {activeTrace.destinationStock} units
                    </span>
                  </div>
                </div>

                {/* Candidate Sources Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                    Available Network Inventory
                  </span>
                  {activeTrace.candidateSources
                    .filter((c) => !c.isDestination)
                    .map((candidate) => {
                      const isBestMatch = candidate.isRecommended;

                      return (
                        <div
                          key={candidate.facility}
                          className={`p-3.5 rounded-lg border flex items-center justify-between transition-all ${
                            isBestMatch
                              ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                              <span>{candidate.facility}</span>
                              <span className="text-xs font-normal text-slate-500">
                                ({candidate.city})
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 font-medium">
                              Transit: {candidate.distanceKm} km · ETA: {candidate.estimatedTransitTime}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                isBestMatch ? 'text-emerald-700' : 'text-slate-800'
                              }`}
                            >
                              {candidate.quantity} available
                            </span>
                            {isBestMatch && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Highlighted Recommended Source Box */}
                {activeTrace.recommendedSource && (
                  <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Recommended source
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Source</span>
                        <span className="text-lg font-bold text-emerald-800">
                          {activeTrace.recommendedSource.facility}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {activeTrace.recommendedSource.city}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Units</span>
                        <span className="text-lg font-bold text-slate-900">
                          {activeTrace.recommendedSource.quantity} units
                        </span>
                        <span className="text-xs text-emerald-700 font-semibold block">
                          Preserves Buffer
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Distance</span>
                        <span className="text-lg font-bold text-sky-700">
                          {activeTrace.recommendedSource.distanceKm} km
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Direct Highway
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">ETA</span>
                        <span className="text-lg font-bold text-amber-600">
                          {activeTrace.recommendedSource.estimatedTransitTime}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Expedited Carrier
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deterministic Reasoning */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
                    WHY {activeTrace.recommendedSource?.facility ?? 'RECOMMENDED'}?
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                    {activeTrace.reasoning.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Multi-Facility Logistics Routing
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTrace(null)}>
                  Close
                </Button>
                {activeTrace.partId === 'BRG-204' && (
                  <Link href="/incidents/INC-204">
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Initiate Reroute Workflow
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PART DETAIL VIEW */}
      {partDetailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-5 text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-700">
                    {partDetailData.partId}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {partDetailData.category}
                  </Badge>
                </div>
                <div className="text-xs text-slate-800 font-semibold mt-0.5">
                  {partDetailData.name} ({partDetailData.sku})
                </div>
              </div>

              <button
                onClick={() => setSelectedPartModal(null)}
                aria-label="Close part details dialog"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Network Stock Stat */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase text-slate-500 font-semibold block">
                  Total network stock
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-0.5 block">
                  {partDetailData.totalStock} units
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const part = partDetailData.partId;
                  setSelectedPartModal(null);
                  handleOpenTrace(part, 'FAC-A');
                }}
                leftIcon={<Compass className="w-3.5 h-3.5" />}
              >
                Trace Spare
              </Button>
            </div>

            {/* Breakdown across FAC-A, FAC-B, FAC-C, FAC-D */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase block">
                Facility Stock Breakdown
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {partDetailData.facilities.map((fac) => (
                  <div
                    key={fac.facility}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {fac.facility}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {fac.city}
                      </span>
                    </div>
                    <span
                      className={`text-base font-bold ${
                        fac.quantity === 0
                          ? 'text-red-600'
                          : fac.quantity <= 2
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {fac.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {partDetailData.description}
            </p>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedPartModal(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
