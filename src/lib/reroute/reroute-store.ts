import { operationalStore } from '../operational-store';

export type RerouteWorkflowStatus = 'IDLE' | 'CONFIRMING' | 'IN_TRANSIT' | 'DELIVERED';

export interface TimelineEntry {
  time: string;
  title: string;
  detail?: string;
  type: 'anomaly' | 'trace' | 'reroute' | 'transit';
}

export interface RerouteState {
  status: RerouteWorkflowStatus;
  incidentId: string;
  machineId: string;
  destinationFacility: string;
  destinationFacilityName: string;
  sourceFacility: string;
  sourceFacilityName: string;
  partId: string;
  partName: string;
  quantity: number;
  eta: string;
  distance: string;
  reason: string;
  stockFacA: number;
  stockFacC: number;
  stockFacB: number;
  stockFacD: number;
  timeline: TimelineEntry[];
  notifiedTeam: boolean;
  transferId?: string;
  verificationHash?: string;
  dispatchedAt?: string;
}

const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    time: '21:02',
    title: 'Anomaly detected',
    detail: 'M-204 vibration exceeded 8.7 mm/s threshold',
    type: 'anomaly',
  },
  {
    time: '21:03',
    title: 'Spare requirement identified',
    detail: 'BRG-204 Bearing required for urgent repair',
    type: 'trace',
  },
  {
    time: '21:03',
    title: 'Inventory traced',
    detail: '0 units at FAC-A, cross-facility search initiated',
    type: 'trace',
  },
];

const CONFIRMED_TIMELINE: TimelineEntry[] = [
  {
    time: '21:02',
    title: 'Anomaly detected',
    detail: 'M-204 vibration exceeded 8.7 mm/s threshold',
    type: 'anomaly',
  },
  {
    time: '21:03',
    title: 'Spare requirement identified',
    detail: 'BRG-204 Bearing required for urgent repair',
    type: 'trace',
  },
  {
    time: '21:03',
    title: 'Inventory traced',
    detail: '0 units at FAC-A, cross-facility search initiated',
    type: 'trace',
  },
  {
    time: '21:04',
    title: 'FAC-C selected',
    detail: 'Optimal transfer source (183 km · 4h 20m ETA)',
    type: 'reroute',
  },
  {
    time: '21:04',
    title: 'Transfer initiated',
    detail: 'Carrier dispatched from FAC-C to FAC-A',
    type: 'transit',
  },
];

export const INITIAL_REROUTE_STATE: RerouteState = {
  status: 'IDLE',
  incidentId: 'INC-204',
  machineId: 'M-204',
  destinationFacility: 'FAC-A',
  destinationFacilityName: 'FAC-A (Chennai)',
  sourceFacility: 'FAC-C',
  sourceFacilityName: 'FAC-C (Hyderabad)',
  partId: 'BRG-204',
  partName: 'Bearing',
  quantity: 4,
  eta: '4h 20m',
  distance: '183 km',
  reason: 'Critical machine anomaly with no local spare available.',
  stockFacA: 0,
  stockFacC: 4,
  stockFacB: 2,
  stockFacD: 7,
  timeline: INITIAL_TIMELINE,
  notifiedTeam: false,
};

const STORAGE_KEY = 'trce_reroute_workflow_state_v1';

// In-memory store with listeners
let currentState: RerouteState = { ...INITIAL_REROUTE_STATE };
const listeners = new Set<(state: RerouteState) => void>();

// Load from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      currentState = { ...INITIAL_REROUTE_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse saved reroute state', e);
  }
}

function notify() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch {
      // ignore
    }
  }
  listeners.forEach((listener) => listener(currentState));
}

export const rerouteStore = {
  getState(): RerouteState {
    return currentState;
  },

  getServerSnapshot(): RerouteState {
    return INITIAL_REROUTE_STATE;
  },

  subscribe(listener: (state?: RerouteState) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  openConfirmation() {
    currentState = {
      ...currentState,
      status: 'CONFIRMING',
    };
    operationalStore.openTransferConfirmation();
    notify();
  },

  cancelConfirmation() {
    currentState = {
      ...currentState,
      status: 'IDLE',
    };
    operationalStore.cancelTransferConfirmation();
    notify();
  },

  confirmTransfer(hash?: string) {
    const transferId = 'TRF-8841';
    const timestamp = new Date().toISOString();
    const verifiedTimeline: TimelineEntry[] = [
      ...CONFIRMED_TIMELINE.slice(0, 4),
      {
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        title: `Transfer ${transferId} Dispatched`,
        detail: hash
          ? `SHA-256 Manifest: ${hash.slice(0, 16)}... (Signed & Verified)`
          : 'Carrier dispatched from FAC-C to FAC-A (Cryptographically Signed)',
        type: 'transit',
      },
    ];

    currentState = {
      ...currentState,
      status: 'IN_TRANSIT',
      stockFacC: 0,
      stockFacA: 4,
      transferId,
      verificationHash: hash,
      dispatchedAt: timestamp,
      timeline: verifiedTimeline,
      notifiedTeam: true,
    };
    operationalStore.approveAndDispatchTransfer(transferId, hash);
    notify();
  },

  restoreBaseline() {
    currentState = {
      ...INITIAL_REROUTE_STATE,
      stockFacA: 0,
      stockFacC: 4,
      transferId: undefined,
      verificationHash: undefined,
      dispatchedAt: undefined,
      timeline: [...INITIAL_TIMELINE],
    };
    operationalStore.restoreBaseline();
    notify();
  },
};
