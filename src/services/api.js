const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

function resolveBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw) return DEFAULT_BASE_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

const API_BASE_URL = resolveBaseUrl();

async function handleResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (isJson && payload && typeof payload === "object" && payload.error) ||
      response.statusText ||
      "Erro na requisição";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

// ============================================
// STOCK ENDPOINTS
// ============================================

/**
 * Buscar ações por termo de pesquisa
 */
export async function searchStocks(query) {
  const target = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=10`;
  const response = await fetch(target, {
    headers: { Accept: "application/json" }
  });
  return handleResponse(response);
}

/**
 * Obter visão geral completa de uma ação
 */
export async function getStockOverview(ticker) {
  const target = `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}`;
  const response = await fetch(target, {
    headers: { Accept: "application/json" }
  });
  return handleResponse(response);
}

/**
 * Obter apenas cotação atualizada
 */
export async function getStockQuote(ticker) {
  const target = `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/quote`;
  const response = await fetch(target, {
    headers: { Accept: "application/json" }
  });
  return handleResponse(response);
}

/**
 * Obter gráfico intraday
 */
export async function getStockChart(ticker, interval = '5m', range = '1d') {
  const target = `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/chart?interval=${interval}&range=${range}`;
  const response = await fetch(target, {
    headers: { Accept: "application/json" }
  });
  return handleResponse(response);
}

/**
 * NOTA: As funções abaixo foram desabilitadas porque o backend retorna
 * todos os dados em uma única rota /api/v1/stocks/:ticker
 * Use getStockData() que já retorna tudo (fundamentals, dividends, valuation, health_score)
 */

// /**
//  * Obter fundamentos detalhados
//  */
// export async function getStockFundamentals(ticker) {
//   const target = `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/fundamentals`;
//   const response = await fetch(target, {
//     headers: { Accept: "application/json" }
//   });
//   return handleResponse(response);
// }

// /**
//  * Obter dados de dividendos
//  */
// export async function getStockDividends(ticker) {
//   const target = `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/dividends`;
//   const response = await fetch(target, {
//     headers: { Accept: "application/json" }
//   });
//   return handleResponse(response);
// }

// /**
//  * Obter análise de valuation
//  */
// export async function getStockValuation(ticker) {
//   const target = `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/valuation`;
//   const response = await fetch(target, {
//     headers: { Accept: "application/json" }
//   });
//   return handleResponse(response);
// }

// /**
//  * Obter Health Score detalhado
//  */
// export async function getHealthScore(ticker) {
//   const target = `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/health-score`;
//   const response = await fetch(target, {
//     headers: { Accept: "application/json" }
//   });
//   return handleResponse(response);
// }

/**
 * Comparar múltiplas ações
 */
export async function compareStocks(tickers, metrics) {
  const target = `${API_BASE_URL}/compare`;
  const response = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ tickers, metrics })
  });
  return handleResponse(response);
}

// Legacy support
export async function fetchTickerSnapshot(ticker) {
  return getStockOverview(ticker);
}

export async function postSummarize(payload, { signal } = {}) {
  const target = `${API_BASE_URL}/summarize`;
  const response = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  return handleResponse(response);
}
