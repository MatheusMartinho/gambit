export type Period = "TTM" | "FY" | "Y-1" | "Y-2" | "Q";

export type Fonte = {
  nome: string;
  url: string;
  data: string;
};

export type MetricaFinanceira = {
  valor: number;
  unidade: "BRL" | "%" | "x" | "pp";
  periodo: string;
  fonte: Fonte;
  calculoDetalhado?: {
    formula: string;
    inputs: Record<string, number>;
    ajustes?: string[];
  };
};

export interface Financials {
  receita: number[];
  ebitda: number[];
  ebit: number[];
  lucroLiquido: number[];
  capex: number[];
  caixa: number[];
  dividaBruta: number[];
  dividendos12m?: number;
  datas: string[];
}

export interface KPIs {
  cagrReceita5a?: number;
  margemEBITDA?: number;
  margemLiquida?: number;
  dividaLiquida?: number;
  divLiqSobreEBITDA?: number;
  coberturaJuros?: number;
  fcf?: number;
  fcfSobreLL?: number;
  roe?: number;
  roic?: number;
  pl?: number;
  evEbitda?: number;
  pvp?: number;
  dividendYield?: number;
}

export interface GuidanceItem {
  nome: string;
  unidade: string;
  guia: number;
  realizado: number;
  erroAbs: number;
  fonte: string;
  data: string;
}

export interface RedFlag {
  tipo: "contabil" | "juridico" | "governanca" | "liquidez";
  termo: string;
  severidade: number;
  materialidade: "baixa" | "media" | "alta";
  trecho: string;
  fonte: string;
  data: string;
}

export type HealthScorePillar = {
  label: string;
  score: number;
  maxScore: number;
  rationale: string[];
};

export interface HealthScore {
  total: number;
  max: number;
  updatedAt: string;
  pillars: HealthScorePillar[];
}

export type ValuationVerdictStatus = "desconto" | "justo" | "premio";

export interface ValuationVerdict {
  status: ValuationVerdictStatus;
  upsideBase: number;
  range: { bear: number; bull: number };
  rationale: string[];
  assumptions: {
    wacc: number;
    g: number;
    ebitdaDelta: number;
  };
}

export interface Analysis {
  ticker: string;
  cnpj: string;
  empresa: string;
  sumario: {
    tese: string[];
    ancora: {
      crescimento: string;
      rentabilidade: string;
      alavancagem: string;
    };
    catalisadores: string[];
    riscos: string[];
  };
  qualidade: {
    moat: string[];
    cicloCaixa: string;
    poderPreco: string;
  };
  setor: {
    tam: string;
    posicao: string;
    regulacao: string;
    kpisSetoriais: Record<string, number | string>;
  };
  financials: Financials;
  kpis: KPIs;
  valuation: {
    precoAtual?: number;
    marketCap?: number;
    enterpriseValue?: number;
    volume2m?: number;
    multiplos: KPIs;
    dcf?: {
      wacc: number;
      g: number;
      sensibilidades: Record<string, number>;
    };
  };
  dividends: {
    payout12m?: number;
    yield12m?: number;
    calendario?: {
      dataEx: string;
      valor: number;
    }[];
  };
  guidance: GuidanceItem[];
  redflags: RedFlag[];
  fontes: Fonte[];
  kpiDetalhado?: Record<string, MetricaFinanceira>;
  series?: {
    trimestral: unknown[];
    anual: unknown[];
  };
  healthScore?: HealthScore;
  verdict?: ValuationVerdict;
  checklist?: Record<string, unknown>;
  updatedAt: string;
}
