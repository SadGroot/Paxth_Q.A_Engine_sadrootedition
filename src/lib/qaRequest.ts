import { normalizeSettings, type AppSettings } from "./providerSettings";
import { finalizeQaResult, QaValidationError, type prepareQaInput } from "./qaAgent";
import { extractLLMResponseContent, parseLLMJsonResponse } from "./llmResponse";
import { ProviderError } from './chatCompletion';

type QaInput = ReturnType<typeof prepareQaInput>;

export type QaResponseFailure = 'empty_answer' | 'invalid_json' | 'invalid_schema' | 'truncated' | 'refusal' | 'invalid_evidence';
export interface QaRecoveryState {
  correctiveRetryUsed?: boolean;
  feedback?: string;
  thinkingDisabled?: boolean;
}

export function qaResponseDiagnostics(data: any) {
  const usage = Object.fromEntries(['prompt_tokens', 'completion_tokens', 'total_tokens'].flatMap(key =>
    Number.isSafeInteger(data?.usage?.[key]) && data.usage[key] >= 0 ? [[key, data.usage[key]]] : []));
  const reasoning = data?.usage?.completion_tokens_details?.reasoning_tokens;
  if (Number.isSafeInteger(reasoning) && reasoning >= 0) usage.reasoning_tokens = reasoning;
  const finishReason = data?.choices?.[0]?.finish_reason;
  return { ...(typeof finishReason === 'string' && { finishReason: finishReason.slice(0, 40) }), usage };
}

export class QaResponseError extends ProviderError {
  diagnostics?: ReturnType<typeof qaResponseDiagnostics>;
  constructor(message: string, public kind: QaResponseFailure, public fieldPaths: string[] = []) { super(message); }
}

export function buildQaRequest(settings: AppSettings, input: Pick<QaInput, 'messages'>, mode: 'qa' | 'catalog' = 'qa') {
  const normalized = normalizeSettings(settings);
  // GLM defaults to maximum reasoning when no effort is supplied.
  const reasoningEffort = normalized.modelName === 'deepseek/deepseek-v4.1-flash'
    ? normalized.deepseekReasoningEffort === 'auto' ? mode === 'catalog' ? 'none' : 'low' : normalized.deepseekReasoningEffort
    : ['z-ai/glm-5.3-flash', 'z-ai/glm-5.3-flashx'].includes(normalized.modelName) ? normalized.reasoningEffort : undefined;
  return {
    payload: {
      model: normalized.modelName,
      temperature: Number(normalized.temperature),
      max_tokens: normalized.maxTokens,
      ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
      response_format: { type: "json_object" },
      messages: input.messages,
    },
  };
}

export function parseQaResponse(data: any, input: QaInput) {
  const reasoningTokens = data?.usage?.completion_tokens_details?.reasoning_tokens;
  const reasoningDetails = Number.isSafeInteger(reasoningTokens) && reasoningTokens > 0
    ? ` The model used ${reasoningTokens} reasoning tokens.` : "";
  try {
    const choice = data?.choices?.[0];
    if (choice?.message?.refusal || choice?.finish_reason === 'content_filter') {
      throw new QaResponseError('LLM refused or filtered the QA answer. Review this SKU before retrying.', 'refusal');
    }
    if (choice?.finish_reason === "length") {
      throw new QaResponseError(`LLM exhausted its output token budget before completing the QA answer.${reasoningDetails} Increase Max Output Tokens or review the required response size.`, 'truncated');
    }
    const content = extractLLMResponseContent(data);
    if (!content.trim()) {
      throw new QaResponseError(`LLM returned no answer.${reasoningDetails} Check the model and Max Output Tokens in LLM Settings.`, 'empty_answer');
    }
    let result: any;
    try { result = parseLLMJsonResponse(content); }
    catch { throw new QaResponseError('LLM returned malformed QA JSON. Expected one complete JSON object matching the application requirements.', 'invalid_json'); }
    return finalizeQaResult(result, input);
  } catch (error) {
    const failure = error instanceof QaResponseError ? error
      : error instanceof QaValidationError ? new QaResponseError(error.message, 'invalid_schema', [error.fieldPath])
      : new QaResponseError(error instanceof Error ? error.message : 'Invalid QA source evidence.', 'invalid_evidence');
    failure.diagnostics = qaResponseDiagnostics(data);
    throw failure;
  }
}
