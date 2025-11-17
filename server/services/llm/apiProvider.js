import process from "node:process";
import { LLMProvider, isSummOutput } from "./provider.js";

const DEFAULT_MODEL = "small-summarizer";

function buildSystemPrompt() {
  return [
    "Você é um assistente financeiro.",
    "Resuma em português neutro.",
    "NÃO invente números nem percentuais: utilize apenas `numbers` e o texto literal dos `snippets`.",
    "Responda em JSON com o formato {\"bullets\": [{\"text\":\"...\",\"cites\":[...]}, ...], \"paragraph\": \"...\"}.",
    "Limite-se a 5 bullets e um parágrafo final.",
    "Cada bullet precisa citar ao menos uma fonte do array `snippets` ou `numbers`."
  ].join("\n");
}

export class ApiProvider extends LLMProvider {
  /**
   * @param {{ apiKey?: string, baseUrl?: string, model?: string }} [options]
   */
  constructor(options = {}) {
    super();
    this.apiKey = options.apiKey ?? process.env.LLM_API_KEY ?? "";
    this.baseUrl = (options.baseUrl ?? process.env.LLM_BASE_URL ?? "").replace(/\/+$/, "");
    this.model = options.model ?? process.env.LLM_MODEL ?? DEFAULT_MODEL;

    if (!this.baseUrl) {
      throw new Error("LLM_BASE_URL não configurado");
    }
  }

  /**
   * @param {import("./provider.js").SummInput} input
   * @param {{ maxTokens?: number }} [opts]
   * @returns {Promise<import("./provider.js").SummOutput>}
   */
  async summarize(input, opts = {}) {
    if (!this.apiKey) {
      throw new Error("LLM_API_KEY não configurado");
    }

    const payload = {
      model: this.model,
      max_tokens: opts.maxTokens ?? 320,
      temperature: 0.1,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: JSON.stringify(input) }
      ],
      response_format: { type: "json_object" }
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`LLM API error (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta do LLM não possui conteúdo");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      void err;
      throw new Error("Não foi possível interpretar a saída do LLM como JSON");
    }

    if (!isSummOutput(parsed)) {
      throw new Error("Formato de saída do LLM inválido");
    }

    return parsed;
  }
}
