'use client';

import React, { useState, useRef, useTransition, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Boxes,
  HelpCircle,
  FileText,
  ShieldAlert,
  Database,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import {
  parseAndNormalizeCsvPayload,
  commitIngestionToStore,
  REAL_SAMPLE_PAYLOADS,
  RealSamplePayload,
  NormalizationPipelineResult,
} from '@/lib/schema-normalizer';

export function SupplierHarmonizationView() {
  const [selectedPayloadId, setSelectedPayloadId] = useState<string>('apex-erp');
  const [customCsv, setCustomCsv] = useState<string | null>(null);
  const [customSupplierName, setCustomSupplierName] = useState<string>('Custom Upload');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [, startTransition] = useTransition();

  // Selected sample payload
  const activeSample = useMemo(() => {
    return (
      REAL_SAMPLE_PAYLOADS.find((p) => p.id === selectedPayloadId) ??
      REAL_SAMPLE_PAYLOADS[0]
    );
  }, [selectedPayloadId]);

  const activeRawCsv = customCsv !== null ? customCsv : activeSample.rawCsv;
  const currentSupplierName =
    customCsv !== null ? customSupplierName : activeSample.name;

  // Real-time parsing, normalization, and quarantine evaluation
  const pipelineResult: NormalizationPipelineResult = useMemo(() => {
    return parseAndNormalizeCsvPayload(activeRawCsv, currentSupplierName);
  }, [activeRawCsv, currentSupplierName]);

  const handleSelectSample = (sample: RealSamplePayload) => {
    startTransition(() => {
      setCustomCsv(null);
      setSelectedPayloadId(sample.id);
      setIngestStatus(null);
    });
  };

  const handleIngestToLedger = () => {
    if (!pipelineResult.validRows.length) return;
    const { committed, quarantined } = commitIngestionToStore(pipelineResult);
    setIngestStatus(
      `Committed ${committed} valid parts into active facility stock. ${quarantined} invalid records isolated in quarantine log.`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      startTransition(() => {
        setCustomCsv(text);
        setCustomSupplierName(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
        setIngestStatus(null);
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      startTransition(() => {
        setCustomCsv(text);
        setCustomSupplierName(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
        setIngestStatus(null);
      });
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. THREE REAL SAMPLE PAYLOAD BUTTONS */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              LOAD REAL SAMPLE PAYLOAD
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Click any live payload format for instant deterministic schema normalization
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REAL_SAMPLE_PAYLOADS.map((sample) => {
            const isSelected = customCsv === null && selectedPayloadId === sample.id;
            const isMalformed = sample.id === 'malformed-feed';

            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-3.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 shadow-xs text-slate-900'
                    : isMalformed
                    ? 'bg-slate-50 border-rose-200 hover:border-rose-400 text-slate-700 hover:text-slate-900'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-400 text-slate-700 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-bold text-xs ${
                      isSelected
                        ? 'text-emerald-800'
                        : isMalformed
                        ? 'text-rose-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {sample.name}
                  </span>
                  <Badge variant={isMalformed ? 'critical' : 'neutral'} size="sm">
                    {sample.delimiter === ';' ? 'SEMICOLON' : 'COMMA'}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-600 mb-1">
                  {sample.formatNote}
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">
                  {sample.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THREE-STAGE SCHEMA PIPELINE ARCHITECTURE (Horizontal on desktop, vertical on mobile) */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            SCHEMA INGESTION ARCHITECTURE PIPELINE
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold">
            {pipelineResult.resolvedMappings.length} CANONICAL FIELDS RESOLVED
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Stage 1: Raw Schema */}
          <div className="flex-1 p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Stage 1: Raw Schema
              </span>
              <Badge variant="neutral" size="sm">
                {activeSample.delimiter === ';' ? 'SEMICOLON' : 'COMMA'}
              </Badge>
            </div>
            <div className="text-xs font-bold text-slate-900">Heterogeneous Format</div>
            <div className="text-[10px] text-slate-600 font-mono truncate">
              {pipelineResult.rawHeaders.join(', ') || 'Awaiting headers'}
            </div>
          </div>

          {/* Stepper Arrow: down on mobile (<md), right on desktop (md+) */}
          <div className="flex justify-center md:px-1 py-0.5 md:py-0 text-slate-400">
            <ArrowDown className="w-4 h-4 md:hidden" />
            <ArrowRight className="w-4 h-4 hidden md:block" />
          </div>

          {/* Stage 2: Field Mapping Engine */}
          <div className="flex-1 p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-300 space-y-1 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Stage 2: Field Mapping Engine
              </span>
              <Badge variant="primary" size="sm">ACTIVE</Badge>
            </div>
            <div className="text-xs font-bold text-slate-900">Deterministic Resolution</div>
            <div className="text-[10px] text-slate-600">
              Alias mapping &amp; physical invariant validation
            </div>
          </div>

          {/* Stepper Arrow: down on mobile (<md), right on desktop (md+) */}
          <div className="flex justify-center md:px-1 py-0.5 md:py-0 text-slate-400">
            <ArrowDown className="w-4 h-4 md:hidden" />
            <ArrowRight className="w-4 h-4 hidden md:block" />
          </div>

          {/* Stage 3: Trce Unified Schema */}
          <div className="flex-1 p-3.5 rounded-lg bg-sky-50/50 border border-sky-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-sky-800 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" /> Stage 3: Trce Unified Schema
              </span>
              <Badge variant="neutral" size="sm">{pipelineResult.validRows.length} VALID</Badge>
            </div>
            <div className="text-xs font-bold text-slate-900">Canonical Facility Ledger</div>
            <div className="text-[10px] text-sky-800 font-mono truncate font-medium">
              part_id · quantity · location · unit_cost
            </div>
          </div>
        </div>
      </div>

      {/* 3. DRAG AND DROP CSV UPLOAD ZONE & RAW SOURCE VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Zone */}
        <Card className="lg:col-span-5 border border-slate-200 bg-white shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                  UPLOAD SUPPLIER CSV
                </CardTitle>
              </div>
              <Badge variant="neutral" size="sm">
                PARSER V2
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`p-6 border-2 border-dashed rounded-lg text-center flex flex-col items-center justify-center gap-3 transition-colors ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-slate-100/60'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sky-600 shadow-2xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Drag &amp; drop real supplier .csv file here
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Supports comma (,) &amp; semicolon (;) delimiters with unmapped schemas
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="supplier-file-input"
                aria-label="Upload real supplier CSV file"
              />

              <div className="pt-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs border-slate-200 hover:border-sky-500 text-slate-700 bg-white shadow-2xs"
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                >
                  Choose Local CSV File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Raw CSV Source Inspector */}
        <Card className="lg:col-span-7 border border-slate-200 bg-white shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-sky-600" />
                <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                  RAW PAYLOAD STREAM · {currentSupplierName}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Delimiter: <strong className="text-slate-900 font-mono">&apos;{pipelineResult.delimiter}&apos;</strong></span>
                <span>&middot;</span>
                <span>Lines: <strong className="text-slate-900 font-mono">{pipelineResult.totalRowsProcessed + 1}</strong></span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-3">
            <pre className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto leading-relaxed max-h-48">
              {activeRawCsv}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* 3. INGESTION NOTIFICATION TOAST */}
      {ingestStatus && (
        <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 flex items-center justify-between gap-3 text-xs text-emerald-800 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{ingestStatus}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIngestStatus(null)}
            className="text-[11px] text-emerald-800 hover:bg-emerald-100 h-6 px-2 font-semibold"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* 4. EXECUTIVE PARSER KPI BANNER */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900 tracking-wider uppercase">
              SCHEMA INGESTION METRICS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleIngestToLedger}
              disabled={pipelineResult.validRows.length === 0}
              leftIcon={<Database className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Ingest Valid Rows to Active Inventory Ledger
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">
              Valid Rows
            </span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
              {pipelineResult.summary.validCount}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Ready for ledger commit
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">
              Quarantined Rows
            </span>
            <span className={`text-xl font-bold mt-0.5 block ${pipelineResult.summary.quarantineCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {pipelineResult.summary.quarantineCount}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Isolated from production
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">
              Columns Mapped
            </span>
            <span className="text-xl font-bold text-sky-700 mt-0.5 block">
              {pipelineResult.resolvedMappings.length} / {pipelineResult.rawHeaders.length}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Canonical schema resolution
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">
              Total Units Parsed
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {pipelineResult.summary.totalUnitsParsed}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Across valid components
            </span>
          </div>
        </div>
      </div>

      {/* 5. QUARANTINED ROWS & SCHEMA EXCEPTIONS TABLE */}
      {pipelineResult.quarantinedRows.length > 0 && (
        <Card className="border border-rose-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-rose-100 bg-rose-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <CardTitle className="text-sm tracking-wider uppercase text-rose-700">
                  QUARANTINED ROWS &amp; SCHEMA EXCEPTIONS ({pipelineResult.quarantinedRows.length})
                </CardTitle>
              </div>
              <Badge variant="critical" size="sm">
                CORRUPTED DATA ISOLATED
              </Badge>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 font-normal">
              These records failed physical invariant checks (negative quantities, missing part identifiers, or unmapped facility codes) and were excluded from live store mutation.
            </p>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-mono font-semibold">
                  <tr>
                    <th className="py-3 px-3.5">Line #</th>
                    <th className="py-3 px-3">Raw CSV Row</th>
                    <th className="py-3 px-4">Rejection Reasons</th>
                    <th className="py-3 px-3">Isolation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {pipelineResult.quarantinedRows.map((qRow, idx) => (
                    <tr key={idx} className="bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-rose-700">
                        Line {qRow.rowNumber}
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        <code className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 text-slate-900">
                          {qRow.rawLine}
                        </code>
                      </td>

                      <td className="py-3 px-4 font-sans text-xs">
                        <div className="space-y-1">
                          {qRow.rejectionReasons.map((reason, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-1.5 text-rose-700">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-medium text-[11px]">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase font-sans">
                          QUARANTINED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. SCHEMA MAPPINGS & UNIFIED LEDGER DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column Mapping Resolution */}
        <Card className="lg:col-span-4 border border-slate-200 bg-white shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                  RESOLVED MAPPINGS
                </CardTitle>
              </div>
              <Badge variant="neutral" size="sm">
                AUTO-ALIGNED
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-3 text-xs">
            {pipelineResult.resolvedMappings.length > 0 ? (
              pipelineResult.resolvedMappings.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Supplier Header
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {m.rawHeader}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-3">
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Trce Canonical
                    </span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {m.canonicalField}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500">
                <HelpCircle className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                No mapped fields
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validated Unified Records Table */}
        <Card className="lg:col-span-8 border border-slate-200 bg-white shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm tracking-wider uppercase text-slate-900">
                  VALIDATED ACTIVE LEDGER RECORDS ({pipelineResult.validRows.length})
                </CardTitle>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Ready to sync with facility inventory
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-3.5">Part ID</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Facility Hub</th>
                    <th className="py-3 px-3">Unit Cost</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-mono text-[11px]">
                  {pipelineResult.validRows.length > 0 ? (
                    pipelineResult.validRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5 font-bold text-emerald-700">
                          {row.partId}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {row.quantity} units
                        </td>
                        <td className="py-3 px-3 text-sky-700 font-semibold">
                          {row.location}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          ${row.unitCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <StatusIndicator
                            status={
                              row.status === 'AVAILABLE'
                                ? 'operational'
                                : row.status === 'LOW STOCK'
                                ? 'warning'
                                : 'critical'
                            }
                            label={row.status}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                        No valid records found in this payload. Review quarantine table above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
