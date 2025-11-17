import analysisTemplate from "@/data/analysisTemplate.json";
import type { Analysis } from "@/models/fundamentals";
import { validateTicker, normalizeTicker } from "@/utils/validation.js";
import { buildHealthScore } from "@/utils/healthScore.js";
import { buildValuationVerdict } from "@/utils/valuation.js";

type AnalysisTemplate = typeof analysisTemplate;

function cloneTemplate(template: AnalysisTemplate): Analysis {
  return JSON.parse(JSON.stringify(template)) as Analysis;
}

function stampAnalysis(base: Analysis, ticker: string): Analysis {
  const normalizedTicker = normalizeTicker(ticker);
  const stamped = { ...base, ticker: normalizedTicker };

  if (Array.isArray(stamped.comparables)) {
    stamped.comparables = stamped.comparables.map((item) => ({
      ...item,
      ticker: String(item.ticker ?? "").toUpperCase(),
    }));
  }

  stamped.updatedAt = new Date().toISOString();
  
  // TEMPORÁRIO: Desabilitado para debug
  // Calcular Health Score e Valuation Verdict
  // try {
  //   stamped.healthScore = buildHealthScore(stamped);
  //   stamped.verdict = buildValuationVerdict(stamped, stamped.comparables);
  // } catch (error) {
  //   console.warn('Erro ao calcular Health Score/Valuation:', error);
  //   // Usa valores do template se houver erro
  // }
  
  return stamped;
}

export const FALLBACK_ANALYSIS: Analysis = stampAnalysis(
  cloneTemplate(analysisTemplate),
  analysisTemplate.ticker
);

/**
 * Busca análise fundamentalista para um ticker
 * @param ticker - Ticker da empresa (ex: VALE3)
 * @returns Análise completa com health score e valuation verdict
 * @throws Error se ticker inválido
 */
export async function getFundamentals(ticker: string): Promise<Analysis> {
  // Validar ticker
  validateTicker(ticker);
  
  // Por enquanto retorna template, mas em produção faria:
  // 1. Tentar buscar da API/cache
  // 2. Se falhar, usar fallback
  // 3. Aplicar rate limiting
  
  const base = cloneTemplate(analysisTemplate);
  return stampAnalysis(base, ticker);
}
