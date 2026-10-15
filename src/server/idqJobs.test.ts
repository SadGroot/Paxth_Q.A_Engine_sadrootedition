import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import express from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import ExcelJS from 'exceljs';
import * as schema from '../db/schema';
import { initializeDatabase } from './database';
import { initializeQaConfiguration } from '../db/qaConfiguration';
import { initializeAuth, registerAuth, hashSessionToken } from './auth';
import { initializeProvider } from './provider';
import { initializeIdq, readIdqJob, registerIdqRoutes, startIdqWorker } from './idqJobs';
import { ApiError } from './catalog';
import { idqBaseResult, IDQ_SET, IDQ_URL } from '../lib/idq';

assert.ok(process.env.TEST_DATABASE_URL,'Set TEST_DATABASE_URL to a disposable database; the test uses an isolated schema.');
const namespace=`idq_${randomUUID().replaceAll('-','')}`;
const root=new Pool({connectionString:process.env.TEST_DATABASE_URL});await root.query(`CREATE SCHEMA ${namespace}`);
const pool=new Pool({connectionString:process.env.TEST_DATABASE_URL,options:`-c search_path=${namespace}`,max:10});
const app=express(),server=createServer(app);let stop:(()=>Promise<void>)|undefined;
process.env.LLM_BASE_URL='http://127.0.0.1:1/v1';process.env.LLM_API_KEY='test-key';process.env.CRAWL4AI_API_KEY='test-crawl';process.env.NODE_ENV='test';
try {
  await initializeDatabase(pool);await initializeQaConfiguration(drizzle(pool,{schema}));await initializeAuth(pool);await initializeProvider(pool);await initializeIdq(pool);await initializeIdq(pool);
  const headers=['sku','name','capacity'];const requirements={sku:'mandatory',name:'optional',capacity:'mandatory'};
  await pool.query('INSERT INTO attribute_sets(id,name,rules_markdown,catalog_headers,catalog_header_requirements) VALUES($1,$2,$3,$4,$5),($6,$7,$3,$4,$5),($8,$9,$3,$4,$10)',
    ['a','Phones','Snapshot rule',JSON.stringify(headers),JSON.stringify(requirements),'b','Other Phones','u','Unclassified','{}']);
  await pool.query("INSERT INTO users(id,username,password,role) VALUES('operator','Operator','unused','user'),('other','Other','unused','user'),('admin','Admin','unused','admin')");
  const cookies:Record<string,string>={};
  for(const id of ['operator','other','admin']){const token=randomBytes(32).toString('hex');await pool.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",[hashSessionToken(token),id]);cookies[id]=`paxth_session=${token}`;}
  app.use(express.json());await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${(server.address() as any).port}`;process.env.APP_ORIGIN=origin;
  registerAuth(app,pool);registerIdqRoutes(app,pool);
  app.use((error:any,_req:any,res:any,_next:any)=>res.status(error instanceof ApiError?error.status:503).json({error:error.message}));
  const request=async(path:string,method='GET',body?:any,actor='operator',requestOrigin=origin)=>{
    const res=await fetch(origin+'/api/idq/jobs'+path,{method,headers:{Origin:requestOrigin,Cookie:cookies[actor]||'','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    return {status:res.status,body:await res.json()};
  };
  assert.equal((await request('','GET',undefined,'anonymous')).status,401);
  assert.equal((await request('','POST',{},'operator','https://attacker.example')).status,403);
  const sheet={columns:[IDQ_URL,IDQ_SET,'sku','name','extra'],rows:[['https://example.com/product/a','Phones','0001','Original title','extra A'],['https://example.com/product/b','Other Phones','0002','Other title','extra B']]};
  const payload=()=>({requestId:randomUUID(),name:'IDQ integration',mode:'scraped',sheets:[structuredClone(sheet)]});
  const unclassified=payload();unclassified.sheets[0].rows[0][1]='Unclassified';assert.equal((await request('','POST',unclassified)).status,400);
  const invalid=payload();invalid.sheets[0].rows[0][0]='http://127.0.0.1/secret';assert.equal((await request('','POST',invalid)).status,400);
  const tooMany=payload();tooMany.sheets[0].rows=Array.from({length:51},()=>sheet.rows[0]);assert.equal((await request('','POST',tooMany)).status,400);
  const duplicate=payload();duplicate.sheets[0].columns.push('sku');assert.equal((await request('','POST',duplicate)).status,400);
  const unknown=payload();unknown.sheets[0].rows[0][1]='Unknown';assert.equal((await request('','POST',unknown)).status,400);
  assert.equal((await pool.query('SELECT count(*) FROM idq_jobs')).rows[0].count,'0');
  const body=payload(),created=await request('','POST',body);assert.equal(created.status,201);
  const id=created.body.id;assert.equal((await request('','POST',body)).body.id,id,'Create is idempotent across retries');
  assert.equal((await pool.query('SELECT count(*) FROM idq_items')).rows[0].count,'2');
  const saved=(await pool.query('SELECT configuration FROM idq_jobs WHERE id=$1',[id])).rows[0].configuration;
  assert.equal(saved.mappings[0].rules,'Snapshot rule');assert.equal(saved.settings.modelName,'deepseek/deepseek-v4.1-flash');assert.deepEqual(saved.limits,{products:50,searches:4,reads:6,totalMs:600000,finalMs:90000});
  await pool.query("UPDATE attribute_sets SET rules_markdown='Changed rules' WHERE id='a'");
  assert.equal((await pool.query('SELECT configuration FROM idq_jobs WHERE id=$1',[id])).rows[0].configuration.mappings[0].rules,'Snapshot rule');
  assert.equal((await request(`/${id}/cancel`,'POST',undefined,'other')).status,403);
  assert.equal((await request(`/${id}/cancel`,'POST')).body.status,'cancelled','Queued cancellation does not wait for a worker');
  assert.equal((await request(`/${id}/resume`,'POST')).body.status,'queued');
  const template=await fetch(origin+'/api/idq/jobs/template',{method:'POST',headers:{Origin:origin,Cookie:cookies.operator,'Content-Type':'application/json'},body:JSON.stringify({attributeSetIds:['a','b']})});assert.equal(template.status,200);
  const templateBook=new ExcelJS.Workbook();await templateBook.xlsx.load(await template.arrayBuffer() as any);assert.equal(templateBook.worksheets.length,2);
  const waitFor=async(test:()=>Promise<boolean>)=>{for(let i=0;i<150;i++){if(await test())return;await delay(50);}throw new Error('Timed out waiting for IDQ worker.');};
  let captures=0,hold=true,runs=0;
  const runner:Parameters<typeof startIdqWorker>[1]=async(input,mapping,_config,progress,signal,checkpoint)=>{
    runs++;
    if(!progress.capture){captures++;progress.capture={id:'original',kind:'original',url:input.url,text:'Phone X100',receivedAt:'now'};await checkpoint(progress);}
    if(hold)await new Promise<void>((_resolve,reject)=>{signal.addEventListener('abort',()=>reject(signal.reason),{once:true});if(signal.aborted)reject(signal.reason);});
    const result=idqBaseResult(input,mapping,progress);result.values.capacity='128GB';result.added=['capacity'];result.missing=[];result.notes.capacity=['Retrieved source\nURL: https://example.com/evidence\nFinding: Capacity 128GB'];return result;
  };
  stop=startIdqWorker(pool,runner);await waitFor(async()=>captures===1);
  await stop();stop=undefined;
  assert.equal((await readIdqJob(pool,id)).items[0].status,'running');
  stop=startIdqWorker(pool,runner);await waitFor(async()=>runs===2);assert.equal(captures,1,'Worker restart reused saved capture');
  assert.equal((await request(`/${id}/cancel`,'POST')).status,200);
  await waitFor(async()=>(await readIdqJob(pool,id)).status==='cancelled');
  const cancelled=await readIdqJob(pool,id);assert.ok(cancelled.items.every((item:any)=>item.status==='cancelled'));
  assert.equal((await request(`/${id}/resume`,'POST',undefined,'other')).status,403);
  hold=false;assert.equal((await request(`/${id}/resume`,'POST')).status,200);
  await waitFor(async()=>(await readIdqJob(pool,id)).status==='completed');
  assert.equal(captures,2,'Each product captured only once, including cancellation/resume');
  const completed=await readIdqJob(pool,id);assert.equal(completed.finished,2);assert.equal(completed.items[0].result.values.sku,'0001');
  const exportRes=await fetch(origin+`/api/idq/jobs/${id}/export`,{headers:{Cookie:cookies.operator}});assert.equal(exportRes.status,200);
  const book=new ExcelJS.Workbook();await book.xlsx.load(await exportRes.arrayBuffer() as any);assert.equal(book.worksheets.length,3);assert.equal(book.getWorksheet('Phones')!.getRow(2).getCell(1).value,'0001');
  assert.equal((await pool.query('SELECT count(*) FROM sku_data')).rows[0].count,'0','IDQ does not alter the catalog');assert.equal((await pool.query('SELECT count(*) FROM jobs')).rows[0].count,'0');
  assert.equal((await request('')).body.length,1);assert.equal((await request('/missing')).status,404);
  console.log('IDQ authenticated API, validation, snapshots, templates, mixed sets, worker recovery, ownership, cancel/resume, export and catalog isolation passed.');
} finally {await stop?.();server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pool.end();await root.query(`DROP SCHEMA ${namespace} CASCADE`);await root.end();}
