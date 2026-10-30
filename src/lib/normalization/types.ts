export type HarmonizedStatus = 'CRITICAL' | 'LOW STOCK' | 'AVAILABLE';

export type CanonicalField = 'part_id' | 'quantity' | 'location';

export interface FieldMapping {
  rawField: string;
  targetField: CanonicalField;
  confidence: number;
  reason: string;
}

export interface HarmonizedRecord {
  partId: string;
  quantity: number;
  location: string;
  status: HarmonizedStatus;
  supplier: string;
  rawValues: Record<string, string>;
}

export interface NormalizationResult {
  success: boolean;
  supplierName: string;
  error?: string;
  warnings?: string[];
  rawHeaders: string[];
  rawRecords: Record<string, string>[];
  mappings: FieldMapping[];
  unresolvedFields: string[];
  harmonizedRecords: HarmonizedRecord[];
  stats: {
    totalRecords: number;
    fieldsStandardized: number;
    unresolved: number;
  };
}

export interface SupplierPreset {
  id: string;
  name: string;
  code: string;
  filename: string;
  description: string;
  csvContent: string;
}
