/**
 * TRCE Algorithmic Downtime Cost & Multi-Variable Routing Engine
 * Module 08: Financial Exposure & Sourcing Optimization
 */

export interface FacilityLogisticsConfig {
  facilityId: string;
  facilityName: string;
  city: string;
  distanceKm: number;
  defaultStock: number;
}

export interface FacilityRouteAnalysis {
  facilityId: string;
  facilityName: string;
  city: string;
  distanceKm: number;
  stockQty: number;
  requiredQty: number;
  isViable: boolean;
  viabilityStatus: 'OPTIMAL' | 'VIABLE' | 'INSUFFICIENT' | 'DESTINATION';
  viabilityReason: string;
  isOptimal: boolean;
  transitHours: number;
  formattedEta: string;
  downtimeCost: number;
  freightCost: number;
  totalFinancialExposure: number;
  netSavingsVsNextBest: number;
  netSavingsVsOem: number;
}

export interface RoutingOptimizationResult {
  destinationFacility: string;
  destinationFacilityName: string;
  partId: string;
  requiredQty: number;
  hourlyDowntimeRate: number;
  routes: FacilityRouteAnalysis[];
  optimalRoute: FacilityRouteAnalysis | null;
  nextBestRoute: FacilityRouteAnalysis | null;
  oemBaseline: {
    leadTimeHours: number;
    downtimeCost: number;
    freightCost: number;
    totalExposure: number;
    formattedEta: string;
  };
  totalNetSavings: number;
  downtimeReductionHours: number;
}

export const ROUTING_CONSTANTS = {
  destinationFacility: 'FAC-A',
  destinationFacilityName: 'Chennai Assembly Plant',
  hourlyDowntimeRate: 14500, // $14,500 / hour unscheduled downtime
  requiredQty: 4, // 4 units of BRG-204 required
  carrierAverageSpeedKmH: 42.2, // 42.2 km/h commercial transit speed
  baseDispatchFee: 150, // $150 base dispatch
  freightRatePerKm: 2.55, // $2.55 / km expedited road transit
  oemLeadTimeHours: 24.0, // 24 hours standard OEM lead time
  oemExpeditedFreightCost: 450, // $450 OEM courier
  candidates: [
    {
      facilityId: 'FAC-B',
      facilityName: 'Bengaluru Machining Hub',
      city: 'Bengaluru',
      distanceKm: 95,
      defaultStock: 2,
    },
    {
      facilityId: 'FAC-C',
      facilityName: 'Hyderabad Logistics Depot',
      city: 'Hyderabad',
      distanceKm: 183,
      defaultStock: 4,
    },
    {
      facilityId: 'FAC-D',
      facilityName: 'Pune Stamping Works',
      city: 'Pune',
      distanceKm: 410,
      defaultStock: 7,
    },
  ] as FacilityLogisticsConfig[],
};

/**
 * Format hours into clean readable ETA string: e.g. "4h 20m"
 */
export function formatTransitEta(hoursFloat: number): string {
  if (hoursFloat <= 0) return '0m';
  const totalMinutes = Math.round(hoursFloat * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Format currency with full USD formatting: e.g. $63,496
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates multi-variable routing financial exposure and sourcing optimization.
 * Accepts active facility stock mapping from the operational store.
 */
export function calculateSourcingOptimization(
  stockOverrides?: Record<string, number>,
  partId = 'BRG-204',
  requiredQty = ROUTING_CONSTANTS.requiredQty,
  hourlyDowntimeRate = ROUTING_CONSTANTS.hourlyDowntimeRate
): RoutingOptimizationResult {
  const oemDowntimeCost = ROUTING_CONSTANTS.oemLeadTimeHours * hourlyDowntimeRate;
  const oemFreightCost = ROUTING_CONSTANTS.oemExpeditedFreightCost;
  const oemTotalExposure = oemDowntimeCost + oemFreightCost;

  // Evaluate candidate routes
  const candidateCalculations = ROUTING_CONSTANTS.candidates.map((cand) => {
    const stockQty =
      stockOverrides && typeof stockOverrides[cand.facilityId] === 'number'
        ? stockOverrides[cand.facilityId]
        : cand.defaultStock;

    const transitHours = cand.distanceKm / ROUTING_CONSTANTS.carrierAverageSpeedKmH;
    const freightCost =
      ROUTING_CONSTANTS.baseDispatchFee + cand.distanceKm * ROUTING_CONSTANTS.freightRatePerKm;
    const downtimeCost = transitHours * hourlyDowntimeRate;
    const totalFinancialExposure = downtimeCost + freightCost;

    const isViable = stockQty >= requiredQty;
    let viabilityReason = 'Surplus inventory verified. Ready for immediate dispatch.';
    let viabilityStatus: FacilityRouteAnalysis['viabilityStatus'] = 'VIABLE';

    if (!isViable) {
      viabilityStatus = 'INSUFFICIENT';
      viabilityReason = `INSUFFICIENT QUANTITY — Partial replacement (${stockQty}/${requiredQty} units) risks secondary bearing failure`;
    }

    return {
      facilityId: cand.facilityId,
      facilityName: cand.facilityName,
      city: cand.city,
      distanceKm: cand.distanceKm,
      stockQty,
      requiredQty,
      isViable,
      viabilityStatus,
      viabilityReason,
      isOptimal: false,
      transitHours,
      formattedEta: formatTransitEta(transitHours),
      downtimeCost,
      freightCost,
      totalFinancialExposure,
      netSavingsVsNextBest: 0,
      netSavingsVsOem: Math.max(0, oemTotalExposure - totalFinancialExposure),
    };
  });

  // Identify viable candidates sorted by total financial exposure (lowest cost first)
  const viableCandidates = candidateCalculations
    .filter((c) => c.isViable)
    .sort((a, b) => a.totalFinancialExposure - b.totalFinancialExposure);

  const optimalCandidate = viableCandidates.length > 0 ? viableCandidates[0] : null;
  const nextBestCandidate = viableCandidates.length > 1 ? viableCandidates[1] : null;

  // Mark optimal candidate and calculate net savings
  const routes: FacilityRouteAnalysis[] = candidateCalculations.map((route) => {
    const isOptimal = optimalCandidate !== null && route.facilityId === optimalCandidate.facilityId;
    let netSavingsVsNextBest = 0;

    if (isOptimal && nextBestCandidate) {
      netSavingsVsNextBest = Math.max(
        0,
        nextBestCandidate.totalFinancialExposure - route.totalFinancialExposure
      );
    }

    return {
      ...route,
      isOptimal,
      viabilityStatus: isOptimal ? 'OPTIMAL' : route.viabilityStatus,
      netSavingsVsNextBest,
    };
  });

  const totalNetSavings = optimalCandidate
    ? nextBestCandidate
      ? nextBestCandidate.totalFinancialExposure - optimalCandidate.totalFinancialExposure
      : oemTotalExposure - optimalCandidate.totalFinancialExposure
    : 0;

  const downtimeReductionHours = optimalCandidate
    ? Number((ROUTING_CONSTANTS.oemLeadTimeHours - optimalCandidate.transitHours).toFixed(1))
    : 0;

  return {
    destinationFacility: ROUTING_CONSTANTS.destinationFacility,
    destinationFacilityName: ROUTING_CONSTANTS.destinationFacilityName,
    partId,
    requiredQty,
    hourlyDowntimeRate,
    routes,
    optimalRoute: optimalCandidate,
    nextBestRoute: nextBestCandidate,
    oemBaseline: {
      leadTimeHours: ROUTING_CONSTANTS.oemLeadTimeHours,
      downtimeCost: oemDowntimeCost,
      freightCost: oemFreightCost,
      totalExposure: oemTotalExposure,
      formattedEta: formatTransitEta(ROUTING_CONSTANTS.oemLeadTimeHours),
    },
    totalNetSavings,
    downtimeReductionHours,
  };
}
