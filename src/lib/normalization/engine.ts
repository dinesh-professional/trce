import {
  CanonicalField,
  SupplierPreset,
  FieldMapping,
  HarmonizedRecord,
  HarmonizedStatus,
  NormalizationResult,
} from './types';

// Standard dictionary of aliases for deterministic column mapping
const ALIAS_MAP: Record<CanonicalField, string[]> = {
  part_id: [
    'part_no',
    'component_id',
    'sku',
    'part_number',
    'item_code',
    'partid',
    'part_id',
    'part#',
    'partnum',
    'material_no',
  ],
  quantity: [
    'qty',
    'available_units',
    'stock',
    'quantity',
    'available_stock',
    'inventory_qty',
    'units',
    'count',
    'on_hand',
  ],
  location: [
    'warehouse',
    'site',
    'location_code',
    'location',
    'facility',
    'plant',
    'depot',
    'whse',
    'loc',
  ],
};

export const SUPPLIER_PRESETS: SupplierPreset[] = [
  {
    id: 'supplier-a',
    name: 'Supplier A',
    code: 'SUP-A',
    filename: 'supplier_a_inventory.csv',
    description: 'Uses legacy industrial naming: [part_no, qty, warehouse]',
    csvContent: `part_no,qty,warehouse
BRG-204,4,FAC-C
MTR-102,2,FAC-B
PMP-501,8,FAC-D`,
  },
  {
    id: 'supplier-b',
    name: 'Supplier B',
    code: 'SUP-B',
    filename: 'supplier_b_feed.csv',
    description: 'Uses component logistics format: [component_id, available_units, site]',
    csvContent: `component_id,available_units,site
BRG-204,7,FAC-D
MTR-102,5,FAC-B
PMP-501,3,FAC-A`,
  },
  {
    id: 'supplier-c',
    name: 'Supplier C',
    code: 'SUP-C',
    filename: 'supplier_c_stock.csv',
    description: 'Uses retail/ERP naming: [SKU, stock, location_code]',
    csvContent: `SKU,stock,location_code
BRG-204,3,FAC-B
MTR-102,1,FAC-A
PMP-501,6,FAC-C`,
  },
  {
    id: 'invalid-schema',
    name: 'Unrecognized Schema (Validation Test)',
    code: 'SCHEMA-ERR',
    filename: 'unrecognized_vendor_export.csv',
    description: 'Malformed headers with no part identifier to verify error resilience',
    csvContent: `vendor_timestamp,dept_code,metric_val
2026-10-24,DEPT-09,92.5
2026-10-24,DEPT-12,18.4`,
  },
];

/**
 * Normalizes a raw string header by stripping whitespace, underscores, dashes, and lowering case.
 */
function normalizeHeaderName(header: string): string {
  return header.trim().toLowerCase().replace(/[\s\-_]/g, '');
}

/**
 * Maps a single raw header to a canonical field using deterministic rules.
 */
function resolveFieldMapping(rawHeader: string): { target: CanonicalField; confidence: number } | null {
  const clean = normalizeHeaderName(rawHeader);

  for (const [canonicalKey, aliases] of Object.entries(ALIAS_MAP)) {
    for (const alias of aliases) {
      const cleanAlias = normalizeHeaderName(alias);
      if (clean === cleanAlias) {
        return { target: canonicalKey as CanonicalField, confidence: 1.0 };
      }
    }
  }

  // Substring match fallback for slight variations
  for (const [canonicalKey, aliases] of Object.entries(ALIAS_MAP)) {
    for (const alias of aliases) {
      const cleanAlias = normalizeHeaderName(alias);
      if (clean.includes(cleanAlias) || cleanAlias.includes(clean)) {
        return { target: canonicalKey as CanonicalField, confidence: 0.85 };
      }
    }
  }

  return null;
}

/**
 * Calculates item status based on inventory quantity.
 */
export function deriveStatusFromQuantity(qty: number): HarmonizedStatus {
  if (qty === 0) return 'CRITICAL';
  if (qty <= 2) return 'LOW STOCK';
  return 'AVAILABLE';
}

/**
 * Parses raw CSV text into rows of string arrays.
 */
export function parseCsvText(rawText: string): string[][] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((line) => {
    // Robust simple CSV splitting handling basic quotes
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    tokens.push(current.trim());
    return tokens;
  });
}

/**
 * Harmonizes raw supplier CSV data into the unified Trce schema.
 */
export function harmonizeSupplierData(
  rawContent: string,
  supplierName = 'Supplier B'
): NormalizationResult {
  // 1. Check for empty input
  if (!rawContent || rawContent.trim().length === 0) {
    return {
      success: false,
      supplierName,
      error: 'The uploaded file is empty. Please provide a valid CSV file with header and data rows.',
      rawHeaders: [],
      rawRecords: [],
      mappings: [],
      unresolvedFields: [],
      harmonizedRecords: [],
      stats: { totalRecords: 0, fieldsStandardized: 0, unresolved: 0 },
    };
  }

  const rows = parseCsvText(rawContent);

  if (rows.length === 0) {
    return {
      success: false,
      supplierName,
      error: 'No readable data rows found in the supplier file.',
      rawHeaders: [],
      rawRecords: [],
      mappings: [],
      unresolvedFields: [],
      harmonizedRecords: [],
      stats: { totalRecords: 0, fieldsStandardized: 0, unresolved: 0 },
    };
  }

  const rawHeaders = rows[0];

  if (rows.length === 1) {
    return {
      success: false,
      supplierName,
      error: 'File contains headers but zero data rows. At least one record is required.',
      rawHeaders,
      rawRecords: [],
      mappings: [],
      unresolvedFields: [],
      harmonizedRecords: [],
      stats: { totalRecords: 0, fieldsStandardized: 0, unresolved: 0 },
    };
  }

  // 2. Perform Schema Mapping
  const mappings: FieldMapping[] = [];
  const unresolvedFields: string[] = [];
  const fieldToHeaderMap: Partial<Record<CanonicalField, string>> = {};

  for (const header of rawHeaders) {
    const match = resolveFieldMapping(header);
    if (match) {
      if (!fieldToHeaderMap[match.target]) {
        fieldToHeaderMap[match.target] = header;
        mappings.push({
          rawField: header,
          targetField: match.target,
          confidence: match.confidence,
          reason: `Mapped via deterministic alias dictionary rule for '${match.target}'`,
        });
      } else {
        // Redundant header mapping
        unresolvedFields.push(header);
      }
    } else {
      unresolvedFields.push(header);
    }
  }

  // 3. Validate Required Canonical Fields
  if (!fieldToHeaderMap.part_id) {
    return {
      success: false,
      supplierName,
      error: 'Could not identify a part identifier in this supplier file. Supported headers: part_no, component_id, SKU, part_number, item_code.',
      rawHeaders,
      rawRecords: [],
      mappings,
      unresolvedFields,
      harmonizedRecords: [],
      stats: { totalRecords: 0, fieldsStandardized: mappings.length, unresolved: unresolvedFields.length },
    };
  }

  if (!fieldToHeaderMap.quantity) {
    return {
      success: false,
      supplierName,
      error: 'Could not identify a quantity column in this supplier file. Supported headers: qty, available_units, stock, quantity.',
      rawHeaders,
      rawRecords: [],
      mappings,
      unresolvedFields,
      harmonizedRecords: [],
      stats: { totalRecords: 0, fieldsStandardized: mappings.length, unresolved: unresolvedFields.length },
    };
  }

  if (!fieldToHeaderMap.location) {
    return {
      success: false,
      supplierName,
      error: 'Could not identify a warehouse/location column in this supplier file. Supported headers: warehouse, site, location_code, location.',
      rawHeaders,
      rawRecords: [],
      mappings,
      unresolvedFields,
      harmonizedRecords: [],
      stats: { totalRecords: 0, fieldsStandardized: mappings.length, unresolved: unresolvedFields.length },
    };
  }

  // 4. Parse Raw Records and Transform into Harmonized Schema
  const rawRecords: Record<string, string>[] = [];
  const harmonizedRecords: HarmonizedRecord[] = [];
  const warnings: string[] = [];

  const partHeader = fieldToHeaderMap.part_id!;
  const qtyHeader = fieldToHeaderMap.quantity!;
  const locHeader = fieldToHeaderMap.location!;

  const partIdx = rawHeaders.indexOf(partHeader);
  const qtyIdx = rawHeaders.indexOf(qtyHeader);
  const locIdx = rawHeaders.indexOf(locHeader);

  for (let r = 1; r < rows.length; r++) {
    const rowValues = rows[r];
    const recordObj: Record<string, string> = {};

    for (let c = 0; c < rawHeaders.length; c++) {
      recordObj[rawHeaders[c]] = rowValues[c] ?? '';
    }
    rawRecords.push(recordObj);

    const rawPart = rowValues[partIdx] ?? '';
    const rawQtyStr = rowValues[qtyIdx] ?? '';
    const rawLoc = rowValues[locIdx] ?? '';

    if (!rawPart) {
      warnings.push(`Row ${r}: Missing part identifier; record skipped.`);
      continue;
    }

    const parsedQty = parseInt(rawQtyStr, 10);
    const quantity = isNaN(parsedQty) || parsedQty < 0 ? 0 : parsedQty;

    if (isNaN(parsedQty)) {
      warnings.push(`Row ${r}: Invalid non-numeric quantity '${rawQtyStr}'; defaulted to 0.`);
    }

    const status = deriveStatusFromQuantity(quantity);

    harmonizedRecords.push({
      partId: rawPart.toUpperCase(),
      quantity,
      location: rawLoc.toUpperCase() || 'UNKNOWN',
      status,
      supplier: supplierName,
      rawValues: recordObj,
    });
  }

  return {
    success: true,
    supplierName,
    warnings: warnings.length > 0 ? warnings : undefined,
    rawHeaders,
    rawRecords,
    mappings,
    unresolvedFields,
    harmonizedRecords,
    stats: {
      totalRecords: harmonizedRecords.length,
      fieldsStandardized: mappings.length,
      unresolved: unresolvedFields.length,
    },
  };
}
