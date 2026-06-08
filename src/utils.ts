/**
 * Extract the spreadsheet ID and optional GID from various Google Sheet URL formats.
 * Returns null if no sheet ID could be determined.
 */
export function extractSheetInfo(url: string): { sheetId: string; gid: string | null } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Pattern to find /spreadsheets/d/[ID]
  const sheetIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{15,})/);
  
  if (sheetIdMatch) {
    const sheetId = sheetIdMatch[1];
    // Find gid if present in query parameters or hash (#gid=123, ?gid=123, &gid=123)
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : null;
    return { sheetId, gid };
  }

  // If the input doesn't look like a URL but satisfies a base Sheet ID regex format, treat as ID
  if (/^[a-zA-Z0-9-_]{15,}$/.test(trimmed)) {
    return { sheetId: trimmed, gid: null };
  }

  return null;
}

/**
 * Builds the direct CSV export link for a given Spreadsheet ID and GID
 */
export function buildExportUrl(sheetId: string, gid: string | null): string {
  let url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  if (gid) {
    url += `&gid=${gid}`;
  }
  return url;
}

/**
 * Robust CSV parser that handles internal commas, double quotes, and line breaks properly.
 */
export function parseCSVToRowsAndCells(csvText: string): {
  rows: string[];
  cells: string[];
} {
  const rows: string[] = [];
  const cells: string[] = [];
  
  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Skip the second quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRecord.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRecord.push(currentField);
      currentField = '';
      records.push(currentRecord);
      currentRecord = [];
    } else {
      currentField += char;
    }
  }
  
  if (currentField !== '' || currentRecord.length > 0) {
    currentRecord.push(currentField);
    records.push(currentRecord);
  }
  
  // Clean, refine and filter records
  records.forEach(rowFields => {
    // Clean outer formatting quotes and trim spaces for each extracted cell
    const cleanedFields = rowFields
      .map(f => {
        let cleaned = f.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        }
        // Unescape internal double quotes
        return cleaned.replace(/""/g, '"');
      })
      // We want to skip completely empty cells to prevent empty slots in sample pool
      .filter(f => f !== '');
      
    if (cleanedFields.length > 0) {
      // 1. Build a text representation for the Row, separating columns cleanly
      rows.push(cleanedFields.join(' | '));
      
      // 2. Add individual cells as unique sample items
      cleanedFields.forEach(cell => {
        cells.push(cell);
      });
    }
  });
  
  return { rows, cells };
}

/**
 * Fisher-Yates shuffle implementation to randomize items
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Custom template sheet URL for quick user evaluation
 */
export const DEMO_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqATHqAKKJ14_NpH_8/edit?usp=sharing';
