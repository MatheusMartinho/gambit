import { httpGet } from "@/lib/http";
import { normalizeIsoDate, extractNumber } from "@/lib/parsing";

const BCB_BASE_URL = import.meta.env.VITE_BCB_BASE_URL ?? "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export interface SerieTemporalItem {
  data: string;
  valor: number;
}

export async function getSerie(codigo: string): Promise<SerieTemporalItem[]> {
  const url = `${BCB_BASE_URL}/${codigo}/dados?formato=json`;
  try {
    const response = await httpGet(url, { headers: { Accept: "application/json" } });
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map((item: Record<string, unknown>) => ({
      data: normalizeIsoDate(String(item.data ?? new Date().toISOString())),
      valor: extractNumber(item.valor as string),
    }));
  } catch (error) {
    console.warn("getSerie fallback para mock", error);
    return [
      { data: "2024-09-01", valor: 0.1275 },
      { data: "2024-08-01", valor: 0.1275 },
    ];
  }
}

