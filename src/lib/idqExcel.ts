import ExcelJS from 'exceljs';
import { IDQ_SET, IDQ_URL, IDQ_SAP, IDQ_MISMATCHES, IDQ_REVIEW_COLUMNS, idqBaseResult, type IdqInput, type IdqMapping, type IdqProgress, type IdqResult } from './idq';

function sheetName(name: string, used: Set<string>) {
  const base = name.replace(/[\\/*?:\[\]\x00-\x1f]/g, ' ').replace(/^'+|'+$/g, '').trim() || 'Products';
  let result = base.slice(0, 31), suffix = 1;
  while (used.has(result.toLowerCase())) { const tail = ` (${++suffix})`; result = base.slice(0, 31 - tail.length) + tail; }
  used.add(result.toLowerCase());
  return result;
}
function configure(sheet: ExcelJS.Worksheet, headers: string[]) {
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF36483C' } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  sheet.columns.forEach(col => { col.width = 32; col.numFmt = '@'; });
}
export async function idqTemplate(mappings: IdqMapping[]) {
  const book = new ExcelJS.Workbook(), used = new Set(['review']);
  for (const mapping of mappings) {
    const sheet = book.addWorksheet(sheetName(mapping.name, used));
    const columns = [...new Set(['sku', IDQ_SET, IDQ_SAP, ...mapping.headers, IDQ_URL, 'image_url'])];
    configure(sheet, columns);
    const row = sheet.addRow(columns.map(h => h === IDQ_SET ? mapping.name : ''));
    for (let index = 0; index < columns.length; index++) {
      row.getCell(index + 1).note = columns[index] === IDQ_URL ? 'Optional public product URL. AI identifies the product from uploaded values and TinyFish searches for evidence.' :
        columns[index] === IDQ_SAP ? 'Paste all SAP data for this SKU into this cell. The original SAP text is preserved.' :
        columns[index] === IDQ_SET ? 'Use the exact attribute set name.' : `IDQ: ${Object.hasOwn(mapping.requirements, columns[index]) ? mapping.requirements[columns[index]] : 'Follow saved mapping rules'}. Verified web corrections are recorded in Review.`;
    }
  }
  return book.xlsx.writeBuffer();
}
export async function idqWorkbook(mappings: IdqMapping[], items: Array<{ input: IdqInput; progress: IdqProgress; result?: IdqResult; status: string; error?: string }>, uploadOnly = false) {
  const book = new ExcelJS.Workbook(), used = new Set(['review']);
  const review = uploadOnly ? null : book.addWorksheet('Review');
  if (review) configure(review, IDQ_REVIEW_COLUMNS);
  for (const mapping of mappings) {
    const group = items.filter(item => item.input.attributeSet === mapping.name && (!uploadOnly ||
      ['completed', 'needs_review'].includes(item.status) && (item.result || item.progress.result)?.readyForUpload === true));
    if (!group.length) continue;
    const columns = uploadOnly ? mapping.headers : [...new Set([...mapping.headers, ...group.flatMap(item => item.input.columns), 'image_url', IDQ_MISMATCHES])];
    const sheet = book.addWorksheet(sheetName(mapping.name, used));
    configure(sheet, columns);
    for (const item of group) {
      const result = item.result || item.progress.result || idqBaseResult(item.input, mapping, item.progress);
      const mismatches = (result.mismatches || []).map(change => `${change.header}: SAP ${change.sap || '(not established)'}; uploaded ${change.uploaded || '(blank)'} → verified web ${change.selected}`).join('\n');
      const row = sheet.addRow(columns.map(h => !uploadOnly && h === IDQ_MISMATCHES ? mismatches.slice(0, 32767) : Object.hasOwn(result.values, h) ? result.values[h] : ''));
      columns.forEach((header, index) => {
        const cell = row.getCell(index + 1);
        cell.numFmt = '@'; cell.alignment = { vertical: 'top', wrapText: true };
        const missing = result.missing.includes(header), conflict = result.conflicts.includes(header);
        const notes = Object.hasOwn(result.notes, header) ? [...result.notes[header]] : [];
        if (missing) notes.push('Missing mandatory value. No supported, unambiguous value was found.');
        if (notes.length) cell.note = notes.join('\n\n').slice(0, 32767);
        const color = conflict ? 'FFFFE0A3' : missing ? 'FFFFC7CE' : result.added.includes(header) ? 'FFC6EFCE' : null;
        if (color) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      });
      if (uploadOnly) continue;
      const addReview = (type: string, header: string, finding: string) => review!.addRow([item.input.values.sku || '', item.input.url, mapping.name, items.indexOf(item) + 1, item.status, type, header, finding.slice(0, 32767)]);
      for (const header of result.missing) addReview('Missing mandatory', header, 'No supported, unambiguous value.');
      for (const header of result.conflicts) addReview('Conflict', header, (result.notes[header] || []).join('\n\n'));
      for (const issue of result.issues) addReview('Review', '', issue);
      if (item.error) addReview('Processing error', '', item.error);
      if (!['completed', 'needs_review'].includes(item.status)) addReview('Incomplete product', '', 'Completed evidence is preserved; this row is included in the export.');
    }
  }
  return book.xlsx.writeBuffer();
}
