import { httpGet } from "@/lib/http";
import { normalizeIsoDate, extractNumber } from "@/lib/parsing";

const B3_BASE_URL = import.meta.env.VITE_B3_BASE_URL ?? "https://arquivos.b3.com.br";

export interface CotacaoDiaria {
  date: string;
  close: number;
  volume: number;
}

export interface Provento {
  dataEx: string;
  valor: number;
  tipo: string;
}

export async function getCotacoes(ticker: string, range: string = "5y"): Promise<CotacaoDiaria[]> {
  const url = `${B3_BASE_URL}/mock/cotacoes/${ticker}?range=${range}`;
  try {
    const response = await httpGet(url, { headers: { Accept: "application/json" } });
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map((item: Record<string, unknown>) => ({
      date: normalizeIsoDate(String(item.date ?? item.data ?? new Date().toISOString())),
      close: extractNumber(item.close as string),
      volume: extractNumber(item.volume as string),
    }));
  } catch (error) {
    console.warn("getCotacoes fallback para mock", error);
    return [
      { date: "2024-10-10", close: 64.27, volume: 1_200_000 },
      { date: "2024-10-09", close: 63.5, volume: 1_050_000 },
      { date: "2024-10-08", close: 62.9, volume: 980_000 },
    ];
  }
}

export async function getProventos(ticker: string): Promise<Provento[]> {
  const url = `${B3_BASE_URL}/mock/proventos/${ticker}`;
  try {
    const response = await httpGet(url, { headers: { Accept: "application/json" } });
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map((item: Record<string, unknown>) => ({
      dataEx: normalizeIsoDate(String(item.dataEx ?? new Date().toISOString())),
      valor: extractNumber(item.valor as string),
      tipo: String(item.tipo ?? "Dividendo"),
    }));
  } catch (error) {
    console.warn("getProventos fallback para mock", error);
    return [
      { dataEx: "2024-09-15", valor: 1.25, tipo: "Dividendo" },
      { dataEx: "2024-06-10", valor: 1.10, tipo: "JCP" },
    ];
  }
}

