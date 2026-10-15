import { mkdir, writeFile } from 'node:fs/promises';
import { pool } from '../src/db/index';
import { getProviderSettings } from '../src/server/provider';
import { runIdqProduct } from '../src/server/idqResearch';
import { emptyIdqProgress, IDQ_LIMITS, IDQ_SET, IDQ_URL, type IdqConfig, type IdqInput, type IdqMapping } from '../src/lib/idq';
import { idqWorkbook } from '../src/lib/idqExcel';

const url = process.argv[2];
if (!url || !pool) throw new Error('Usage: npm run test:idq-live -- https://public-product-detail-url (uses current server credentials and a small paid pilot).');
const directory = '.cache/idq-pilot'; await mkdir(directory,{recursive:true});
try {
  const settings = await getProviderSettings(pool);
  const headers = ['name','description','bullet_points','specifications','brand','model','color','capacity','image_url'];
  const mapping: IdqMapping = { id:'pilot',name:'IDQ pilot',headers,requirements:Object.fromEntries(headers.map(h=>[h,['name','brand','model'].includes(h)?'mandatory':'optional'])),rules:'Extract verbatim product evidence. Do not invent variants, product features or missing identifiers.' };
  const config: IdqConfig = {mode:'url',mappings:[mapping],settings,limits:IDQ_LIMITS};
  let input: IdqInput = {url,attributeSet:mapping.name,columns:[IDQ_URL,IDQ_SET,...headers],values:{[IDQ_URL]:url,[IDQ_SET]:mapping.name}};
  for (const mode of ['url','scraped'] as const) {
    const state=emptyIdqProgress();let previous='';
    const result=await runIdqProduct(input,mapping,{...config,mode},state,new AbortController().signal,async p=>{
      if (p.stage!==previous) {previous=p.stage||'';console.log(`${mode}: ${previous}`);}
      await writeFile(`${directory}/${mode}-progress.json`,JSON.stringify(p,null,2));
    });
    await writeFile(`${directory}/${mode}.xlsx`,Buffer.from(await idqWorkbook([mapping],[{input,progress:state,result,status:result.issues.length||result.missing.length||result.conflicts.length?'needs_review':'completed'}])));
    console.log(JSON.stringify({mode,model:settings.modelName,searches:state.searches.length,reads:state.reads.length,added:result.added,missing:result.missing,conflicts:result.conflicts,issues:result.issues}));
    input={...input,values:{...input.values,...result.values}};
  }
} finally {await pool.end();}
