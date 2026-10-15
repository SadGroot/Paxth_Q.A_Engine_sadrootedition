import assert from 'node:assert/strict';
import { runIdqProduct } from './idqResearch';
import { emptyIdqProgress, IDQ_LIMITS, type IdqConfig, type IdqInput, type IdqMapping, type IdqProgress } from '../lib/idq';
import { normalizeSettings } from '../lib/providerSettings';
import { completeQa } from './provider';

const input: IdqInput = { url: 'https://store.example/product', attributeSet: 'Phones', columns: ['attributes__url','attributes__attribute_set','sku','name','image_url'], values: { attributes__url: 'https://store.example/product', attributes__attribute_set: 'Phones', sku: '0001', name: 'Phone X100 Blue 128GB', image_url: '' } };
const mapping: IdqMapping = { id: 'phones', name: 'Phones', headers: ['sku','name','capacity','color','image_url'], requirements: { sku:'mandatory',name:'mandatory',capacity:'mandatory',color:'optional',image_url:'optional' }, rules: '' };
const config: IdqConfig = { mode: 'url', mappings:[mapping], settings: normalizeSettings({}), limits: IDQ_LIMITS };
const page = (url: string) => ({ markdown: 'Phone X100 Blue 128GB. Capacity: 128GB. Color: Blue.', requestedUrl: url, finalUrl: null, capturedAt: null, status: 'collected' as const, receivedAt: 'now', report: { durationMs: 1, characters: 60, warnings: [] }, imageGalleries: [
  { id:'ads',label:'promotional carousel',images:[{identity:'ad',url:'https://cdn.example/ad.jpg',alt:'ad'}] },
  { id:'main',label:'product gallery',images:[{identity:'first',url:'https://cdn.example/first.jpg',alt:'first'}, {identity:'second',url:'https://cdn.example/second.jpg',alt:'second'}] },
] });
const response = (data: any) => ({ choices: [{ finish_reason:'stop', message:{role:'assistant',content:JSON.stringify(data)} }] });
const baseline = { identity: { description:'Phone X100',anchors:[{value:'X100',quote:'Phone X100'}],variants:[{value:'Blue',quote:'Blue'},{value:'128GB',quote:'128GB'}],market:'AE',language:'English' },facts:[],galleryId:'main',issues:[] };
const tool = (name: string, args: any, id: string) => ({id,type:'function',function:{name,arguments:JSON.stringify(args)}});
const assistant = (tool_calls: any[]) => ({ choices:[{finish_reason:'tool_calls',message:{role:'assistant',content:null,tool_calls}}] });
const facts = [{ header:'capacity',value:'128GB',evidence:[{sourceId:'research-1',quote:'Capacity: 128GB.'}] }];
let collected: string[] = [], searches = 0, images: string[] = [], modelCalls = 0;
const deps = {
  collect: async (url: string) => { collected.push(url); return page(url); },
  search: async () => { searches++; return [{title:'Manufacturer X100',url:'https://maker.example/x100',snippet:'Unusable snippet'}]; },
  image: async (url: string) => { images.push(url); },
  complete: async (payload: any, _signal: AbortSignal, options: any) => {
    assert.equal(payload.model, config.settings.modelName);
    assert.equal(payload.reasoning_effort, 'medium', 'IDQ JSON and tool calls use the saved effort');
    modelCalls++; await options.beforeAttempt(1, payload);
    if (!payload.tools) return response(payload.messages[1].content.includes('"task":"Extract title') ? baseline : {matches:[{sourceId:'research-1',kind:'manufacturer',verdict:'exact',quote:'Phone X100 Blue 128GB.'}],facts,conflicts:[],issues:[]});
    const toolOutputs = payload.messages.filter((m: any) => m.role === 'tool');
    if (!toolOutputs.length) return assistant([tool('search_web',{query:'X100 Blue 128GB manufacturer'},'s')]);
    if (toolOutputs.length === 1) return assistant([tool('read_page',{url:'https://maker.example/x100'},'r')]);
    return response({done:true});
  },
};
const state = emptyIdqProgress();
const result = await runIdqProduct(input,mapping,config,state,new AbortController().signal,async () => {},deps);
assert.deepEqual(collected,[input.url,'https://maker.example/x100']); assert.equal(searches,1); assert.deepEqual(images,['https://cdn.example/first.jpg']);
assert.equal(result.values.image_url,'https://cdn.example/first.jpg'); assert.equal(result.values.name,input.values.name); assert.equal(result.values.capacity,'128GB');
assert.match(result.notes.image_url[0],/First main-gallery image/);

// A persisted capture survives cancellation and process restart without a second paid retrieval.
collected = []; searches=0; images=[]; modelCalls=0;
let persisted: IdqProgress = emptyIdqProgress(); const cancel = new AbortController();
await assert.rejects(runIdqProduct(input,mapping,config,emptyIdqProgress(),cancel.signal,async progress => {
  persisted = structuredClone(progress); if (progress.capture && !progress.baseline) cancel.abort(new Error('Stopped'));
},deps), /Stopped/);
assert.deepEqual(collected,[input.url]);
await runIdqProduct(input,mapping,config,persisted,new AbortController().signal,async () => {},deps);
assert.equal(collected.filter(url => url === input.url).length,1);

// Already-scraped mode never fetches the original page, including query aliases; blocked images are flagged.
collected=[]; const imported = { ...input,values:{...input.values,image_url:'https://cdn.example/missing.jpg'} };
let readsReturned=false;
await runIdqProduct(imported,mapping,{...config,mode:'scraped'},emptyIdqProgress(),new AbortController().signal,async () => {},{
  ...deps, image:async () => {throw new Error('blocked');},
  complete: async (payload: any,_signal:AbortSignal,options:any) => {
    await options.beforeAttempt(1,payload);
    if (!payload.tools) return response(payload.messages[1].content.includes('"task":"Extract title') ? baseline : {facts:[],conflicts:[],issues:[]});
    if (!readsReturned) {readsReturned=true;return assistant([tool('read_page',{url:input.url+'?variant=1'},'original'),tool('read_page',{url:'https://store.example/%70roduct'},'encoded')]);}
    assert.match(payload.messages.at(-1).content,/disabled/);return response({done:true});
  },
}).then(r => {assert.equal(r.values.image_url,imported.values.image_url);assert.ok(r.issues.some(i => i.includes('image is unavailable')));});
assert.deepEqual(collected,[]);

// A blocked original still permits research grounded in the supplied catalog title.
collected=[];
const blocked=await runIdqProduct(input,mapping,config,emptyIdqProgress(),new AbortController().signal,async()=>{},{...deps,collect:async(url:string)=>{collected.push(url);if(url===input.url)throw new Error('PAGE_BLOCKED');return page(url);}});
assert.equal(blocked.values.capacity,'128GB');assert.ok(blocked.issues.some(issue=>issue.includes('Original capture failed')));

// Budget limits include failed searches/pages, and unsafe URLs never reach the crawler.
let actualReads=0, actualSearches=0;
const budgetState=emptyIdqProgress(); budgetState.baseline=baseline;
await runIdqProduct(input,mapping,{...config,mode:'scraped'},budgetState,new AbortController().signal,async () => {},{
  image:async()=>{}, search:async()=>{actualSearches++;throw new Error('blocked');}, collect:async()=>{actualReads++;throw new Error('blocked');},
  complete:async(payload:any,_signal:AbortSignal,options:any)=>{
    await options.beforeAttempt(1,payload);
    if(!payload.tools) return response({facts:[],conflicts:[],issues:[]});
    return assistant([
      ...Array.from({length:5},(_,i)=>tool('search_web',{query:`model ${i}`},`s${i}`)),
      tool('read_page',{url:'http://127.0.0.1/secret'},'unsafe'),
      ...Array.from({length:7},(_,i)=>tool('read_page',{url:`https://maker.example/${i}`},`r${i}`)),
    ]);
  },
});
assert.equal(actualSearches,4);assert.equal(actualReads,6);assert.equal(budgetState.searches.length,4);assert.equal(budgetState.reads.length,6);

// No new paid research after the deadline; partial input is still returned with mandatory gaps.
let paid=0;const expired={...emptyIdqProgress(),deadlineAt:1};
const partial=await runIdqProduct(input,mapping,config,expired,new AbortController().signal,async()=>{},{now:()=>2,collect:async()=>{paid++;return page(input.url);},complete:async()=>{paid++;return response({});}});
assert.equal(paid,0);assert.ok(partial.missing.includes('capacity'));assert.ok(partial.issues.some(i=>i.includes('ten-minute')));

// Restart in the middle of a multi-tool message executes only unfinished tool calls.
let initialReads=0;let snapshot=emptyIdqProgress();const stopMid=new AbortController();
const multiDeps={...deps,complete:async(payload:any,_signal:AbortSignal,options:any)=>{
  await options.beforeAttempt(1,payload);
  if(!payload.tools)return response(payload.messages[1].content.includes('"task":"Extract title')?baseline:{facts:[],conflicts:[],issues:[]});
  if(!payload.messages.some((m:any)=>m.role==='tool'))return assistant([tool('read_page',{url:'https://maker.example/a'},'a'),tool('read_page',{url:'https://maker.example/b'},'b')]);
  return response({done:true});
},collect:async(url:string)=>{initialReads++;return page(url);}};
await assert.rejects(runIdqProduct(input,mapping,{...config,mode:'scraped'},emptyIdqProgress(),stopMid.signal,async p=>{
  snapshot=structuredClone(p);if(p.messages?.some(m=>m.role==='tool'&&m.tool_call_id==='a'))stopMid.abort();
},multiDeps));
assert.equal(initialReads,1);
await runIdqProduct(input,mapping,{...config,mode:'scraped'},snapshot,new AbortController().signal,async()=>{},multiDeps);
assert.equal(initialReads,2);assert.equal(snapshot.sources.length,2);

// A worker restart after a failed request preserves the remaining attempt and effort recovery.
const originalFetch = globalThis.fetch, originalUrl = process.env.LLM_BASE_URL, originalKey = process.env.LLM_API_KEY;
process.env.LLM_BASE_URL = 'https://provider.example/v1'; process.env.LLM_API_KEY = 'test-only';
const interrupted = new AbortController();
let saved = emptyIdqProgress();
const requests: any[] = [];
try {
  globalThis.fetch = async (_url, init) => {
    requests.push(JSON.parse(init!.body as string));
    return Response.json({}, { status: 500 });
  };
  await assert.rejects(runIdqProduct(input, mapping, { ...config, mode: 'scraped' }, emptyIdqProgress(), interrupted.signal, async progress => {
    saved = structuredClone(progress);
    if (progress.calls.baseline?.lastFailure) interrupted.abort();
  }, { ...deps, complete: completeQa }));
  assert.equal(saved.calls.baseline.attempts, 1);
  assert.deepEqual(saved.calls.baseline.lastFailure, { status: 500, retryable: true });
  globalThis.fetch = async (_url, init) => {
    const payload = JSON.parse(init!.body as string); requests.push(payload);
    return Response.json(payload.tools ? response({ done: true }) : response(payload.messages[1].content.includes('"task":"Extract title') ? baseline : { matches: [], facts: [], conflicts: [], issues: [] }));
  };
  await runIdqProduct(input, mapping, { ...config, mode: 'scraped' }, saved, new AbortController().signal, async () => {}, { ...deps, complete: completeQa });
  assert.deepEqual(requests.slice(0, 2).map(payload => payload.reasoning_effort), ['medium', 'none']);
  assert.equal(saved.calls.baseline.attempts, 2);
  assert.equal(saved.calls.baseline.reasoningEffort, 'none');
  assert.ok(saved.result!.issues.some(issue => issue.includes('thinking off')));
} finally {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.LLM_BASE_URL; else process.env.LLM_BASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.LLM_API_KEY; else process.env.LLM_API_KEY = originalKey;
}
console.log('IDQ modes, first image, bounded tools, blocked pages, deadlines, cancellation and capture/research restart passed.');
