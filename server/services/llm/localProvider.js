import process from "node:process";
import { LLMProvider, isSummOutput } from "./provider.js";

function buildPrompt(input) {
  return [
    "SYSTEM:",
    "Você é um assistente financeiro.",
    "NÃO invente números ou percentuais: use apenas `numbers` e texto literal de `snippets`.",
    "Máximo de 5 bullets e um parágrafo final. Cite sempre as fontes.",
    "Retorne JSON exatamente no formato {\"bullets\": [...], \"paragraph\": \"...\"}.",
    "",
    "USER:",
    JSON.stringify(input)
  ].join("\n");
}

export class LocalProvider extends LLMProvider {
  /**
   * @param {{ baseUrl?: string, model?: string }} [options]
   */
  constructor(options = {}) {
    super();
    this.baseUrl = (options.baseUrl ?? process.env.LOCAL_LLM_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
    this.model = options.model ?? process.env.LOCAL_LLM_MODEL ?? "";
  }

  /**
   * @param {import("./provider.js").SummInput} input
   * @param {{ maxTokens?: number }} [opts]
   * @returns {Promise<import("./provider.js").SummOutput>}
   */
  async summarize(input, opts = {}) {
    const body = {
      prompt: buildPrompt(input),
      max_tokens: opts.maxTokens ?? 320,
      temperature: 0.1
    };
    if (this.model) body.model = this.model;

    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Local LLM error (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json();
    const textOutput = data?.text ?? data?.output;
    if (!textOutput) {
      throw new Error("Resposta do LLM local sem campo `text`");
    }

    let parsed;
    try {
      parsed = typeof textOutput === "string" ? JSON.parse(textOutput) : textOutput;
    } catch (err) {
      void err;
      throw new Error("Não foi possível interpretar a saída do LLM local como JSON");
    }

    if (!isSummOutput(parsed)) {
      throw new Error("Formato de saída do LLM local inválido");
    }

    return parsed;
  }
}
