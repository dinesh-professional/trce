export interface ActivityLogItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  category: 'TELEMETRY' | 'INVENTORY' | 'DISPATCH' | 'SYSTEM' | 'SECURITY';
  target: string;
  facility: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'INFO';
  details: string;
}

export const activityLogsData: ActivityLogItem[] = [
  {
    id: 'ACT-901',
    timestamp: '2 mins ago',
    actor: 'Dinesh',
    actorRole: 'Operations Director',
    action: 'Inter-facility transfer initiated',
    category: 'DISPATCH',
    target: 'BRG-204 (4 units)',
    facility: 'FAC-C → FAC-A',
    status: 'SUCCESS',
    details: 'Dispatched expedited carrier for critical line mitigation.',
  },
  {
    id: 'ACT-902',
    timestamp: '14 mins ago',
    actor: 'Telemetry Stream',
    actorRole: 'Edge Daemon',
    action: 'ISO-10816 threshold breach recorded',
    category: 'TELEMETRY',
    target: 'M-204 (Precision Spindle)',
    facility: 'FAC-A',
    status: 'CRITICAL',
    details: 'Vibration peaked at 8.7 mm/s RMS (threshold: 6.0 mm/s).',
  },
  {
    id: 'ACT-903',
    timestamp: '42 mins ago',
    actor: 'Inventory Engine',
    actorRole: 'Automated Audit',
    action: 'Distributed stock synchronization complete',
    category: 'INVENTORY',
    target: '4 Facilities (14 SKUs)',
    facility: 'Global Ledger',
    status: 'SUCCESS',
    details: 'All facility buffer states verified with zero ledger drift.',
  },
  {
    id: 'ACT-904',
    timestamp: '1h 10m ago',
    actor: 'Procurement Gateway',
    actorRole: 'Vendor Ingestion',
    action: 'Supplier B catalog harmonized',
    category: 'SYSTEM',
    target: 'SUP-B Inventory Feed',
    facility: 'FAC-D / FAC-B',
    status: 'INFO',
    details: 'Normalized 3 proprietary columns to canonical Common Data Model.',
  },
  {
    id: 'ACT-905',
    timestamp: '2h 25m ago',
    actor: 'Sarah Chen',
    actorRole: 'Plant Engineer',
    action: 'Thermal sensor recalibrated',
    category: 'TELEMETRY',
    target: 'M-117 (Drive Motor)',
    facility: 'FAC-B',
    status: 'WARNING',
    details: 'Bearing temperature normalized from 81°C down to 68°C.',
  },
  {
    id: 'ACT-906',
    timestamp: '4h 00m ago',
    actor: 'Access Guard',
    actorRole: 'Security Audit',
    action: 'Operator session authenticated',
    category: 'SECURITY',
    target: 'Dinesh (dinesh@apexindustrial.com)',
    facility: 'US-East Node',
    status: 'SUCCESS',
    details: 'Multi-factor authentication verified from internal VPN.',
  },
];
