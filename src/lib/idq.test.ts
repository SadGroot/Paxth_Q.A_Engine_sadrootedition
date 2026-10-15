import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { emptyIdqProgress, IDQ_URL, IDQ_SET, idqMapping, validateIdqInput, type IdqInput, type IdqProgress } from './idq';
import { idqTemplate, idqWorkbook } from './idqExcel';
import { parseIdqWorkbook } from './idqUpload';
import { idqEvidence, mainIdqGallery, mergeIdqResult, validIdqFact, verifiedIdqSource } from '../server/idqResearch';
import { validateScrapeInput } from './scrapeNetwork';

const headers = ['sku','name','color','capacity','price','missing'];
const set = { id: 'phone', name: 'Phones', catalogHeaders: headers, catalogHeaderRequirements: Object.fromEntries(headers.map(h => [h, h === 'missing' ? 'mandatory' as const : 'optional' as const])), rulesMarkdown: 'Keep verbatim.', createdAt: 0, updatedAt: 0 };
const mapping = idqMapping(set);
const sheet = { columns: [IDQ_URL, IDQ_SET, 'sku', 'name', 'color', 'extra', 'image_url'], rows: [['https://example.com/product/x100', 'Phones', '000123', 'Existing \nTitle ™', 'Blue', '=literal text', 'https://example.com/photo.jpg']] };
const input = validateIdqInput('scraped', [sheet], [set]).items[0];
assert.throws(() => idqMapping({ ...set, catalogHeaderRequirements: {} }), /Classify every/);
for (const mutation of [
  { ...sheet, columns: [...sheet.columns, 'sku'] },
  { ...sheet, rows: Array.from({ length: 51 }, () => sheet.rows[0]) },
  { ...sheet, rows: [sheet.rows[0].map((v,i) => i === 1 ? 'Unknown' : v)] },
  { ...sheet, rows: [sheet.rows[0].map((v,i) => i === 0 ? 'file:///etc/passwd' : v)] },
]) assert.throws(() => validateIdqInput('url', [mutation], [set]));
for (const url of ['http://127.0.0.1/x', 'http://169.254.169.254/', 'http://[::1]/', 'https://example.com:1234/', 'https://user:secret@example.com/', 'http://internal/']) assert.throws(() => validateScrapeInput({ url }));
const research = { id: 'r1', url: 'https://manufacturer.example/x100', kind: 'research' as const, text: 'Model X100, Blue, 128GB. Capacity: 128GB. Color: Red. Price: 99.', receivedAt: 'now' };
const state: IdqProgress = { ...emptyIdqProgress(), sources: [research], baseline: { identity: { description: 'Phone', anchors: [{ value: 'X100', quote: 'Model X100' }], variants: [{ value: '128GB', quote: '128GB' }, { value: 'Blue', quote: 'Blue' }], market: 'AE', language: 'English' }, facts: [], issues: [] } };
const fact = (header: string, value: string, quote: string, sourceId = 'r1') => ({ header, value, evidence: [{ sourceId, quote }] });
assert.ok(verifiedIdqSource(research, state.baseline!));
assert.equal(verifiedIdqSource({ ...research, text: research.text.replaceAll('128GB', '256GB') }, state.baseline!), false);
assert.equal(validIdqFact(fact('capacity','8GB','Capacity: 128GB.'), [research], headers), false, 'A suffix of a number is not a supported value');
assert.equal(verifiedIdqSource({ ...research, text: 'Model X100Pro, Blue, 128GB.' }, state.baseline!), false);
assert.equal(validIdqFact(fact('capacity','512GB','Capacity: 128GB.'), [research], headers), false);
const matches = [{sourceId:'r1',kind:'manufacturer',verdict:'exact',quote:'Model X100, Blue, 128GB.'}];
const result = mergeIdqResult(input, mapping, state, { matches, facts: [fact('capacity','128GB','Capacity: 128GB.'), fact('price','99','Price: 99.'), fact('missing','Invented','made up', 'fabricated')], conflicts: [fact('color','Red','Color: Red.')] });
assert.equal(result.values.sku, '000123'); assert.equal(result.values.name, 'Existing \nTitle ™'); assert.equal(result.values.extra, '=literal text');
assert.equal(result.values.color, 'Blue'); assert.ok(result.conflicts.includes('color')); assert.equal(result.values.capacity, '128GB'); assert.equal(result.values.price, '');
assert.ok(result.missing.includes('missing')); assert.match(result.notes.color.join(' '), /manufacturer.example/); assert.ok(result.issues.some(i => i.includes('unsupported')));
const conflicting = mergeIdqResult(input, mapping, { ...state, sources: [research, { ...research, id: 'r2', text: research.text.replaceAll('128GB', '256GB') + ' Available in 128GB.' }] }, { matches:[...matches,{sourceId:'r2',kind:'manufacturer',verdict:'exact',quote:'Model X100, Blue, 256GB. Capacity: 256GB. Color: Red. Price: 99. Available in 128GB.'}], conflicts: [fact('capacity','128GB','Capacity: 128GB.'), fact('capacity','256GB','Capacity: 256GB.', 'r2')] });
assert.equal(conflicting.values.capacity, ''); assert.ok(conflicting.conflicts.includes('capacity'));
const unproven = mergeIdqResult(input,mapping,{...state,baseline:{...state.baseline,identity:{...state.baseline.identity,variants:[]}}},{matches,facts:[fact('capacity','128GB','Capacity: 128GB.')]});
assert.equal(unproven.values.capacity,'','Unknown variants cannot supply capacity');
const mpnSource={...research,text:'MPN: AB12345BL128. Capacity: 128GB. Battery: 5000 mAh.'};
const mpnState={...state,sources:[mpnSource],baseline:{...state.baseline,identity:{...state.baseline.identity,anchors:[{value:'AB12345BL128',quote:'MPN: AB12345BL128',kind:'mpn' as const}],variants:[]}}};
const mpnResult=mergeIdqResult(input,{...mapping,headers:[...mapping.headers,'battery_capacity']},mpnState,{matches:[{sourceId:'r1',kind:'manufacturer',verdict:'exact',quote:'MPN: AB12345BL128.'}],facts:[fact('capacity','128GB','Capacity: 128GB.'),fact('battery_capacity','5000 mAh','Battery: 5000 mAh.')]});
assert.equal(mpnResult.values.capacity,'128GB');assert.equal(mpnResult.values.battery_capacity,'5000 mAh');
const blog=mergeIdqResult(input,mapping,state,{matches:[{...matches[0],kind:'other'}],facts:[fact('capacity','128GB','Capacity: 128GB.')]});assert.equal(blog.values.capacity,'');

const duplicateConflict=mergeIdqResult(input,mapping,state,{matches,facts:[fact('color','Red','Color: Red.')],conflicts:[fact('color','Red','Color: Red.')]});
assert.ok(duplicateConflict.conflicts.includes('color'));
assert.equal(mainIdqGallery({...state,baseline:{...state.baseline,galleryId:'nav'},galleries:[{id:'nav',label:'Phone X100',images:[{url:'https://cdn.example/product-list/x100.jpg',alt:'X100'}]}]}),undefined);
const longPage='[Navigation](https://example.com/nav)\n'.repeat(400)+'\n# Phone X100 Blue 128GB specifications\nCapacity: 128GB. Battery: 5000 mAh. Material: metal.\n'+'[Footer](https://example.com/footer)\n'.repeat(400);
const focused=idqEvidence(longPage,6000,mapping,state);assert.ok(focused.length<=6000);assert.match(focused,/Battery: 5000 mAh/);
const second = { ...mapping, name: 'Other/Phones' };
const buffer = await idqWorkbook([mapping, second], [
  { input, progress: state, result, status: 'needs_review' },
  { input: { ...input, attributeSet: second.name }, progress: emptyIdqProgress(), status: 'cancelled' },
]);
const book = new ExcelJS.Workbook(); await book.xlsx.load(buffer as any);
assert.equal(book.worksheets.length, 3); assert.ok(book.getWorksheet('Review')!.rowCount > 2);
const output = book.getWorksheet('Phones')!;
const outputHeaders = output.getRow(1).values as string[];
assert.deepEqual(outputHeaders.slice(1, 7), headers);
assert.equal(outputHeaders.filter(h => h === 'image_url').length, 1);
const cell = (h: string) => output.getRow(2).getCell(outputHeaders.indexOf(h));
assert.equal(cell('sku').value, '000123'); assert.equal(cell('name').value, 'Existing \nTitle ™'); assert.equal(cell('extra').value, '=literal text');
assert.match(String(cell('name').note), /Supplied catalog data; not re-fetched/);
assert.match(String(cell('capacity').note), /https:\/\/manufacturer.example/);
assert.equal((cell('capacity').fill as any).fgColor.argb, 'FFC6EFCE'); assert.equal((cell('color').fill as any).fgColor.argb, 'FFFFE0A3'); assert.equal((cell('missing').fill as any).fgColor.argb, 'FFFFC7CE');
const template = new ExcelJS.Workbook(); await template.xlsx.load(await idqTemplate([mapping]) as any);
assert.equal(template.getWorksheet(1)!.getRow(1).getCell(1).value, IDQ_URL);
const rawBook = XLSX.utils.book_new(); const rawSheet = XLSX.utils.aoa_to_sheet([sheet.columns, sheet.rows[0]]);
rawSheet.C2 = { t: 'n', v: 123, z: '000000' }; XLSX.utils.book_append_sheet(rawBook, rawSheet, 'Review');
const parsed = parseIdqWorkbook(XLSX.write(rawBook, { type: 'array', bookType: 'xlsx' }));
assert.equal(parsed[0].rows[0][2], '000123');
const specialInput = { ...input, columns:[...input.columns,'toString','__proto__'], values:{...input.values,toString:'', ['__proto__']:'Kept literal'} };
const special = new ExcelJS.Workbook(); await special.xlsx.load(await idqWorkbook([mapping],[{input:specialInput,progress:emptyIdqProgress(),status:'cancelled'}]) as any);
assert.equal(special.getWorksheet('Phones')!.getRow(2).getCell((special.getWorksheet('Phones')!.getRow(1).values as string[]).indexOf('__proto__')).value, 'Kept literal');
assert.throws(() => validateIdqInput(['url'], [sheet], [set]));
assert.throws(() => idqMapping({...set,catalogHeaderRequirements:{...set.catalogHeaderRequirements,name:['mandatory'] as any}}));
console.log('IDQ validation, preserved text, variants, evidence, mixed sets and Excel comments passed.');
