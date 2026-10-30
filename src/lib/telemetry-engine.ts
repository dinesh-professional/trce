/**
 * TRCE Industrial Telemetry Evaluation & Root-Cause Failure Engine
 * Module 07: Real-Time Diagnostic Threshold Analysis
 */

export interface TelemetryPayload {
  vibration: number; // mm/s (Normal: 0 - 6.0)
  temperature: number; // °C (Normal: 40 - 75)
  pressure?: number; // bar (Normal: 30 - 50)
  rpm?: number; // RPM (Normal: 1500 - 2200)
}

export type OperationalThresholdStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';

export interface ThresholdViolation {
  metric: 'vibration' | 'temperature' | 'pressure' | 'rpm';
  label: string;
  value: number;
  nominalRange: string;
  threshold: number;
  unit: string;
  severity: 'WARNING' | 'CRITICAL';
}

export interface ComponentFailureAnalysis {
  id: string;
  name: string;
  probability: number; // 0 - 100%
  isPrimary: boolean;
  reason: string;
}

export interface TelemetryEvaluationResult {
  status: OperationalThresholdStatus;
  machineStatus: 'operational' | 'warning' | 'critical';
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  bearingFailureProbability: number; // Specific mathematical score for BRG-204
  primaryComponent: {
    id: string;
    name: string;
    probability: number;
    reason: string;
    recommendedAction: string;
  };
  componentAnalyses: ComponentFailureAnalysis[];
  violations: ThresholdViolation[];
  diagnosticSummary: string;
  recommendedAction: string;
}

export const TELEMETRY_THRESHOLDS = {
  vibration: {
    nominalMin: 0.0,
    nominalMax: 6.0,
    criticalMin: 8.0,
    unit: 'mm/s',
  },
  temperature: {
    nominalMin: 40.0,
    nominalMax: 75.0,
    criticalMin: 77.0,
    unit: '°C',
  },
  pressure: {
    nominalMin: 30.0,
    nominalMax: 50.0,
    unit: 'bar',
  },
  rpm: {
    nominalMin: 1500,
    nominalMax: 2200,
    unit: 'RPM',
  },
} as const;

/**
 * Calculates dynamic root-cause failure probability (%) for spindle bearing BRG-204.
 * Uses a mathematical formula based on how far vibration and temperature exceed nominal thresholds.
 */
export function calculateBearingFailureProbability(
  vibration: number,
  temperature: number
): number {
  const vNominal = TELEMETRY_THRESHOLDS.vibration.nominalMax; // 6.0 mm/s
  const tNominal = TELEMETRY_THRESHOLDS.temperature.nominalMax; // 75.0 °C

  const vExcess = Math.max(0, vibration - vNominal);
  const tExcess = Math.max(0, temperature - tNominal);

  // If completely within nominal thresholds
  if (vExcess === 0 && tExcess === 0) {
    const baselineRatio = Math.max(0, vibration) / vNominal;
    const tempRatio = Math.max(0, temperature - 40) / 35;
    const nominalBaseline = 4.0 + baselineRatio * 5.0 + tempRatio * 2.0;
    return Number(Math.min(11.5, Math.max(3.8, nominalBaseline)).toFixed(1));
  }

  // Base probability upon crossing into abnormal territory
  let probability = 15.0;

  // Primary driver: Vibration excess (22.0% per mm/s above 6.0 mm/s)
  probability += vExcess * 22.0;

  // Accelerating factor: Thermal elevation (2.5% per °C above 75.0 °C)
  probability += tExcess * 2.5;

  // Non-linear cross-product term when high friction and high vibration co-occur
  if (vExcess > 0 && tExcess > 0) {
    probability += vExcess * tExcess * 1.25;
  }

  // Bound within realistic diagnostic limits [15.0%, 99.4%]
  const bounded = Math.min(99.4, Math.max(15.0, probability));
  return Number(bounded.toFixed(1));
}

/**
 * Evaluates full telemetry payload and computes real-time operational status,
 * component failure risks, and threshold violations.
 */
export function evaluateTelemetryPayload(payload: TelemetryPayload): TelemetryEvaluationResult {
  const { vibration, temperature, pressure = 41.0, rpm = 1840 } = payload;
  const violations: ThresholdViolation[] = [];

  // 1. Evaluate Vibration
  if (vibration >= TELEMETRY_THRESHOLDS.vibration.criticalMin) {
    violations.push({
      metric: 'vibration',
      label: 'Vibration Excursion',
      value: vibration,
      nominalRange: '0–6.0 mm/s',
      threshold: TELEMETRY_THRESHOLDS.vibration.criticalMin,
      unit: 'mm/s',
      severity: 'CRITICAL',
    });
  } else if (vibration > TELEMETRY_THRESHOLDS.vibration.nominalMax) {
    violations.push({
      metric: 'vibration',
      label: 'Vibration Elevation',
      value: vibration,
      nominalRange: '0–6.0 mm/s',
      threshold: TELEMETRY_THRESHOLDS.vibration.nominalMax,
      unit: 'mm/s',
      severity: 'WARNING',
    });
  }

  // 2. Evaluate Temperature
  if (temperature >= TELEMETRY_THRESHOLDS.temperature.criticalMin) {
    violations.push({
      metric: 'temperature',
      label: 'Thermal Criticality',
      value: temperature,
      nominalRange: '40–75°C',
      threshold: TELEMETRY_THRESHOLDS.temperature.criticalMin,
      unit: '°C',
      severity: 'CRITICAL',
    });
  } else if (temperature > TELEMETRY_THRESHOLDS.temperature.nominalMax) {
    violations.push({
      metric: 'temperature',
      label: 'Thermal Elevation',
      value: temperature,
      nominalRange: '40–75°C',
      threshold: TELEMETRY_THRESHOLDS.temperature.nominalMax,
      unit: '°C',
      severity: 'WARNING',
    });
  }

  // 3. Evaluate Pressure
  if (pressure < TELEMETRY_THRESHOLDS.pressure.nominalMin || pressure > TELEMETRY_THRESHOLDS.pressure.nominalMax) {
    violations.push({
      metric: 'pressure',
      label: 'Hydraulic Deviation',
      value: pressure,
      nominalRange: '30–50 bar',
      threshold: pressure > 50 ? 50 : 30,
      unit: 'bar',
      severity: 'WARNING',
    });
  }

  // 4. Evaluate RPM
  if (rpm < TELEMETRY_THRESHOLDS.rpm.nominalMin || rpm > TELEMETRY_THRESHOLDS.rpm.nominalMax) {
    violations.push({
      metric: 'rpm',
      label: 'Drive Speed Imbalance',
      value: rpm,
      nominalRange: '1500–2200 RPM',
      threshold: rpm > 2200 ? 2200 : 1500,
      unit: 'RPM',
      severity: 'WARNING',
    });
  }

  // 5. Determine Machine Status
  // CRITICAL: Vibration >= 8.0 mm/s or Temp >= 77°C
  // WARNING: Vibration > 6.0 mm/s or Temp > 75°C
  // NOMINAL: Vibration <= 6.0 mm/s and Temp <= 75°C
  let status: OperationalThresholdStatus = 'NOMINAL';
  let machineStatus: 'operational' | 'warning' | 'critical' = 'operational';
  let severityLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (
    vibration >= TELEMETRY_THRESHOLDS.vibration.criticalMin ||
    temperature >= TELEMETRY_THRESHOLDS.temperature.criticalMin
  ) {
    status = 'CRITICAL';
    machineStatus = 'critical';
    severityLevel = 'critical';
  } else if (
    vibration > TELEMETRY_THRESHOLDS.vibration.nominalMax ||
    temperature > TELEMETRY_THRESHOLDS.temperature.nominalMax ||
    violations.length > 0
  ) {
    status = 'WARNING';
    machineStatus = 'warning';
    severityLevel = 'medium';
  }

  // 6. Component Failure Probability Calculations
  const bearingProb = calculateBearingFailureProbability(vibration, temperature);

  // Motor winding failure probability
  const motorExcessTemp = Math.max(0, temperature - 75.0);
  const motorProb = Number(
    Math.min(94.0, Math.max(5.0, 8.0 + motorExcessTemp * 7.5 + (rpm > 2100 ? 12 : 0))).toFixed(1)
  );

  // Valve seal wear probability
  const pressureExcess = Math.abs(pressure - 41.0);
  const valveProb = Number(
    Math.min(88.0, Math.max(3.0, 6.0 + pressureExcess * 2.8)).toFixed(1)
  );

  const componentAnalyses: ComponentFailureAnalysis[] = [
    {
      id: 'BRG-204',
      name: 'Spindle Bearing BRG-204',
      probability: bearingProb,
      isPrimary: bearingProb >= motorProb && bearingProb >= valveProb,
      reason:
        bearingProb > 50
          ? `High-frequency harmonic vibration (${vibration.toFixed(1)} mm/s) indicates inner/outer race fatigue.`
          : 'Operating within standard mechanical fatigue tolerance.',
    },
    {
      id: 'MTR-102',
      name: 'Main Drive Motor MTR-102',
      probability: motorProb,
      isPrimary: motorProb > bearingProb && motorProb >= valveProb,
      reason:
        motorProb > 50
          ? `Thermal dissipation deviation (${temperature.toFixed(1)}°C) suggests stator winding degradation.`
          : 'Thermal dissipation within continuous rated envelope.',
    },
    {
      id: 'VLV-301',
      name: 'Proportional Hydraulic Valve VLV-301',
      probability: valveProb,
      isPrimary: valveProb > bearingProb && valveProb > motorProb,
      reason:
        valveProb > 40
          ? `Manifold pressure fluctuation (${pressure.toFixed(1)} bar) indicates spool clearance leakage.`
          : 'Line pressure stable at standard delivery baseline.',
    },
  ];

  // Primary component selected by highest failure probability
  const primaryComp = componentAnalyses.reduce(
    (max, cur) => (cur.probability > max.probability ? cur : max),
    componentAnalyses[0]
  );

  let diagnosticSummary = 'All machine telemetry parameters within nominal operating boundaries.';
  let recommendedAction = 'Maintain standard continuous monitoring schedule.';

  if (status === 'CRITICAL') {
    diagnosticSummary = `CRITICAL DEVIATION: Vibration at ${vibration.toFixed(
      1
    )} mm/s and Temperature at ${temperature.toFixed(
      1
    )}°C severely breach ISO-10816 baseline. Root-cause synthesis points to ${primaryComp.name} with ${primaryComp.probability}% failure probability.`;
    recommendedAction =
      primaryComp.id === 'BRG-204'
        ? 'Initiate urgent spare isolation for BRG-204 and dispatch automated reroute transfer.'
        : 'Halt spindle operation for immediate mechanical inspection.';
  } else if (status === 'WARNING') {
    diagnosticSummary = `OPERATIONAL WARNING: Parameter departure detected (Vibration: ${vibration.toFixed(
      1
    )} mm/s, Temp: ${temperature.toFixed(
      1
    )}°C). Elevated risk profile for ${primaryComp.name} (${primaryComp.probability}%).`;
    recommendedAction = 'Stage replacement inventory and monitor bearing temperature ramp rate.';
  }

  return {
    status,
    machineStatus,
    severityLevel,
    bearingFailureProbability: bearingProb,
    primaryComponent: {
      id: primaryComp.id,
      name: primaryComp.name,
      probability: primaryComp.probability,
      reason: primaryComp.reason,
      recommendedAction,
    },
    componentAnalyses,
    violations,
    diagnosticSummary,
    recommendedAction,
  };
}
