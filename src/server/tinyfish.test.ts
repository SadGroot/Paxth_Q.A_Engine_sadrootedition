import assert from 'node:assert/strict';
import { collectTinyfishPage, getTinyfishApiKey, searchTinyfish } from './tinyfish';

const originalFetch = globalThis.fetch, originalKey = process.env.TINYFISH_API_KEY;
const signal = new AbortController().signal;
const requests: Array<{url:string;init?:RequestInit}> = [];
const resolve = async () => ({ address:'93.184.215.14', family:4 });
try {
  delete process.env.TINYFISH_API_KEY;
  assert.throws(getTinyfishApiKey,/Configure TINYFISH_API_KEY/);
  process.env.TINYFISH_API_KEY='test-secret-tinyfish';
  globalThis.fetch=async(url,init)=>{
    requests.push({url:String(url),init});
    assert.equal((init!.headers as Record<string,string>)['X-API-Key'],'test-secret-tinyfish');
    return Response.json(String(url).includes('api.search.')?{results:[{title:'Product X100',url:'https://maker.example/x100',snippet:'Discovery only'},{url:'http://127.0.0.1/secret'}]}:
      {results:[{url:'https://maker.example/x100',final_url:'https://maker.example/x100',text:'Product X100 specifications: Battery 4500 mAh.'}],errors:[]});
  };
  const hits=await searchTinyfish('Product X100 manufacturer',signal);
  assert.equal(hits.length,1);assert.equal(new URL(requests[0].url).searchParams.get('query'),'Product X100 manufacturer');
  const page=await collectTinyfishPage(hits[0].url,signal,resolve);
  assert.match(page.markdown,/4500 mAh/);assert.equal(page.finalUrl,hits[0].url);
  assert.deepEqual(JSON.parse(requests[1].init!.body as string),{urls:[hits[0].url],format:'markdown',ttl:0,per_url_timeout_ms:45000});
  await assert.rejects(collectTinyfishPage('http://127.0.0.1/secret',signal,resolve),/public HTTP/);
  assert.equal(requests.length,2,'Private URLs never reach TinyFish');
  globalThis.fetch=async()=>Response.json({errors:[{url:hits[0].url,error:'timeout'}],results:[]});
  await assert.rejects(collectTinyfishPage(hits[0].url,signal,resolve),/readable product evidence/);
  globalThis.fetch=async()=>Response.json({results:[{url:hits[0].url,final_url:'http://169.254.169.254/',text:'private'}]});
  await assert.rejects(collectTinyfishPage(hits[0].url,signal,resolve),/public HTTP/);
  globalThis.fetch=async()=>Response.json({error:'test-secret-tinyfish'},{status:401});
  await assert.rejects(searchTinyfish('X100',signal),error=>error instanceof Error && /Check the server/.test(error.message) && !error.message.includes('test-secret-tinyfish'));
  globalThis.fetch=async()=>Response.json({unexpected:true});
  await assert.rejects(searchTinyfish('X100',signal),/invalid results/);
  const abort=new AbortController();abort.abort(new Error('Cancelled'));
  await assert.rejects(searchTinyfish('X100',abort.signal),/Cancelled/);
  console.log('TinyFish search/fetch contracts, credentials, unsafe URLs, redirects, failures and cancellation passed.');
} finally {
  globalThis.fetch=originalFetch;
  if(originalKey===undefined)delete process.env.TINYFISH_API_KEY;else process.env.TINYFISH_API_KEY=originalKey;
}
