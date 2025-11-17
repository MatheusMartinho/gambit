import { memo, Suspense, lazy, useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  Bell,
  ChevronRight,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  BarChart3,
  Database,
  Layers,
  Eye,
  CalendarDays,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { ProfessionalChecklist } from "@/components/ProfessionalChecklist";
import { ExplainMath } from "@/components/ExplainMath";
import { SimpleTooltip } from "@/components/SimpleTooltip";
import { SkeletonBlock, SkeletonKpiChips, SkeletonChart, SkeletonCard } from "@/components/Skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useFundamentals } from "@/features/fundamentals/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { FALLBACK_ANALYSIS } from "@/data/repository";

const CompararTab = lazy(() => import("@/components/ComparePeers"));

// FALLBACK_ANALYSIS agora é importado de @/data/repository

const WATCHLIST = [
  { t: "ITUB4", n: "Itau Unibanco", p: 38.11, ch: 0.62, y: "4,2%" },
  { t: "VALE3", n: "Vale S.A.", p: 64.27, ch: -1.21, y: "7,1%" },
  { t: "PETR4", n: "Petrobras PN", p: 39.85, ch: 0.31, y: "14,8%" },
  { t: "WEGE3", n: "WEG", p: 39.12, ch: 0.95, y: "1,2%" },
];

const ROADMAP_STATUS = [
  { area: "Encoding UTF-8 fix", entrega: "MVP", status: "✅ Concluido" },
  { area: "APIs + Crawler", entrega: "Core", status: "✅ Em producao" },
  { area: "KPIs + Graficos", entrega: "MVP", status: "✅ Concluido" },
      "Venda de ativos de niquel no Canada reduz alavancagem.",
      "Ramp-up de Serra Sul amplia volume com melhor mix.",
    ],
    riscos: [
      "Volatilidade do preco do minerio impacta margens.",
      "Passivos ESG podem gerar desembolsos adicionais.",
    ],
  },
  qualidade: {
    moat: [
      "Escala global com integracao mina-ferrovia-porto otimiza custo entregue.",
      "Portfolio de minerio premium gera premio de preco e fideliza clientes.",
    ],
    cicloCaixa: "Conversao de caixa media de 80% do lucro liquido nos ultimos 5 anos.",
    poderPreco: "Contratos indexados a benchmarks internacionais sustentam repasse de custos.",
  },
  setor: {
    tam: "Mercado global de minerio de ferro estimado em US$ 180 bi",
    posicao: "Top 3 global com participacao proxima de 12%",
    regulacao: "Exposicao ambiental elevada exige compliance ESG rigoroso",
    kpisSetoriais: {
      cashCost: 41,
      premio65fe: 13,
      cambioFavoravel: "USD forte beneficia margens",
    },
  },
  financials: {
    receita: [267_211_000_000, 260_000_000_000, 255_000_000_000, 240_000_000_000, 230_000_000_000],
    ebitda: [86_842_000_000, 80_500_000_000, 78_100_000_000, 74_000_000_000, 70_000_000_000],
    ebit: [65_320_000_000, 60_210_000_000, 58_900_000_000, 55_000_000_000, 52_800_000_000],
    lucroLiquido: [35_539_000_000, 32_100_000_000, 31_400_000_000, 30_200_000_000, 28_900_000_000],
    capex: [8_900_000_000, 9_300_000_000, 10_200_000_000, 9_800_000_000, 9_600_000_000],
    caixa: [44_213_000_000, 42_100_000_000, 39_800_000_000, 37_500_000_000, 35_000_000_000],
    dividaBruta: [122_450_000_000, 120_000_000_000, 118_200_000_000, 121_000_000_000, 124_000_000_000],
    dividendos12m: 18_500_000_000,
    datas: ["2024-12-31", "2023-12-31", "2022-12-31", "2021-12-31", "2020-12-31"],
  },
  kpis: {
    cagrReceita5a: 0.043,
    margemEBITDA: 0.325,
    margemLiquida: 0.133,
    dividaLiquida: 78_237_000_000,
    divLiqSobreEBITDA: 0.9,
    coberturaJuros: 9.4,
    fcf: 77_942_000_000,
    fcfSobreLL: 2.19,
    roe: 0.32,
    roic: 0.158,
    pl: 6.2,
    evEbitda: 5.1,
    pvp: 1.6,
    dividendYield: 0.071,
  },
  valuation: {
    precoAtual: 64.27,
    marketCap: 267_211_000_000,
    enterpriseValue: 298_000_000_000,
    volume2m: 1_018_380_000,
    multiplos: {
      pl: 6.2,
      evEbitda: 5.1,
      dividendYield: 0.071,
      pvp: 1.6,
    },
    dcf: {
      wacc: 0.1275,
      g: 0.02,
      sensibilidades: {
        "WACC +0,5 p.p.": -0.06,
        "Preco do minerio -10%": -0.08,
        "FX BRL/USD +0,2": 0.04,
      },
    },
  },
  dividends: {
    payout12m: 0.52,
    yield12m: 0.071,
    calendario: [
      { dataEx: "2024-09-15", valor: 1.25 },
      { dataEx: "2024-06-10", valor: 1.1 },
      { dataEx: "2024-03-12", valor: 0.95 },
    ],
  },
  guidance: [
    {
      nome: "Producao minerio (Mt)",
      unidade: "Mt",
      guia: 320,
      realizado: 312,
      erroAbs: 0.025,
      fonte: "https://ri.example.com/vale3/guidance#__MOCKED__",
      data: "2024-12-31",
    },
  ],
  redflags: [
    {
      tipo: "juridico",
      termo: "fato relevante",
      severidade: 2,
      materialidade: "media",
      trecho: "Atualizacao do acordo de Brumadinho pode gerar novos desembolsos.",
      fonte: "https://ri.example.com/vale3/fr#__MOCKED__",
      data: "2024-11-03",
    },
  ],
  fontes: [
    { nome: "CVM - DFP 2024", url: "https://www.cvm.gov.br/dfp", data: "2025-02-15" },
    { nome: "B3 - Cotacoes", url: "https://www.b3.com.br", data: "2025-02-22" },
    { nome: "BCB - Selic", url: "https://api.bcb.gov.br", data: "2025-02-20" },
  ],
  comparables: [
    { ticker: "VALE3", empresa: "Vale S.A.", pl: 6.2, evEbitda: 5.1, dividendYield: 0.071, margemEbitda: 0.33, roe: 0.32 },
    { ticker: "RIO", empresa: "Rio Tinto", pl: 8.4, evEbitda: 6.2, dividendYield: 0.055, margemEbitda: 0.31, roe: 0.28 },
    { ticker: "BHP", empresa: "BHP Group", pl: 9.1, evEbitda: 6.8, dividendYield: 0.049, margemEbitda: 0.29, roe: 0.26 },
    { ticker: "CSNA3", empresa: "CSN", pl: 7.3, evEbitda: 5.9, dividendYield: 0.042, margemEbitda: 0.24, roe: 0.19 },
  ],
  kpiDetalhado: {
    cagr_receita_5a: {
      valor: 0.043,
      unidade: "%",
      periodo: "FY-5y",
      fonte: { nome: "CVM - DFP 2024", url: "https://www.cvm.gov.br/dfp", data: "2025-02-15" },
      calculoDetalhado: {
        formula: "(ReceitaAtual / ReceitaInicial)^(1/n) - 1",
        inputs: { ReceitaAtual: 267_211_000_000, ReceitaInicial: 230_000_000_000, n: 4 },
      },
    },
  },
  series: {
    anual: [
      { data: "2024-12-31", receita: 267_211_000_000, lucro: 35_539_000_000, ebitda: 86_842_000_000, capex: 8_900_000_000 },
      { data: "2023-12-31", receita: 260_000_000_000, lucro: 32_100_000_000, ebitda: 80_500_000_000, capex: 9_300_000_000 },
      { data: "2022-12-31", receita: 255_000_000_000, lucro: 31_400_000_000, ebitda: 78_100_000_000, capex: 10_200_000_000 },
      { data: "2021-12-31", receita: 240_000_000_000, lucro: 30_200_000_000, ebitda: 74_000_000_000, capex: 9_800_000_000 },
      { data: "2020-12-31", receita: 230_000_000_000, lucro: 28_900_000_000, ebitda: 70_000_000_000, capex: 9_600_000_000 },
    ],
    trimestral: [],
  },
  healthScore: {
    total: 82,
    max: 100,
    updatedAt: "2025-02-22T10:00:00Z",
    pillars: [
      { label: "Rentabilidade", score: 22, maxScore: 25, rationale: ["ROIC 15,8% vs WACC 12,7%", "Spread positivo"] },
      { label: "Crescimento", score: 18, maxScore: 25, rationale: ["CAGR receita 4,3%"] },
      { label: "Estrutura", score: 20, maxScore: 25, rationale: ["Divida Liq./EBITDA 0,9x", "Cobertura juros 9,4x"] },
      { label: "Geracao de Caixa", score: 22, maxScore: 25, rationale: ["FCF/LL 2,19x", "Yield 7,1%"] },
    ],
  },
  verdict: {
    status: "desconto",
    upsideBase: 0.18,
    range: { bear: 0.08, bull: 0.28 },
    rationale: [
      "EV/EBITDA atual 5,1x vs pares 6,0x",
      "Dividend Yield acima de 7%",
      "Spread ROIC-WACC positivo",
    ],
    assumptions: {
      wacc: 0.1275,
      g: 0.02,
      ebitdaDelta: 0.05,
    },
  },
  checklist: {
    health: {
      category: "Saude financeira",
      score: 4,
      maxScore: 5,
      items: [
        { check: "ROIC acima do WACC", status: true },
        { check: "Alavancagem controlada (<2x)", status: true },
        { check: "Conversao de caixa consistente", status: true },
      ],
    },
    growth: {
      category: "Crescimento",
      score: 3,
      maxScore: 4,
      items: [
        { check: "CAGR receita saudavel", status: true },
        { check: "Capex alinhado ao FCF", status: true },
      ],
    },
  },
  updatedAt: "2025-02-22T10:00:00Z",
});

const WATCHLIST = [
  { t: "ITUB4", n: "Itau Unibanco", p: 38.11, ch: 0.62, y: "4,2%" },
  { t: "VALE3", n: "Vale S.A.", p: 64.27, ch: -1.21, y: "7,1%" },
  { t: "PETR4", n: "Petrobras PN", p: 39.85, ch: 0.31, y: "14,8%" },
  { t: "WEGE3", n: "WEG", p: 39.12, ch: 0.95, y: "1,2%" },
];

const ROADMAP_STATUS = [
  { area: "Encoding UTF-8 fix", entrega: "MVP", status: "✅ Concluido" },
  { area: "APIs + Crawler", entrega: "Core", status: "✅ Em producao" },
  { area: "KPIs + Graficos", entrega: "MVP", status: "✅ Concluido" },
  { area: "Health Score", entrega: "Core", status: "✅ Concluido" },
  { area: "Valuation Verdict", entrega: "Core", status: "✅ Concluido" },
  { area: "Responsividade + A11y", entrega: "Polimento", status: "✅ Em progresso" },
  { area: "Fallback + Cache", entrega: "Core", status: "✅ Concluido" },
  { area: "Comparar + PDF", entrega: "Polimento", status: "🔜 Proxima fase" },
  { area: "Testes e Docs", entrega: "Pos-estabilizacao", status: "🔜 Agendado" },
];

const TICKER_REGEX = /^[A-Z]{4}[0-9]{1,2}$/;

const EmptyState = ({ message }) => (
  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/50">
    {message}
  </div>
);

const ErrorMessage = ({ msg }) => (
  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
    <AlertTriangle className="mr-2 inline h-4 w-4" />
    {msg}
  </div>
);
const HealthScoreCard = memo(({ healthScore }) => {
  if (!healthScore) return <EmptyState message="Health score nao disponivel." />;
  return (
    <Card className="rounded-2xl border-white/10 bg-[#10192E]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">Health Score</div>
            <div className="mt-1 text-3xl font-semibold text-white">{healthScore.total}</div>
            <div className="text-xs text-white/60">de {healthScore.max} pontos</div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-200">
            Atualizado {new Date(healthScore.updatedAt).toLocaleDateString("pt-BR")}
          </Badge>
        </div>
        <div className="space-y-3">
          {healthScore.pillars.map((pillar) => (
            <div key={pillar.label}>
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
                <span>{pillar.label}</span>
                <span>
                  {pillar.score.toFixed(1)} / {pillar.maxScore}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3E8FFF] to-emerald-400"
                  style={{ width: `${Math.min(100, (pillar.score / pillar.maxScore) * 100)}%` }}
                />
              </div>
              <ul className="mt-1 space-y-1 text-xs text-white/60">
                {pillar.rationale.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

const ValuationVerdictCard = memo(({ verdict }) => {
  if (!verdict) return <EmptyState message="Valuation ainda nao calculado." />;

  const badgeMap = {
    desconto: "bg-emerald-500/20 text-emerald-200",
    justo: "bg-amber-500/20 text-amber-200",
    premio: "bg-rose-500/20 text-rose-200",
  };

  const statusLabel =
    verdict.status === "desconto"
      ? "Negociando com desconto"
      : verdict.status === "justo"
        ? "Preco alinhado aos fundamentos"
        : "Negociando com premio";

  return (
    <Card className="rounded-2xl border-white/10 bg-[#10192E]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">Valuation verdict</div>
            <div className="mt-1 text-2xl font-semibold text-white">{(verdict.upsideBase * 100).toFixed(1)}%</div>
            <div className="text-xs text-white/60">Upside base estimado</div>
          </div>
          <Badge className={badgeMap[verdict.status]}>{statusLabel}</Badge>
        </div>
        <div className="text-xs text-white/60">
          Range de sensibilidade: <span className="text-white">{(verdict.range.bear * 100).toFixed(1)}%</span> a <span className="text-white">{(verdict.range.bull * 100).toFixed(1)}%</span>
        </div>
        <ul className="space-y-1 text-xs text-white/70">
          {verdict.rationale.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ArrowUpRight className="mt-0.5 h-3 w-3 text-[#3E8FFF]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-white/10 bg-[#0F162B] p-3 text-[11px] text-white/50">
          <div>
            <span className="text-white/60">WACC base:</span> {(verdict.assumptions.wacc * 100).toFixed(1)}%
          </div>
          <div>
            <span className="text-white/60">Crescimento terminal:</span> {(verdict.assumptions.g * 100).toFixed(1)}%
          </div>
          <div>
            <span className="text-white/60">Delta EBITDA:</span> {(verdict.assumptions.ebitdaDelta * 100).toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const PerformanceCharts = memo(({ data }) => {
  const chartData = useMemo(
    () =>
      data?.length
        ? data.map((item) => ({
            period: new Date(item.data).getFullYear().toString(),
            receita: item.receita,
            lucro: item.lucro,
            fcf: (item.ebitda ?? 0) - (item.capex ?? 0),
          }))
        : [],
    [data],
  );

  const isMobile = useMediaQuery("(max-width: 768px)");
  
  if (!data?.length) return <EmptyState message="Sem historico anual para exibir." />;
  const chartHeight = isMobile ? 220 : 280;
  const axisFormatter = (value) => `${(value / 1_000_000_000).toFixed(0)}B`;
  const tooltipFormatter = (value) => `${(Number(value) / 1_000_000_000).toFixed(2)} bi`;
  const areaMargin = isMobile ? { top: 16, right: 12, left: -18, bottom: 0 } : { top: 20, right: 24, left: -6, bottom: 0 };
  const barMargin = isMobile ? { top: 16, right: 12, left: -18, bottom: 0 } : { top: 24, right: 24, left: -6, bottom: 0 };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-2xl border-white/10 bg-[#10192E]">
        <CardContent className="p-4">
          <div className="text-xs uppercase tracking-wide text-white/40">Receita vs lucro</div>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={areaMargin}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3E8FFF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3E8FFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={axisFormatter} />
                <RechartsTooltip formatter={tooltipFormatter} contentStyle={{ background: "#111A2E", borderRadius: 12, border: "1px solid rgba(148,163,184,.2)" }} />
                <Legend />
                <Area type="monotone" dataKey="receita" stroke="#3E8FFF" fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="lucro" stroke="#34d399" fillOpacity={1} fill="url(#colorLucro)" name="Lucro" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-white/10 bg-[#10192E]">
        <CardContent className="p-4">
          <div className="text-xs uppercase tracking-wide text-white/40">FCF estimado (EBITDA - Capex)</div>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={barMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={axisFormatter} />
                <RechartsTooltip formatter={tooltipFormatter} contentStyle={{ background: "#111A2E", borderRadius: 12, border: "1px solid rgba(148,163,184,.2)" }} />
                <Bar dataKey="fcf" fill="#F97316" name="FCF estimado" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
const Screen = () => {
  const [query, setQuery] = useState("VALE3");
  const [selectedTicker, setSelectedTicker] = useState("VALE3");
  const [yieldMin, setYieldMin] = useState([5]);
  const [plMax, setPlMax] = useState([12]);
  const [leverage, setLeverage] = useState([2]);

  const { data, error, isLoading, refresh } = useFundamentals(selectedTicker);
  const analysis = useMemo(() => (isRenderableAnalysis(data) ? data : FALLBACK_ANALYSIS), [data]);
  const healthScore = analysis.healthScore ?? FALLBACK_ANALYSIS.healthScore;
  const verdict = analysis.verdict ?? FALLBACK_ANALYSIS.verdict;

  const headerInfo = useMemo(
    () => ({
      name: analysis.empresa,
      ticker: analysis.ticker,
      price: analysis.valuation.precoAtual ?? 0,
      change: 0,
      marketCap: analysis.valuation.marketCap ?? 0,
      volume: analysis.valuation.volume2m ?? 0,
    }),
    [analysis],
  );

  const primaryFonte = useMemo(
    () =>
      analysis.fontes?.[0] ?? {
        nome: "Fonte nao informada",
        url: "#",
        data: analysis.updatedAt,
      },
    [analysis.fontes, analysis.updatedAt],
  );

  const anchorMetrics = useMemo(
    () => [
      {
        label: "Crescimento",
        value: analysis.sumario.ancora.crescimento.split(":").slice(-1)[0]?.trim() ?? analysis.sumario.ancora.crescimento,
        context: analysis.sumario.ancora.crescimento,
        formula: "CAGR = (ReceitaAtual / ReceitaInicial)^(1/n) - 1",
        calculation: {
          inputs: {
            ReceitaAtual: analysis.financials.receita[0],
            ReceitaInicial: analysis.financials.receita.at(-1) ?? analysis.financials.receita[0],
            n: Math.max(analysis.financials.receita.length - 1, 1),
          },
          steps: ["Dividir receita atual pela inicial", "Aplicar raiz equivalente", "Subtrair 1"],
        },
        fonte: primaryFonte,
      },
      {
        label: "Rentabilidade",
        value: analysis.sumario.ancora.rentabilidade.split(":").slice(-1)[0]?.trim() ?? analysis.sumario.ancora.rentabilidade,
        context: analysis.sumario.ancora.rentabilidade,
        formula: "ROIC = NOPAT / Capital Investido Medio",
        calculation: {
          inputs: {
            NOPAT: (analysis.kpis.roic ?? 0) * (analysis.financials.dividaBruta[0] ?? 1),
            CapitalInvestido: analysis.financials.dividaBruta[0] ?? 1,
          },
          steps: ["Aplicar imposto sobre EBIT", "Dividir pelo capital investido medio"],
        },
        fonte: primaryFonte,
      },
      {
        label: "Alavancagem",
        value: analysis.sumario.ancora.alavancagem.split(":").slice(-1)[0]?.trim() ?? analysis.sumario.ancora.alavancagem,
        context: analysis.sumario.ancora.alavancagem,
        formula: "Divida Liquida / EBITDA",
        calculation: {
          inputs: {
            DividaBruta: analysis.financials.dividaBruta[0],
            Caixa: analysis.financials.caixa[0],
            EBITDA: analysis.financials.ebitda[0],
          },
          steps: ["Divida Liquida = Divida Bruta - Caixa", "Dividir pelo EBITDA"],
        },
        fonte: primaryFonte,
      },
    ],
    [analysis, primaryFonte],
  );

  const filteredWatchlist = useMemo(
    () =>
      filterByYield(WATCHLIST, yieldMin[0]).filter((asset) => {
        const normalizedPl = Math.abs(parsePercent(asset.ch));
        return normalizedPl <= plMax[0];
      }),
    [yieldMin, plMax],
  );

  const annualSeries = analysis.series?.anual ?? [];
  const detailedMetrics = Object.entries(analysis.kpiDetalhado ?? {});
  const peerComparisons = useMemo(() => {
    const baseComparable = {
      ticker: analysis.ticker,
      empresa: analysis.empresa,
      pl: analysis.kpis.pl ?? null,
      evEbitda: analysis.kpis.evEbitda ?? null,
      dividendYield: analysis.kpis.dividendYield ?? null,
      margemEbitda: analysis.kpis.margemEBITDA ?? null,
      roe: analysis.kpis.roe ?? null,
    };
    const peersSource =
      analysis.comparables && analysis.comparables.length ? analysis.comparables : FALLBACK_ANALYSIS.comparables ?? [];
    const deduped = [];
    const seen = new Set();
    [baseComparable, ...peersSource].forEach((item) => {
      if (!item || !item.ticker) return;
      const ticker = item.ticker.toUpperCase();
      if (seen.has(ticker)) return;
      seen.add(ticker);
      deduped.push({
        ticker,
        empresa: item.empresa ?? item.ticker,
        pl: typeof item.pl === "number" ? item.pl : null,
        evEbitda: typeof item.evEbitda === "number" ? item.evEbitda : null,
        dividendYield: typeof item.dividendYield === "number" ? item.dividendYield : null,
        margemEbitda: typeof item.margemEbitda === "number" ? item.margemEbitda : null,
        roe: typeof item.roe === "number" ? item.roe : null,
      });
    });
    return deduped;
  }, [analysis]);
  const isInitialLoading = isLoading && !data;

  const handleSearch = (rawTicker) => {
    const symbol = (rawTicker || query || "").trim().toUpperCase();
    if (!symbol || !TICKER_REGEX.test(symbol)) {
      return;
    }
    setSelectedTicker(symbol);
    setQuery(symbol);
    refresh();
  };

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        background:
          "radial-gradient(1200px 800px at 10% -10%, rgba(62,143,255,.18), transparent), radial-gradient(900px 600px at 90% -20%, rgba(255,30,210,.12), transparent)",
        backgroundColor: "#0A0F1F",
      }}
    >
      {/* Acessibilidade: Anúncio de status para screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading ? `Carregando análise de ${selectedTicker}...` : `Análise de ${analysis.empresa} atualizada`}
      </div>
      {error && (
        <div className="sr-only" role="alert" aria-live="assertive">
          Erro ao carregar dados. Por favor, tente novamente.
        </div>
      )}

      <div className="sticky top-0 z-30 border-b border-white/5 bg-slate-900/30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-content-center rounded-xl bg-gradient-to-br from-[#3E8FFF] to-[#FF1ED2] shadow-[0_0_24px_rgba(62,143,255,.45)]">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm uppercase tracking-wider text-white/70">GAMBIT</div>
              <div className="text-[10px] text-white/40">Risco calculado, retorno claro</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="border border-[#3E8FFF]/30 bg-[#13203B] text-[#3E8FFF]">Free | 10 analises/mes</Badge>
            <Button className="bg-[#FF1ED2] hover:bg-[#e31ac0] text-white">Upgrade PRO</Button>
          </div>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6">
        <div className="mb-5 flex items-center gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Sparkles className="mr-2 h-4 w-4" />
            Analise fundamentalista com IA
          </Button>
          <Badge variant="secondary" className="border border-white/10 bg-[#14213D] text-white">
            Dados oficiais CVM | RI | B3 | BCB
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          Analise empresas da B3 em <span className="text-[#3E8FFF]">30 segundos</span>
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Sumario executivo, fundamentos auditaveis, health score e verdict de valuation em uma unica experiencia responsiva.
        </p>
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Digite um ticker: 'VALE3', 'PETR4', 'ITUB4'..."
              className="rounded-2xl border-white/10 bg-[#0F162B] py-6 pl-12 pr-40 text-base text-white placeholder:text-white/40"
              aria-label="Buscar ticker"
              autoComplete="off"
            />
            <Button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[#3E8FFF] hover:bg-[#2c75dc]"
            >
              {isLoading ? "Carregando..." : "Pesquisar"}
            </Button>
          </div>
          {error && <ErrorMessage msg="Nao foi possivel carregar os dados. Tente novamente." />}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <BarChart3 className="h-4 w-4" />, text: "Analise PETR4 para mim" },
            { icon: <Layers className="h-4 w-4" />, text: "Compare VALE3 vs ITUB4" },
            { icon: <Info className="h-4 w-4" />, text: "MGLU3 tem red flags?" },
            { icon: <TrendingUp className="h-4 w-4" />, text: "Melhores pagadoras de dividendos" },
          ].map((item) => (
            <Button
              key={item.text}
              variant="outline"
              className="flex items-center gap-2 justify-start rounded-xl border-white/10 bg-white/5 text-left text-white hover:bg-white/10"
            >
              {item.icon}
              {item.text}
              <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
            </Button>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 space-y-6">
        <Card className="rounded-2xl border-white/10 bg-[#0F162B]/80">
          <CardContent className="space-y-6 p-6">
            {isInitialLoading ? (
              <div className="space-y-6">
                <SkeletonCard />
                <SkeletonKpiChips />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex flex-1 items-start gap-3">
                    <span className="grid h-12 w-12 place-content-center rounded-2xl bg-[#13203B] text-[#3E8FFF]">
                      <Building2 className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {headerInfo.name} <span className="text-white/40">({analysis.ticker})</span>
                      </div>
                      <div className="text-xs text-white/60">
                        {analysis.setor.posicao} | {analysis.setor.regulacao}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wide text-white/30">
                        <span>Valor mercado {formatCurrency(headerInfo.marketCap)}</span>
                        <span>Volume 2m {formatCurrency(headerInfo.volume)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-white">R$ {headerInfo.price.toFixed(2)}</div>
                    <div className={`${headerInfo.change >= 0 ? "text-emerald-400" : "text-rose-400"} text-sm`}>
                      {headerInfo.change >= 0 ? <ArrowUpRight className="mr-1 inline h-4 w-4" /> : <ArrowDownRight className="mr-1 inline h-4 w-4" />}
                      {headerInfo.change.toFixed(2)}% hoje
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-white/30">
                      Atualizado em {new Date(analysis.updatedAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {anchorMetrics.map((metric, index) => {
                    const Icon = [TrendingUp, Sparkles, Layers][index % 3];
                    return (
                      <div
                        key={metric.label}
                        className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 text-sm text-white/80"
                      >
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span className="grid h-8 w-8 place-content-center rounded-full bg-[#13203B] text-[#3E8FFF]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <SimpleTooltip content={metric.formula}>
                            <span className="cursor-help">{metric.label}</span>
                          </SimpleTooltip>
                        </div>
                      <div className="mt-2 text-2xl font-semibold text-white">{metric.value}</div>
                      <div className="mt-2 text-xs text-white/60">{metric.context}</div>
                      <ExplainMath
                        formula={metric.formula}
                        calculation={metric.calculation}
                        cite={metric.fonte}
                        triggerLabel="Ver conta"
                        className="mt-4"
                      />
                    </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-wide text-white/40">Tese (30-60s)</div>
                      <ul className="mt-2 space-y-2 text-sm text-white/85">
                        {analysis.sumario.tese.map((item) => (
                          <li key={item} className="list-disc list-inside">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-wide text-white/40">Catalisadores</div>
                      <ul className="mt-2 space-y-2 text-sm text-white/80">
                        {analysis.sumario.catalisadores.map((item) => (
                          <li key={item} className="rounded-lg border border-white/10 bg-[#0F162B] p-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-wide text-white/40">Riscos</div>
                      <ul className="mt-2 space-y-2 text-sm text-white/80">
                        {analysis.sumario.riscos.map((item) => (
                          <li key={item} className="rounded-lg border border-white/10 bg-[#0F162B] p-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <HealthScoreCard healthScore={healthScore} />
          <ValuationVerdictCard verdict={verdict} />
        </div>
        <PerformanceCharts data={annualSeries} />

        <Card className="rounded-2xl border-white/10 bg-[#10192E]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Eventos e documentos</span>
              <Badge className="border border-[#3E8FFF]/30 bg-[#13203B] text-[#3E8FFF]">Citacoes</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(analysis.fontes ?? []).map((fonte) => (
                <div key={`${fonte.url}-${fonte.data}`} className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-sm">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">{formatShortDate(fonte.data)}</div>
                  <div className="mt-1 text-white">{fonte.nome}</div>
                  <a href={fonte.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[#3E8FFF]">
                    <ArrowUpRight className="h-3 w-3" />
                    Abrir documento
                  </a>
                </div>
              ))}
            </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-white/10 bg-[#10192E]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <CalendarDays className="h-4 w-4" />
            <span>Roadmap MVP → Core → Polimento</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-white/70">
              <thead>
                <tr className="text-white/40">
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">Area</th>
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">Entrega</th>
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {ROADMAP_STATUS.map((item) => {
                  const statusLabel = item.status;
                  const isDone = statusLabel.includes("✅");
                  const isNext = statusLabel.includes("🔜");
                  const Icon = isDone ? CheckCircle2 : isNext ? Bell : Sparkles;
                  const pillClass = isDone
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : isNext
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-sky-500/30 bg-sky-500/10 text-sky-200";
                  return (
                    <tr key={item.area} className="border-t border-white/10 text-white/80">
                      <td className="py-2 pr-4 text-sm font-medium text-white">{item.area}</td>
                      <td className="py-2 pr-4">{item.entrega}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[11px] uppercase tracking-wide ${pillClass}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-white/10 bg-[#10192E]">
        <CardContent className="p-6">
          <Tabs defaultValue="overview">
              <TabsList className="mb-4 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-1 text-white">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="fundamentals">Fundamentos</TabsTrigger>
                <TabsTrigger value="finance">Financeiro</TabsTrigger>
                <TabsTrigger value="dividends">Dividendos</TabsTrigger>
                <TabsTrigger value="alerts">Alertas</TabsTrigger>
                <TabsTrigger value="valuation">Valuation</TabsTrigger>
                <TabsTrigger value="compare">Comparar</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 text-sm">
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Qualidade do negocio</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-white/80">
                        <div className="text-[11px] uppercase tracking-wide text-white/40">Moat</div>
                        <ul className="mt-2 space-y-2 text-sm text-white/80">
                          {analysis.qualidade.moat.map((item) => (
                            <li key={item} className="rounded-lg border border-white/10 bg-[#111B32] p-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-white/80">
                        <div className="text-[11px] uppercase tracking-wide text-white/40">Ciclo de caixa</div>
                        <div className="mt-2 text-sm text-white/80">{analysis.qualidade.cicloCaixa}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-white/80">
                        <div className="text-[11px] uppercase tracking-wide text-white/40">Poder de preco</div>
                        <div className="mt-2 text-sm text-white/80">{analysis.qualidade.poderPreco}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Setor e posicao competitiva</div>
                    <ul className="mt-2 space-y-2 text-white/80">
                      <li>Mercado: {analysis.setor.tam}</li>
                      <li>Posicao: {analysis.setor.posicao}</li>
                      <li>Regulacao: {analysis.setor.regulacao}</li>
                    </ul>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {Object.entries(analysis.setor.kpisSetoriais).map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-sm text-white/80">
                          <div className="text-xs text-white/50">{label}</div>
                          <div className="text-lg font-semibold text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fundamentals" className="space-y-4 text-sm">
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Resumo executivo</div>
                    <ul className="mt-2 space-y-2 text-white/85">
                      {analysis.sumario.tese.map((item, index) => (
                        <li key={`${analysis.ticker}-tese-${index}`} className="list-disc list-inside">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Catalisadores e riscos</div>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-white/80">
                        <div className="text-[11px] uppercase tracking-wide text-white/40">Catalisadores</div>
                    <ul className="mt-2 space-y-2 text-sm text-white/80">
                      {analysis.sumario.catalisadores.map((item, index) => (
                        <li key={`${analysis.ticker}-cat-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-white/80">
                    <div className="text-[11px] uppercase tracking-wide text-white/40">Riscos e mitigacao</div>
                    <ul className="mt-2 space-y-2 text-sm text-white/80">
                      {analysis.sumario.riscos.map((item, index) => (
                        <li key={`${analysis.ticker}-risk-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {detailedMetrics.length > 0 && (
              <Card className="border-white/10 bg-white/5">
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wide text-white/40">KPIs detalhados</div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {detailedMetrics.map(([key, metric], index) => {
                      const valor = metric.valor ?? 0;
                      const formattedValue =
                        metric.unidade === "%"
                          ? `${(valor * 100).toFixed(1)}%`
                          : metric.unidade === "BRL"
                            ? formatCurrency(valor)
                            : metric.unidade === "x"
                              ? `${valor.toFixed(2)}x`
                              : valor.toFixed(2);

                      return (
                        <div key={`${key}-${index}`} className="rounded-xl border border-white/10 bg-[#0F162B] p-3 text-sm text-white/80">
                          <div className="text-xs uppercase tracking-wide text-white/50">{key.replace(/_/g, " ")}</div>
                          <div className="mt-1 text-xl font-semibold text-white">{formattedValue}</div>
                          {metric.calculoDetalhado && (
                            <ExplainMath
                              formula={metric.calculoDetalhado.formula}
                              calculation={{
                                inputs: metric.calculoDetalhado.inputs,
                                steps: metric.calculoDetalhado.ajustes ?? [],
                              }}
                              cite={metric.fonte ?? primaryFonte}
                              className="mt-3"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
              </TabsContent>
              <TabsContent value="finance" className="space-y-4 text-sm">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      metric: "CAGR Receita 5a",
                      value: `${((analysis.kpis.cagrReceita5a ?? 0) * 100).toFixed(1)}%`,
                      explain: "Crescimento composto de receita nos ultimos cinco anos.",
                      formula: "(ReceitaAtual / ReceitaInicial)^(1/5) - 1",
                      calculation: {
                        inputs: {
                          ReceitaAtual: analysis.financials.receita[0],
                          ReceitaInicial: analysis.financials.receita.at(-1) ?? analysis.financials.receita[0],
                          Periodos: Math.max(analysis.financials.receita.length - 1, 1),
                        },
                        steps: ["Dividir receita atual pela inicial", "Aplicar raiz equivalente", "Subtrair 1"],
                      },
                    },
                    {
                      metric: "Margem EBITDA",
                      value: `${((analysis.kpis.margemEBITDA ?? 0) * 100).toFixed(1)}%`,
                      explain: "Eficiencia operacional em relacao a receita.",
                      formula: "EBITDA / Receita",
                      calculation: {
                        inputs: {
                          EBITDA: analysis.financials.ebitda[0],
                          Receita: analysis.financials.receita[0],
                        },
                        steps: ["Dividir EBITDA por receita"],
                      },
                    },
                    {
                      metric: "Margem Liquida",
                      value: `${((analysis.kpis.margemLiquida ?? 0) * 100).toFixed(1)}%`,
                      explain: "Lucro liquido como percentual da receita.",
                      formula: "Lucro Liquido / Receita",
                      calculation: {
                        inputs: {
                          LucroLiquido: analysis.financials.lucroLiquido[0],
                          Receita: analysis.financials.receita[0],
                        },
                        steps: ["Dividir lucro liquido por receita"],
                      },
                    },
                  ].map((item) => (
                    <Card key={item.metric} className="border-white/10 bg-white/5">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-white/40">{item.metric}</div>
                        <div className="mt-1 text-xl font-semibold text-white">{item.value}</div>
                        <div className="mt-2 text-xs text-white/60">{item.explain}</div>
                        <ExplainMath formula={item.formula} calculation={item.calculation} cite={primaryFonte} className="mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      metric: "Divida Liquida",
                      value: formatCurrency(analysis.kpis.dividaLiquida ?? 0),
                      explain: "Posicao de divida apos considerar caixa e equivalentes.",
                      formula: "Divida Liquida = Divida Bruta - Caixa",
                      calculation: {
                        inputs: {
                          DividaBruta: analysis.financials.dividaBruta[0],
                          Caixa: analysis.financials.caixa[0],
                        },
                        steps: ["Subtrair caixa da divida bruta"],
                      },
                    },
                    {
                      metric: "Divida Liquida / EBITDA",
                      value: `${(analysis.kpis.divLiqSobreEBITDA ?? 0).toFixed(1)}x`,
                      explain: "Indicador de alavancagem baseado em EBITDA.",
                      formula: "Divida Liquida / EBITDA",
                      calculation: {
                        inputs: {
                          DividaLiquida: analysis.kpis.dividaLiquida ?? 0,
                          EBITDA: analysis.financials.ebitda[0],
                        },
                        steps: ["Dividir divida liquida por EBITDA"],
                      },
                    },
                    {
                      metric: "Cobertura de juros",
                      value: `${(analysis.kpis.coberturaJuros ?? 0).toFixed(1)}x`,
                      explain: "Capacidade de cobrir despesa financeira com EBIT.",
                      formula: "EBIT / Despesa Financeira",
                      calculation: {
                        inputs: {
                          EBIT: analysis.financials.ebit[0],
                          DespesaFinanceira: (analysis.financials.ebit[0] ?? 0) * 0.1,
                        },
                        steps: ["Dividir EBIT por despesa financeira"],
                      },
                    },
                  ].map((item) => (
                    <Card key={item.metric} className="border-white/10 bg-white/5">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-white/40">{item.metric}</div>
                        <div className="mt-1 text-xl font-semibold text-white">{item.value}</div>
                        <div className="mt-2 text-xs text-white/60">{item.explain}</div>
                        <ExplainMath formula={item.formula} calculation={item.calculation} cite={primaryFonte} className="mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Guidance vs realizado</div>
                    {analysis.guidance.length ? (
                      <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full text-left text-xs text-white/70">
                          <thead>
                            <tr className="text-white/50">
                              <th className="py-2 pr-4 font-medium">Metrica</th>
                              <th className="py-2 pr-4 font-medium">Guidance</th>
                              <th className="py-2 pr-4 font-medium">Realizado</th>
                              <th className="py-2 pr-4 font-medium">Erro</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.guidance.map((row) => (
                              <tr key={row.nome} className="border-t border-white/10">
                                <td className="py-2 pr-4 text-white">{row.nome}</td>
                                <td className="py-2 pr-4">
                                  {row.guia} {row.unidade}
                                </td>
                                <td className="py-2 pr-4">
                                  {row.realizado} {row.unidade}
                                </td>
                                  <td className={`${(row.erroAbs ?? 0) > 0.05 ? "text-rose-300" : "text-emerald-300"} py-2 pr-4`}>
                                    {((row.erroAbs ?? 0) * 100).toFixed(1)}%
                                  </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState message="Sem dados de guidance para o periodo analisado." />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dividends" className="space-y-4 text-sm">
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-white/60" />
                      <div className="text-sm text-white/70">Resumo de proventos 12m</div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-[#0F162B] p-3">
                        <div className="text-xs text-white/50">Yield 12m</div>
                        <div className="text-2xl font-semibold text-emerald-400">
                          {((analysis.dividends.yield12m ?? 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-[#0F162B] p-3">
                        <div className="text-xs text-white/50">Payout 12m</div>
                        <div className="text-2xl font-semibold text-white">
                          {((analysis.dividends.payout12m ?? 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-[#0F162B] p-3">
                        <div className="text-xs text-white/50">Proximo evento</div>
                        <div className="text-lg text-white">
                          {analysis.dividends.calendario?.[0]
                            ? formatShortDate(analysis.dividends.calendario[0].dataEx)
                            : "--"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Calendario de dividendos</div>
                    {analysis.dividends.calendario?.length ? (
                      <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full text-left text-xs text-white/70">
                          <thead>
                            <tr className="text-white/50">
                              <th className="py-2 pr-4 font-medium">Data ex</th>
                              <th className="py-2 pr-4 font-medium">Valor (R$)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.dividends.calendario.map((item) => (
                              <tr key={`${item.dataEx}-${item.valor}`} className="border-t border-white/10">
                                <td className="py-2 pr-4 text-white">{formatShortDate(item.dataEx)}</td>
                                <td className="py-2 pr-4">{item.valor.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState message="Sem eventos de dividendos encontrados." />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="grid gap-4 md:grid-cols-2 text-sm">
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <Bell className="h-4 w-4" /> Alertas automaticos
                    </div>
                    <div className="flex items-center justify-between text-white/70">
                      <span>Notificar por e-mail</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between text-white/70">
                      <span>Notificar in-app</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between text-white/70">
                      <span>Halts e fatos relevantes</span>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <Info className="h-4 w-4" /> Red flags monitorados
                    </div>
                    <div className="space-y-3">
                      {analysis.redflags.length ? (
                        analysis.redflags.map((flag) => (
                          <div key={`${flag.fonte}-${flag.termo}`} className="rounded-xl border border-white/10 bg-[#0F162B] p-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/90">{flag.termo}</span>
                              <Badge className="bg-rose-500/20 text-rose-200 text-[10px] uppercase">{flag.materialidade}</Badge>
                            </div>
                            <div className="mt-1 text-xs text-white/60">{flag.trecho}</div>
                            <div className="mt-1 text-[10px] uppercase tracking-wide text-white/30">Fonte: {flag.fonte}</div>
                          </div>
                        ))
                      ) : (
                        <EmptyState message="Nenhuma red flag relevante registrada." />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="valuation" className="grid gap-4 md:grid-cols-2 text-sm">
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="space-y-3 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Multiplos principais</div>
                    <ul className="space-y-2 text-white/80">
                      {[
                        { label: "P/L", value: `${(analysis.kpis.pl ?? 0).toFixed(1)}x` },
                        { label: "EV/EBITDA", value: `${(analysis.kpis.evEbitda ?? 0).toFixed(1)}x` },
                        { label: "P/VP", value: `${(analysis.kpis.pvp ?? 0).toFixed(1)}x` },
                        { label: "Dividend Yield", value: `${((analysis.kpis.dividendYield ?? 0) * 100).toFixed(1)}%` },
                      ].map((item) => (
                        <li key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F162B] p-3">
                          <span>{item.label}</span>
                          <span className="font-semibold text-white">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="space-y-3 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/40">Sensibilidade DCF</div>
                    {analysis.valuation.dcf?.sensibilidades ? (
                      <ul className="space-y-2 text-white/80">
                        {Object.entries(analysis.valuation.dcf.sensibilidades).map(([label, value]) => (
                          <li key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F162B] p-3">
                            <span>{label}</span>
                            <span className={value >= 0 ? "text-emerald-400" : "text-rose-400"}>{(value * 100).toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyState message="Sem tabela de sensibilidade cadastrada." />
                    )}
                    <div className="text-[11px] uppercase tracking-wide text-white/30">
                      WACC base: {((analysis.valuation.dcf?.wacc ?? 0) * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compare" className="text-sm text-white/70">
                <Suspense fallback={<SkeletonBlock lines={5} />}>
                  <CompararTab analysis={analysis} peers={peerComparisons} onSelectTicker={handleSearch} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-white/10 bg-[#10192E]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Filter className="h-4 w-4" /> Filtrar oportunidades
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs uppercase tracking-wide text-white/40">
                  <span>Yield minimo</span>
                  <span>{yieldMin[0]}%</span>
                </div>
                <Slider value={yieldMin} onValueChange={setYieldMin} min={0} max={15} step={0.5} />
              </div>
              <div>
                <div className="flex justify-between text-xs uppercase tracking-wide text-white/40">
                  <span>P/L maximo</span>
                  <span>{plMax[0]}</span>
                </div>
                <Slider value={plMax} onValueChange={setPlMax} min={0} max={30} step={1} />
              </div>
              <div>
                <div className="flex justify-between text-xs uppercase tracking-wide text-white/40">
                  <span>Alavancagem maxima</span>
                  <span>{leverage[0]}x</span>
                </div>
                <Slider value={leverage} onValueChange={setLeverage} min={0} max={6} step={0.1} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {filteredWatchlist.map((item) => (
                <div key={item.t} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="grid h-9 w-9 place-content-center rounded-lg bg-[#13203B] text-[#3E8FFF] font-semibold">
                    {item.t.replace(/\d+/, "")}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="text-white/90">{item.n}</div>
                    <div className="text-white/40">
                      {item.t} | Yield {item.y}
                    </div>
                  </div>
                  <Button size="sm" className="bg-[#3E8FFF] hover:bg-[#2c75dc]" onClick={() => handleSearch(item.t)}>
                    Analisar
                  </Button>
                </div>
              ))}
              {!filteredWatchlist.length && <EmptyState message="Ajuste os filtros para encontrar novas oportunidades." />}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/10 bg-[#10192E]">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Eye className="h-4 w-4" /> Watchlist
            </div>
            <div className="space-y-2">
              {WATCHLIST.map((item) => (
                <div key={item.t} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="w-16">
                    <div className="text-xs text-white/50">{item.t}</div>
                    <div className="text-sm font-medium text-white">{formatCurrency(item.p)}</div>
                  </div>
                  <div className={`${item.ch >= 0 ? "text-emerald-400" : "text-rose-400"} text-sm`}>
                    {item.ch >= 0 ? <ArrowUpRight className="mr-1 inline h-4 w-4" /> : <ArrowDownRight className="mr-1 inline h-4 w-4" />}
                    {item.ch}%
                  </div>
                  <div className="ml-auto text-xs text-white/50">Yield {item.y}</div>
                  <Button size="sm" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" onClick={() => handleSearch(item.t)}>
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Layers className="h-4 w-4" /> Checklist profissional
          </div>
          <ProfessionalChecklist checklist={analysis.checklist ?? {}} />
        </div>

        <Card className="rounded-2xl border-white/10 bg-[#10192E]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Database className="h-4 w-4" /> Fontes e confianca
            </div>
            <p className="mt-3 text-sm text-white/70">
              As respostas priorizam documentos oficiais (CVM, B3, RI, BCB). Cada metrica exibe formula, campos e citacoes auditaveis.
            </p>
            <div className="text-[11px] uppercase tracking-wide text-white/30">
              Atualizado em {new Date(analysis.updatedAt).toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-white/40 text-xs">
        Prototipo visual | GAMBIT (c) {new Date().getFullYear()} - dados mockados
      </footer>
    </div>
  );
};

export default Screen;
function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShortDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("pt-BR");
}

function parsePercent(str) {
  if (typeof str === "number") return str;
  const n = Number.parseFloat(String(str).replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function filterByYield(items, minYield) {
  return items.filter((item) => parsePercent(item.y) >= minYield);
}

function isRenderableAnalysis(data) {
  return data && typeof data === "object" && data.ticker && data.empresa;
}


