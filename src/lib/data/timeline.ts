import { TimelineEvent } from '../types';

export const timelineEventsData: TimelineEvent[] = [
  {
    id: 'EVT-01',
    time: '21:02',
    timestamp: '2026-10-23T21:02:00Z',
    title: 'Anomaly detected',
    target: 'M-204',
    type: 'anomaly',
    severity: 'critical',
  },
  {
    id: 'EVT-02',
    time: '21:01',
    timestamp: '2026-10-23T21:01:00Z',
    title: 'Inventory sync completed',
    type: 'inventory',
    severity: 'info',
  },
  {
    id: 'EVT-03',
    time: '20:58',
    timestamp: '2026-10-23T20:58:00Z',
    title: 'Supplier data received',
    type: 'supplier',
    severity: 'info',
  },
  {
    id: 'EVT-04',
    time: '20:54',
    timestamp: '2026-10-23T20:54:00Z',
    title: 'Machine telemetry updated',
    type: 'telemetry',
    severity: 'info',
  },
];
