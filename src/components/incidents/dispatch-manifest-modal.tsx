'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Printer,
  Copy,
  Check,
  X,
  Truck,
  Clock,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/Logo';
import { DispatchManifestPayload } from '@/lib/crypto-manifest';

interface DispatchManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: DispatchManifestPayload;
}

export function DispatchManifestModal({
  isOpen,
  onClose,
  manifest,
}: DispatchManifestModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(manifest.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manifest-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl rounded-t-xl sm:rounded-xl border-t sm:border border-slate-200 bg-white text-slate-900 shadow-2xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in duration-200">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 shrink-0" />

        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <Logo variant="icon" size="sm" className="shrink-0" />
            <div className="min-w-0">
              <h2 id="manifest-modal-title" className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 truncate">
                Cryptographic Bill of Lading &amp; Dispatch Manifest
              </h2>
              <span className="text-[11px] text-slate-500">
                Deterministic SHA-256 Verified Transfer Order
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs bg-white"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Export Manifest
            </Button>
            <button
              onClick={onClose}
              aria-label="Close manifest modal"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8 print:text-black">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-5 print:border-gray-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <Logo variant="icon" size="sm" className="shrink-0" />
                  <span className="text-xl font-black tracking-tight text-slate-900 print:text-black">
                    TRCE LOGISTICS DISPATCH MANIFEST
                  </span>
                  <Badge variant="primary" size="sm">
                    DIGITALLY SIGNED
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 mt-1 print:text-gray-600">
                  Standard Autonomous Inter-Facility Transfer Protocol · Module 09
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block print:text-gray-500 font-semibold">
                  Transfer Identifier
                </span>
                <span className="text-xl font-mono font-bold text-amber-700 print:text-black">
                  {manifest.transferId}
                </span>
                <span className="text-[11px] text-slate-500 block font-mono print:text-gray-600">
                  Ref Incident: {manifest.incidentId}
                </span>
              </div>
            </div>
          </div>

          {/* SHA-256 Cryptographic Verification Seal */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-2 print:border-gray-400 print:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 print:text-black" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 print:text-black">
                  SHA-256 Ledger Verification Hash
                </span>
              </div>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-[11px] text-amber-800 font-semibold hover:underline print:hidden"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-amber-700" />
                    <span className="text-amber-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-md bg-white border border-amber-200 font-mono text-[11px] text-slate-800 break-all select-all print:bg-white print:border-gray-300 print:text-black">
              {manifest.sha256Hash}
            </div>
            <span className="text-[10px] text-slate-500 block print:text-gray-500">
              Verified by Web Crypto API (SubtleCrypto Digest). Cryptographically bounds transfer ID, part ID, origin, destination, quantity, and epoch timestamp.
            </span>
          </div>

          {/* Route Grid: Origin vs Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 print:bg-white print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block print:text-gray-500 font-semibold">
                Origin Logistics Node
              </span>
              <div className="text-base font-bold text-slate-900 print:text-black">
                {manifest.origin}
              </div>
              <div className="text-xs text-slate-600 print:text-gray-600">
                {manifest.originFacility}
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 print:border-gray-200">
                <span>Dispatch Bay</span>
                <span className="font-semibold text-slate-900 print:text-black">Bay 04 (Express)</span>
              </div>
            </div>

            {/* Destination */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-300 space-y-2 print:bg-white print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block print:text-gray-500 font-semibold">
                Destination Receiving Dock
              </span>
              <div className="text-base font-bold text-amber-800 print:text-black">
                {manifest.destination}
              </div>
              <div className="text-xs text-slate-600 print:text-gray-600">
                {manifest.destinationFacility}
              </div>
              <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs text-slate-600 print:border-gray-200">
                <span>Receiving Dock</span>
                <span className="font-semibold text-amber-800 print:text-black">Dock 02 (Assembly Line 2)</span>
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 print:bg-white print:border-gray-300">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block print:text-gray-500 font-semibold">
              Consignment & Assembly Inventory
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase print:text-gray-500">Part SKU</span>
                <span className="font-mono font-bold text-emerald-700 text-sm print:text-black">{manifest.partId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase print:text-gray-500">Description</span>
                <span className="font-semibold text-slate-900 print:text-black">{manifest.partName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase print:text-gray-500">Quantity</span>
                <span className="font-mono font-bold text-slate-900 text-sm print:text-black">{manifest.quantity} Units</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase print:text-gray-500">Package Spec</span>
                <span className="font-semibold text-slate-900 print:text-black">Anti-Static Sealed</span>
              </div>
            </div>
          </div>

          {/* Carrier SLA & Cost Savings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Carrier SLA */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 print:bg-white print:border-gray-300">
              <div className="flex items-center gap-1.5 text-amber-700 print:text-black font-semibold">
                <Truck className="w-4 h-4" />
                <span>Expedited Carrier Logistics</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-gray-600">Carrier Service:</span>
                  <span className="font-semibold text-slate-900 print:text-black">{manifest.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-gray-600">Tracking Code:</span>
                  <span className="font-mono font-semibold text-amber-700 print:text-black">{manifest.carrierTrackingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-gray-600">Guaranteed Transit SLA:</span>
                  <span className="font-semibold text-amber-700 print:text-black">{manifest.eta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-gray-600">Dispatched Timestamp:</span>
                  <span className="font-mono text-slate-900 print:text-black">
                    {new Date(manifest.dispatchedAt).toLocaleString('en-US', { hour12: false })}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Impact */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 print:bg-white print:border-gray-300">
              <div className="flex items-center gap-1.5 text-emerald-800 print:text-black font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>Net Financial Savings (Algorithmically Optimized)</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 print:text-gray-600">Savings vs FAC-D Routing:</span>
                  <span className="font-mono font-bold text-emerald-700 print:text-black">
                    +${manifest.costSavingsVsNextBest.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 print:text-gray-600">Savings vs Standard OEM:</span>
                  <span className="font-mono font-bold text-emerald-700 print:text-black">
                    +${manifest.costSavingsVsOem.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 print:text-gray-600">Mitigated Downtime:</span>
                  <span className="font-semibold text-slate-900 print:text-black">19.7 hours saved</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 print:text-gray-600">Dispatch Fee &amp; Freight:</span>
                  <span className="font-semibold text-slate-900 print:text-black">$616.65 (Expedited)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Custody Chain (Print-optimized) */}
          <div className="pt-4 border-t border-slate-200 print:border-gray-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block print:text-gray-500 font-semibold">
                Authorizing Dispatch Officer
              </span>
              <div className="h-10 mt-1 flex items-end border-b border-slate-300 print:border-gray-400 font-mono text-[11px] text-slate-700 print:text-gray-700">
                System Operator (Ops Console 04)
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block print:text-gray-500 font-semibold">
                Carrier Acceptance Signature
              </span>
              <div className="h-10 mt-1 flex items-end border-b border-slate-300 print:border-gray-400 font-mono text-[11px] text-slate-700 print:text-gray-700">
                BlueDart Express Custody Driver #4029
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Screen only */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Carrier SLA Countdown: <strong className="text-amber-700 font-mono font-bold">{manifest.eta}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex-1 sm:flex-none justify-center text-xs bg-white"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Manifest
            </Button>
            <Button variant="primary" size="sm" onClick={onClose} className="flex-1 sm:flex-none justify-center text-xs font-semibold">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
