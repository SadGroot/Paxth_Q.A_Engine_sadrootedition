import assert from "node:assert/strict";
import { normalizeMaxTokens } from "../hooks/useSettings";
import { extractLLMResponseContent, parseLLMJsonResponse } from "./llmResponse";
import { prepareQaInput } from "./qaAgent";
import { parseQaResponse, QaResponseError } from "./qaRequest";

const json = '{"qa_status":"pass","confidence":"high","summary":"OK","issue_count":0,"issues":[],"source_notes":{"sap_used":true,"url_used":false,"source_conflicts":[]}}';

assert.equal(extractLLMResponseContent({ choices: [{ message: { content: json, reasoning_content: "We need to compare the source data first." } }] }), json);
assert.equal(extractLLMResponseContent({ choices: [{ message: { reasoning_content: "We need to compare the source data first." } }] }), "");
assert.equal(parseLLMJsonResponse(json).qa_status, "pass");
assert.throws(() => parseLLMJsonResponse("We need to output JSON only."));
assert.equal(normalizeMaxTokens(40000), 40000);
assert.equal(normalizeMaxTokens("40000"), 40000);
assert.equal(normalizeMaxTokens(0), 32768);

const input = prepareQaInput({
  sku: "test", status: "ready", upload_attributes: { brand: "Brand" }, raw_row: {},
  source: { sap: "Brand: Brand" },
}, [], "Check supplied evidence.", 40000);
const completion = (content: string | null, finish_reason = "stop") => ({ choices: [{ message: { content }, finish_reason }] });
assert.equal(parseQaResponse(completion(json), input).qa_status, "warning", "A valid QA response retains the missing-rules warning");
for (const content of [null, "", " \n "]) {
  assert.throws(() => parseQaResponse(completion(content), input), /LLM returned no answer/);
}
for (const empty of [null, {}, { choices: [] }]) {
  assert.throws(() => parseQaResponse(empty, input), /LLM returned no answer/);
}
assert.throws(() => parseQaResponse({
  choices: [{ message: { content: null, reasoning_content: "Internal reasoning" }, finish_reason: "length" }],
  usage: { completion_tokens: 10000, completion_tokens_details: { reasoning_tokens: 10000 } },
}, input), /output token budget.*10000 reasoning tokens.*Max Output Tokens/);
assert.throws(() => parseQaResponse(completion(json, "length"), input), /output token budget/, "Even valid-looking JSON is incomplete when the provider reports truncation");
assert.throws(() => parseQaResponse(completion('{"qa_status":'), input));
assert.throws(() => parseQaResponse(completion('{"message":"hello"}'), input), /invalid QA result structure/);
assert.throws(() => parseQaResponse({ choices: [{ message: { reasoning_content: json } }] }, input), /LLM returned no answer/);
const issue = { severity: 'minor', cell_color: 'yellow', issue_type: 'formatting', field: 'name',
  uploaded_value: 'brand', source_truth: 'Brand', explanation: 'Use the supplied brand casing.', suggested_fix: 'Brand' };
for (const [patch, path] of [
  [{ qa_status: undefined }, 'qa_status'],
  [{ qa_status: 'approved' }, 'qa_status'],
  [{ issue_count: '0' }, 'issue_count'],
  [{ source_notes: { sap_used: true, url_used: false, source_conflicts: [42] } }, 'source_notes.source_conflicts[0]'],
  [{ issues: [{ ...issue, issue_type: 'mismatch' }] }, 'issues[0].issue_type'],
  [{ issues: [{ ...issue, uploaded_value: 42 }] }, 'issues[0].uploaded_value'],
] as const) {
  assert.throws(() => parseQaResponse(completion(JSON.stringify({ ...JSON.parse(json), ...patch })), input), error => {
    assert.ok(error instanceof QaResponseError);
    assert.equal(error.kind, 'invalid_schema');
    assert.deepEqual(error.fieldPaths, [path]);
    assert.ok(error.message.includes(path));
    return true;
  });
}
const multiFailure = { ...JSON.parse(json), qa_status: 'CORRECTIONS_REQUIRED', issues: [issue, { ...issue, severity: 'major' }] };
assert.throws(() => parseQaResponse(completion(JSON.stringify(multiFailure)), input), error => {
  assert.ok(error instanceof QaResponseError);
  assert.deepEqual(error.fieldPaths, ['qa_status', 'issues[1].severity']);
  assert.deepEqual(error.validationIssues, [
    { fieldPath: 'qa_status', expected: 'pass, warning, fail', received: '"corrections_required"' },
    { fieldPath: 'issues[1].severity', expected: 'minor, moderate, critical', received: '"major"' },
  ]);
  assert.match(error.message, /qa_status.*Expected pass, warning, fail/);
  assert.match(error.message, /issues\[1\].severity.*Expected minor, moderate, critical/);
  return true;
});
for (const result of [null, [], { ...JSON.parse(json), source_notes: null, issues: [null, [], 12] },
  { ...JSON.parse(json), source_notes: { sap_used: 'true', url_used: 0, source_conflicts: {} }, issues: {} }]) {
  assert.throws(() => parseQaResponse(completion(JSON.stringify(result)), input), error =>
    error instanceof QaResponseError && error.kind === 'invalid_schema' && error.fieldPaths.length > 0);
}
for (const secret of ['sk-private-test', 'Bearer private-header', 'Confidential product evidence', 'test-only', 'constructor', '__proto__']) {
  assert.throws(() => parseQaResponse(completion(JSON.stringify({ ...JSON.parse(json), qa_status: secret })), input), error => {
    assert.ok(error instanceof QaResponseError);
    assert.ok(!JSON.stringify(error.validationIssues).includes(secret));
    assert.ok(!error.message.includes(secret));
    return true;
  });
}
assert.throws(() => parseQaResponse(completion(JSON.stringify({ ...JSON.parse(json),
  issues: Array.from({ length: 100 }, () => ({ ...issue, severity: 'major', field: null })) })), input), error => {
  assert.ok(error instanceof QaResponseError);
  assert.equal(error.fieldPaths.length, 20, 'Validation diagnostics are bounded');
  assert.ok(error.message.length <= 2000);
  return true;
});
for (const data of [completion(json, 'content_filter'), { choices: [{ message: { content: json, refusal: 'Refused' } }] }]) {
  assert.throws(() => parseQaResponse(data, input), error => error instanceof QaResponseError && error.kind === 'refusal');
}
console.log("LLM response parsing, empty-answer, and token-budget assertions passed.");
