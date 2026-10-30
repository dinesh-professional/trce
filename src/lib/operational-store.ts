'use client';

import { useSyncExternalStore } from 'react';
import { evaluateTelemetryPayload } from './telemetry-engine';

// ==============================================================================
// TRCE — Unified Reactive Operational Data Store
// ==============================================================================

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type MachineStatus = 'operational' | 'warning' | 'critical' | 'offline';
export type FacilityStatus = 'operational' | 'degraded' | 'critical' | 'maintenance';
export type InventoryStatus = 'AVAILABLE' | 'LOW STOCK' | 'CRITICAL';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';
export type SupplierStatus = 'active' | 'under_review' | 'restricted';
export type TransferStatus = 'IDLE' | 'CONFIRMING' | 'IN_TRANSIT' | 'DELIVERED';

export interface TelemetryPoint {
  time: string;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
}

export interface Machine {
  id: string;
  name: string;
  facilityId: string;
  facilityName: string;
  line: string;
  category: 'milling' | 'welding' | 'press' | 'robotics' | 'injection';
  status: MachineStatus;
  healthScore: number;
  temperatureC: number;
  vibrationMmS: number;
  pressureBar: number;
  rpm: number;
  uptimeHours: number;
  lastMaintenance: string;
  nextScheduledMaintenance: string;
  lastUpdate: string;
  history: TelemetryPoint[];
}

export interface Incident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  facilityId: string;
  facilityName: string;
  machineId: string;
  machineName: string;
  category: 'mechanical' | 'supply_chain' | 'electrical' | 'environmental';
  createdAt: string;
  updatedAt: string;
  description: string;
  assignedTo: string;
  componentId: string;
  componentName: string;
  metricBreach: string;
  recommendedSource: string;
  eta: string;
}

export interface InventoryItem {
  id: string;
  partId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unitCost: number;
  leadTimeDays: number;
  minBuffer: number;
}

export interface FacilityStock {
  id: string;
  partId: string;
  partName: string;
  sku: string;
  category: string;
  facilityId: string;
  facilityName: string;
  city: string;
  quantity: number;
  minSafetyStock: number;
  maxStockLevel: number;
  reorderPoint: number;
  status: InventoryStatus;
  lastUpdated: string;
  binLocation: string;
}

export interface SupplierFeed {
  id: string;
  name: string;
  code: string;
  tier: 1 | 2 | 3;
  rating: number;
  onTimeDeliveryRate: number;
  riskScore: 'low' | 'medium' | 'elevated' | 'high';
  country: string;
  primaryContact: string;
  email: string;
  partsSuppliedCount: number;
  status: SupplierStatus;
  lastIngestionAt: string;
}

export interface TransferOrder {
  id: string;
  incidentId: string;
  partId: string;
  partName: string;
  quantity: number;
  sourceFacility: string;
  sourceFacilityName: string;
  destinationFacility: string;
  destinationFacilityName: string;
  distanceKm: number;
  distance: string;
  eta: string;
  status: TransferStatus;
  carrier: string;
  createdAt: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  reason: string;
  verificationHash?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  isoTimestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  category: 'TELEMETRY' | 'INVENTORY' | 'DISPATCH' | 'SYSTEM' | 'SECURITY';
  target: string;
  facility: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'INFO';
  details: string;
  link?: string;
  linkText?: string;
}

export interface OperationalState {
  machines: Machine[];
  incidents: Incident[];
  inventoryItems: InventoryItem[];
  facilityStocks: FacilityStock[];
  suppliers: SupplierFeed[];
  transferOrders: TransferOrder[];
  auditEvents: AuditEvent[];
  lastSyncTimestamp: string;
}

// ==============================================================================
// BASELINE DATA INITIALIZATION (Deterministic Enterprise Seeds)
// ==============================================================================

const INITIAL_MACHINES: Machine[] = [
  {
    id: 'M-204',
    name: 'Precision Spindle Unit M-204',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    line: 'Assembly Line 2',
    category: 'milling',
    status: 'critical',
    healthScore: 34,
    temperatureC: 78.0,
    vibrationMmS: 8.7,
    pressureBar: 41.0,
    rpm: 1840,
    uptimeHours: 2840,
    lastMaintenance: '2026-09-01',
    nextScheduledMaintenance: '2026-10-24',
    lastUpdate: '2 min ago',
    history: [
      { time: '20:00', temperature: 68, vibration: 3.2, pressure: 42, rpm: 1820 },
      { time: '20:10', temperature: 69, vibration: 3.8, pressure: 41, rpm: 1830 },
      { time: '20:20', temperature: 71, vibration: 4.4, pressure: 42, rpm: 1835 },
      { time: '20:30', temperature: 73, vibration: 5.1, pressure: 40, rpm: 1840 },
      { time: '20:40', temperature: 75, vibration: 6.2, pressure: 41, rpm: 1840 },
      { time: '20:50', temperature: 77, vibration: 7.5, pressure: 41, rpm: 1845 },
      { time: '21:00', temperature: 78, vibration: 8.7, pressure: 41, rpm: 1840 },
    ],
  },
  {
    id: 'M-117',
    name: 'Drive Motor Unit M-117',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    line: 'Machining Bay 1',
    category: 'robotics',
    status: 'warning',
    healthScore: 65,
    temperatureC: 81.2,
    vibrationMmS: 4.2,
    pressureBar: 38.0,
    rpm: 1720,
    uptimeHours: 4210,
    lastMaintenance: '2026-09-18',
    nextScheduledMaintenance: '2026-11-05',
    lastUpdate: '5 min ago',
    history: [
      { time: '20:00', temperature: 70, vibration: 3.8, pressure: 37, rpm: 1720 },
      { time: '20:15', temperature: 73, vibration: 3.9, pressure: 38, rpm: 1715 },
      { time: '20:30', temperature: 76, vibration: 4.1, pressure: 38, rpm: 1720 },
      { time: '20:45', temperature: 78, vibration: 4.1, pressure: 38, rpm: 1725 },
      { time: '21:00', temperature: 81, vibration: 4.2, pressure: 38, rpm: 1720 },
    ],
  },
  {
    id: 'M-301',
    name: 'Hydropress Transfer Manifold M-301',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    line: 'Hydraulic Stamping Cell',
    category: 'press',
    status: 'warning',
    healthScore: 68,
    temperatureC: 62.0,
    vibrationMmS: 2.1,
    pressureBar: 54.0,
    rpm: 1650,
    uptimeHours: 5800,
    lastMaintenance: '2026-10-10',
    nextScheduledMaintenance: '2026-12-20',
    lastUpdate: '8 min ago',
    history: [
      { time: '20:00', temperature: 60, vibration: 2.0, pressure: 44, rpm: 1650 },
      { time: '20:20', temperature: 61, vibration: 2.1, pressure: 48, rpm: 1650 },
      { time: '20:40', temperature: 62, vibration: 2.1, pressure: 52, rpm: 1645 },
      { time: '21:00', temperature: 62, vibration: 2.1, pressure: 54, rpm: 1650 },
    ],
  },
  {
    id: 'M-402',
    name: 'Automated Gantry Cell M-402',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    line: 'Transfer Line 4',
    category: 'robotics',
    status: 'operational',
    healthScore: 97,
    temperatureC: 55.0,
    vibrationMmS: 1.4,
    pressureBar: 42.0,
    rpm: 1910,
    uptimeHours: 7120,
    lastMaintenance: '2026-10-15',
    nextScheduledMaintenance: '2027-01-12',
    lastUpdate: '11 min ago',
    history: [
      { time: '20:00', temperature: 54, vibration: 1.3, pressure: 42, rpm: 1910 },
      { time: '20:30', temperature: 55, vibration: 1.4, pressure: 42, rpm: 1915 },
      { time: '21:00', temperature: 55, vibration: 1.4, pressure: 42, rpm: 1910 },
    ],
  },
  {
    id: 'M-508',
    name: 'Robotic Weld Station M-508',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    line: 'Chassis Line 1',
    category: 'welding',
    status: 'operational',
    healthScore: 94,
    temperatureC: 68.0,
    vibrationMmS: 3.1,
    pressureBar: 44.0,
    rpm: 1820,
    uptimeHours: 3410,
    lastMaintenance: '2026-10-02',
    nextScheduledMaintenance: '2026-12-14',
    lastUpdate: '14 min ago',
    history: [
      { time: '20:00', temperature: 66, vibration: 2.9, pressure: 44, rpm: 1820 },
      { time: '20:30', temperature: 67, vibration: 3.0, pressure: 44, rpm: 1825 },
      { time: '21:00', temperature: 68, vibration: 3.1, pressure: 44, rpm: 1820 },
    ],
  },
  {
    id: 'M-612',
    name: 'CNC 5-Axis Precision Miller M-612',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    line: 'Turbine Fabrication Bay',
    category: 'milling',
    status: 'operational',
    healthScore: 92,
    temperatureC: 58.0,
    vibrationMmS: 2.8,
    pressureBar: 46.0,
    rpm: 2050,
    uptimeHours: 4920,
    lastMaintenance: '2026-09-22',
    nextScheduledMaintenance: '2026-12-01',
    lastUpdate: '18 min ago',
    history: [
      { time: '20:00', temperature: 57, vibration: 2.7, pressure: 46, rpm: 2050 },
      { time: '20:30', temperature: 58, vibration: 2.8, pressure: 46, rpm: 2050 },
      { time: '21:00', temperature: 58, vibration: 2.8, pressure: 46, rpm: 2050 },
    ],
  },
  {
    id: 'M-719',
    name: 'Thermoplastic Injection Cell M-719',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    line: 'Polymer Injection Bay 2',
    category: 'injection',
    status: 'operational',
    healthScore: 96,
    temperatureC: 71.0,
    vibrationMmS: 1.9,
    pressureBar: 48.0,
    rpm: 1600,
    uptimeHours: 6180,
    lastMaintenance: '2026-10-08',
    nextScheduledMaintenance: '2027-01-05',
    lastUpdate: '22 min ago',
    history: [
      { time: '20:00', temperature: 70, vibration: 1.8, pressure: 48, rpm: 1600 },
      { time: '20:30', temperature: 71, vibration: 1.9, pressure: 48, rpm: 1600 },
      { time: '21:00', temperature: 71, vibration: 1.9, pressure: 48, rpm: 1600 },
    ],
  },
  {
    id: 'M-825',
    name: 'Heavy Extruder Unit M-825',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    line: 'Extrusion Line 3',
    category: 'press',
    status: 'operational',
    healthScore: 95,
    temperatureC: 64.0,
    vibrationMmS: 2.5,
    pressureBar: 36.0,
    rpm: 1750,
    uptimeHours: 5310,
    lastMaintenance: '2026-09-30',
    nextScheduledMaintenance: '2026-12-18',
    lastUpdate: '25 min ago',
    history: [
      { time: '20:00', temperature: 63, vibration: 2.4, pressure: 36, rpm: 1750 },
      { time: '20:30', temperature: 64, vibration: 2.5, pressure: 36, rpm: 1750 },
      { time: '21:00', temperature: 64, vibration: 2.5, pressure: 36, rpm: 1750 },
    ],
  },
  // Deterministically generate remaining machines to make 48 total assets
  // Skipping explicit IDs already declared above: M-204, M-117, M-301, M-402, M-508, M-612, M-719, M-825
  ...Array.from({ length: 48 }, (_, idx) => {
    const num = 101 + idx;
    if ([204, 117, 301, 402, 508, 612, 719, 825].includes(num)) {
      return null;
    }
    const facIndex = idx % 4;
    const facId = ['FAC-A', 'FAC-B', 'FAC-C', 'FAC-D'][facIndex];
    const facNames: Record<string, string> = {
      'FAC-A': 'Chennai Assembly Plant',
      'FAC-B': 'Bengaluru Machining Hub',
      'FAC-C': 'Hyderabad Logistics Depot',
      'FAC-D': 'Pune Robotics Plant',
    };
    const categories: Array<'milling' | 'welding' | 'press' | 'robotics' | 'injection'> = [
      'milling',
      'welding',
      'press',
      'robotics',
      'injection',
    ];
    const cat = categories[idx % categories.length];

    return {
      id: `M-${num}`,
      name: `Industrial ${cat.charAt(0).toUpperCase() + cat.slice(1)} Cell M-${num}`,
      facilityId: facId,
      facilityName: facNames[facId],
      line: `Cell Line ${Math.floor(idx / 4) + 1}`,
      category: cat,
      status: 'operational' as MachineStatus,
      healthScore: 90 + (idx % 10),
      temperatureC: 52.0 + (idx % 15),
      vibrationMmS: 1.2 + ((idx % 20) * 0.1),
      pressureBar: 40.0 + (idx % 8),
      rpm: 1600 + (idx % 300),
      uptimeHours: 3000 + (idx * 95),
      lastMaintenance: '2026-10-01',
      nextScheduledMaintenance: '2026-12-25',
      lastUpdate: `${5 + (idx % 30)} min ago`,
      history: [
        { time: '20:00', temperature: 52, vibration: 1.2, pressure: 40, rpm: 1600 },
        { time: '20:30', temperature: 53, vibration: 1.3, pressure: 41, rpm: 1610 },
        { time: '21:00', temperature: 53, vibration: 1.3, pressure: 40, rpm: 1605 },
      ],
    };
  }).filter(Boolean) as Machine[],
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-204',
    title: 'Abnormal vibration on Spindle Bearing',
    severity: 'critical',
    status: 'investigating',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    machineId: 'M-204',
    machineName: 'Precision Spindle Unit M-204',
    category: 'mechanical',
    createdAt: '2026-10-23T21:02:00Z',
    updatedAt: '2026-10-23T21:05:00Z',
    description: 'Vibration velocity reached 8.7 mm/s RMS on primary spindle axis. Risk of catastrophic bearing seizure.',
    assignedTo: 'Shift Lead 02',
    componentId: 'BRG-204',
    componentName: 'Angular Contact Bearing',
    metricBreach: '8.7 mm/s (Breached)',
    recommendedSource: 'FAC-C',
    eta: '4h 20m',
  },
  {
    id: 'INC-117',
    title: 'Temperature elevation on Winding Core',
    severity: 'medium',
    status: 'open',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    machineId: 'M-117',
    machineName: 'Drive Motor Unit M-117',
    category: 'electrical',
    createdAt: '2026-10-23T20:30:00Z',
    updatedAt: '2026-10-23T20:45:00Z',
    description: 'Motor winding core temperature continuously drifting above normal 78°C operating envelope.',
    assignedTo: 'Maintenance Dispatch',
    componentId: 'MTR-102',
    componentName: 'Servo Motor',
    metricBreach: '81.2°C (Elevated)',
    recommendedSource: 'Local reserve',
    eta: 'Immediate',
  },
  {
    id: 'INC-301',
    title: 'Pressure oscillation on Hydraulic Circuit',
    severity: 'medium',
    status: 'open',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    machineId: 'M-301',
    machineName: 'Hydropress Transfer Manifold M-301',
    category: 'mechanical',
    createdAt: '2026-10-23T19:50:00Z',
    updatedAt: '2026-10-23T20:10:00Z',
    description: 'Secondary return line circuit pressure oscillating outside steady calibration range.',
    assignedTo: 'Hydraulics Tech',
    componentId: 'VLV-301',
    componentName: 'Directional Valve',
    metricBreach: '54 bar (Fluctuating)',
    recommendedSource: 'FAC-B',
    eta: '6h 15m',
  },
];

const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'PRT-BRG-204',
    partId: 'BRG-204',
    sku: 'SKF-BRG-204',
    name: 'Bearing',
    description: 'Angular contact precision ball bearing for CNC & spindle units',
    category: 'Bearings',
    unitCost: 285.0,
    leadTimeDays: 14,
    minBuffer: 3,
  },
  {
    id: 'PRT-MTR-102',
    partId: 'MTR-102',
    sku: 'SIEM-MTR-102',
    name: 'Motor',
    description: 'Industrial 3-Phase servo drive motor 15kW',
    category: 'Electrical',
    unitCost: 1850.0,
    leadTimeDays: 21,
    minBuffer: 2,
  },
  {
    id: 'PRT-VLV-301',
    partId: 'VLV-301',
    sku: 'RXT-VLV-301',
    name: 'Hydraulic Valve',
    description: 'Proportional directional control valve 350 bar',
    category: 'Hydraulics',
    unitCost: 740.0,
    leadTimeDays: 10,
    minBuffer: 2,
  },
  {
    id: 'PRT-SNS-401',
    partId: 'SNS-401',
    sku: 'IFM-VSA-401',
    name: 'Vibration Sensor',
    description: 'High-frequency piezoelectric vibration sensor core',
    category: 'Sensors',
    unitCost: 320.0,
    leadTimeDays: 7,
    minBuffer: 4,
  },
  {
    id: 'PRT-PMP-501',
    partId: 'PMP-501',
    sku: 'GRF-PMP-501',
    name: 'Centrifugal Coolant Pump',
    description: 'High-volume submerged coolant circulation pump',
    category: 'Hydraulics',
    unitCost: 620.0,
    leadTimeDays: 12,
    minBuffer: 2,
  },
  {
    id: 'PRT-FLT-108',
    partId: 'FLT-108',
    sku: 'MN-FLT-108',
    name: 'Hydraulic Oil Filter',
    description: '10-micron high efficiency hydraulic filtration cartridge',
    category: 'Hydraulics',
    unitCost: 85.0,
    leadTimeDays: 5,
    minBuffer: 6,
  },
  {
    id: 'PRT-RLY-220',
    partId: 'RLY-220',
    sku: 'OMR-RLY-220',
    name: 'Safety Control Relay',
    description: 'Dual channel e-stop safety monitoring relay',
    category: 'Electrical',
    unitCost: 145.0,
    leadTimeDays: 4,
    minBuffer: 3,
  },
  {
    id: 'PRT-PLC-310',
    partId: 'PLC-310',
    sku: 'SIEM-PLC-310',
    name: 'PLC Digital I/O Module',
    description: '32-channel isolated digital input/output bus terminal',
    category: 'Electrical',
    unitCost: 490.0,
    leadTimeDays: 16,
    minBuffer: 2,
  },
  {
    id: 'PRT-GSK-404',
    partId: 'GSK-404',
    sku: 'VSP-GSK-404',
    name: 'High-Pressure Manifold Gasket',
    description: 'Fluorocarbon elastomeric gasket for high-pressure seals',
    category: 'Hardware',
    unitCost: 42.0,
    leadTimeDays: 6,
    minBuffer: 8,
  },
  {
    id: 'PRT-HYD-702',
    partId: 'HYD-702',
    sku: 'RXT-HYD-702',
    name: 'Hydraulic Piston Seal Kit',
    description: 'PTFE step-seal set for 120mm press cylinders',
    category: 'Hydraulics',
    unitCost: 110.0,
    leadTimeDays: 9,
    minBuffer: 4,
  },
  {
    id: 'PRT-BRG-608',
    partId: 'BRG-608',
    sku: 'NSK-BRG-608',
    name: 'Ceramic Spindle Bearing Set',
    description: 'Ultra-high-speed hybrid ceramic bearing assembly',
    category: 'Bearings',
    unitCost: 520.0,
    leadTimeDays: 18,
    minBuffer: 2,
  },
  {
    id: 'PRT-CLU-112',
    partId: 'CLU-112',
    sku: 'ZF-CLU-112',
    name: 'Electromagnetic Clutch Plate',
    description: 'High-torque clutch friction disk for spindle engagement',
    category: 'Mechanical',
    unitCost: 380.0,
    leadTimeDays: 14,
    minBuffer: 2,
  },
  {
    id: 'PRT-ENC-901',
    partId: 'ENC-901',
    sku: 'HDN-ENC-901',
    name: 'Absolute Rotary Optical Encoder',
    description: '24-bit multi-turn absolute position feedback encoder',
    category: 'Sensors',
    unitCost: 890.0,
    leadTimeDays: 20,
    minBuffer: 2,
  },
  {
    id: 'PRT-BLT-304',
    partId: 'BLT-304',
    sku: 'GTS-BLT-304',
    name: 'Synchronous Timing Belt',
    description: 'Carbon fiber reinforced synchronous drive belt 14M pitch',
    category: 'Mechanical',
    unitCost: 95.0,
    leadTimeDays: 7,
    minBuffer: 5,
  },
];

const INITIAL_FACILITY_STOCKS: FacilityStock[] = [
  // BRG-204 (Critical part)
  {
    id: 'STK-FAC-A-BRG-204',
    partId: 'BRG-204',
    partName: 'Bearing',
    sku: 'SKF-BRG-204',
    category: 'Bearings',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    city: 'Chennai',
    quantity: 0,
    minSafetyStock: 3,
    maxStockLevel: 12,
    reorderPoint: 4,
    status: 'CRITICAL',
    lastUpdated: '2026-10-23 21:02',
    binLocation: 'Rack A1-Bin 04',
  },
  {
    id: 'STK-FAC-B-BRG-204',
    partId: 'BRG-204',
    partName: 'Bearing',
    sku: 'SKF-BRG-204',
    category: 'Bearings',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    city: 'Bengaluru',
    quantity: 2,
    minSafetyStock: 2,
    maxStockLevel: 8,
    reorderPoint: 3,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 20:45',
    binLocation: 'Cabinet B2-Bin 12',
  },
  {
    id: 'STK-FAC-C-BRG-204',
    partId: 'BRG-204',
    partName: 'Bearing',
    sku: 'SKF-BRG-204',
    category: 'Bearings',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    city: 'Hyderabad',
    quantity: 4,
    minSafetyStock: 2,
    maxStockLevel: 16,
    reorderPoint: 4,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 21:00',
    binLocation: 'Bay C3-Shelf 01',
  },
  {
    id: 'STK-FAC-D-BRG-204',
    partId: 'BRG-204',
    partName: 'Bearing',
    sku: 'SKF-BRG-204',
    category: 'Bearings',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    city: 'Pune',
    quantity: 7,
    minSafetyStock: 3,
    maxStockLevel: 20,
    reorderPoint: 5,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:30',
    binLocation: 'Storage D4-Pallet 09',
  },

  // MTR-102
  {
    id: 'STK-FAC-A-MTR-102',
    partId: 'MTR-102',
    partName: 'Motor',
    sku: 'SIEM-MTR-102',
    category: 'Electrical',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    city: 'Chennai',
    quantity: 1,
    minSafetyStock: 2,
    maxStockLevel: 6,
    reorderPoint: 3,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 18:00',
    binLocation: 'Cabinet M-01',
  },
  {
    id: 'STK-FAC-B-MTR-102',
    partId: 'MTR-102',
    partName: 'Motor',
    sku: 'SIEM-MTR-102',
    category: 'Electrical',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    city: 'Bengaluru',
    quantity: 2,
    minSafetyStock: 2,
    maxStockLevel: 8,
    reorderPoint: 3,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 20:30',
    binLocation: 'Cabinet M-02',
  },
  {
    id: 'STK-FAC-C-MTR-102',
    partId: 'MTR-102',
    partName: 'Motor',
    sku: 'SIEM-MTR-102',
    category: 'Electrical',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    city: 'Hyderabad',
    quantity: 5,
    minSafetyStock: 2,
    maxStockLevel: 10,
    reorderPoint: 4,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 20:00',
    binLocation: 'Motor Depot C1',
  },
  {
    id: 'STK-FAC-D-MTR-102',
    partId: 'MTR-102',
    partName: 'Motor',
    sku: 'SIEM-MTR-102',
    category: 'Electrical',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    city: 'Pune',
    quantity: 3,
    minSafetyStock: 2,
    maxStockLevel: 8,
    reorderPoint: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 17:15',
    binLocation: 'Heavy Rack D2',
  },

  // VLV-301
  {
    id: 'STK-FAC-A-VLV-301',
    partId: 'VLV-301',
    partName: 'Hydraulic Valve',
    sku: 'RXT-VLV-301',
    category: 'Hydraulics',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    city: 'Chennai',
    quantity: 0,
    minSafetyStock: 2,
    maxStockLevel: 8,
    reorderPoint: 3,
    status: 'CRITICAL',
    lastUpdated: '2026-10-23 16:30',
    binLocation: 'Hydraulics A3',
  },
  {
    id: 'STK-FAC-B-VLV-301',
    partId: 'VLV-301',
    partName: 'Hydraulic Valve',
    sku: 'RXT-VLV-301',
    category: 'Hydraulics',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    city: 'Bengaluru',
    quantity: 3,
    minSafetyStock: 2,
    maxStockLevel: 8,
    reorderPoint: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:10',
    binLocation: 'Hydraulics B1',
  },
  {
    id: 'STK-FAC-C-VLV-301',
    partId: 'VLV-301',
    partName: 'Hydraulic Valve',
    sku: 'RXT-VLV-301',
    category: 'Hydraulics',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    city: 'Hyderabad',
    quantity: 6,
    minSafetyStock: 2,
    maxStockLevel: 12,
    reorderPoint: 4,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 18:45',
    binLocation: 'Valve Bay C2',
  },
  {
    id: 'STK-FAC-D-VLV-301',
    partId: 'VLV-301',
    partName: 'Hydraulic Valve',
    sku: 'RXT-VLV-301',
    category: 'Hydraulics',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    city: 'Pune',
    quantity: 4,
    minSafetyStock: 2,
    maxStockLevel: 10,
    reorderPoint: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 18:20',
    binLocation: 'Valve Storage D1',
  },

  // SNS-401
  {
    id: 'STK-FAC-A-SNS-401',
    partId: 'SNS-401',
    partName: 'Vibration Sensor',
    sku: 'IFM-VSA-401',
    category: 'Sensors',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    city: 'Chennai',
    quantity: 8,
    minSafetyStock: 4,
    maxStockLevel: 25,
    reorderPoint: 6,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 21:01',
    binLocation: 'Sensor Bin S-14',
  },
  {
    id: 'STK-FAC-B-SNS-401',
    partId: 'SNS-401',
    partName: 'Vibration Sensor',
    sku: 'IFM-VSA-401',
    category: 'Sensors',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    city: 'Bengaluru',
    quantity: 12,
    minSafetyStock: 4,
    maxStockLevel: 30,
    reorderPoint: 8,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 20:50',
    binLocation: 'Sensor Bin S-02',
  },
  {
    id: 'STK-FAC-C-SNS-401',
    partId: 'SNS-401',
    partName: 'Vibration Sensor',
    sku: 'IFM-VSA-401',
    category: 'Sensors',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    city: 'Hyderabad',
    quantity: 15,
    minSafetyStock: 5,
    maxStockLevel: 35,
    reorderPoint: 10,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:00',
    binLocation: 'Sensor Depot C4',
  },
  {
    id: 'STK-FAC-D-SNS-401',
    partId: 'SNS-401',
    partName: 'Vibration Sensor',
    sku: 'IFM-VSA-401',
    category: 'Sensors',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    city: 'Pune',
    quantity: 4,
    minSafetyStock: 4,
    maxStockLevel: 20,
    reorderPoint: 6,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 18:20',
    binLocation: 'Sensor Cabinet D3',
  },

  // Supporting items to bring total stock to active enterprise levels (127 units total)
  {
    id: 'STK-FAC-A-PMP-501',
    partId: 'PMP-501',
    partName: 'Centrifugal Coolant Pump',
    sku: 'GRF-PMP-501',
    category: 'Hydraulics',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    city: 'Chennai',
    quantity: 3,
    minSafetyStock: 2,
    maxStockLevel: 8,
    reorderPoint: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 17:00',
    binLocation: 'Pump Bay A1',
  },
  {
    id: 'STK-FAC-B-FLT-108',
    partId: 'FLT-108',
    partName: 'Hydraulic Oil Filter',
    sku: 'MN-FLT-108',
    category: 'Hydraulics',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    city: 'Bengaluru',
    quantity: 14,
    minSafetyStock: 6,
    maxStockLevel: 40,
    reorderPoint: 10,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:20',
    binLocation: 'Filter Rack B4',
  },
  {
    id: 'STK-FAC-C-RLY-220',
    partId: 'RLY-220',
    partName: 'Safety Control Relay',
    sku: 'OMR-RLY-220',
    category: 'Electrical',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    city: 'Hyderabad',
    quantity: 9,
    minSafetyStock: 3,
    maxStockLevel: 20,
    reorderPoint: 5,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 18:30',
    binLocation: 'Electrical Tray C2',
  },
  {
    id: 'STK-FAC-D-PLC-310',
    partId: 'PLC-310',
    partName: 'PLC Digital I/O Module',
    sku: 'SIEM-PLC-310',
    category: 'Electrical',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    city: 'Pune',
    quantity: 5,
    minSafetyStock: 2,
    maxStockLevel: 10,
    reorderPoint: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:40',
    binLocation: 'Automation Bay D1',
  },
  {
    id: 'STK-FAC-A-GSK-404',
    partId: 'GSK-404',
    partName: 'High-Pressure Manifold Gasket',
    sku: 'VSP-GSK-404',
    category: 'Hardware',
    facilityId: 'FAC-A',
    facilityName: 'Chennai Assembly Plant',
    city: 'Chennai',
    quantity: 8,
    minSafetyStock: 4,
    maxStockLevel: 24,
    reorderPoint: 6,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 16:50',
    binLocation: 'Seals Drawer A2',
  },
  {
    id: 'STK-FAC-B-HYD-702',
    partId: 'HYD-702',
    partName: 'Hydraulic Piston Seal Kit',
    sku: 'RXT-HYD-702',
    category: 'Hydraulics',
    facilityId: 'FAC-B',
    facilityName: 'Bengaluru Machining Hub',
    city: 'Bengaluru',
    quantity: 4,
    minSafetyStock: 2,
    maxStockLevel: 12,
    reorderPoint: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 17:30',
    binLocation: 'Seal Kit Bin B3',
  },
  {
    id: 'STK-FAC-C-BRG-608',
    partId: 'BRG-608',
    partName: 'Ceramic Spindle Bearing Set',
    sku: 'NSK-BRG-608',
    category: 'Bearings',
    facilityId: 'FAC-C',
    facilityName: 'Hyderabad Logistics Depot',
    city: 'Hyderabad',
    quantity: 2,
    minSafetyStock: 2,
    maxStockLevel: 6,
    reorderPoint: 3,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 20:10',
    binLocation: 'High Speed Vault C5',
  },
  {
    id: 'STK-FAC-D-CLU-112',
    partId: 'CLU-112',
    partName: 'Electromagnetic Clutch Plate',
    sku: 'ZF-CLU-112',
    category: 'Mechanical',
    facilityId: 'FAC-D',
    facilityName: 'Pune Robotics Plant',
    city: 'Pune',
    quantity: 3,
    minSafetyStock: 2,
    maxStockLevel: 8,
    reorderPoint: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 18:00',
    binLocation: 'Transmission Bay D3',
  },
];

const INITIAL_SUPPLIERS: SupplierFeed[] = [
  {
    id: 'SUP-VND-088',
    name: 'Apex Industrial Bearings AG',
    code: 'AIB-EU',
    tier: 1,
    rating: 4.8,
    onTimeDeliveryRate: 97.4,
    riskScore: 'low',
    country: 'Germany',
    primaryContact: 'Lars Eberhardt',
    email: 'l.eberhardt@apex-bearings.de',
    partsSuppliedCount: 42,
    status: 'active',
    lastIngestionAt: '12 min ago',
  },
  {
    id: 'SUP-VND-104',
    name: 'Rexroth Hydraulic & Automation Ltd',
    code: 'RXT-US',
    tier: 1,
    rating: 4.9,
    onTimeDeliveryRate: 98.7,
    riskScore: 'low',
    country: 'United States',
    primaryContact: 'Sarah Jenkins',
    email: 's.jenkins@rexroth-auto.com',
    partsSuppliedCount: 78,
    status: 'active',
    lastIngestionAt: '25 min ago',
  },
  {
    id: 'SUP-VND-092',
    name: 'Nippon Precision Actuators & Sensors Co.',
    code: 'NPAS-JP',
    tier: 2,
    rating: 4.8,
    onTimeDeliveryRate: 96.9,
    riskScore: 'low',
    country: 'Japan',
    primaryContact: 'Taro Yamada',
    email: 't-yamada@npas-precision.co.jp',
    partsSuppliedCount: 31,
    status: 'active',
    lastIngestionAt: '42 min ago',
  },
  {
    id: 'SUP-VND-117',
    name: 'Vanguard Seals & Polymer Extrusions',
    code: 'VSP-MX',
    tier: 3,
    rating: 4.1,
    onTimeDeliveryRate: 91.2,
    riskScore: 'medium',
    country: 'Mexico',
    primaryContact: 'Carlos Mendez',
    email: 'carlos.m@vanguardseals.mx',
    partsSuppliedCount: 19,
    status: 'active',
    lastIngestionAt: '1h 10m ago',
  },
  {
    id: 'SUP-VND-125',
    name: 'Kirloskar Heavy Drives & Motor Corp',
    code: 'KHD-IN',
    tier: 1,
    rating: 4.7,
    onTimeDeliveryRate: 95.8,
    riskScore: 'low',
    country: 'India',
    primaryContact: 'Rajesh Sharma',
    email: 'r.sharma@kirloskardrives.in',
    partsSuppliedCount: 54,
    status: 'active',
    lastIngestionAt: '1h 35m ago',
  },
  {
    id: 'SUP-VND-133',
    name: 'Siemens Industrial Automation & Drives',
    code: 'SIEM-DE',
    tier: 1,
    rating: 4.9,
    onTimeDeliveryRate: 99.1,
    riskScore: 'low',
    country: 'Germany',
    primaryContact: 'Markus Weber',
    email: 'm.weber@siemens-industry.de',
    partsSuppliedCount: 96,
    status: 'active',
    lastIngestionAt: '2h 10m ago',
  },
  {
    id: 'SUP-VND-140',
    name: 'IFM Electronic Sensors & Vision Systems',
    code: 'IFM-DE',
    tier: 2,
    rating: 4.8,
    onTimeDeliveryRate: 97.8,
    riskScore: 'low',
    country: 'Germany',
    primaryContact: 'Klaus Fischer',
    email: 'k.fischer@ifm-electronic.com',
    partsSuppliedCount: 38,
    status: 'active',
    lastIngestionAt: '2h 45m ago',
  },
  {
    id: 'SUP-VND-152',
    name: 'Omron Industrial Controls Global',
    code: 'OMR-JP',
    tier: 2,
    rating: 4.7,
    onTimeDeliveryRate: 96.2,
    riskScore: 'low',
    country: 'Japan',
    primaryContact: 'Kenzo Tanaka',
    email: 'k.tanaka@omron-industrial.jp',
    partsSuppliedCount: 29,
    status: 'active',
    lastIngestionAt: '3h 15m ago',
  },
  {
    id: 'SUP-VND-161',
    name: 'SKF Precision Bearing Solutions',
    code: 'SKF-SE',
    tier: 1,
    rating: 4.9,
    onTimeDeliveryRate: 98.4,
    riskScore: 'low',
    country: 'Sweden',
    primaryContact: 'Astrid Lind',
    email: 'a.lind@skf-precision.se',
    partsSuppliedCount: 65,
    status: 'active',
    lastIngestionAt: '3h 40m ago',
  },
  {
    id: 'SUP-VND-170',
    name: 'Grundfos Industrial Pumping Systems',
    code: 'GRF-DK',
    tier: 2,
    rating: 4.6,
    onTimeDeliveryRate: 94.6,
    riskScore: 'medium',
    country: 'Denmark',
    primaryContact: 'Jens Nielsen',
    email: 'j.nielsen@grundfos-industrial.dk',
    partsSuppliedCount: 22,
    status: 'active',
    lastIngestionAt: '4h 00m ago',
  },
  {
    id: 'SUP-VND-184',
    name: 'Heidenhain Encoders & Metrology',
    code: 'HDN-DE',
    tier: 1,
    rating: 4.9,
    onTimeDeliveryRate: 98.9,
    riskScore: 'low',
    country: 'Germany',
    primaryContact: 'Stefan Bauer',
    email: 's.bauer@heidenhain-systems.de',
    partsSuppliedCount: 35,
    status: 'active',
    lastIngestionAt: '4h 30m ago',
  },
  {
    id: 'SUP-VND-192',
    name: 'ZF Wind & Industrial Transmission',
    code: 'ZF-DE',
    tier: 2,
    rating: 4.7,
    onTimeDeliveryRate: 95.3,
    riskScore: 'low',
    country: 'Germany',
    primaryContact: 'Helmut Braun',
    email: 'h.braun@zf-transmissions.de',
    partsSuppliedCount: 27,
    status: 'active',
    lastIngestionAt: '5h 10m ago',
  },
  {
    id: 'SUP-VND-205',
    name: 'Gates Power Transmission Systems',
    code: 'GTS-US',
    tier: 2,
    rating: 4.6,
    onTimeDeliveryRate: 93.8,
    riskScore: 'medium',
    country: 'United States',
    primaryContact: 'David Miller',
    email: 'd.miller@gates-drives.com',
    partsSuppliedCount: 40,
    status: 'active',
    lastIngestionAt: '5h 45m ago',
  },
  {
    id: 'SUP-VND-219',
    name: 'NSK Precision Motion & Bearings',
    code: 'NSK-JP',
    tier: 1,
    rating: 4.8,
    onTimeDeliveryRate: 97.1,
    riskScore: 'low',
    country: 'Japan',
    primaryContact: 'Hiroshi Sato',
    email: 'h.sato@nsk-precision.jp',
    partsSuppliedCount: 48,
    status: 'active',
    lastIngestionAt: '6h 00m ago',
  },
];

const INITIAL_TRANSFER_ORDERS: TransferOrder[] = [
  {
    id: 'TRF-8841',
    incidentId: 'INC-204',
    partId: 'BRG-204',
    partName: 'Spindle Bearing (Angular Contact)',
    quantity: 4,
    sourceFacility: 'FAC-C',
    sourceFacilityName: 'FAC-C (Hyderabad)',
    destinationFacility: 'FAC-A',
    destinationFacilityName: 'FAC-A (Chennai)',
    distanceKm: 183,
    distance: '183 km',
    eta: '4h 20m',
    status: 'IDLE',
    carrier: 'BlueDart Industrial Prime Logistics',
    createdAt: '2026-10-23T21:04:00Z',
    reason: 'Critical machine anomaly on M-204 with no local spare available at FAC-A.',
  },
];

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'ACT-901',
    timestamp: '2 mins ago',
    isoTimestamp: '2026-10-23T21:04:00Z',
    actor: 'Dinesh',
    actorRole: 'Operations Director',
    action: 'Inter-facility transfer initiated',
    category: 'DISPATCH',
    target: 'BRG-204 (4 units)',
    facility: 'FAC-C → FAC-A',
    status: 'SUCCESS',
    details: 'Dispatched expedited carrier for critical line mitigation.',
    link: '/incidents/INC-204',
    linkText: 'View transfer order',
  },
  {
    id: 'ACT-902',
    timestamp: '14 mins ago',
    isoTimestamp: '2026-10-23T21:02:00Z',
    actor: 'Telemetry Stream',
    actorRole: 'Edge Daemon',
    action: 'ISO-10816 threshold breach recorded',
    category: 'TELEMETRY',
    target: 'M-204 (Precision Spindle)',
    facility: 'FAC-A',
    status: 'CRITICAL',
    details: 'Vibration peaked at 8.7 mm/s RMS (safety threshold: 6.0 mm/s).',
    link: '/machines/M-204',
    linkText: 'Inspect telemetry',
  },
  {
    id: 'ACT-903',
    timestamp: '42 mins ago',
    isoTimestamp: '2026-10-23T20:30:00Z',
    actor: 'Inventory Engine',
    actorRole: 'Automated Audit',
    action: 'Distributed stock synchronization complete',
    category: 'INVENTORY',
    target: '4 Facilities (14 SKUs)',
    facility: 'Global Ledger',
    status: 'SUCCESS',
    details: 'All facility buffer states verified with zero ledger drift.',
    link: '/inventory',
    linkText: 'Check ledger',
  },
  {
    id: 'ACT-904',
    timestamp: '1h 10m ago',
    isoTimestamp: '2026-10-23T19:50:00Z',
    actor: 'Procurement Gateway',
    actorRole: 'Vendor Ingestion',
    action: 'Supplier B catalog harmonized',
    category: 'SYSTEM',
    target: 'SUP-B Inventory Feed',
    facility: 'FAC-D / FAC-B',
    status: 'INFO',
    details: 'Normalized 3 proprietary columns to canonical Common Data Model.',
    link: '/suppliers',
    linkText: 'View feed',
  },
  {
    id: 'ACT-905',
    timestamp: '2h 25m ago',
    isoTimestamp: '2026-10-23T18:35:00Z',
    actor: 'Sarah Chen',
    actorRole: 'Plant Engineer',
    action: 'Thermal sensor recalibrated',
    category: 'TELEMETRY',
    target: 'M-117 (Drive Motor)',
    facility: 'FAC-B',
    status: 'WARNING',
    details: 'Motor core operating temperature monitored at 81.2°C.',
    link: '/machines/M-117',
    linkText: 'Inspect machine',
  },
  {
    id: 'ACT-906',
    timestamp: '4h 00m ago',
    isoTimestamp: '2026-10-23T17:00:00Z',
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

export const INITIAL_OPERATIONAL_STATE: OperationalState = {
  machines: INITIAL_MACHINES,
  incidents: INITIAL_INCIDENTS,
  inventoryItems: INITIAL_INVENTORY_ITEMS,
  facilityStocks: INITIAL_FACILITY_STOCKS,
  suppliers: INITIAL_SUPPLIERS,
  transferOrders: INITIAL_TRANSFER_ORDERS,
  auditEvents: INITIAL_AUDIT_EVENTS,
  lastSyncTimestamp: new Date().toISOString(),
};

const STORAGE_KEY = 'trce_operational_store_v1';

// ==============================================================================
// PERSISTENT REACTIVE STORE IMPLEMENTATION
// ==============================================================================

class OperationalStoreService {
  private state: OperationalState;
  private listeners: Set<() => void> = new Set();
  private isSupabaseSyncInitialized: boolean = false;

  constructor() {
    this.state = { ...INITIAL_OPERATIONAL_STATE };
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      this.initSupabaseSync();
    }
  }

  private async initSupabaseSync() {
    if (this.isSupabaseSyncInitialized) return;
    this.isSupabaseSyncInitialized = true;

    try {
      // Lazy load sync service to avoid SSR conflicts
      const { supabaseSyncService } = await import('@/lib/supabase/sync-service');
      const isLive = await supabaseSyncService.checkConnection();
      if (!isLive) return;

      // 1. Fetch real-time tenant machines from Supabase
      const liveMachines = await supabaseSyncService.fetchMachines();
      if (liveMachines && liveMachines.length > 0) {
        this.state = {
          ...this.state,
          machines: this.deduplicateMachines(liveMachines),
        };
        this.notify();
      }

      // 2. Fetch real-time tenant incidents from Supabase
      const liveIncidents = await supabaseSyncService.fetchIncidents();
      if (liveIncidents && liveIncidents.length > 0) {
        this.state = {
          ...this.state,
          incidents: liveIncidents,
        };
        this.notify();
      }

      // 3. Listen to live PostgreSQL WebSocket broadcasts
      supabaseSyncService.subscribeToRealtimeChanges((table, payload) => {
        if (table === 'machines' && payload.new) {
          const m = payload.new;
          this.state = {
            ...this.state,
            machines: this.state.machines.map((old) =>
              old.id === m.id
                ? {
                    ...old,
                    vibrationMmS: m.vibration_mms ?? old.vibrationMmS,
                    temperatureC: m.temperature_c ?? old.temperatureC,
                    pressureBar: m.pressure_bar ?? old.pressureBar,
                    status: m.status ?? old.status,
                    healthScore: m.health_score ?? old.healthScore,
                  }
                : old
            ),
          };
          this.notify();
        }
      });
    } catch (e) {
      console.warn('Supabase sync initialization fallback to local:', e);
    }
  }

  private deduplicateMachines(machines: Machine[]): Machine[] {
    const seen = new Set<string>();
    return machines.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.machines)) {
          this.state = {
            ...INITIAL_OPERATIONAL_STATE,
            ...parsed,
            machines: this.deduplicateMachines(parsed.machines),
          };
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read operational store from storage', e);
    }
    this.state.machines = this.deduplicateMachines(this.state.machines);
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save operational store to storage', e);
    }
  }

  private notify() {
    this.state = {
      ...this.state,
      lastSyncTimestamp: new Date().toISOString(),
    };
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getState = (): OperationalState => {
    return this.state;
  };

  public getInitialState = (): OperationalState => {
    return INITIAL_OPERATIONAL_STATE;
  };

  // ----------------------------------------------------------------------------
  // MACHINE CRUD ACTIONS
  // ----------------------------------------------------------------------------
  public getMachines(): Machine[] {
    return this.state.machines;
  }

  public getMachineById(id: string): Machine | undefined {
    return this.state.machines.find((m) => m.id.toLowerCase() === id.toLowerCase());
  }

  public updateMachineTelemetry(
    machineId: string,
    telemetry: Partial<Pick<Machine, 'temperatureC' | 'vibrationMmS' | 'pressureBar' | 'rpm' | 'status' | 'healthScore'>>
  ) {
    this.state = {
      ...this.state,
      machines: this.state.machines.map((m) => {
        if (m.id.toLowerCase() !== machineId.toLowerCase()) return m;
        const newHistoryPoint: TelemetryPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: telemetry.temperatureC ?? m.temperatureC,
          vibration: telemetry.vibrationMmS ?? m.vibrationMmS,
          pressure: telemetry.pressureBar ?? m.pressureBar,
          rpm: telemetry.rpm ?? m.rpm,
        };
        return {
          ...m,
          ...telemetry,
          lastUpdate: 'Just now',
          history: [...m.history.slice(-10), newHistoryPoint],
        };
      }),
    };
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // INCIDENT CRUD ACTIONS
  // ----------------------------------------------------------------------------
  public getIncidents(): Incident[] {
    return this.state.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.state.incidents.find((i) => i.id.toLowerCase() === id.toLowerCase());
  }

  public updateIncidentStatus(incidentId: string, status: IncidentStatus) {
    this.state = {
      ...this.state,
      incidents: this.state.incidents.map((inc) =>
        inc.id.toLowerCase() === incidentId.toLowerCase()
          ? { ...inc, status, updatedAt: new Date().toISOString() }
          : inc
      ),
    };
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // INVENTORY & FACILITY STOCK CRUD ACTIONS
  // ----------------------------------------------------------------------------
  public getFacilityStocks(): FacilityStock[] {
    return this.state.facilityStocks;
  }

  public getStocksByPartId(partId: string): FacilityStock[] {
    return this.state.facilityStocks.filter(
      (s) => s.partId.toLowerCase() === partId.toLowerCase()
    );
  }

  public updateFacilityStock(facilityId: string, partId: string, quantity: number) {
    const status: InventoryStatus =
      quantity === 0 ? 'CRITICAL' : quantity <= 2 ? 'LOW STOCK' : 'AVAILABLE';

    this.state = {
      ...this.state,
      facilityStocks: this.state.facilityStocks.map((stock) => {
        if (
          stock.facilityId.toLowerCase() === facilityId.toLowerCase() &&
          stock.partId.toLowerCase() === partId.toLowerCase()
        ) {
          return {
            ...stock,
            quantity,
            status,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return stock;
      }),
    };
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // TRANSFER ORDER ACTIONS
  // ----------------------------------------------------------------------------
  public getTransferOrders(): TransferOrder[] {
    return this.state.transferOrders;
  }

  public openTransferConfirmation(orderId?: string) {
    this.state = {
      ...this.state,
      transferOrders: this.state.transferOrders.map((o) =>
        !orderId || o.id === orderId ? { ...o, status: 'CONFIRMING' as TransferStatus } : o
      ),
    };
    this.notify();
  }

  public cancelTransferConfirmation(orderId?: string) {
    this.state = {
      ...this.state,
      transferOrders: this.state.transferOrders.map((o) =>
        !orderId || o.id === orderId ? { ...o, status: 'IDLE' as TransferStatus } : o
      ),
    };
    this.notify();
  }

  public approveAndDispatchTransfer(orderId?: string, manifestHash?: string) {
    const order = this.state.transferOrders.find(
      (o) => !orderId || o.id === orderId || o.id === 'TRF-8841'
    );
    if (!order) return;

    const sourceFac = order.sourceFacility;
    const destFac = order.destinationFacility;
    const partId = order.partId;
    const qty = order.quantity;
    const effectiveOrderId = orderId || order.id || 'TRF-8841';

    // Mutate facility stocks:
    // Source facility decrements by qty
    // Destination facility increases by qty (marked in transit)
    const updatedStocks = this.state.facilityStocks.map((stock) => {
      if (stock.partId.toLowerCase() === partId.toLowerCase()) {
        if (stock.facilityId.toLowerCase() === sourceFac.toLowerCase()) {
          const newQty = Math.max(0, stock.quantity - qty);
          return {
            ...stock,
            quantity: newQty,
            status: (newQty === 0 ? 'CRITICAL' : newQty <= 2 ? 'LOW STOCK' : 'AVAILABLE') as InventoryStatus,
            lastUpdated: 'Just now',
          };
        }
        if (stock.facilityId.toLowerCase() === destFac.toLowerCase()) {
          const newQty = stock.quantity + qty;
          return {
            ...stock,
            quantity: newQty,
            status: (newQty === 0 ? 'CRITICAL' : newQty <= 2 ? 'LOW STOCK' : 'AVAILABLE') as InventoryStatus,
            lastUpdated: 'Just now (In Transit)',
          };
        }
      }
      return stock;
    });

    const nowIso = new Date().toISOString();

    // Update transfer order status
    const updatedOrders = this.state.transferOrders.map((o) =>
      o.id === order.id || o.id === effectiveOrderId
        ? {
            ...o,
            id: effectiveOrderId,
            status: 'IN_TRANSIT' as TransferStatus,
            dispatchedAt: nowIso,
            verificationHash: manifestHash,
          }
        : o
    );

    // Update incident status
    const updatedIncidents = this.state.incidents.map((inc) =>
      inc.id === order.incidentId
        ? {
            ...inc,
            status: 'mitigated' as IncidentStatus,
            updatedAt: nowIso,
          }
        : inc
    );

    // Append Audit Event with SHA-256 Manifest details
    const hashSummary = manifestHash
      ? ` SHA-256 Manifest: ${manifestHash.slice(0, 16)}...${manifestHash.slice(-8)}`
      : '';

    const newAuditEvent: AuditEvent = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      isoTimestamp: nowIso,
      actor: 'Operations Director',
      actorRole: 'Controller',
      action: `Inter-facility transfer dispatched (${effectiveOrderId})`,
      category: 'DISPATCH',
      target: `${partId} (${qty} units)`,
      facility: `${sourceFac} → ${destFac}`,
      status: 'SUCCESS',
      details: `Expedited carrier in transit (183 km · ETA ${order.eta}). Mitigated ${order.incidentId}.${hashSummary}`,
      link: `/incidents/${order.incidentId}`,
      linkText: 'Inspect transfer order',
    };

    this.state = {
      ...this.state,
      facilityStocks: updatedStocks,
      transferOrders: updatedOrders,
      incidents: updatedIncidents,
      auditEvents: [newAuditEvent, ...this.state.auditEvents],
    };
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // SUPPLIER INGESTION / HARMONIZATION ACTION
  // ----------------------------------------------------------------------------
  public ingestSupplierFeedRecords(
    supplierName: string,
    records: Array<{ partId: string; quantity: number; location: string; status: string }>
  ) {
    const updatedStocks = [...this.state.facilityStocks];

    records.forEach((rec) => {
      const existingIdx = updatedStocks.findIndex(
        (s) =>
          s.partId.toLowerCase() === rec.partId.toLowerCase() &&
          s.facilityId.toLowerCase() === rec.location.toLowerCase()
      );

      const status: InventoryStatus =
        rec.status === 'AVAILABLE' ? 'AVAILABLE' : rec.status === 'LOW STOCK' ? 'LOW STOCK' : 'CRITICAL';

      if (existingIdx >= 0) {
        updatedStocks[existingIdx] = {
          ...updatedStocks[existingIdx],
          quantity: rec.quantity,
          status,
          lastUpdated: 'Just now',
        };
      } else {
        updatedStocks.push({
          id: `STK-${rec.location}-${rec.partId}`,
          partId: rec.partId,
          partName: rec.partId,
          sku: rec.partId,
          category: 'Standard',
          facilityId: rec.location,
          facilityName: rec.location,
          city: rec.location,
          quantity: rec.quantity,
          minSafetyStock: 2,
          maxStockLevel: 20,
          reorderPoint: 4,
          status,
          lastUpdated: 'Just now',
          binLocation: 'Dock Receiving',
        });
      }
    });

    const newAuditEvent: AuditEvent = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      isoTimestamp: new Date().toISOString(),
      actor: 'Harmonization Pipeline',
      actorRole: 'Ingestion Engine',
      action: 'Supplier feed synchronized',
      category: 'INVENTORY',
      target: `${records.length} parts from ${supplierName}`,
      facility: 'Global Ledger',
      status: 'SUCCESS',
      details: `Ingested ${records.length} standardized inventory balances into active ledger.`,
      link: '/suppliers',
      linkText: 'Inspect feed',
    };

    this.state = {
      ...this.state,
      facilityStocks: updatedStocks,
      auditEvents: [newAuditEvent, ...this.state.auditEvents],
    };
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // REAL-TIME TELEMETRY INJECTION & EVALUATION ACTION
  // ----------------------------------------------------------------------------
  public injectMachineTelemetry(
    machineId: string,
    payload: {
      vibration: number;
      temperature: number;
      pressure?: number;
      rpm?: number;
      time?: string;
    }
  ) {
    const machine = this.state.machines.find(
      (m) => m.id.toLowerCase() === machineId.toLowerCase()
    );
    if (!machine) return;

    const evaluation = evaluateTelemetryPayload(payload);

    const now = new Date();
    const timeLabel =
      payload.time ||
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const newPoint: TelemetryPoint = {
      time: timeLabel,
      temperature: Number(payload.temperature.toFixed(1)),
      vibration: Number(payload.vibration.toFixed(1)),
      pressure: Number((payload.pressure ?? machine.pressureBar).toFixed(1)),
      rpm: Math.round(payload.rpm ?? machine.rpm),
    };

    const updatedHistory = [...(machine.history || []), newPoint].slice(-15);

    const updatedMachine: Machine = {
      ...machine,
      vibrationMmS: newPoint.vibration,
      temperatureC: newPoint.temperature,
      pressureBar: newPoint.pressure,
      rpm: newPoint.rpm,
      status: evaluation.machineStatus,
      healthScore: Math.max(
        10,
        Math.min(100, Math.round(100 - evaluation.bearingFailureProbability * 0.85))
      ),
      lastUpdate: 'Just now',
      history: updatedHistory,
    };

    const incidentId = machineId === 'M-204' ? 'INC-204' : `INC-${machineId.replace(/^M-?/, '')}`;
    const updatedIncidents = [...this.state.incidents];
    const existingIdx = updatedIncidents.findIndex(
      (i) => i.id === incidentId || i.machineId.toLowerCase() === machineId.toLowerCase()
    );
    const newAuditEvents = [...this.state.auditEvents];

    if (evaluation.status === 'CRITICAL') {
      if (existingIdx >= 0) {
        updatedIncidents[existingIdx] = {
          ...updatedIncidents[existingIdx],
          status: 'open',
          severity: 'critical',
          updatedAt: now.toISOString(),
          metricBreach: `Vibration ${newPoint.vibration} mm/s, Temp ${newPoint.temperature}°C (Failure risk: ${evaluation.bearingFailureProbability}%)`,
          description: evaluation.diagnosticSummary,
        };
      } else {
        updatedIncidents.unshift({
          id: incidentId,
          title: `${machine.name}: Spindle Bearing Critical Anomaly`,
          severity: 'critical',
          status: 'open',
          facilityId: machine.facilityId,
          facilityName: machine.facilityName,
          machineId: machine.id,
          machineName: machine.name,
          category: 'mechanical',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          description: evaluation.diagnosticSummary,
          assignedTo: 'Automated Dispatch System',
          componentId: 'BRG-204',
          componentName: 'BRG-204 Bearing',
          metricBreach: `Vibration ${newPoint.vibration} mm/s & Temp ${newPoint.temperature}°C`,
          recommendedSource: 'FAC-C',
          eta: '2.4 hrs',
        });
      }

      newAuditEvents.unshift({
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        isoTimestamp: now.toISOString(),
        actor: 'Trce Telemetry Engine',
        actorRole: 'Autonomous Diagnostic Daemon',
        action: 'Automated threshold breach detected',
        category: 'TELEMETRY',
        target: `${machine.id} (${machine.name})`,
        facility: machine.facilityName,
        status: 'CRITICAL',
        details: `Critical telemetry excursion: vibration ${newPoint.vibration} mm/s (limit 6.0), temp ${newPoint.temperature}°C (limit 75°C). BRG-204 root-cause probability: ${evaluation.bearingFailureProbability}%.`,
        link: `/machines/${machine.id}`,
        linkText: 'Inspect telemetry',
      });
    } else if (evaluation.status === 'WARNING') {
      if (existingIdx >= 0) {
        updatedIncidents[existingIdx] = {
          ...updatedIncidents[existingIdx],
          severity: 'medium',
          updatedAt: now.toISOString(),
          metricBreach: `Vibration ${newPoint.vibration} mm/s, Temp ${newPoint.temperature}°C`,
        };
      } else {
        updatedIncidents.unshift({
          id: incidentId,
          title: `${machine.name}: Telemetry Threshold Warning`,
          severity: 'medium',
          status: 'investigating',
          facilityId: machine.facilityId,
          facilityName: machine.facilityName,
          machineId: machine.id,
          machineName: machine.name,
          category: 'mechanical',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          description: evaluation.diagnosticSummary,
          assignedTo: 'Lead Reliability Engineer',
          componentId: 'BRG-204',
          componentName: 'BRG-204 Bearing',
          metricBreach: `Vibration ${newPoint.vibration} mm/s & Temp ${newPoint.temperature}°C`,
          recommendedSource: 'FAC-C',
          eta: '4.5 hrs',
        });
      }

      newAuditEvents.unshift({
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        isoTimestamp: now.toISOString(),
        actor: 'Trce Telemetry Engine',
        actorRole: 'Autonomous Diagnostic Daemon',
        action: 'Operational warning triggered',
        category: 'TELEMETRY',
        target: `${machine.id} (${machine.name})`,
        facility: machine.facilityName,
        status: 'WARNING',
        details: `Elevated sensor parameters: vibration ${newPoint.vibration} mm/s, temp ${newPoint.temperature}°C. BRG-204 risk: ${evaluation.bearingFailureProbability}%.`,
        link: `/machines/${machine.id}`,
        linkText: 'Inspect telemetry',
      });
    } else {
      // NOMINAL: If previously open, mark mitigated
      if (existingIdx >= 0 && updatedIncidents[existingIdx].status === 'open') {
        updatedIncidents[existingIdx] = {
          ...updatedIncidents[existingIdx],
          status: 'mitigated',
          updatedAt: now.toISOString(),
          metricBreach: `Normalized: Vibration ${newPoint.vibration} mm/s, Temp ${newPoint.temperature}°C`,
        };
      }
    }

    this.state = {
      ...this.state,
      machines: this.state.machines.map((m) =>
        m.id.toLowerCase() === machineId.toLowerCase() ? updatedMachine : m
      ),
      incidents: updatedIncidents,
      auditEvents: newAuditEvents,
      lastSyncTimestamp: now.toISOString(),
    };
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // ENTERPRISE RESTORATION
  // ----------------------------------------------------------------------------
  public restoreBaseline() {
    this.state = {
      machines: INITIAL_MACHINES.map((m) => ({ ...m })),
      incidents: INITIAL_INCIDENTS.map((i) => ({ ...i })),
      inventoryItems: INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item })),
      facilityStocks: INITIAL_FACILITY_STOCKS.map((s) => ({ ...s })),
      suppliers: INITIAL_SUPPLIERS.map((sup) => ({ ...sup })),
      transferOrders: INITIAL_TRANSFER_ORDERS.map((o) => ({ ...o })),
      auditEvents: INITIAL_AUDIT_EVENTS.map((a) => ({ ...a })),
      lastSyncTimestamp: new Date().toISOString(),
    };
    this.notify();
  }
}

export const operationalStore = new OperationalStoreService();

// ==============================================================================
// REACT HOOKS FOR REACTIVE COMPUTATIONS & AUTO-SUBSCRIPTION
// ==============================================================================

export function useOperationalStore(): OperationalState {
  return useSyncExternalStore(
    operationalStore.subscribe,
    operationalStore.getState,
    operationalStore.getInitialState
  );
}

export function useOperationalMetrics() {
  const state = useOperationalStore();

  const machines = state.machines;
  const criticalMachines = machines.filter((m) => m.status === 'critical').length;
  const warningMachines = machines.filter((m) => m.status === 'warning').length;
  const healthyMachines = machines.filter((m) => m.status === 'operational').length;
  const attentionMachines = criticalMachines + warningMachines;

  const incidents = state.incidents;
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const criticalIncidents = activeIncidents.filter(
    (i) => i.severity === 'critical' || i.severity === 'high'
  ).length;

  const facilityStocks = state.facilityStocks;
  const totalStockUnits = facilityStocks.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockCount = facilityStocks.filter(
    (s) => s.status === 'CRITICAL' || s.status === 'LOW STOCK'
  ).length;

  const suppliers = state.suppliers;
  const activeSuppliers = suppliers.filter((s) => s.status === 'active').length;

  return {
    machines,
    machinesCount: machines.length,
    attentionMachines,
    criticalMachines,
    warningMachines,
    healthyMachines,
    incidents,
    activeIncidents,
    activeIncidentsCount: activeIncidents.length,
    criticalIncidents,
    criticalIncidentsCount: criticalIncidents,
    facilityStocks,
    totalStockUnits,
    lowStockCount,
    suppliers,
    suppliersCount: suppliers.length,
    activeSuppliers,
    transferOrders: state.transferOrders,
    primaryTransferOrder: state.transferOrders[0],
    auditEvents: state.auditEvents,
  };
}
