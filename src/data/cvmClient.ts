import { httpGet } from "@/lib/http";
import { parseCsv, extractNumber, normalizeIsoDate } from "@/lib/parsing";
import type { Financials } from "@/models/fundamentals";

const CVM_BASE_URL = import.meta.env.VITE_CVM_BASE_URL ?? "https://dados.cvm.gov.br";

interface FactoRelevante {
  title: string;
  date: string;
  url: string;
  excerpt: string;
  __MOCKED__?: boolean;
}

const MOCK_FINANCIALS: Financials = {
  receita: [267_211_000_000, 260_000_000_000, 255_000_000_000],
  ebitda: [86_842_000_000, 80_500_000_000, 78_100_000_000],
  ebit: [65_320_000_000, 60_210_000_000, 58_900_000_000],
  lucroLiquido: [35_539_000_000, 32_100_000_000, 31_400_000_000],
  capex: [8_900_000_000, 9_300_000_000, 10_200_000_000],
  caixa: [44_213_000_000, 42_100_000_000, 39_800_000_000],
  dividaBruta: [122_450_000_000, 120_000_000_000, 118_200_000_000],
  dividendos12m: 18_500_000_000,
  datas: ["2024-12-31", "2023-12-31", "2022-12-31"],
};

function mapCsvToFinancials(csv: string): Financials {
  const rows = parseCsv(csv);
  if (rows.length <= 1) {
    return MOCK_FINANCIALS;
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const getColumn = (aliases: string[]) => dataRows.map((row) => extractNumber(row[headers.indexOf(aliases[0])] ?? "0"));

  return {
    receita: getColumn(["Receita"]),
    ebitda: getColumn(["EBITDA"]),
    ebit: getColumn(["EBIT"]),
    lucroLiquido: getColumn(["Lucro Líquido", "Lucro Liquido"]),
    capex: getColumn(["CAPEX"]),
    caixa: getColumn(["Caixa"]),
    dividaBruta: getColumn(["Dívida Bruta", "Divida Bruta"]),
    dividendos12m: MOCK_FINANCIALS.dividendos12m,
    datas: dataRows.map((row) => normalizeIsoDate(row[0] ?? "")),
  };
}

export async function getITRDFP(cnpj: string): Promise<{ financials: Financials; fonte: string }> {
  const url = `${CVM_BASE_URL}/dataset/cia_aberta-doc-itr.csv?cnpj=${cnpj}`;

  try {
    const response = await httpGet<string>(url, {
      headers: { Accept: "text/csv" },
    });

    return {
      financials: mapCsvToFinancials(response.rawBody),
      fonte: url,
    };
  } catch (error) {
    console.warn("getITRDFP fallback para mock", error);
    return {
      financials: MOCK_FINANCIALS,
      fonte: `${url}#__MOCKED__`,
    };
  }
}

export async function getFR(cnpj: string): Promise<FactoRelevante[]> {
  const url = `${CVM_BASE_URL}/dados/cia_aberta/doc/fre/DOC_FRE_CIA_ABERTA_${cnpj}.csv`;

  try {
    const response = await httpGet<string>(url, {
      headers: { Accept: "text/csv" },
    });
    const rows = parseCsv(response.rawBody).slice(1);

    return rows.slice(0, 5).map((row) => ({
      title: row[2] ?? "Fato relevante",
      date: normalizeIsoDate(row[1] ?? ""),
      url: row[3] ?? url,
      excerpt: row[4] ?? "",
    }));
  } catch (error) {
    console.warn("getFR fallback para mock", error);
    return [
      {
        title: "Atualização do guidance de produção 2025",
        date: new Date().toISOString(),
        url: `${url}#__MOCKED__`,
        excerpt: "Companhia revisou projeções de produção e capex para 2025.",
        __MOCKED__: true,
      },
    ];
  }
}

