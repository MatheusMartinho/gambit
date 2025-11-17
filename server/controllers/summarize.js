import crypto from "node:crypto";
import process from "node:process";
import { performance } from "node:perf_hooks";
import { ApiProvider } from "../services/llm/apiProvider.js";
import { LocalProvider } from "../services/llm/localProvider.js";
import { isSummOutput } from "../services/llm/provider.js";

const CACHE_TTL_MS = Number(process.env.SUMMARY_CACHE_TTL_MS ?? 24 * 60 * 60 * 1000);
const SUMMARY_LIMIT = Number(process.env.SUMMARY_LIMIT ?? 50);
const MAX_SNIPPETS = Number(process.env.SUMMARY_MAX_SNIPPETS ?? 6);
const MAX_SNIPPET_LENGTH = Number(process.env.SUMMARY_MAX_SNIPPET_LEN ?? 1200);
const MAX_TOKENS = Number(process.env.SUMMARY_MAX_TOKENS ?? 320);

/** @type {Map<string, { expiresAt: number, payload: any }>} */
const cache = new Map();
/** @type {Map<string, { count: number, resetAt: number }>} */
const usage = new Map();

let providerSingleton = null;

function createProvider() {
  if (process.env.LLM_MODE === "local") {
    return new LocalProvider();
  }
  return new ApiProvider();
}

function getProvider() {
  if (!providerSingleton) {
    providerSingleton = createProvider();
  }
  return providerSingleton;
}

/**
 * Sanitizes snippets array (limit size and length).
 * @param {any[]} snippets
 */
function sanitizeSnippets(snippets) {
  const safeSnippets = Array.isArray(snippets) ? snippets.slice(0, MAX_SNIPPETS) : [];
  return safeSnippets.map((snippet, index) => {
    if (!snippet || typeof snippet !== "object") return null;
    const text = typeof snippet.text === "string" ? snippet.text.slice(0, MAX_SNIPPET_LENGTH) : "";
    const cite = snippet.cite && typeof snippet.cite === "object" ? snippet.cite : {};
    const id = typeof snippet.id === "string" ? snippet.id : `snippet-${index}`;
    return { id, text, cite };
  }).filter(Boolean);
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, { value: number | string, unit?: string, cite: Record<string, any> }>}
 */
function isValidNumbers(value) {
  if (!value || typeof value !== "object") return false;
  const entries = Object.entries(value);
  return entries.every(([key, val]) => {
    if (typeof key !== "string" || !val || typeof val !== "object") return false;
    const { value: numValue, cite } = val;
    return (typeof numValue === "number" || typeof numValue === "string") && cite && typeof cite === "object";
  });
}

function normalizeQuestion(question) {
  return question.trim().toLowerCase();
}

export async function summarizeController(req, res, next) {
  try {
    const { question, snippets, numbers, diff, company } = req.body ?? {};
    const userId = String(req.headers["x-user-id"] || "anon");

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Campo `question` é obrigatório." });
    }
    if (!Array.isArray(snippets) || !snippets.length) {
      return res.status(400).json({ error: "É necessário enviar ao menos um snippet." });
    }
    if (!isValidNumbers(numbers)) {
      return res.status(400).json({ error: "Objeto `numbers` inválido." });
    }

    const safeSnippets = sanitizeSnippets(snippets);
    if (!safeSnippets.length) {
      return res.status(400).json({ error: "Snippets vazios após sanitização." });
    }

    const safeDiff = Array.isArray(diff)
      ? diff
          .slice(0, 6)
          .filter(
            (entry) =>
              entry &&
              typeof entry === "object" &&
              typeof entry.what === "string" &&
              typeof entry.prev === "string" &&
              typeof entry.now === "string" &&
              entry.cite &&
              typeof entry.cite === "object"
          )
      : undefined;

    const normalizedQuestion = normalizeQuestion(question);
    const cacheKey = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          q: normalizedQuestion,
          company,
          snippets: safeSnippets.map((snippet) => snippet.id),
          numbers,
          diff: safeDiff
        })
      )
      .digest("hex");

    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return res.json({ ...cached.payload, cached: true });
    }

    const limit = Number.isFinite(SUMMARY_LIMIT) ? SUMMARY_LIMIT : 50;
    const tracker = usage.get(userId) ?? { count: 0, resetAt: now + 30 * 24 * 60 * 60 * 1000 };
    if (now > tracker.resetAt) {
      tracker.count = 0;
      tracker.resetAt = now + 30 * 24 * 60 * 60 * 1000;
    }

    if (tracker.count >= limit) {
      return res.status(402).json({
        error: "Limite de resumos atingido.",
        fallback: { question, company, snippets: safeSnippets, numbers, diff: safeDiff }
      });
    }

    const provider = getProvider();
    const start = performance.now();
    const output = await provider.summarize(
      { question, company, snippets: safeSnippets, numbers, diff: safeDiff },
      { maxTokens: MAX_TOKENS }
    );
    const ms = Math.round(performance.now() - start);

    if (!isSummOutput(output)) {
      throw new Error("Resposta do provider LLM inválida.");
    }

    tracker.count += 1;
    usage.set(userId, tracker);

    const payload = { ok: true, ms, output };
    cache.set(cacheKey, { payload, expiresAt: now + CACHE_TTL_MS });

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}
