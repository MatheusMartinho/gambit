import { fetchQuoteSnapshot } from "./brapiService.js";
import { fetchFundamentusSnapshot } from "./fundamentusService.js";
import { buildInsights } from "./insightsService.js";

const TICKER_PATTERN = /^[A-Z]{4}\d{1,2}$/;

function normalizeTicker(ticker) {
  if (!ticker) return null;
  const cleaned = String(ticker).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (TICKER_PATTERN.test(cleaned)) return cleaned;
  // allow suffix like .SA
  const suffixMatch = cleaned.match(/^([A-Z]{4}\d{1,2})(SA)?$/);
  return suffixMatch ? suffixMatch[1] : null;
}

function mergeCompany({ quote, fundamentus }) {
  const company = {
    name: fundamentus?.company?.name ?? quote?.company?.longName ?? quote?.company?.shortName ?? null,
    ticker: fundamentus?.ticker ?? quote?.ticker ?? null,
    type: fundamentus?.company?.type ?? null,
    sector: fundamentus?.company?.sector ?? null,
    subsector: fundamentus?.company?.subsector ?? null,
    currency: quote?.company?.currency ?? "BRL",
    logoUrl: quote?.company?.logoUrl ?? null,
    lastQuoteDate: fundamentus?.company?.lastQuoteDate ?? null,
  };

  return company;
}

function mergePrice({ quote, fundamentus }) {
  const fundamentusPrice = fundamentus?.price ?? {};
  const quotePrice = quote?.price ?? {};

  return {
    last: quotePrice.last ?? fundamentusPrice.close ?? null,
    open: quotePrice.open ?? null,
    high: quotePrice.high ?? fundamentusPrice.max52w ?? null,
    low: quotePrice.low ?? fundamentusPrice.min52w ?? null,
    previousClose: quotePrice.previousClose ?? null,
    change: quotePrice.change ?? null,
    changePercent: quotePrice.changePercent ?? fundamentusPrice.changePercentDay ?? null,
    changePercent30d: fundamentusPrice.changePercent30d ?? null,
    changePercent12m: fundamentusPrice.changePercent12m ?? quotePrice.changePercent ?? null,
    dayRange: quotePrice.dayRange ?? null,
    marketTime: quotePrice.marketTime ?? null,
    min52w: fundamentusPrice.min52w ?? quotePrice.fiftyTwoWeekLow ?? null,
    max52w: fundamentusPrice.max52w ?? quotePrice.fiftyTwoWeekHigh ?? null,
    currency: quote?.company?.currency ?? "BRL",
  };
}

export async function fetchTickerSnapshot(rawTicker) {
  const ticker = normalizeTicker(rawTicker);
  if (!ticker) {
    const error = new Error("Ticker inválido. Use o padrão B3 (ex: VALE3, PETR4).");
    error.status = 400;
    throw error;
  }

  const [quoteResult, fundamentusResult] = await Promise.allSettled([
    fetchQuoteSnapshot(ticker),
    fetchFundamentusSnapshot(ticker),
  ]);

  if (quoteResult.status === "rejected" && fundamentusResult.status === "rejected") {
    const error = new Error("Não foi possível coletar dados para o ticker informado.");
    error.status = 502;
    error.details = {
      quote: quoteResult.reason?.message,
      fundamentus: fundamentusResult.reason?.message,
    };
    throw error;
  }

  const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null;
  const fundamentus = fundamentusResult.status === "fulfilled" ? fundamentusResult.value : null;

  const company = mergeCompany({ quote, fundamentus });
  const price = mergePrice({ quote, fundamentus });

  const fundamentals = fundamentus
    ? {
        valuation: fundamentus.valuation,
        profitability: fundamentus.profitability,
        dividends: fundamentus.dividends,
        leverage: fundamentus.leverage,
        financials: fundamentus.financials,
        growth: fundamentus.growth,
        marketData: fundamentus.marketData,
      }
    : {
        valuation: null,
        profitability: null,
        dividends: null,
        leverage: null,
        financials: null,
        growth: null,
        marketData: quote?.fundamentals ?? null,
      };

  const insights = buildInsights({
    price,
    valuation: fundamentals.valuation,
    profitability: fundamentals.profitability,
    dividends: fundamentals.dividends,
    leverage: fundamentals.leverage,
    growth: fundamentals.growth,
  });

  return {
    ticker,
    fetchedAt: new Date().toISOString(),
    company,
    price,
    fundamentals,
    insights,
    sources: {
      brapi: quoteResult.status === "fulfilled"
        ? { ok: true, url: quote?.source?.url, fetchedAt: quote?.fetchedAt }
        : { ok: false, message: quoteResult.reason?.message },
      fundamentus: fundamentusResult.status === "fulfilled"
        ? { ok: true, fetchedAt: fundamentus.fetchedAt }
        : { ok: false, message: fundamentusResult.reason?.message },
    },
    raw: {
      quote,
      fundamentus,
    },
  };
}
