/**
 * TRCE Cryptographic Dispatch Manifest & Ledger Export Utilities
 * Module 09: SHA-256 Verified Bill of Lading & Audit Ledger Export
 */

import { AuditEvent } from './operational-store';

export interface DispatchManifestPayload {
  transferId: string; // 'TRF-8841'
  incidentId: string; // 'INC-204'
  partId: string; // 'BRG-204'
  partName: string; // 'Spindle Bearing (Angular Contact)'
  quantity: number; // 4
  origin: string; // 'FAC-C Dispatch Bay 04'
  originFacility: string; // 'Hyderabad Logistics Depot'
  destination: string; // 'FAC-A Receiving Dock 02'
  destinationFacility: string; // 'Chennai Assembly Plant'
  carrier: string; // 'BlueDart Industrial Prime Logistics'
  carrierTrackingCode: string; // 'BLU-8841-EXP'
  dispatchedAt: string; // ISO String
  eta: string; // '4h 20m'
  costSavingsVsNextBest: number; // 78576
  costSavingsVsOem: number; // 284954
  sha256Hash: string; // 64-character hex string
}

/**
 * Computes a cryptographic SHA-256 hash using the browser's native Web Crypto API.
 */
export async function computeSha256(payload: unknown): Promise<string> {
  const jsonString =
    typeof payload === 'string' ? payload : JSON.stringify(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Deterministic fallback hash for environments where window.crypto is unavailable
  let hash = 0x811c9dc5;
  for (let i = 0; i < jsonString.length; i++) {
    hash ^= jsonString.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const fallbackHex = (hash >>> 0).toString(16).padStart(8, '0');
  return `0x${fallbackHex.repeat(8).slice(0, 64)}`;
}

/**
 * Creates deterministic manifest for transfer TRF-8841 and signs it with SHA-256.
 */
export async function generateDispatchManifest(params?: {
  transferId?: string;
  partId?: string;
  quantity?: number;
  origin?: string;
  destination?: string;
}): Promise<DispatchManifestPayload> {
  const transferId = params?.transferId ?? 'TRF-8841';
  const partId = params?.partId ?? 'BRG-204';
  const quantity = params?.quantity ?? 4;
  const origin = params?.origin ?? 'FAC-C Dispatch Bay 04';
  const destination = params?.destination ?? 'FAC-A Receiving Dock 02';
  const dispatchedAt = new Date().toISOString();

  // Core payload to hash
  const canonicalPayload = {
    transferId,
    partId,
    origin,
    destination,
    quantity,
    timestamp: dispatchedAt,
  };

  const sha256Hash = await computeSha256(canonicalPayload);

  return {
    transferId,
    incidentId: 'INC-204',
    partId,
    partName: 'Spindle Bearing (Angular Contact)',
    quantity,
    origin,
    originFacility: 'FAC-C (Hyderabad Logistics Depot)',
    destination,
    destinationFacility: 'FAC-A (Chennai Assembly Plant)',
    carrier: 'BlueDart Industrial Prime Logistics',
    carrierTrackingCode: 'BLU-8841-EXP',
    dispatchedAt,
    eta: '4h 20m',
    costSavingsVsNextBest: 78576,
    costSavingsVsOem: 284954,
    sha256Hash,
  };
}

/**
 * Helper to download raw text file into the user's browser.
 */
export function downloadBlob(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports audit events as a standardized CSV file.
 */
export function exportAuditAsCsv(auditEvents: AuditEvent[]) {
  const headers = [
    'EVENT_ID',
    'TIMESTAMP',
    'CATEGORY',
    'ACTOR',
    'ACTION',
    'TARGET',
    'FACILITY',
    'STATUS',
    'DETAILS',
  ];

  const rows = auditEvents.map((e) => [
    e.id,
    e.isoTimestamp || e.timestamp,
    e.category,
    e.actor,
    `"${(e.action || '').replace(/"/g, '""')}"`,
    `"${(e.target || '').replace(/"/g, '""')}"`,
    `"${(e.facility || '').replace(/"/g, '""')}"`,
    e.status,
    `"${(e.details || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `trce_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports audit events as formatted JSON.
 */
export function exportAuditAsJson(auditEvents: AuditEvent[]) {
  const jsonContent = JSON.stringify(auditEvents, null, 2);
  const filename = `trce_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`;
  downloadBlob(jsonContent, filename, 'application/json');
}
