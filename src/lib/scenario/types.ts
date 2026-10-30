export type ScenarioStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ScenarioStepDefinition {
  step: ScenarioStepNumber;
  title: string;
  shortLabel: string;
  description: string;
}

export const SCENARIO_STEPS: ScenarioStepDefinition[] = [
  {
    step: 1,
    title: 'Anomaly Detected',
    shortLabel: '1. Anomaly',
    description: 'Autonomous telemetry sensor flags critical variance on machine M-204 in FAC-A.',
  },
  {
    step: 2,
    title: 'Vibration Telemetry Analysis',
    shortLabel: '2. Telemetry',
    description: 'Vibration reading breaches 8.7 mm/s (acceptable range: 0–6 mm/s).',
  },
  {
    step: 3,
    title: 'Suspected Component Isolated',
    shortLabel: '3. Component',
    description: 'Trce AI-driven failure signature identifies spindle bearing BRG-204 as primary failure vector.',
  },
  {
    step: 4,
    title: 'Local Stock Deficit Checked',
    shortLabel: '4. Local Stock',
    description: 'Zero local inventory at FAC-A triggers immediate critical outage prevention alert.',
  },
  {
    step: 5,
    title: 'Distributed Inventory Traced',
    shortLabel: '5. Trace',
    description: 'Deterministic cross-network ledger query discovers stock across FAC-B, FAC-C, and FAC-D.',
  },
  {
    step: 6,
    title: 'Trce Reroute Recommendation',
    shortLabel: '6. Recommendation',
    description: 'Algorithmic routing selects FAC-C (4 units, 183 km, 4h 20m ETA) preserving safety reserves.',
  },
  {
    step: 7,
    title: 'Initiate Reroute Action',
    shortLabel: '7. Reroute CTA',
    description: 'Operations controller validates transfer parameters and initiates dispatch sequence.',
  },
  {
    step: 8,
    title: 'Active Logistics in Transit',
    shortLabel: '8. In Transit',
    description: 'Dynamic transfer in progress: FAC-C stock decrements 4 → 0, FAC-A stock updates 0 → 4.',
  },
  {
    step: 9,
    title: 'Incident Timeline Finalized',
    shortLabel: '9. Timeline',
    description: 'Complete auditable event log synchronized across enterprise operations command.',
  },
];
