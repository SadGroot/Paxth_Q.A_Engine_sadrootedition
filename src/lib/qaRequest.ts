import { normalizeSettings, type AppSettings } from "./providerSettings";
import { finalizeQaResult, type prepareQaInput } from "./qaAgent";
import { extractLLMResponseContent, parseLLMJsonResponse } from "./llmResponse";

type QaInput = ReturnType<typeof prepareQaInput>;

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
  if (data?.choices?.[0]?.finish_reason === "length") {
    throw new Error(`LLM exhausted its output token budget before completing the QA answer.${reasoningDetails} Increase Max Output Tokens or choose a model that needs fewer reasoning tokens.`);
  }
  const content = extractLLMResponseContent(data);
  if (!content.trim()) {
    throw new Error(`LLM returned no answer.${reasoningDetails} Check the model and Max Output Tokens in LLM Settings.`);
  }
  return finalizeQaResult(parseLLMJsonResponse(content), input);
}
