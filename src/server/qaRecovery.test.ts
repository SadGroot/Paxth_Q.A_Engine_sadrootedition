import assert from 'node:assert/strict';
import { completeQa } from './provider';
import { prepareQaInput } from '../lib/qaAgent';
import { buildQaRequest, parseQaResponse, QaResponseError, type QaRecoveryState } from '../lib/qaRequest';
import { normalizeSettings } from '../lib/providerSettings';

const originalFetch = globalThis.fetch;
const originalUrl = process.env.LLM_BASE_URL, originalKey = process.env.LLM_API_KEY;
process.env.LLM_BASE_URL = 'https://provider.example/v1';
process.env.LLM_API_KEY = 'test-only';
const keepAlive = setInterval(() => {}, 1000);
const input = prepareQaInput({ sku: 'one-sku', status: 'ready', raw_row: {}, upload_attributes: {}, source: { sap: 'Brand: Test' } }, [], 'Review all supplied fields.', 40000);
const payload = buildQaRequest(normalizeSettings(), input).payload;
const valid = { qa_status: 'pass', confidence: 'high', summary: 'Reviewed', issue_count: 0, issues: [], source_notes: { sap_used: true, url_used: false, source_conflicts: [] } };
const completion = (content: unknown = valid, finish_reason = 'stop') => Response.json({
  choices: [{ finish_reason, message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }],
  usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150, completion_tokens_details: { reasoning_tokens: 10 } },
});
const validateResponse = (data: any) => { parseQaResponse(data, input); };
let requests: any[] = [];
const mock = (responses: Array<() => Response>) => {
  requests = [];
  globalThis.fetch = async (_url, init) => {
    requests.push(JSON.parse(init!.body as string));
    assert.ok(requests.length <= responses.length, 'No unbudgeted provider call');
    return responses[requests.length - 1]();
  };
};
try {
  const failures: QaResponseError[] = [];
  const checkpoints: Array<{ attempt: number; recovery: QaRecoveryState }> = [];
  mock([() => Response.json({}, { status: 500 }), () => completion({ ...valid, qa_status: 'approved' }), () => completion()]);
  await completeQa(payload, AbortSignal.timeout(10000), {
    validateResponse,
    beforeAttempt: async (attempt, _request, recovery) => { checkpoints.push({ attempt, recovery: { ...recovery } }); },
    onAttemptError: async (_attempt, error) => { if (error instanceof QaResponseError) failures.push(error); },
  });
  assert.deepEqual(requests.map(request => request.reasoning_effort), ['low', 'none', 'none']);
  assert.deepEqual(checkpoints.map(checkpoint => checkpoint.attempt), [1, 2, 3]);
  assert.equal(checkpoints[2].recovery.correctiveRetryUsed, true);
  assert.match(requests[2].messages.at(-1).content, /qa_status/);
  assert.deepEqual(failures[0].fieldPaths, ['qa_status']);
  assert.equal(failures[0].diagnostics?.finishReason, 'stop');
  assert.equal(failures[0].diagnostics?.usage.reasoning_tokens, 10);
  assert.ok(requests.every(request => request.max_tokens === 32768 && request.messages[1].content === input.messages[1].content));
  assert.equal(payload.messages.length, 2, 'Recovery never mutates the original prompt');

  for (const bad of ['', '{"qa_status":', { ...valid, issue_count: '0' }]) {
    mock([() => completion(bad), () => completion()]);
    await completeQa(payload, AbortSignal.timeout(5000), { validateResponse });
    assert.equal(requests.length, 2);
    assert.equal(requests[1].reasoning_effort, 'low', 'Format correction retains requested reasoning');
    assert.equal(requests[1].messages.length, 3);
  }
  mock([() => new Response('not-json'), () => completion()]);
  await completeQa(payload, AbortSignal.timeout(5000), { validateResponse });
  assert.equal(requests.length, 2, 'A malformed HTTP response body shares the corrective retry');

  mock([() => completion({}), () => completion({})]);
  await assert.rejects(completeQa(payload, AbortSignal.timeout(5000), { validateResponse }), /qa_status/);
  assert.equal(requests.length, 2, 'Only one corrective retry is allowed');

  mock([() => completion('', 'length'), () => completion()]);
  await completeQa(payload, AbortSignal.timeout(5000), { validateResponse });
  assert.deepEqual(requests.map(request => request.reasoning_effort), ['low', 'none']);
  assert.ok(requests.every(request => request.max_tokens === payload.max_tokens), 'Truncation recovery respects the configured cap');
  mock([() => completion('', 'length')]);
  await assert.rejects(completeQa({ ...payload, reasoning_effort: 'none' }, AbortSignal.timeout(5000), { validateResponse }), /Increase Max Output Tokens/);
  assert.equal(requests.length, 1, 'Already-Off truncation does not repeat the same bounded request');

  for (const response of [() => completion(valid, 'content_filter'), () => completion({ ...valid, source_notes: { ...valid.source_notes, sap_used: false } })]) {
    mock([response]);
    await assert.rejects(completeQa(payload, AbortSignal.timeout(2000), { validateResponse }));
    assert.equal(requests.length, 1, 'Refusal and source-evidence failures remain terminal');
  }

  // Simulate process loss after a durable failure checkpoint, then resume the same item.
  let savedRecovery: QaRecoveryState = {};
  const interrupted = new AbortController();
  mock([() => completion({ ...valid, issue_count: '0' })]);
  await assert.rejects(completeQa(payload, interrupted.signal, {
    validateResponse,
    onAttemptError: async (_attempt, _error, recovery) => { savedRecovery = { ...recovery }; interrupted.abort(); },
  }));
  mock([() => completion({ ...valid, issue_count: '0' })]);
  await assert.rejects(completeQa(payload, AbortSignal.timeout(2000), {
    attempts: 1, qaRecovery: savedRecovery, validateResponse,
    lastFailure: { status: 502, retryable: true, kind: 'invalid_schema' },
  }), /issue_count/);
  assert.equal(requests.length, 1, 'Restart cannot replenish the corrective retry');
  assert.match(requests[0].messages.at(-1).content, /issue_count/);

  mock([() => completion()]);
  await completeQa(payload, AbortSignal.timeout(2000), { attempts: 2, qaRecovery: { thinkingDisabled: true }, validateResponse });
  assert.equal(requests[0].reasoning_effort, 'none', 'Truncation recovery survives restart');
  mock([() => completion({})]);
  await assert.rejects(completeQa(payload, AbortSignal.timeout(2000), { attempts: 2, validateResponse }), /qa_status/);
  assert.equal(requests.length, 1, 'A third-attempt format failure cannot create a fourth call');

  const cancelled = new AbortController();
  mock([() => completion({})]);
  await assert.rejects(completeQa(payload, cancelled.signal, { validateResponse, onAttemptError: async () => { cancelled.abort(); } }));
  assert.equal(requests.length, 1);
  mock([() => completion({})]);
  await assert.rejects(completeQa(payload, AbortSignal.timeout(50), { validateResponse }));
  assert.equal(requests.length, 1, 'The caller deadline bounds corrective retry backoff');
  mock([]);
  await assert.rejects(completeQa(payload, AbortSignal.timeout(1000), { attempts: 3, validateResponse }), /budget|interrupted/);
  assert.equal(requests.length, 0);
  await assert.rejects(completeQa(payload, AbortSignal.timeout(1000), { validateResponse, beforeAttempt: async () => { throw new Error('checkpoint unavailable'); } }), /checkpoint unavailable/);
  assert.equal(requests.length, 0, 'A failed durable checkpoint prevents a paid dispatch');
  console.log('QA recovery checks passed: bounded validation retries, unchanged evidence and limits, diagnostics, cancellation, and durable restart state.');
} finally {
  clearInterval(keepAlive);
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.LLM_BASE_URL; else process.env.LLM_BASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.LLM_API_KEY; else process.env.LLM_API_KEY = originalKey;
}
