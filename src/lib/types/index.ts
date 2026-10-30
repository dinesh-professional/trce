export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type MachineStatus = 'operational' | 'warning' | 'critical' | 'offline';
export type FacilityStatus = 'operational' | 'degraded' | 'critical' | 'maintenance';
export type InventoryStatus = 'optimal' | 'low_stock' | 'critical' | 'overstock';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';
export type SupplierStatus = 'active' | 'under_review' | 'restricted';

export interface Facility {
  id: string;
  name: string;
  code: string;
  location: string;
  type: 'manufacturing' | 'warehouse' | 'assembly' | 'distribution';
  status: FacilityStatus;
  activeLines: number;
  totalLines: number;
  supervisor: string;
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
  uptimeHours: number;
  lastMaintenance: string;
  nextScheduledMaintenance: string;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: 'bearings' | 'hydraulics' | 'electrical' | 'sensors' | 'actuators';
  compatibleMachines: string[];
  unitCost: number;
  leadTimeDays: number;
  preferredSupplierId: string;
}

export interface InventoryRecord {
  id: string;
  partId: string;
  partName: string;
  sku: string;
  facilityId: string;
  facilityName: string;
  quantityOnHand: number;
  minSafetyStock: number;
  maxStockLevel: number;
  reorderPoint: number;
  status: InventoryStatus;
  unit: string;
  binLocation: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  facilityId: string;
  facilityName: string;
  machineId?: string;
  machineName?: string;
  category: 'mechanical' | 'supply_chain' | 'electrical' | 'environmental';
  createdAt: string;
  updatedAt: string;
  description: string;
  assignedTo?: string;
}

export interface SupplierRecord {
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
}

export interface TimelineEvent {
  id: string;
  time: string;
  timestamp: string;
  title: string;
  target?: string;
  type: 'anomaly' | 'inventory' | 'supplier' | 'telemetry';
  severity?: 'critical' | 'warning' | 'info';
}
