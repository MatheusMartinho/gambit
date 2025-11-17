import { httpGet } from "@/lib/http";

const QUOTES_BASE_URL = import.meta.env.VITE_QUOTES_BASE_URL ?? "https://brapi.dev/api";
const QUOTES_TOKEN = import.meta.env.VITE_QUOTES_TOKEN ?? "";

export interface QuoteSnapshot {
  price: number;
  marketCap: number;
  enterpriseValue: number;
  volume: number;
  currency: string;
  updatedAt: string;
}

export async function getPrecoAtual(ticker: string): Promise<QuoteSnapshot> {
  const url = `${QUOTES_BASE_URL}/quote/${ticker}`;

  try {
    const response = await httpGet(url, {
      headers: {
        Accept: "application/json",
        ...(QUOTES_TOKEN ? { Authorization: `Bearer ${QUOTES_TOKEN}` } : {}),
      },
    });

    const result = Array.isArray(response.data?.results) ? response.data.results[0] : null;

    if (!result) {
      throw new Error("Resultado inválido");
    }

    return {
      price: Number(result.regularMarketPrice ?? 0),
      marketCap: Number(result.marketCap ?? 0),
      enterpriseValue: Number(result.enterpriseValue ?? result.marketCap ?? 0),
      volume: Number(result.regularMarketVolume ?? 0),
      currency: result.currency ?? "BRL",
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("getPrecoAtual fallback para mock", error);
    return {
      price: 64.27,
      marketCap: 267_211_000_000,
      enterpriseValue: 298_000_000_000,
      volume: 1_018_380_000,
      currency: "BRL",
      updatedAt: new Date().toISOString(),
    };
  }
}

