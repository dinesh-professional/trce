import { operationalStore } from '../operational-store';

export interface FacilityLocation {
  id: string;
  name: string;
  city: string;
  state?: string;
  coordinates: { lat: number; lng: number };
}

export const FACILITY_LOCATIONS: Record<string, FacilityLocation> = {
  'FAC-A': {
    id: 'FAC-A',
    name: 'FAC-A (Chennai Heavy Stamping & Assembly)',
    city: 'Chennai',
    coordinates: { lat: 13.0827, lng: 80.2707 },
  },
  'FAC-B': {
    id: 'FAC-B',
    name: 'FAC-B (Bengaluru Precision Machining Hub)',
    city: 'Bengaluru',
    coordinates: { lat: 12.9716, lng: 77.5946 },
  },
  'FAC-C': {
    id: 'FAC-C',
    name: 'FAC-C (Hyderabad Logistics & Spare Depot)',
    city: 'Hyderabad',
    coordinates: { lat: 17.3850, lng: 78.4867 },
  },
  'FAC-D': {
    id: 'FAC-D',
    name: 'FAC-D (Pune Robotics & Fabrication Plant)',
    city: 'Pune',
    coordinates: { lat: 18.5204, lng: 73.8567 },
  },
};

export interface PartMetadata {
  partId: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  minBuffer: number;
}

export const PART_METADATA: Record<string, PartMetadata> = {
  'BRG-204': {
    partId: 'BRG-204',
    name: 'Bearing',
    sku: 'SKF-BRG-204',
    description: 'Angular contact precision ball bearing for CNC & spindle units',
    category: 'Bearings',
    minBuffer: 3,
  },
  'MTR-102': {
    partId: 'MTR-102',
    name: 'Motor',
    sku: 'SIEM-MTR-102',
    description: 'Industrial 3-Phase servo drive motor 15kW',
    category: 'Electrical',
    minBuffer: 2,
  },
  'VLV-301': {
    partId: 'VLV-301',
    name: 'Hydraulic Valve',
    sku: 'RXT-VLV-301',
    description: 'Proportional directional control valve 350 bar',
    category: 'Hydraulics',
    minBuffer: 2,
  },
  'SNS-401': {
    partId: 'SNS-401',
    name: 'Vibration Sensor',
    sku: 'IFM-VSA-401',
    description: 'High-frequency piezoelectric vibration sensor core',
    category: 'Sensors',
    minBuffer: 4,
  },
};

export interface InventoryItemRecord {
  partId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  facility: string;
  facilityCity: string;
  quantity: number;
  status: 'CRITICAL' | 'LOW STOCK' | 'AVAILABLE';
  lastUpdated: string;
}

// Master inventory database across FAC-A, FAC-B, FAC-C, FAC-D
export const masterInventoryRecords: InventoryItemRecord[] = [
  // BRG-204 Bearing (Critical Part)
  {
    partId: 'BRG-204',
    sku: 'SKF-BRG-204',
    name: 'Bearing',
    description: 'Angular contact precision ball bearing for CNC & spindle units',
    category: 'Bearings',
    facility: 'FAC-A',
    facilityCity: 'Chennai',
    quantity: 0,
    status: 'CRITICAL',
    lastUpdated: '2026-10-23 21:02',
  },
  {
    partId: 'BRG-204',
    sku: 'SKF-BRG-204',
    name: 'Bearing',
    description: 'Angular contact precision ball bearing for CNC & spindle units',
    category: 'Bearings',
    facility: 'FAC-B',
    facilityCity: 'Bengaluru',
    quantity: 2,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 20:45',
  },
  {
    partId: 'BRG-204',
    sku: 'SKF-BRG-204',
    name: 'Bearing',
    description: 'Angular contact precision ball bearing for CNC & spindle units',
    category: 'Bearings',
    facility: 'FAC-C',
    facilityCity: 'Hyderabad',
    quantity: 4,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 21:00',
  },
  {
    partId: 'BRG-204',
    sku: 'SKF-BRG-204',
    name: 'Bearing',
    description: 'Angular contact precision ball bearing for CNC & spindle units',
    category: 'Bearings',
    facility: 'FAC-D',
    facilityCity: 'Pune',
    quantity: 7,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:30',
  },

  // MTR-102 Motor
  {
    partId: 'MTR-102',
    sku: 'SIEM-MTR-102',
    name: 'Motor',
    description: 'Industrial 3-Phase servo drive motor 15kW',
    category: 'Electrical',
    facility: 'FAC-A',
    facilityCity: 'Chennai',
    quantity: 1,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 18:00',
  },
  {
    partId: 'MTR-102',
    sku: 'SIEM-MTR-102',
    name: 'Motor',
    description: 'Industrial 3-Phase servo drive motor 15kW',
    category: 'Electrical',
    facility: 'FAC-B',
    facilityCity: 'Bengaluru',
    quantity: 2,
    status: 'LOW STOCK',
    lastUpdated: '2026-10-23 20:30',
  },
  {
    partId: 'MTR-102',
    sku: 'SIEM-MTR-102',
    name: 'Motor',
    description: 'Industrial 3-Phase servo drive motor 15kW',
    category: 'Electrical',
    facility: 'FAC-C',
    facilityCity: 'Hyderabad',
    quantity: 5,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 20:00',
  },
  {
    partId: 'MTR-102',
    sku: 'SIEM-MTR-102',
    name: 'Motor',
    description: 'Industrial 3-Phase servo drive motor 15kW',
    category: 'Electrical',
    facility: 'FAC-D',
    facilityCity: 'Pune',
    quantity: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 17:15',
  },

  // VLV-301 Hydraulic Valve
  {
    partId: 'VLV-301',
    sku: 'RXT-VLV-301',
    name: 'Hydraulic Valve',
    description: 'Proportional directional control valve 350 bar',
    category: 'Hydraulics',
    facility: 'FAC-A',
    facilityCity: 'Chennai',
    quantity: 0,
    status: 'CRITICAL',
    lastUpdated: '2026-10-23 16:30',
  },
  {
    partId: 'VLV-301',
    sku: 'RXT-VLV-301',
    name: 'Hydraulic Valve',
    description: 'Proportional directional control valve 350 bar',
    category: 'Hydraulics',
    facility: 'FAC-B',
    facilityCity: 'Bengaluru',
    quantity: 3,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:10',
  },
  {
    partId: 'VLV-301',
    sku: 'RXT-VLV-301',
    name: 'Hydraulic Valve',
    description: 'Proportional directional control valve 350 bar',
    category: 'Hydraulics',
    facility: 'FAC-C',
    facilityCity: 'Hyderabad',
    quantity: 6,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 18:45',
  },

  // SNS-401 Vibration Sensor
  {
    partId: 'SNS-401',
    sku: 'IFM-VSA-401',
    name: 'Vibration Sensor',
    description: 'High-frequency piezoelectric vibration sensor core',
    category: 'Sensors',
    facility: 'FAC-A',
    facilityCity: 'Chennai',
    quantity: 8,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 21:01',
  },
  {
    partId: 'SNS-401',
    sku: 'IFM-VSA-401',
    name: 'Vibration Sensor',
    description: 'High-frequency piezoelectric vibration sensor core',
    category: 'Sensors',
    facility: 'FAC-B',
    facilityCity: 'Bengaluru',
    quantity: 12,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 20:50',
  },
  {
    partId: 'SNS-401',
    sku: 'IFM-VSA-401',
    name: 'Vibration Sensor',
    description: 'High-frequency piezoelectric vibration sensor core',
    category: 'Sensors',
    facility: 'FAC-C',
    facilityCity: 'Hyderabad',
    quantity: 15,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 19:00',
  },
  {
    partId: 'SNS-401',
    sku: 'IFM-VSA-401',
    name: 'Vibration Sensor',
    description: 'High-frequency piezoelectric vibration sensor core',
    category: 'Sensors',
    facility: 'FAC-D',
    facilityCity: 'Pune',
    quantity: 4,
    status: 'AVAILABLE',
    lastUpdated: '2026-10-23 18:20',
  },
];

/**
 * Seeded logistics distances and transit times between facilities.
 * Matches specific requirement: FAC-C to FAC-A = 183 km, ETA: 4h 20m.
 */
export const SEEDED_DISTANCES: Record<string, Record<string, { distanceKm: number; eta: string }>> = {
  'FAC-A': {
    'FAC-B': { distanceKm: 346, eta: '6h 15m' },
    'FAC-C': { distanceKm: 183, eta: '4h 20m' }, // Requirement target: 183 km, 4h 20m
    'FAC-D': { distanceKm: 914, eta: '16h 30m' },
  },
  'FAC-B': {
    'FAC-A': { distanceKm: 346, eta: '6h 15m' },
    'FAC-C': { distanceKm: 569, eta: '9h 45m' },
    'FAC-D': { distanceKm: 835, eta: '14h 20m' },
  },
  'FAC-C': {
    'FAC-A': { distanceKm: 183, eta: '4h 20m' },
    'FAC-B': { distanceKm: 569, eta: '9h 45m' },
    'FAC-D': { distanceKm: 548, eta: '9h 10m' },
  },
  'FAC-D': {
    'FAC-A': { distanceKm: 914, eta: '16h 30m' },
    'FAC-B': { distanceKm: 835, eta: '14h 20m' },
    'FAC-C': { distanceKm: 548, eta: '9h 10m' },
  },
};

export interface CandidateSource {
  facility: string;
  facilityName: string;
  city: string;
  quantity: number;
  distanceKm: number;
  estimatedTransitTime: string;
  isDestination: boolean;
  isZeroStock: boolean;
  score: number;
  isRecommended: boolean;
  status: 'CRITICAL' | 'LOW STOCK' | 'AVAILABLE';
  rejectionReason?: string;
}

export interface TraceResult {
  success: boolean;
  partId: string;
  partName?: string;
  description?: string;
  destinationFacility: string;
  destinationCity: string;
  destinationStock: number;
  recommendedSource?: CandidateSource;
  candidateSources: CandidateSource[];
  totalNetworkStock: number;
  reasoning: string[];
  error?: string;
}

export function getActiveInventoryRecords(): InventoryItemRecord[] {
  if (typeof window !== 'undefined') {
    const liveStocks = operationalStore.getState().facilityStocks;
    if (liveStocks && liveStocks.length > 0) {
      return liveStocks.map((s) => ({
        partId: s.partId,
        sku: s.sku,
        name: s.partName,
        description: PART_METADATA[s.partId]?.description ?? s.category,
        category: s.category,
        facility: s.facilityId,
        facilityCity: s.city,
        quantity: s.quantity,
        status: s.status,
        lastUpdated: s.lastUpdated,
      }));
    }
  }
  return masterInventoryRecords;
}

/**
 * Traces a spare part across distributed facilities and deterministically identifies the best source.
 * 1. Finds matching inventory.
 * 2. Removes destination facility from source candidates.
 * 3. Ignores zero-stock locations.
 * 4. Ranks available locations.
 * 5. Returns the recommended source.
 */
export function traceSparePart(
  partId: string,
  destinationFacility: string = 'FAC-A'
): TraceResult {
  const normalizedPartId = partId.trim().toUpperCase();
  const normalizedDest = destinationFacility.trim().toUpperCase();

  // 1. Find matching inventory from active operational store
  const activeRecords = getActiveInventoryRecords();
  const matchingRecords = activeRecords.filter(
    (item) => item.partId.toUpperCase() === normalizedPartId
  );

  if (matchingRecords.length === 0) {
    return {
      success: false,
      partId: normalizedPartId,
      destinationFacility: normalizedDest,
      destinationCity: FACILITY_LOCATIONS[normalizedDest]?.city ?? 'Unknown',
      destinationStock: 0,
      candidateSources: [],
      totalNetworkStock: 0,
      reasoning: [],
      error: 'No matching spare found',
    };
  }

  const primaryItem = matchingRecords[0];
  const destRecord = matchingRecords.find((r) => r.facility === normalizedDest);
  const destStock = destRecord ? destRecord.quantity : 0;
  const totalNetworkStock = matchingRecords.reduce((acc, r) => acc + r.quantity, 0);

  // 2. Remove destination facility and 3. Ignore zero-stock locations
  const candidates: CandidateSource[] = [];

  for (const record of matchingRecords) {
    const loc = FACILITY_LOCATIONS[record.facility] || {
      id: record.facility,
      name: record.facility,
      city: record.facilityCity,
      coordinates: { lat: 0, lng: 0 },
    };

    const isDest = record.facility === normalizedDest;
    const isZero = record.quantity === 0;

    // Logistics metrics
    const logistics =
      SEEDED_DISTANCES[normalizedDest]?.[record.facility] ||
      SEEDED_DISTANCES[record.facility]?.[normalizedDest] ||
      { distanceKm: 500, eta: '8h 00m' };

    let rejectionReason: string | undefined;
    if (isDest) rejectionReason = 'Current destination facility (depleted)';
    else if (isZero) rejectionReason = 'Zero inventory on hand (out of stock)';

    // Scoring algorithm:
    // Base score prioritizes stock adequacy (>2 units preserves safety threshold)
    // Distance penalty ensures fastest transit time
    let score = 0;
    if (!isDest && !isZero) {
      const stockFactor = record.quantity > 2 ? 100 : 40; // Avoid depleting a low-stock site
      const distanceFactor = Math.max(0, 500 - logistics.distanceKm / 2);
      score = stockFactor + distanceFactor;
    }

    candidates.push({
      facility: record.facility,
      facilityName: loc.name,
      city: loc.city,
      quantity: record.quantity,
      distanceKm: isDest ? 0 : logistics.distanceKm,
      estimatedTransitTime: isDest ? '0h' : logistics.eta,
      isDestination: isDest,
      isZeroStock: isZero,
      score,
      isRecommended: false,
      status: record.status,
      rejectionReason,
    });
  }

  // Filter valid sources (non-destination, non-zero stock)
  const validSources = candidates.filter((c) => !c.isDestination && !c.isZeroStock);

  // 4. Rank available locations by score
  validSources.sort((a, b) => b.score - a.score);

  // 5. Select recommended source
  const recommended = validSources.length > 0 ? validSources[0] : undefined;
  if (recommended) {
    recommended.isRecommended = true;
  }

  // Exact deterministic reasoning as required by specification
  const reasoning = recommended
    ? [
        'Exact part match',
        'Available stock',
        'Suitable source facility',
        'Efficient transfer distance',
        'Supports current incident urgency',
      ]
    : ['No suitable alternate facility with available stock found across network'];

  return {
    success: true,
    partId: primaryItem.partId,
    partName: primaryItem.name,
    description: primaryItem.description,
    destinationFacility: normalizedDest,
    destinationCity: FACILITY_LOCATIONS[normalizedDest]?.city ?? 'Chennai',
    destinationStock: destStock,
    recommendedSource: recommended,
    candidateSources: candidates,
    totalNetworkStock,
    reasoning,
  };
}
