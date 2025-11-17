import process from "node:process";
import { cached } from "../lib/cache.js";
import { parseBrazilianNumber } from "../lib/parsers.js";

const BASE_URL = process.env.BRAPI_BASE_URL ?? "https://brapi.dev/api";
const TTL_MS = 60 * 1000; // 1 minute cache

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
  Accept: "application/json",
};

function buildUrl(ticker) {
  const params = new URLSearchParams({
    range: "1d",
    interval: "1d",
    fundamental: "false",
  });

  if (process.env.BRAPI_TOKEN) {
    params.set("token", process.env.BRAPI_TOKEN);
  }

  return `${BASE_URL}/quote/${encodeURIComponent(ticker)}?${params.toString()}`;
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return parseBrazilianNumber(value);
}

export async function fetchQuoteSnapshot(ticker) {
  const normalized = ticker.toUpperCase();
  const url = buildUrl(normalized);

  return cached(`brapi:${normalized}`, TTL_MS, async () => {
    const response = await fetch(url, { headers: HEADERS });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      const message = `Brapi request failed (${response.status})`;
      const payload = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);
      throw Object.assign(new Error(message), { payload });
    }

    if (!contentType.includes("application/json")) {
      throw new Error("Brapi returned non-JSON response. A token may be required.");
    }

    const json = await response.json();
    const result = json?.results?.[0];

    if (!result) {
      throw new Error("Ticker não encontrado na Brapi");
    }

    return {
      ticker: normalized,
      fetchedAt: json.requestedAt ?? new Date().toISOString(),
      source: {
        url,
      },
      company: {
        shortName: result.shortName,
        longName: result.longName,
        currency: result.currency,
        logoUrl: result.logourl,
      },
      price: {
        last: toNumber(result.regularMarketPrice),
        open: toNumber(result.regularMarketOpen),
        high: toNumber(result.regularMarketDayHigh),
        low: toNumber(result.regularMarketDayLow),
        previousClose: toNumber(result.regularMarketPreviousClose),
        change: toNumber(result.regularMarketChange),
        changePercent: toNumber(result.regularMarketChangePercent),
        marketTime: result.regularMarketTime,
        dayRange: result.regularMarketDayRange,
        fiftyTwoWeekLow: toNumber(result.fiftyTwoWeekLow),
        fiftyTwoWeekHigh: toNumber(result.fiftyTwoWeekHigh),
      },
      fundamentals: {
        marketCap: toNumber(result.marketCap),
        priceEarnings: toNumber(result.priceEarnings),
        earningsPerShare: toNumber(result.earningsPerShare),
      },
    };
  });
}
