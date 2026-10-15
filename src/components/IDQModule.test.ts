import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import * as XLSX from 'xlsx';
import { idqTemplate } from '../lib/idqExcel';
import { IDQ_SET, IDQ_URL } from '../lib/idq';

const headers=['sku','base_code','attributes__lulu_ean','attributes__shipping_weight','attributes__brand','attributes__lulu_product_type','name'];
const attributeSets=[{id:'phones',name:'Phones',rulesMarkdown:'Keep existing values.',catalogHeaders:headers,catalogHeaderRequirements:Object.fromEntries(headers.map(h=>[h,'optional'])),createdAt:Date.now(),updatedAt:Date.now()}];
const mapping={id:'phones',name:'Phones',headers,requirements:attributeSets[0].catalogHeaderRequirements,rules:'Keep existing values.'} as any;
const template=Buffer.from(await idqTemplate([mapping]));
const item={position:0,url:'https://example.com/phone',attributeSet:'Phones',status:'running',stage:'Researching product evidence',searches:1,reads:2,result:{values:{sku:'000123',name:'Existing title'},added:[],notes:{},conflicts:[],missing:['name'],issues:['Review exact capacity.']}};
let job:any=null,createCalls=0,cancelCalls=0,resumeCalls=0,templateCalls=0,requirementsSaved=false;
const vite=await createServer({cacheDir:'/tmp/paxth-idq-vite-cache',server:{host:'127.0.0.1',port:0,hmr:false},logLevel:'error'});
let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
try {
  await vite.listen();browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1700,height:1100}});page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(60000);
  await page.route('**/api/**',async route=>{
    const req=route.request(),path=new URL(req.url()).pathname;
    if(path==='/api/auth/me')return route.fulfill({json:{id:'operator',username:'Operator',role:'admin'}});
    if(path==='/api/db-status')return route.fulfill({json:{status:'connected'}});
    if(path==='/api/qa-configuration')return route.fulfill({json:{qaAgentMemory:'Memory',attributeSets}});
    if(path==='/api/attribute-sets/phones'&&req.method()==='PUT'){const data=req.postDataJSON();assert.equal(data.catalogHeaderRequirements.name,'mandatory');Object.assign(attributeSets[0],data);requirementsSaved=true;return route.fulfill({json:attributeSets[0]});}
    if(path==='/api/catalog'||path==='/api/jobs'||path==='/api/job-runs'||path==='/api/users')return route.fulfill({json:[]});
    if(path==='/api/idq/jobs/template'){templateCalls++;assert.deepEqual(req.postDataJSON().attributeSetIds,['phones']);return route.fulfill({body:template,contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});}
    if(path==='/api/idq/jobs'){
      if(req.method()==='GET')return route.fulfill({json:job?[job]:[]});
      const data=req.postDataJSON();createCalls++;assert.equal(data.mode,'scraped');assert.equal(data.sheets[0].rows[0][2],'000123');assert.equal(data.sheets[0].rows[0][4],'Extra ™');assert.ok(data.requestId);
      job={id:'idq-job',name:data.name,actorId:'operator',status:'running',mode:'scraped',modelName:'z-ai/glm-5.3-flash',createdAt:new Date().toISOString(),total:1,finished:0,mappings:[mapping],items:[item]};return route.fulfill({status:201,json:job});
    }
    if(path==='/api/idq/jobs/idq-job/cancel'){cancelCalls++;job.status='cancelled';item.status='cancelled';return route.fulfill({json:job});}
    if(path==='/api/idq/jobs/idq-job/resume'){resumeCalls++;job.status='completed';job.finished=1;item.status='completed';return route.fulfill({json:job});}
    if(path==='/api/idq/jobs/idq-job/export')return route.fulfill({body:template,contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    if(path==='/api/idq/jobs/idq-job')return route.fulfill({json:job});
    return route.fulfill({status:404,json:{error:'Unexpected endpoint '+path}});
  });
  await page.goto(vite.resolvedUrls!.local[0]);
  await page.getByRole('button',{name:'IDQ',exact:true}).click();
  assert.equal(await page.getByLabel('Excel workbook (.xlsx or .xls)',{exact:true}).count(),0,'Mode must be chosen before upload');
  await page.getByLabel('Input mode',{exact:true}).selectOption('url');
  await page.getByText('Download a template',{exact:true}).click();await page.getByRole('checkbox',{name:'Phones',exact:true}).check();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download selected templates'}).click();await download;assert.equal(templateCalls,1);
  const workbook=(set:string)=>{const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([[IDQ_URL,IDQ_SET,'sku','name','extra'],['https://example.com/phone',set,'000123','Existing title','Extra ™']]),'Input');return Buffer.from(XLSX.write(book,{type:'buffer',bookType:'xlsx'}));};
  await page.getByLabel('Input mode',{exact:true}).selectOption('scraped');
  await page.getByLabel('Excel workbook (.xlsx or .xls)',{exact:true}).setInputFiles({name:'bad.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:workbook('Unknown')});
  await page.getByRole('alert').filter({hasText:'Unknown attribute set'}).waitFor();assert.ok(await page.getByRole('button',{name:'Start enrichment'}).isDisabled());assert.equal(createCalls,0);
  await page.getByLabel('Excel workbook (.xlsx or .xls)',{exact:true}).setInputFiles({name:'catalog.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:workbook('Phones')});
  await page.getByText('catalog.xlsx: 1 products across 1 attribute sets.',{exact:false}).waitFor();
  await page.getByRole('button',{name:'Start enrichment'}).click();await page.getByRole('button',{name:'Cancel batch'}).waitFor();assert.equal(createCalls,1);
  await page.getByRole('button',{name:'Cancel batch'}).click();await page.getByRole('button',{name:'Resume unfinished products'}).click();await page.getByRole('progressbar',{name:'Batch progress'}).waitFor();assert.equal(cancelCalls,1);assert.equal(resumeCalls,1);
  const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Download workbook',exact:true}).click();await exported;
  await page.reload();await page.getByRole('button',{name:'IDQ',exact:true}).click();await page.getByRole('button',{name:'catalog completed · 1/1',exact:false}).click();await page.getByRole('progressbar',{name:'Batch progress'}).waitFor();
  await page.getByRole('button',{name:'Attribute Sets',exact:true}).click();await page.getByText('Phones',{exact:true}).click();await page.getByRole('button',{name:'Catalog Output Headers',exact:true}).click();
  await page.getByLabel('name',{exact:true}).selectOption('mandatory');await page.getByRole('button',{name:'Update Logic',exact:true}).click();
  await page.waitForTimeout(300);assert.ok(requirementsSaved);
  console.log('IDQ browser flow passed: mode-first upload, template, invalid set rejection, identifiers/extras, create, progress, cancel/resume, download, history and requirement editing.');
}finally{await browser?.close();await vite.close();}
