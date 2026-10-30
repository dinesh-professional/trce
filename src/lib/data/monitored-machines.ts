import { evaluateMachineAnomaly } from '../anomaly';

export interface TelemetryPoint {
  time: string;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
}

export interface MonitoredMachineData {
  machineId: string;
  name: string;
  facility: string;
  facilityName: string;
  line: string;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  history: TelemetryPoint[];
}

export const monitoredMachinesList: MonitoredMachineData[] = [
  {
    machineId: 'M-204',
    name: 'Precision Spindle Unit M-204',
    facility: 'FAC-A',
    facilityName: 'Detroit Assembly Plant',
    line: 'Assembly Line 2',
    temperature: 78,
    vibration: 8.7,
    pressure: 41,
    rpm: 1840,
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
    machineId: 'M-117',
    name: 'Drive Motor Unit M-117',
    facility: 'FAC-B',
    facilityName: 'Stuttgart Powertrain Works',
    line: 'Machining Bay 1',
    temperature: 79,
    vibration: 4.2,
    pressure: 38,
    rpm: 1720,
    history: [
      { time: '20:00', temperature: 70, vibration: 3.8, pressure: 37, rpm: 1720 },
      { time: '20:15', temperature: 73, vibration: 3.9, pressure: 38, rpm: 1715 },
      { time: '20:30', temperature: 76, vibration: 4.1, pressure: 38, rpm: 1720 },
      { time: '20:45', temperature: 78, vibration: 4.1, pressure: 38, rpm: 1725 },
      { time: '21:00', temperature: 79, vibration: 4.2, pressure: 38, rpm: 1720 },
    ],
  },
  {
    machineId: 'M-301',
    name: 'Hydropress Transfer Manifold M-301',
    facility: 'FAC-A',
    facilityName: 'Detroit Assembly Plant',
    line: 'Hydraulic Stamping Cell',
    temperature: 62,
    vibration: 2.1,
    pressure: 54,
    rpm: 1650,
    history: [
      { time: '20:00', temperature: 60, vibration: 2.0, pressure: 44, rpm: 1650 },
      { time: '20:20', temperature: 61, vibration: 2.1, pressure: 48, rpm: 1650 },
      { time: '20:40', temperature: 62, vibration: 2.1, pressure: 52, rpm: 1645 },
      { time: '21:00', temperature: 62, vibration: 2.1, pressure: 54, rpm: 1650 },
    ],
  },
  {
    machineId: 'M-402',
    name: 'Automated Gantry Cell M-402',
    facility: 'FAC-C',
    facilityName: 'Yokohama Robotics Works',
    line: 'Transfer Line 4',
    temperature: 55,
    vibration: 1.4,
    pressure: 42,
    rpm: 1910,
    history: [
      { time: '20:00', temperature: 54, vibration: 1.3, pressure: 42, rpm: 1910 },
      { time: '20:30', temperature: 55, vibration: 1.4, pressure: 42, rpm: 1915 },
      { time: '21:00', temperature: 55, vibration: 1.4, pressure: 42, rpm: 1910 },
    ],
  },
  {
    machineId: 'M-508',
    name: 'Robotic Weld Station M-508',
    facility: 'FAC-B',
    facilityName: 'Stuttgart Powertrain Works',
    line: 'Chassis Line 1',
    temperature: 68,
    vibration: 3.1,
    pressure: 44,
    rpm: 1820,
    history: [
      { time: '20:00', temperature: 66, vibration: 2.9, pressure: 44, rpm: 1820 },
      { time: '20:30', temperature: 67, vibration: 3.0, pressure: 44, rpm: 1825 },
      { time: '21:00', temperature: 68, vibration: 3.1, pressure: 44, rpm: 1820 },
    ],
  },
  {
    machineId: 'M-612',
    name: 'CNC 5-Axis Precision Miller M-612',
    facility: 'FAC-D',
    facilityName: 'Monterrey Logistics & Fabrication',
    line: 'Turbine Fabrication Bay',
    temperature: 58,
    vibration: 2.8,
    pressure: 46,
    rpm: 2050,
    history: [
      { time: '20:00', temperature: 57, vibration: 2.7, pressure: 46, rpm: 2050 },
      { time: '20:30', temperature: 58, vibration: 2.8, pressure: 46, rpm: 2050 },
      { time: '21:00', temperature: 58, vibration: 2.8, pressure: 46, rpm: 2050 },
    ],
  },
  {
    machineId: 'M-719',
    name: 'Thermoplastic Injection Cell M-719',
    facility: 'FAC-C',
    facilityName: 'Yokohama Robotics Works',
    line: 'Polymer Injection Bay 2',
    temperature: 71,
    vibration: 1.9,
    pressure: 48,
    rpm: 1600,
    history: [
      { time: '20:00', temperature: 70, vibration: 1.8, pressure: 48, rpm: 1600 },
      { time: '20:30', temperature: 71, vibration: 1.9, pressure: 48, rpm: 1600 },
      { time: '21:00', temperature: 71, vibration: 1.9, pressure: 48, rpm: 1600 },
    ],
  },
  {
    machineId: 'M-825',
    name: 'Heavy Extruder Unit M-825',
    facility: 'FAC-D',
    facilityName: 'Monterrey Logistics & Fabrication',
    line: 'Extrusion Line 3',
    temperature: 64,
    vibration: 2.5,
    pressure: 36,
    rpm: 1750,
    history: [
      { time: '20:00', temperature: 63, vibration: 2.4, pressure: 36, rpm: 1750 },
      { time: '20:30', temperature: 64, vibration: 2.5, pressure: 36, rpm: 1750 },
      { time: '21:00', temperature: 64, vibration: 2.5, pressure: 36, rpm: 1750 },
    ],
  },
];

export function getMonitoredMachine(id: string) {
  const machine = monitoredMachinesList.find(
    (m) => m.machineId.toLowerCase() === id.toLowerCase()
  );
  if (!machine) return null;

  const evaluation = evaluateMachineAnomaly(machine.machineId, {
    temperature: machine.temperature,
    vibration: machine.vibration,
    pressure: machine.pressure,
    rpm: machine.rpm,
  });

  return {
    ...machine,
    evaluation,
  };
}
