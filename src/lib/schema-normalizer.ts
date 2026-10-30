/**
 * TRCE Universal CSV Parser, Schema Normalization & Quarantine Engine
 * Module 09: Enterprise Multi-Vendor Feed Ingestion Pipeline
 */

import { operationalStore } from './operational-store';

export type CanonicalSchemaField = 'part_id' | 'quantity' | 'location' | 'unit_cost';

export const HEADER_MAPPING_DICTIONARY: Record<CanonicalSchemaField, string[]> = {
  part_id: [
    'part_id',
    'component_id',
    'comp_ref_no',
    'teilenummer',
    'sku',
    'part_no',
    'part_number',
    'item_code',
    'partid',
    'material_no',
  ],
  quantity: [
    'quantity',
    'available_units',
    'qty_on_hand',
    'bestand',
    'stock',
    'qty',
    'available_stock',
    'inventory_qty',
    'units',
    'count',
    'on_hand',
  ],
  location: [
    'location',
    'site',
    'plant_loc',
    'werk',
    'facility',
    'location_code',
    'warehouse',
    'plant',
    'depot',
  ],
  unit_cost: [
    'unit_cost',
    'price',
    'preis',
    'cost_usd',
    'unit_price',
    'cost',
    'einzelpreis',
  ],
};

export const RECOGNIZED_FACILITIES = new Set(['FAC-A', 'FAC-B', 'FAC-C', 'FAC-D']);

export interface HeaderMappingResolution {
  rawHeader: string;
  canonicalField: CanonicalSchemaField;
  confidence: number;
}

export interface QuarantinedRow {
  rowNumber: number; // 1-based CSV line number
  rawLine: string;
  rawValues: Record<string, string>;
  rejectionReasons: string[];
  severity: 'CRITICAL' | 'WARNING';
}

export interface ValidatedIngestionRow {
  rowNumber: number;
  partId: string;
  quantity: number;
  location: string;
  unitCost: number;
  status: 'AVAILABLE' | 'LOW STOCK' | 'CRITICAL';
  rawValues: Record<string, string>;
}

export interface NormalizationPipelineResult {
  success: boolean;
  supplierName: string;
  delimiter: ',' | ';';
  rawHeaders: string[];
  resolvedMappings: HeaderMappingResolution[];
  unmappedHeaders: string[];
  totalRowsProcessed: number;
  validRows: ValidatedIngestionRow[];
  quarantinedRows: QuarantinedRow[];
  summary: {
    validCount: number;
    quarantineCount: number;
    totalUnitsParsed: number;
    quarantineRate: string;
  };
}

export interface RealSamplePayload {
  id: string;
  name: string;
  code: string;
  filename: string;
  description: string;
  formatNote: string;
  delimiter: ',' | ';';
  rawCsv: string;
}

export const REAL_SAMPLE_PAYLOADS: RealSamplePayload[] = [
  {
    id: 'apex-erp',
    name: 'Apex Industrial ERP',
    code: 'SUP-APEX',
    filename: 'apex_erp_export.csv',
    description: 'Legacy uppercase corporate ERP catalog with comma delimiter',
    formatNote: 'Headers: [COMP_REF_NO, AVAILABLE_UNITS, PLANT_LOC, COST_USD]',
    delimiter: ',',
    rawCsv: `COMP_REF_NO,AVAILABLE_UNITS,PLANT_LOC,COST_USD
BRG-204,6,FAC-C,320.00
MTR-102,3,FAC-B,1450.00
VLV-301,8,FAC-D,890.00
PMP-501,5,FAC-A,420.00`,
  },
  {
    id: 'rheinmetall-logistics',
    name: 'Rheinmetall Logistics',
    code: 'SUP-RHEIN',
    filename: 'rheinmetall_logistics.csv',
    description: 'European automotive format with German headers and semicolon delimiter',
    formatNote: 'Headers: [teilenummer; bestand; werk; preis]',
    delimiter: ';',
    rawCsv: `teilenummer;bestand;werk;preis
BRG-204;8;FAC-C;295.50
MTR-102;4;FAC-B;1380.00
VLV-301;12;FAC-D;850.00
PRT-SEN-99;15;FAC-A;110.00`,
  },
  {
    id: 'malformed-feed',
    name: 'Malformed Supplier Feed',
    code: 'SUP-ANOMALY',
    filename: 'malformed_vendor_feed.csv',
    description: 'Stress-test feed containing 4 valid rows and 2 corrupted entries',
    formatNote: 'Isolates missing part_id, negative stock, and unknown facility codes',
    delimiter: ',',
    rawCsv: `part_id,qty_on_hand,site,unit_cost
BRG-204,5,FAC-C,315.00
MTR-102,-3,FAC-B,1420.00
,10,FAC-D,45.00
VLV-301,6,FAC-D,880.00
PMP-501,4,FAC-A,410.00
BRG-204,8,FAC-Z_INVALID,315.00`,
  },
];

/**
 * Normalizes header string by stripping whitespace, underscores, dashes and casing.
 */
function cleanHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s\-_]/g, '');
}

/**
 * Detects delimiter by evaluating the header line.
 */
export function detectDelimiter(headerLine: string): ',' | ';' {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  return semiCount > commaCount ? ';' : ',';
}

/**
 * Robust CSV line tokenizer respecting quotes and delimiters.
 */
export function parseCsvLine(line: string, delimiter: ',' | ';'): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Maps arbitrary raw CSV headers into the canonical Trce schema dictionary.
 */
export function resolveHeaders(
  rawHeaders: string[]
): {
  mappings: HeaderMappingResolution[];
  unmapped: string[];
  canonicalIndexMap: Partial<Record<CanonicalSchemaField, number>>;
} {
  const mappings: HeaderMappingResolution[] = [];
  const unmapped: string[] = [];
  const canonicalIndexMap: Partial<Record<CanonicalSchemaField, number>> = {};

  rawHeaders.forEach((header, index) => {
    const cleaned = cleanHeader(header);
    let matchedField: CanonicalSchemaField | null = null;
    let confidence = 0;

    for (const [canonicalKey, aliases] of Object.entries(HEADER_MAPPING_DICTIONARY) as [
      CanonicalSchemaField,
      string[]
    ][]) {
      for (const alias of aliases) {
        const cleanedAlias = cleanHeader(alias);
        if (cleaned === cleanedAlias) {
          matchedField = canonicalKey;
          confidence = 1.0;
          break;
        } else if (cleaned.includes(cleanedAlias) || cleanedAlias.includes(cleaned)) {
          matchedField = canonicalKey;
          confidence = 0.85;
        }
      }
      if (matchedField) break;
    }

    if (matchedField && canonicalIndexMap[matchedField] === undefined) {
      canonicalIndexMap[matchedField] = index;
      mappings.push({
        rawHeader: header,
        canonicalField: matchedField,
        confidence,
      });
    } else {
      unmapped.push(header);
    }
  });

  return { mappings, unmapped, canonicalIndexMap };
}

/**
 * Parses raw CSV string, standardizes headers, evaluates rows,
 * and isolates non-compliant rows into quarantine.
 */
export function parseAndNormalizeCsvPayload(
  rawCsv: string,
  supplierName = 'Vendor Import'
): NormalizationPipelineResult {
  const lines = rawCsv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      supplierName,
      delimiter: ',',
      rawHeaders: [],
      resolvedMappings: [],
      unmappedHeaders: [],
      totalRowsProcessed: 0,
      validRows: [],
      quarantinedRows: [],
      summary: { validCount: 0, quarantineCount: 0, totalUnitsParsed: 0, quarantineRate: '0%' },
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseCsvLine(lines[0], delimiter);
  const { mappings, unmapped, canonicalIndexMap } = resolveHeaders(rawHeaders);

  const validRows: ValidatedIngestionRow[] = [];
  const quarantinedRows: QuarantinedRow[] = [];

  // Minimum required canonical fields: part_id and quantity
  const hasPartId = canonicalIndexMap.part_id !== undefined;
  const hasQuantity = canonicalIndexMap.quantity !== undefined;

  for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
    const rowNumber = lineIdx + 1; // 1-based CSV line number
    const line = lines[lineIdx];
    const columns = parseCsvLine(line, delimiter);

    const rawValues: Record<string, string> = {};
    rawHeaders.forEach((h, i) => {
      rawValues[h] = columns[i] ?? '';
    });

    const rejectionReasons: string[] = [];

    // Header Resolution Check
    if (!hasPartId) {
      rejectionReasons.push('Schema missing required part identifier mapping (part_id / component_id)');
    }
    if (!hasQuantity) {
      rejectionReasons.push('Schema missing required stock quantity mapping (quantity / available_units)');
    }

    // Extract Canonical Values
    const rawPartId = hasPartId ? columns[canonicalIndexMap.part_id!] : '';
    const rawQty = hasQuantity ? columns[canonicalIndexMap.quantity!] : '';
    const rawLocation =
      canonicalIndexMap.location !== undefined ? columns[canonicalIndexMap.location] : 'FAC-A';
    const rawCost =
      canonicalIndexMap.unit_cost !== undefined ? columns[canonicalIndexMap.unit_cost] : '0';

    // 1. Part ID Validation
    const cleanPartId = (rawPartId ?? '').trim().toUpperCase();
    if (!cleanPartId) {
      rejectionReasons.push('Missing required part identifier (part_id)');
    }

    // 2. Quantity Validation
    const parsedQty = parseFloat(rawQty ?? '');
    if (isNaN(parsedQty)) {
      rejectionReasons.push(`Non-numeric quantity value '${rawQty}' cannot be parsed`);
    } else if (parsedQty < 0) {
      rejectionReasons.push(`Negative stock (${parsedQty}) violates physical inventory constraints`);
    } else if (!Number.isInteger(parsedQty)) {
      rejectionReasons.push(`Fractional quantity (${parsedQty}) invalid for discrete machinery parts`);
    }

    // 3. Location Validation
    const normalizedLocation = (rawLocation ?? '').trim().toUpperCase();
    if (!normalizedLocation) {
      rejectionReasons.push('Missing location facility code');
    } else if (!RECOGNIZED_FACILITIES.has(normalizedLocation)) {
      rejectionReasons.push(
        `Unknown facility code '${rawLocation}' — must map to recognized enterprise hub (FAC-A, FAC-B, FAC-C, FAC-D)`
      );
    }

    // 4. Cost Validation
    const parsedCost = parseFloat(rawCost ?? '0');
    if (isNaN(parsedCost) || parsedCost < 0) {
      rejectionReasons.push(`Invalid unit cost '${rawCost}'`);
    }

    // Routing: Valid vs Quarantined
    if (rejectionReasons.length > 0) {
      quarantinedRows.push({
        rowNumber,
        rawLine: line,
        rawValues,
        rejectionReasons,
        severity: 'CRITICAL',
      });
    } else {
      const quantity = Math.round(parsedQty);
      const status = quantity === 0 ? 'CRITICAL' : quantity <= 2 ? 'LOW STOCK' : 'AVAILABLE';

      validRows.push({
        rowNumber,
        partId: cleanPartId,
        quantity,
        location: normalizedLocation,
        unitCost: parsedCost,
        status,
        rawValues,
      });
    }
  }

  const totalProcessed = lines.length - 1;
  const totalUnits = validRows.reduce((sum, r) => sum + r.quantity, 0);
  const qRate =
    totalProcessed > 0
      ? `${Math.round((quarantinedRows.length / totalProcessed) * 100)}%`
      : '0%';

  return {
    success: validRows.length > 0,
    supplierName,
    delimiter,
    rawHeaders,
    resolvedMappings: mappings,
    unmappedHeaders: unmapped,
    totalRowsProcessed: totalProcessed,
    validRows,
    quarantinedRows,
    summary: {
      validCount: validRows.length,
      quarantineCount: quarantinedRows.length,
      totalUnitsParsed: totalUnits,
      quarantineRate: qRate,
    },
  };
}

/**
 * Commits verified valid rows into the live operational store and records audit events.
 */
export function commitIngestionToStore(
  result: NormalizationPipelineResult
): { committed: number; quarantined: number } {
  if (!result.validRows.length) {
    return { committed: 0, quarantined: result.quarantinedRows.length };
  }

  const ingestionRecords = result.validRows.map((r) => ({
    partId: r.partId,
    quantity: r.quantity,
    location: r.location,
    status: r.status,
  }));

  operationalStore.ingestSupplierFeedRecords(result.supplierName, ingestionRecords);

  return {
    committed: result.validRows.length,
    quarantined: result.quarantinedRows.length,
  };
}
