import { detectRedFlags } from "@/lib/redflags";
import type { GuidanceItem, RedFlag } from "@/models/fundamentals";

const ALLOWLIST =
  (import.meta.env.VITE_RI_ALLOWLIST as string | undefined)?.split(",").map((item) => item.trim()) ?? [];

function isDomainAllowed(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return !ALLOWLIST.length || ALLOWLIST.some((allowed) => hostname.endsWith(allowed));
  } catch (error) {
    console.warn("URL inválida para crawler", url, error);
    return false;
  }
}

export async function getGuidance(identifier: string): Promise<GuidanceItem[]> {
  console.info("[riCrawler] getGuidance executado com identificador", identifier);
  // TODO: implementar crawler real respeitando robots.txt
  return [
    {
      nome: "Produção minério (Mt)",
      unidade: "Mt",
      guia: 320,
      realizado: 312,
      erroAbs: Math.abs(312 - 320) / 320,
      fonte: `https://ri.example.com/${identifier}/guidance#__MOCKED__`,
      data: new Date().toISOString(),
    },
  ];
}

export async function getDocuments(identifier: string): Promise<
  {
    title: string;
    url: string;
    date: string;
    kind: string;
    excerpt: string;
    redflags: RedFlag[];
  }[]
> {
  console.info("[riCrawler] getDocuments executado com identificador", identifier);

  const mockedUrl = `https://ri.example.com/${identifier}/documento#__MOCKED__`;

  if (!isDomainAllowed(mockedUrl)) {
    return [];
  }

  const excerpt =
    "Companhia informou atualização de guidance e menção a covenant em projeto estruturante para 2025.";

  const redflags = detectRedFlags(excerpt).map((hit) => ({
    tipo: "governança" as const,
    termo: hit.term,
    severidade: 2,
    materialidade: "média" as const,
    trecho: hit.context,
    fonte: mockedUrl,
    data: new Date().toISOString(),
  }));

  return [
    {
      title: "Investor Day 2025 - Atualização Estratégica",
      url: mockedUrl,
      date: new Date().toISOString(),
      kind: "Apresentação",
      excerpt,
      redflags,
    },
  ];
}

