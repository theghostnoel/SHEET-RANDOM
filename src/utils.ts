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
 * Simple yet robust CSV row parser that handles quotes and splits correctly.
 */
export function parseCSVToRowsAndCells(csvText: string): {
  rows: string[];
  cells: string[];
} {
  const rows: string[] = [];
  const cells: string[] = [];
  
  let currentField = '';
  let inQuotes = false;
  let currentRowFields: string[] = [];
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRowFields.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip standard \r\n line feed
      }
      currentRowFields.push(currentField.trim());
      currentField = '';
      
      // Process finished row
      const joinedRow = currentRowFields.filter(f => f !== '').join(', ');
      if (joinedRow) {
        rows.push(joinedRow);
      }
      currentRowFields.forEach(cell => {
        if (cell) cells.push(cell);
      });
      currentRowFields = [];
    } else {
      currentField += char;
    }
  }
  
  // Handle remainder
  if (currentField.trim() || currentRowFields.length > 0) {
    currentRowFields.push(currentField.trim());
    const joinedRow = currentRowFields.filter(f => f !== '').join(', ');
    if (joinedRow) {
      rows.push(joinedRow);
    }
    currentRowFields.forEach(cell => {
      if (cell) cells.push(cell);
    });
  }
  
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
