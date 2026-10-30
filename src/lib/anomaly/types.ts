export type AnomalySeverity = 'HEALTHY' | 'WARNING' | 'HIGH';

export type AnomalyType = 'vibration' | 'temperature' | 'pressure' | 'rpm';

export interface AnomalyViolation {
  metric: AnomalyType;
  label: string;
  currentValue: number;
  normalRange: { min: number; max: number };
  unit: string;
  message: string;
}

export interface AnomalyEvaluation {
  machineId: string;
  severity: AnomalySeverity;
  anomalyCount: number;
  violations: AnomalyViolation[];
  suspectedComponent?: {
    code: string;
    name: string;
    reason: string;
  };
  recommendedAction: string;
  analysisSummary: string;
  activeIncident?: {
    incidentId: string;
    machineId: string;
    issue: string;
    component: string;
    status: 'ACTIVE';
  };
}
