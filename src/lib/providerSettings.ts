import { DEFAULT_QA_AGENT_MEMORY } from "./qaAgent";

export interface AppSettings {
  llmProvider: string;
  baseUrl: string;
  providerConfigured: boolean;
  scraperConfigured: boolean;
  modelName: string;
  scraperModelName: string;
  reasoningEffort: 'low' | 'high' | 'max';
  deepseekReasoningEffort: 'auto' | 'none' | 'low' | 'medium' | 'high' | 'max';
  temperature: number;
  maxTokens: number;
  maxConcurrency: number;
  maxRetries: number;
  maxPageContentLength: number;
  qaAgentMemory: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  llmProvider: "openai-compatible", baseUrl: "", providerConfigured: false, scraperConfigured: false,
  modelName: "deepseek/deepseek-v4.1-flash", temperature: 0.1, maxTokens: 32_768,
  scraperModelName: "deepseek/deepseek-v4.1-flash",
  reasoningEffort: 'low',
  deepseekReasoningEffort: 'low',
  maxConcurrency: 1, maxRetries: 2,
  maxPageContentLength: 40_000, qaAgentMemory: DEFAULT_QA_AGENT_MEMORY,
};

export function normalizeMaxTokens(value: unknown): number {
  const tokens = Number(value);
  return Number.isSafeInteger(tokens) && tokens > 0 && tokens <= 65536 ? tokens : DEFAULT_SETTINGS.maxTokens;
}

/** Explicit fields prevent legacy browser credentials leaking into settings or run snapshots. */
export function normalizeSettings(settings: Partial<AppSettings> = {}): AppSettings {
  const modelName = typeof settings.modelName === "string" && settings.modelName.trim() ? settings.modelName.trim() : DEFAULT_SETTINGS.modelName;
  return {
    ...DEFAULT_SETTINGS,
    baseUrl: "",
    providerConfigured: settings.providerConfigured === true,
    scraperConfigured: settings.scraperConfigured === true,
    modelName,
    scraperModelName: typeof settings.scraperModelName === "string" && settings.scraperModelName.trim()
      ? settings.scraperModelName.trim() : DEFAULT_SETTINGS.scraperModelName,
    reasoningEffort: settings.reasoningEffort === 'high' || settings.reasoningEffort === 'max'
      ? settings.reasoningEffort : DEFAULT_SETTINGS.reasoningEffort,
    deepseekReasoningEffort: settings.deepseekReasoningEffort && ['auto', 'none', 'low', 'medium', 'high', 'max'].includes(settings.deepseekReasoningEffort)
      ? settings.deepseekReasoningEffort : DEFAULT_SETTINGS.deepseekReasoningEffort,
    temperature: typeof settings.temperature === "number" && settings.temperature >= 0 && settings.temperature <= 1
      ? settings.temperature : DEFAULT_SETTINGS.temperature,
    maxTokens: normalizeMaxTokens(settings.maxTokens),
    maxPageContentLength: Number.isSafeInteger(settings.maxPageContentLength) && settings.maxPageContentLength > 0 && settings.maxPageContentLength <= 200_000
      ? settings.maxPageContentLength : DEFAULT_SETTINGS.maxPageContentLength,
    qaAgentMemory: typeof settings.qaAgentMemory === "string" && settings.qaAgentMemory.trim()
      ? settings.qaAgentMemory : DEFAULT_QA_AGENT_MEMORY,
  };
}

export function editableSettings(settings: AppSettings) {
  return {
    modelName: settings.modelName,
    scraperModelName: settings.scraperModelName,
    reasoningEffort: settings.reasoningEffort,
    deepseekReasoningEffort: settings.deepseekReasoningEffort,
    temperature: settings.temperature, maxTokens: settings.maxTokens,
    maxPageContentLength: settings.maxPageContentLength, qaAgentMemory: settings.qaAgentMemory,
  };
}
