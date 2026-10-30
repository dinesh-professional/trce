import { AnomalyEvaluation, AnomalyViolation, AnomalySeverity } from './types';

export const NORMAL_RANGES = {
  temperature: { min: 40, max: 75, unit: '°C' },
  vibration: { min: 0, max: 6, unit: 'mm/s' },
  pressure: { min: 30, max: 50, unit: 'bar' },
  rpm: { min: 1500, max: 2200, unit: 'RPM' },
} as const;

export interface TelemetryReading {
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
}

/**
 * Deterministically evaluates telemetry readings against configured operational thresholds.
 * Rules:
 * - vibration > 6 -> vibration anomaly
 * - temperature > 75 -> temperature anomaly
 * - pressure < 30 or > 50 -> pressure anomaly
 *
 * Severity:
 * - 0 anomalies -> HEALTHY
 * - 1 anomaly   -> WARNING
 * - 2+ anomalies -> HIGH
 */
export function evaluateMachineAnomaly(
  machineId: string,
  telemetry: TelemetryReading
): AnomalyEvaluation {
  const violations: AnomalyViolation[] = [];

  // Vibration threshold: 0-6 mm/s
  if (telemetry.vibration > NORMAL_RANGES.vibration.max) {
    violations.push({
      metric: 'vibration',
      label: 'Vibration',
      currentValue: telemetry.vibration,
      normalRange: { min: NORMAL_RANGES.vibration.min, max: NORMAL_RANGES.vibration.max },
      unit: NORMAL_RANGES.vibration.unit,
      message: `Vibration ${telemetry.vibration} ${NORMAL_RANGES.vibration.unit} exceeds upper threshold (0–6 ${NORMAL_RANGES.vibration.unit})`,
    });
  }

  // Temperature threshold: 40-75 °C
  if (telemetry.temperature > NORMAL_RANGES.temperature.max) {
    violations.push({
      metric: 'temperature',
      label: 'Temperature',
      currentValue: telemetry.temperature,
      normalRange: { min: NORMAL_RANGES.temperature.min, max: NORMAL_RANGES.temperature.max },
      unit: NORMAL_RANGES.temperature.unit,
      message: `Temperature ${telemetry.temperature}${NORMAL_RANGES.temperature.unit} exceeds operating envelope (40–75${NORMAL_RANGES.temperature.unit})`,
    });
  } else if (telemetry.temperature < NORMAL_RANGES.temperature.min) {
    violations.push({
      metric: 'temperature',
      label: 'Temperature',
      currentValue: telemetry.temperature,
      normalRange: { min: NORMAL_RANGES.temperature.min, max: NORMAL_RANGES.temperature.max },
      unit: NORMAL_RANGES.temperature.unit,
      message: `Temperature ${telemetry.temperature}${NORMAL_RANGES.temperature.unit} below minimum nominal (40–75${NORMAL_RANGES.temperature.unit})`,
    });
  }

  // Pressure threshold: 30-50 bar
  if (telemetry.pressure < NORMAL_RANGES.pressure.min || telemetry.pressure > NORMAL_RANGES.pressure.max) {
    violations.push({
      metric: 'pressure',
      label: 'Pressure',
      currentValue: telemetry.pressure,
      normalRange: { min: NORMAL_RANGES.pressure.min, max: NORMAL_RANGES.pressure.max },
      unit: NORMAL_RANGES.pressure.unit,
      message: `Pressure ${telemetry.pressure} ${NORMAL_RANGES.pressure.unit} outside nominal range (30–50 ${NORMAL_RANGES.pressure.unit})`,
    });
  }

  // Determine Severity
  const anomalyCount = violations.length;
  let severity: AnomalySeverity = 'HEALTHY';
  if (anomalyCount === 1) {
    severity = 'WARNING';
  } else if (anomalyCount >= 2) {
    severity = 'HIGH';
  }

  // Suspected Component Mapping
  let suspectedComponent: AnomalyEvaluation['suspectedComponent'];
  let recommendedAction = 'Continue nominal sensor telemetry sampling.';
  let analysisSummary = 'All telemetry readings within configured operating tolerances.';

  const hasVibration = violations.some((v) => v.metric === 'vibration');
  const hasTemperature = violations.some((v) => v.metric === 'temperature');
  const hasPressure = violations.some((v) => v.metric === 'pressure');

  if (hasVibration) {
    suspectedComponent = {
      code: 'BRG-204',
      name: 'BRG-204 Bearing',
      reason: 'Abnormal high-frequency harmonic vibration indicates mechanical bearing breakdown.',
    };
    recommendedAction = 'Check spare availability.';
    analysisSummary = 'Abnormal vibration detected above the configured operating range.';
  } else if (hasTemperature) {
    suspectedComponent = {
      code: 'MTR-102',
      name: 'MTR-102 Motor',
      reason: 'Elevated winding core temperature indicates stator degradation or ventilation blockage.',
    };
    recommendedAction = 'Inspect cooling circuit and verify motor inventory.';
    analysisSummary = 'Thermal deviation detected above normal operating envelope.';
  } else if (hasPressure) {
    suspectedComponent = {
      code: 'VLV-301',
      name: 'VLV-301 Hydraulic Valve',
      reason: 'Manifold circuit pressure deviation indicates internal spool leakage or seal wear.',
    };
    recommendedAction = 'Inspect valve manifold and check hydraulic seal inventory.';
    analysisSummary = 'Pressure anomaly detected outside calibrated pressure boundaries.';
  }

  // Incident Generation for HIGH Anomaly
  let activeIncident: AnomalyEvaluation['activeIncident'];
  if (severity === 'HIGH') {
    // Standard format specified in requirements: INC-204 for M-204
    const incidentSuffix = machineId.replace(/^M-?/, '');
    activeIncident = {
      incidentId: `INC-${incidentSuffix}`,
      machineId,
      issue: hasVibration ? 'Abnormal vibration' : 'Multiple operational deviations',
      component: suspectedComponent?.code ?? 'BRG-204',
      status: 'ACTIVE',
    };
  }

  return {
    machineId,
    severity,
    anomalyCount,
    violations,
    suspectedComponent,
    recommendedAction,
    analysisSummary,
    activeIncident,
  };
}
