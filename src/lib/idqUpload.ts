import * as XLSX from 'xlsx';
import { IDQ_REVIEW_COLUMNS, type IdqSheet } from './idq';

export function parseIdqWorkbook(data: ArrayBuffer): IdqSheet[] {
  const book = XLSX.read(data, { type: 'array', cellText: true, cellDates: false });
  return book.SheetNames.flatMap(name => {
    const grid = XLSX.utils.sheet_to_json<string[]>(book.Sheets[name], { header: 1, raw: false, defval: '', blankrows: false });
    if (!grid.length) return [];
    const columns = grid[0].map(value => String(value));
    if (name === 'Review' && [IDQ_REVIEW_COLUMNS, IDQ_REVIEW_COLUMNS.slice(1)].some(headers => JSON.stringify(columns) === JSON.stringify(headers))) return [];
    return [{ columns, rows: grid.slice(1).map(row => Array.from({ length: Math.max(columns.length, row.length) }, (_, index) => String(row[index] ?? ''))) }];
  });
}
