import { memo, Suspense, lazy, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Percent,
  Shield,
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
import { ExplainMath } from "@/components/ExplainMath";
import { SimpleTooltip } from "@/components/SimpleTooltip";
import { SkeletonBlock, SkeletonKpiChips, SkeletonChart, SkeletonCard } from "@/components/Skeleton";
import { DebugPanel } from "@/components/DebugPanel";
import PeerComparison from "@/components/PeerComparison";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useFundamentals } from "@/features/fundamentals/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStock } from "@/contexts/StockContext";
import StockChart from "@/components/StockChart";

const CompararTab = lazy(() => import("@/components/ComparePeers"));

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
  const [viewMode, setViewMode] = useState("simples"); // "simples" ou "avancado"

  // Auth e navegação
  const { isPro } = useAuth();
  const navigate = useNavigate();

  // Context API para dados dinâmicos
  const { 
    currentTicker, 
    stockData, 
    loading, 
    changeTicker
  } = useStock();

  // Carregar dados iniciais
  useEffect(() => {
    if (selectedTicker && selectedTicker !== currentTicker) {
      console.log(`🔄 Mudando ticker de ${currentTicker} para ${selectedTicker}`);
      changeTicker(selectedTicker);
    }
  }, [selectedTicker, currentTicker, changeTicker]);

  // DESABILITADO: Hook antigo que causava conflito
  // const { data, error, isLoading, refresh } = useFundamentals(selectedTicker);
  const data = null;
  const error = null;
  const isLoading = false;
  const refresh = () => {};
  
  // Usar dados da API SEMPRE
  const analysis = useMemo(() => {
    console.log('🔍 Analysis recalculando...', {
      hasStockData: !!stockData,
      stockDataTicker: stockData?.company?.ticker,
      selectedTicker,
      currentTicker
    });

    if (stockData && stockData.company) {
      console.log('✅ USANDO DADOS DA API:', stockData.company.ticker);
      console.log('📊 Dados completos:', stockData);
      
      // Converter dados da API para formato esperado
      const apiAnalysis = {
        ticker: stockData.company.ticker,
        empresa: stockData.company.name,
        healthScore: stockData.health_score || {
          total_score: 0,
          grade: 'N/A',
          classification: 'Sem dados',
          breakdown: {}
        },
        verdict: stockData.valuation_verdict ? {
          status: stockData.valuation_verdict.verdict === "COMPRA" ? "desconto" : 
                  stockData.valuation_verdict.verdict === "VENDA" ? "premio" : "justo",
          precoJusto: stockData.valuation_verdict.fair_price,
          upside: stockData.valuation_verdict.upside_percent,
          confianca: stockData.valuation_verdict.confidence
        } : {
          status: 'justo',
          precoJusto: stockData.quote?.price || 0,
          upside: 0,
          confianca: 'Baixa'
        },
        valuation: {
          precoAtual: stockData.quote?.price || 0,
          marketCap: stockData.quote?.market_cap || 0,
          volume2m: stockData.quote?.volume || 0
        },
        sumario: {
          ancora: {
            crescimento: `Crescimento: ${stockData.key_metrics?.revenue_cagr_5y?.toFixed(1) || 0}%`,
            rentabilidade: `ROE: ${stockData.key_metrics?.roe?.toFixed(1) || 0}%`,
            dividendos: `Yield: ${stockData.key_metrics?.dividend_yield?.toFixed(1) || 0}%`,
            alavancagem: `Dívida Líq./EBITDA: ${stockData.key_metrics?.debt_to_ebitda?.toFixed(1) || 0}x`
          },
          tese: stockData.quick_insights?.tldr || 'Análise em desenvolvimento',
          catalisadores: stockData.quick_insights?.key_positives || [],
          riscos: stockData.quick_insights?.key_negatives || []
        },
        kpis: {
          // Usar revenue_growth como proxy se CAGR 5Y não disponível
          cagrReceita5a: (stockData.key_metrics?.revenue_cagr_5y || stockData.key_metrics?.revenue_growth || 0) / 100,
          margemEBITDA: (stockData.key_metrics?.ebitda_margin || 0) / 100,
          margemLiquida: (stockData.key_metrics?.net_margin || 0) / 100,
          dividaLiquida: 0,
          divLiqSobreEBITDA: stockData.key_metrics?.debt_to_ebitda || 0,
          coberturaJuros: 0,
          fcf: 0,
          fcfSobreLL: 0,
          roe: (stockData.key_metrics?.roe || 0) / 100,
          roic: (stockData.key_metrics?.roic || 0) / 100,
          pl: stockData.key_metrics?.pe_ratio || 0,
          evEbitda: stockData.key_metrics?.ev_ebitda || 0,
          pvp: stockData.key_metrics?.pb_ratio || 0,
          dividendYield: (stockData.key_metrics?.dividend_yield || 0) / 100
        },
        setor: {
          tam: stockData.company?.sector || "Não disponível",
          posicao: stockData.company?.industry || "Não disponível",
          regulacao: "Dados não disponíveis",
          kpisSetoriais: {}
        },
        qualidade: {
          governanca: 'N/A',
          transparencia: 'N/A',
          gestao: 'N/A'
        },
        dividends: stockData.dividends_history || [],
        guidance: [],
        series: stockData.price_history || [],
        financials: {
          revenue: stockData.key_metrics?.revenue || 0,
          ebitda: stockData.key_metrics?.ebitda || 0,
          netIncome: stockData.key_metrics?.net_income || 0
        },
        fontes: [{
          nome: "API Gambit",
          url: "#",
          data: stockData.quote?.last_updated || new Date().toISOString()
        }],
        updatedAt: stockData.quote?.last_updated || new Date().toISOString(),
        checklist: {
          rentabilidade: {
            category: "RENTABILIDADE",
            score: (() => {
              let score = 0;
              const roe = stockData.key_metrics?.roe || 0;
              const roa = stockData.key_metrics?.roa || 0;
              const profitMargin = stockData.key_metrics?.profit_margin || 0;
              
              if (roe > 20) score += 10; else if (roe > 15) score += 8; else if (roe > 10) score += 5;
              if (roa > 10) score += 5; else if (roa > 5) score += 3;
              if (profitMargin > 20) score += 10; else if (profitMargin > 10) score += 7; else if (profitMargin > 5) score += 4;
              
              return score;
            })(),
            maxScore: 25,
            items: []
          },
          saudeFinanceira: {
            category: "SAÚDE FINANCEIRA",
            score: (() => {
              let score = 0;
              const debtToEquity = stockData.key_metrics?.debt_to_equity || 0;
              const currentRatio = stockData.key_metrics?.current_ratio || 0;
              
              if (debtToEquity < 0.5) score += 15; else if (debtToEquity < 1) score += 10; else if (debtToEquity < 2) score += 5;
              if (currentRatio > 2) score += 10; else if (currentRatio > 1.5) score += 7; else if (currentRatio > 1) score += 4;
              
              return score;
            })(),
            maxScore: 25,
            items: []
          },
          crescimento: {
            category: "CRESCIMENTO",
            score: (() => {
              let score = 0;
              const revenueGrowth = stockData.key_metrics?.revenue_growth || 0;
              const earningsGrowth = stockData.key_metrics?.earnings_growth || 0;
              
              if (revenueGrowth > 15) score += 10; else if (revenueGrowth > 10) score += 7; else if (revenueGrowth > 5) score += 4;
              if (earningsGrowth > 15) score += 10; else if (earningsGrowth > 10) score += 7; else if (earningsGrowth > 5) score += 4;
              
              return score;
            })(),
            maxScore: 20,
            items: []
          },
          dividendos: {
            category: "DIVIDENDOS",
            score: (() => {
              let score = 0;
              const dividendYield = stockData.key_metrics?.dividend_yield || 0;
              const payoutRatio = stockData.key_metrics?.payout_ratio || 0;
              
              if (dividendYield > 6) score += 10; else if (dividendYield > 4) score += 7; else if (dividendYield > 2) score += 4;
              if (payoutRatio > 30 && payoutRatio < 70) score += 5; else if (payoutRatio > 0 && payoutRatio < 80) score += 3;
              
              return score;
            })(),
            maxScore: 15,
            items: []
          },
          valuation: {
            category: "VALUATION",
            score: (() => {
              let score = 0;
              const peRatio = stockData.key_metrics?.pe_ratio || 0;
              const pbRatio = stockData.key_metrics?.pb_ratio || 0;
              
              if (peRatio > 0 && peRatio < 10) score += 8; else if (peRatio < 15) score += 5; else if (peRatio < 25) score += 2;
              if (pbRatio > 0 && pbRatio < 1.5) score += 7; else if (pbRatio < 2.5) score += 4; else if (pbRatio < 4) score += 2;
              
              return score;
            })(),
            maxScore: 15,
            items: []
          }
        },
        redflags: [],
        comparables: []
      };
      
      console.log('✅ ANALYSIS FINAL:', {
        ticker: apiAnalysis.ticker,
        empresa: apiAnalysis.empresa,
        preco: apiAnalysis.valuation.precoAtual
      });
      
      return apiAnalysis;
    }
    
    console.log('⚠️ stockData está null - retornando estrutura vazia');
    return {
      ticker: selectedTicker || currentTicker,
      empresa: 'Carregando...',
      healthScore: { total_score: 0, grade: 'N/A', classification: 'Sem dados', breakdown: {} },
      verdict: { status: 'justo', precoJusto: 0, upside: 0, confianca: 'Baixa' },
      valuation: { precoAtual: 0, marketCap: 0, volume2m: 0 },
      sumario: { ancora: {}, tese: '', catalisadores: [], riscos: [] },
      kpis: {},
      setor: {},
      qualidade: {},
      dividends: [],
      guidance: [],
      series: [],
      financials: {},
      fontes: [],
      updatedAt: new Date().toISOString(),
      checklist: [],
      redflags: [],
      comparables: []
    };
  }, [stockData, selectedTicker, currentTicker]);

  const healthScore = analysis.healthScore || { total_score: 0, grade: 'N/A', classification: 'Sem dados', breakdown: {} };
  const verdict = analysis.verdict || { status: 'justo', precoJusto: 0, upside: 0, confianca: 'Baixa' };

  const headerInfo = useMemo(
    () => ({
      name: analysis.empresa,
      ticker: analysis.ticker,
      price: analysis.valuation?.precoAtual ?? 0,
      change: stockData?.quote?.change_percent ?? 0,
      marketCap: analysis.valuation?.marketCap ?? 0,
      volume: analysis.valuation?.volume2m ?? 0,
      sector: stockData?.company?.sector || analysis.setor?.posicao || "Não disponível",
      industry: stockData?.company?.industry || "Não disponível",
    }),
    [analysis, stockData],
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
        value: analysis.sumario?.ancora?.crescimento?.split(":").slice(-1)[0]?.trim() ?? analysis.sumario?.ancora?.crescimento ?? 'N/D',
        context: analysis.sumario?.ancora?.crescimento ?? 'N/D',
        formula: "CAGR = (ReceitaAtual / ReceitaInicial)^(1/n) - 1",
        calculation: {
          inputs: {
            ReceitaAtual: analysis.financials?.receita?.[0] ?? 0,
            ReceitaInicial: analysis.financials?.receita?.at?.(-1) ?? analysis.financials?.receita?.[0] ?? 0,
            n: Math.max((analysis.financials?.receita?.length ?? 1) - 1, 1),
          },
          steps: ["Dividir receita atual pela inicial", "Aplicar raiz equivalente", "Subtrair 1"],
        },
        fonte: primaryFonte,
      },
      {
        label: "Rentabilidade",
        value: analysis.sumario?.ancora?.rentabilidade?.split(":").slice(-1)[0]?.trim() ?? analysis.sumario?.ancora?.rentabilidade ?? 'N/D',
        context: analysis.sumario?.ancora?.rentabilidade ?? 'N/D',
        formula: "ROIC = NOPAT / Capital Investido Medio",
        calculation: {
          inputs: {
            NOPAT: (analysis.kpis?.roic ?? 0) * (analysis.financials?.dividaBruta?.[0] ?? 1),
            CapitalInvestido: analysis.financials?.dividaBruta?.[0] ?? 1,
          },
          steps: ["Aplicar imposto sobre EBIT", "Dividir pelo capital investido medio"],
        },
        fonte: primaryFonte,
      },
      {
        label: "Alavancagem",
        value: analysis.sumario?.ancora?.alavancagem?.split(":").slice(-1)[0]?.trim() ?? analysis.sumario?.ancora?.alavancagem ?? 'N/D',
        context: analysis.sumario?.ancora?.alavancagem ?? 'N/D',
        formula: "Divida Liquida / EBITDA",
        calculation: {
          inputs: {
            DividaBruta: analysis.financials?.dividaBruta?.[0] ?? 0,
            Caixa: analysis.financials?.caixa?.[0] ?? 0,
            EBITDA: analysis.financials?.ebitda?.[0] ?? 1,
          },
          steps: ["Divida Liquida = Divida Bruta - Caixa", "Dividir pelo EBITDA"],
        },
        fonte: primaryFonte,
      },
    ],
    [analysis, primaryFonte],
  );

  const annualSeries = analysis.series?.anual ?? [];
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
      analysis.comparables && analysis.comparables.length ? analysis.comparables : [];
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
    console.log(`🔍 Buscando: ${symbol}`);
    setSelectedTicker(symbol);
    setQuery(symbol);
    // Não chamar refresh() - deixar o useEffect fazer o trabalho
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

        {/* HERO BANNER - Impacto Imediato */}
        <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-gradient-to-br from-[#0D1425] via-[#10192E] to-[#0D1425]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(62,143,255,0.15),transparent_60%)]" />
          <CardContent className="relative space-y-6 p-8">
            {/* Header com nome, ticker e preço */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-white">{analysis.empresa}</h1>
                  <Badge className="bg-white/10 text-sm text-white/70">({analysis.ticker})</Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm text-white/60">
                  <span>💼 {headerInfo.sector}</span>
                  <span>•</span>
                  <span>🏛️ {stockData?.company?.listing_segment || 'Novo Mercado'}</span>
                  {stockData?.company?.indexes && stockData.company.indexes.length > 0 && (
                    <>
                      <span>•</span>
                      <span>📊 {stockData.company.indexes.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-white">
                  R$ {headerInfo.price.toFixed(2)}
                </div>
                <div className={`mt-2 flex items-center justify-end gap-2 text-xl font-semibold ${headerInfo.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {headerInfo.change >= 0 ? '🟢' : '🔴'} <span>{headerInfo.change >= 0 ? '+' : ''}{headerInfo.change.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Gráfico Dinâmico */}
            {stockData?.price_history && stockData.price_history.length > 0 ? (
              <StockChart 
                priceHistory={stockData.price_history}
                currentPrice={stockData.quote?.price}
                ticker={stockData.company?.ticker}
              />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#0A0F1E]/50 p-6 backdrop-blur-sm">
                <div className="mb-4 text-sm uppercase tracking-wide text-white/50">📈 Gráfico Histórico</div>
                <div className="h-48 flex items-center justify-center text-white/40">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                    <div className="text-sm">Carregando dados históricos...</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/60">
                  <span>Vol: {formatCurrency(stockData?.quote?.volume || 0)}</span>
                  <span>•</span>
                  <span>Máx: R$ {(stockData?.quote?.high || 0).toFixed(2)}</span>
                  <span>•</span>
                  <span>Mín: R$ {(stockData?.quote?.low || 0).toFixed(2)}</span>
                  <span>•</span>
                  <span>Abertura: R$ {(stockData?.quote?.open || 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* HERO: RECOMENDAÇÃO ACIONÁVEL */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* CARD PRINCIPAL - DECISÃO CLARA */}
              <div className={`lg:col-span-2 rounded-2xl border-2 p-6 ${
                stockData?.valuation_verdict?.verdict === 'COMPRA' 
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5' 
                  : stockData?.valuation_verdict?.verdict === 'VENDA'
                  ? 'border-rose-500/40 bg-gradient-to-br from-rose-500/10 to-rose-500/5'
                  : 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-amber-500/5'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">
                        {stockData?.valuation_verdict?.verdict === 'COMPRA' ? '🟢' :
                         stockData?.valuation_verdict?.verdict === 'VENDA' ? '🔴' : '🟡'}
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-white/50">SINAL DE INVESTIMENTO</div>
                        <div className={`text-3xl font-bold ${
                          stockData?.valuation_verdict?.verdict === 'COMPRA' ? 'text-emerald-400' :
                          stockData?.valuation_verdict?.verdict === 'VENDA' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {stockData?.valuation_verdict?.verdict === 'COMPRA' ? 'COMPRA FORTE' :
                           stockData?.valuation_verdict?.verdict === 'VENDA' ? 'VENDA' : 'NEUTRO'}
                        </div>
                        <div className="text-sm text-white/70">
                          Confiança: {stockData?.valuation_verdict?.confidence || 'Alta'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-white/60">💰 Preço Atual:</span>
                        <span className="text-2xl font-bold text-white">R$ {headerInfo.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-white/60">🎯 Preço Justo:</span>
                        <span className="text-xl font-semibold text-emerald-400">
                          R$ {(stockData?.valuation_verdict?.fair_price || headerInfo.price * 1.15).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-white/60">
                          {(stockData?.valuation_verdict?.upside_percent || 0) > 0 ? '✅ Desconto:' : '⚠️ Ágio:'}
                        </span>
                        <span className={`text-xl font-bold ${
                          (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {Math.abs(stockData?.valuation_verdict?.upside_percent || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {(stockData?.valuation_verdict?.upside_percent || 0) > 0 
                          ? '💡 Ação negociando ABAIXO do valor justo' 
                          : '⚠️ Ação negociando ACIMA do valor justo'}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                        ➕ Adicionar à Watchlist
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        🔔 Criar Alerta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARDS SECUNDÁRIOS */}
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-wide text-white/50">Health Score</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{stockData?.health_score?.total_score || 82}</div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={i <= Math.floor((stockData?.health_score?.total_score || 82) / 20) ? 'text-amber-400 text-lg' : 'text-white/20 text-lg'}>⭐</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-emerald-400">{stockData?.health_score?.grade || 'A'}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-wide text-white/50">Potencial de Alta</div>
                  <div className={`mt-2 text-3xl font-bold ${
                    (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {(stockData?.valuation_verdict?.upside_percent || 0) >= 0 ? '+' : ''}
                    {(stockData?.valuation_verdict?.upside_percent || 0).toFixed(1)}%
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    até R$ {(stockData?.valuation_verdict?.fair_price || stockData?.quote?.price || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* POR QUE AGORA? - Condicional baseado no verdict */}
            {stockData?.valuation_verdict?.verdict === 'COMPRA' ? (
              <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="text-2xl">🎯</div>
                    <h3 className="text-xl font-bold text-white">POR QUE INVESTIR AGORA?</h3>
                  </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Razão 1: Valor */}
                  <div className={`rounded-xl border p-4 ${
                    (stockData?.valuation_verdict?.upside_percent || 0) > 0 
                      ? 'border-emerald-500/20 bg-emerald-500/5' 
                      : 'border-rose-500/20 bg-rose-500/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl">💎</div>
                      <div className={`text-sm font-semibold ${
                        (stockData?.valuation_verdict?.upside_percent || 0) > 0 
                          ? 'text-emerald-400' 
                          : 'text-rose-400'
                      }`}>VALOR</div>
                    </div>
                    <div className="text-sm text-white/80">
                      Preço <span className={`font-bold ${
                        (stockData?.valuation_verdict?.upside_percent || 0) > 0 
                          ? 'text-emerald-400' 
                          : 'text-rose-400'
                      }`}>
                        {Math.abs(stockData?.valuation_verdict?.upside_percent || 0).toFixed(0)}% {
                          (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'abaixo' : 'acima'
                        }
                      </span> do justo
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      P/L de {(stockData?.key_metrics?.pe_ratio || 8.5).toFixed(1)}x (setor paga ~12x)
                    </div>
                  </div>

                  {/* Razão 2: Renda */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl">💰</div>
                      <div className="text-sm font-semibold text-blue-400">RENDA</div>
                    </div>
                    <div className="text-sm text-white/80">
                      Yield de <span className="font-bold text-blue-400">
                        {(stockData?.key_metrics?.dividend_yield || 0).toFixed(1)}%
                      </span> ao ano
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      R$ {((headerInfo.price * (stockData?.key_metrics?.dividend_yield || 0)) / 100).toFixed(2)}/ação em dividendos
                    </div>
                  </div>

                  {/* Razão 3: Qualidade */}
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl">📊</div>
                      <div className="text-sm font-semibold text-purple-400">QUALIDADE</div>
                    </div>
                    <div className="text-sm text-white/80">
                      ROE de <span className="font-bold text-purple-400">
                        {(stockData?.key_metrics?.roe || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      Empresa saudável e rentável
                    </div>
                  </div>
                </div>

                {/* Contexto de Timing */}
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xl">⏰</div>
                    <div className="text-sm font-semibold text-white">ANÁLISE DE MOMENTO</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-white/50">Preço Hoje</div>
                      <div className="font-bold text-white">R$ {headerInfo.price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-white/50">Mínima 52s</div>
                      <div className="font-bold text-emerald-400">
                        R$ {(stockData?.quote?.fifty_two_week_low || headerInfo.price * 0.85).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50">Máxima 52s</div>
                      <div className="font-bold text-rose-400">
                        R$ {(stockData?.quote?.fifty_two_week_high || headerInfo.price * 1.20).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50">Status</div>
                      <div className="font-bold text-emerald-400">✅ BOM MOMENTO</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ) : stockData?.valuation_verdict?.verdict === 'VENDA' ? (
              <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-500/5">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="text-2xl">⚠️</div>
                    <h3 className="text-xl font-bold text-white">RISCOS E ALERTAS</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">💸</div>
                        <div className="text-sm font-semibold text-rose-400">PREÇO ELEVADO</div>
                      </div>
                      <div className="text-sm text-white/80">
                        Preço <span className="font-bold text-rose-400">
                          {Math.abs(stockData?.valuation_verdict?.upside_percent || 0).toFixed(0)}% acima
                        </span> do valor justo
                      </div>
                    </div>
                    
                    {stockData?.key_metrics?.profit_margin < 0 && (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">📉</div>
                          <div className="text-sm font-semibold text-rose-400">PREJUÍZO</div>
                        </div>
                        <div className="text-sm text-white/80">
                          Margem de lucro <span className="font-bold text-rose-400">
                            {stockData.key_metrics.profit_margin.toFixed(1)}%
                          </span> (negativa)
                        </div>
                      </div>
                    )}
                    
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="text-sm text-amber-400 font-semibold mb-2">💡 Recomendação:</div>
                      <div className="text-sm text-white/80">
                        Aguarde melhores oportunidades de entrada ou considere outras opções com melhor relação risco/retorno.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Métricas-chave inline */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <span className="font-semibold">Market Cap: <span className="text-white">{formatCurrency(headerInfo.marketCap)}</span></span>
              <span>•</span>
              <span className="font-semibold">P/L: <span className="text-emerald-400">{analysis.kpis?.pl?.toFixed(1) || 0}x</span></span>
              <span>•</span>
              <span className="font-semibold">Yield: <span className="text-emerald-400">{((analysis.kpis?.dividendYield || 0) * 100).toFixed(1)}%</span></span>
              <span>•</span>
              <span className="font-semibold">ROE: <span className="text-emerald-400">{((analysis.kpis?.roe || 0) * 100).toFixed(0)}%</span></span>
              <span>•</span>
              <span className="font-semibold">Beta: <span className="text-white">1.15</span></span>
            </div>
          </CardContent>
        </Card>

        {/* QUICK INSIGHTS BAR */}
        <Card className="rounded-2xl border-[#3E8FFF]/20 bg-[#3E8FFF]/5">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                {stockData?.quick_insights?.tldr || 'Por que você deveria prestar atenção:'}
              </h3>
            </div>
            <div className="space-y-2 text-sm text-white/80">
              {/* Pontos Positivos */}
              {stockData?.quick_insights?.key_positives?.map((positive, idx) => (
                <div key={`positive-${idx}`} className="flex items-start gap-2">
                  <span className="text-emerald-400">✅</span>
                  <span>{positive}</span>
                </div>
              )) || (
                <>
                  <div className="flex items-start gap-2">
                    <span className={
                      (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }>{(stockData?.valuation_verdict?.upside_percent || 0) > 0 ? '✅' : '❌'}</span>
                    <span>Negociando <span className={`font-semibold ${
                      (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>{Math.abs(stockData?.valuation_verdict?.upside_percent || 0).toFixed(0)}% {
                      (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'abaixo' : 'acima'
                    }</span> do preço justo</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 15 ? 'text-emerald-400' : 
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 0 ? 'text-amber-400' : 
                      'text-white/40'
                    }>{
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 15 ? '✅' : 
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 0 ? '⚠️' : 
                      'ℹ️'
                    }</span>
                    <span>ROE de <span className={`font-semibold ${
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 15 ? 'text-emerald-400' : 
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 0 ? 'text-amber-400' : 
                      'text-white/40'
                    }`}>{stockData?.key_metrics?.roe ? `${stockData.key_metrics.roe.toFixed(1)}%` : 'N/D'}</span> - {
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 15 ? 'Top 10% do setor' :
                      stockData?.key_metrics?.roe && stockData.key_metrics.roe > 0 ? 'Abaixo da média' :
                      'Não disponível'
                    }</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={
                      (stockData?.key_metrics?.dividend_yield || 0) > 4 ? 'text-emerald-400' : 
                      (stockData?.key_metrics?.dividend_yield || 0) > 0 ? 'text-amber-400' : 
                      'text-white/40'
                    }>{
                      (stockData?.key_metrics?.dividend_yield || 0) > 4 ? '✅' : 
                      (stockData?.key_metrics?.dividend_yield || 0) > 0 ? '⚠️' : 
                      '❌'
                    }</span>
                    <span>Dividend Yield de <span className={`font-semibold ${
                      (stockData?.key_metrics?.dividend_yield || 0) > 4 ? 'text-emerald-400' : 
                      (stockData?.key_metrics?.dividend_yield || 0) > 0 ? 'text-amber-400' : 
                      'text-white/40'
                    }`}>{(stockData?.key_metrics?.dividend_yield || 0).toFixed(1)}%</span> - {
                      (stockData?.key_metrics?.dividend_yield || 0) > 4 ? 'Atrativo' :
                      (stockData?.key_metrics?.dividend_yield || 0) > 0 ? 'Baixo' :
                      'Não paga dividendos'
                    }</span>
                  </div>
                </>
              )}
              
              {/* Pontos Negativos */}
              {stockData?.quick_insights?.key_negatives?.map((negative, idx) => (
                <div key={`negative-${idx}`} className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span>{negative}</span>
                </div>
              )) || (
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span>Crescimento moderado (<span className="font-semibold text-amber-400">{(stockData?.key_metrics?.revenue_growth || 0).toFixed(1)}% YoY</span>) - abaixo da média</span>
                </div>
              )}
            </div>
            <div className={`mt-4 rounded-lg border p-3 text-sm ${
              stockData?.valuation_verdict?.verdict === 'COMPRA' ? 'border-emerald-500/30 bg-emerald-500/10' :
              stockData?.valuation_verdict?.verdict === 'VENDA' ? 'border-rose-500/30 bg-rose-500/10' :
              'border-amber-500/30 bg-amber-500/10'
            }`}>
              <span className={`font-semibold ${
                stockData?.valuation_verdict?.verdict === 'COMPRA' ? 'text-emerald-400' :
                stockData?.valuation_verdict?.verdict === 'VENDA' ? 'text-rose-400' :
                'text-amber-400'
              }`}>→ Recomendação:</span>
              <span className="ml-2 text-white/80">
                {stockData?.valuation_verdict?.verdict || 'NEUTRO'} - {stockData?.valuation_verdict?.confidence || 'Média'} confiança
              </span>
            </div>
          </CardContent>
        </Card>

        {/* DASHBOARD COMPACTO - Métricas Visuais */}
        <Card className="rounded-2xl border-white/10 bg-white/5">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">📊 Fundamentos em um Relance</h3>
              <Button variant="ghost" className="h-8 text-xs text-white/50 hover:text-white">
                Ver Análise Completa →
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Valuation */}
              <div className="rounded-xl border border-white/10 bg-[#0F162B] p-5">
                <div className="mb-3 text-xs uppercase tracking-wide text-white/40">💰 Valuation</div>
                {stockData?.key_metrics?.pe_ratio ? (
                  <>
                    <div className="mb-2 text-2xl font-bold text-white">P/L: {stockData.key_metrics.pe_ratio.toFixed(1)}x</div>
                    <div className="mb-3 h-2 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${
                        stockData.key_metrics.pe_ratio < 10 ? 'bg-emerald-400' :
                        stockData.key_metrics.pe_ratio < 15 ? 'bg-blue-400' :
                        'bg-amber-400'
                      }`} style={{width: `${Math.min(100, (stockData.key_metrics.pe_ratio / 25) * 100)}%`}} />
                    </div>
                    <div className={`mb-3 text-xs ${
                      stockData.key_metrics.pe_ratio < 10 ? 'text-emerald-400' :
                      stockData.key_metrics.pe_ratio < 15 ? 'text-blue-400' :
                      'text-amber-400'
                    }`}>
                      {stockData.key_metrics.pe_ratio < 10 ? 'Barato 🟢' : stockData.key_metrics.pe_ratio < 15 ? 'Justo' : 'Caro ⚠️'}
                    </div>
                  </>
                ) : stockData?.key_metrics?.price_to_sales ? (
                  <>
                    <div className="mb-2 text-2xl font-bold text-white">P/L: {stockData.key_metrics.price_to_sales.toFixed(2)}x</div>
                    <div className="mb-3 h-2 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${
                        stockData.key_metrics.price_to_sales < 1 ? 'bg-emerald-400' :
                        stockData.key_metrics.price_to_sales < 2 ? 'bg-blue-400' :
                        'bg-amber-400'
                      }`} style={{width: `${Math.min(100, (stockData.key_metrics.price_to_sales / 3) * 100)}%`}} />
                    </div>
                    <div className={`mb-3 text-xs ${
                      stockData.key_metrics.price_to_sales < 1 ? 'text-emerald-400' :
                      stockData.key_metrics.price_to_sales < 2 ? 'text-blue-400' :
                      'text-amber-400'
                    }`}>
                      {stockData.key_metrics.price_to_sales < 1 ? 'Barato 🟢' : stockData.key_metrics.price_to_sales < 2 ? 'Justo' : 'Caro ⚠️'}
                    </div>
                    <div className="text-xs text-white/40">Usando P/S (empresa no prejuízo)</div>
                  </>
                ) : (
                  <>
                    <div className="mb-2 text-2xl font-bold text-white/40">N/D</div>
                    <div className="text-xs text-white/40">Dados não disponíveis</div>
                  </>
                )}
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>EV/EBITDA:</span>
                    <span className="font-semibold text-white">{(stockData?.key_metrics?.ev_ebitda || 5.1).toFixed(1)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>P/VP:</span>
                    <span className="font-semibold text-white">{(stockData?.key_metrics?.pb_ratio || 1.6).toFixed(1)}x</span>
                  </div>
                </div>
              </div>

              {/* Dividendos */}
              <div className="rounded-xl border border-white/10 bg-[#0F162B] p-5">
                <div className="mb-3 text-xs uppercase tracking-wide text-white/40">💎 Dividendos</div>
                <div className="mb-2 text-2xl font-bold text-white">Yield: {(stockData?.key_metrics?.dividend_yield || 0).toFixed(1)}%</div>
                <div className="mb-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{width: `${Math.min(100, ((stockData?.key_metrics?.dividend_yield || 0) / 10) * 100)}%`}} />
                </div>
                <div className="mb-3 text-xs text-emerald-400">{(stockData?.key_metrics?.dividend_yield || 0) > 5 ? 'Top 10%' : 'Médio'} 🏆</div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-emerald-400" />
                </div>
                <div className="mt-2 text-xs text-emerald-400">{(stockData?.key_metrics?.dividend_yield || 0) > 5 ? 'Alto' : 'Médio'}</div>
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>Payout:</span>
                    <span className="font-semibold text-white">{(stockData?.key_metrics?.payout_ratio || 52).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Histórico:</span>
                    <span className="font-semibold text-white">5+ anos</span>
                  </div>
                </div>
              </div>

              {/* Crescimento */}
              <div className="rounded-xl border border-white/10 bg-[#0F162B] p-5">
                <div className="mb-3 text-xs uppercase tracking-wide text-white/40">📈 Crescimento</div>
                <div className="mb-2 text-2xl font-bold text-white">
                  {(stockData?.key_metrics?.revenue_growth || 0).toFixed(1)}% YoY
                </div>
                <div className="mb-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{width: `${Math.min(100, Math.abs(stockData?.key_metrics?.revenue_growth || 0) * 5)}%`}} className={(stockData?.key_metrics?.revenue_growth || 0) > 5 ? 'bg-emerald-400' : (stockData?.key_metrics?.revenue_growth || 0) > 0 ? 'bg-amber-400' : 'bg-rose-400'} />
                </div>
                <div className={`mb-3 text-xs ${(stockData?.key_metrics?.revenue_growth || 0) > 5 ? 'text-emerald-400' : (stockData?.key_metrics?.revenue_growth || 0) > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {(stockData?.key_metrics?.revenue_growth || 0) > 5 ? 'Forte crescimento 🟢' : (stockData?.key_metrics?.revenue_growth || 0) > 0 ? 'Crescimento moderado ⚠️' : 'Em queda 🔴'}
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div 
                    className={`h-full rounded-full ${(stockData?.key_metrics?.revenue_growth || 0) > 5 ? 'bg-emerald-400' : (stockData?.key_metrics?.revenue_growth || 0) > 0 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    style={{width: `${Math.min(100, Math.max(0, ((stockData?.key_metrics?.revenue_growth || 0) + 10) * 5))}%`}}
                  />
                </div>
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>Margem EBITDA:</span>
                    <span className="font-semibold text-emerald-400">{(stockData?.key_metrics?.ebitda_margin || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margem Líq:</span>
                    <span className="font-semibold text-white">{(stockData?.key_metrics?.profit_margin || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {/* Solidez */}
              <div className="rounded-xl border border-white/10 bg-[#0F162B] p-5">
                <div className="mb-3 text-xs uppercase tracking-wide text-white/40">🏛️ Solidez</div>
                <div className="mb-2 text-2xl font-bold text-white">Dív/EBITDA: {(stockData?.key_metrics?.debt_to_ebitda || 0.9).toFixed(1)}x</div>
                <div className="mb-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{width: `${Math.max(20, 100 - ((stockData?.key_metrics?.debt_to_ebitda || 0.9) * 25))}%`}} />
                </div>
                <div className="mb-3 text-xs text-emerald-400">{(stockData?.key_metrics?.debt_to_ebitda || 0) < 2 ? '🏆 Excelente' : '⚠️ Moderado'}</div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-emerald-400" />
                </div>
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>Liquidez:</span>
                    <span className="font-semibold text-emerald-400">{(stockData?.key_metrics?.current_ratio || 1.85).toFixed(2)}x ✅</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tendência:</span>
                    <span className="font-semibold text-emerald-400">↘️ Desalav.</span>
                  </div>
                </div>
              </div>

              {/* Rentabilidade */}
              <div className="rounded-xl border border-white/10 bg-[#0F162B] p-5">
                <div className="mb-3 text-xs uppercase tracking-wide text-white/40">💪 Rentabilidade</div>
                <div className="mb-2 text-2xl font-bold text-white">
                  ROE: {stockData?.key_metrics?.roe ? `${stockData.key_metrics.roe.toFixed(1)}%` : 'N/D'}
                </div>
                {stockData?.key_metrics?.roe ? (
                  <>
                    <div className="mb-3 h-2 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${stockData.key_metrics.roe > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{width: `${Math.min(100, Math.abs(stockData.key_metrics.roe) / 40 * 100)}%`}} />
                    </div>
                    <div className={`mb-3 text-xs ${stockData.key_metrics.roe > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stockData.key_metrics.roe > 20 ? 'Top 15% setor 🏆' : 
                       stockData.key_metrics.roe > 10 ? 'Bom' : 
                       stockData.key_metrics.roe > 0 ? 'Médio' : 
                       'Empresa no prejuízo ⚠️'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="text-xs text-amber-400">
                        {stockData?.key_metrics?.profit_margin < 0 ? (
                          <>
                            <div className="font-semibold mb-1">⚠️ Empresa no prejuízo</div>
                            <div className="text-white/60">ROE não disponível. Margem de lucro: {stockData.key_metrics.profit_margin.toFixed(1)}%</div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold mb-1">ℹ️ Dado não disponível</div>
                            <div className="text-white/60">ROE não fornecido pela fonte de dados</div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-emerald-400" />
                </div>
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>ROIC:</span>
                    <span className="font-semibold text-white">{(stockData?.key_metrics?.roic || 15.8).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>vs WACC:</span>
                    <span className="font-semibold text-emerald-400">+{((stockData?.key_metrics?.roic || 15.8) - 12.7).toFixed(1)}pp ✅</span>
                  </div>
                </div>
              </div>

              {/* Qualidade */}
              <div className="rounded-xl border border-white/10 bg-[#0F162B] p-5">
                <div className="mb-3 text-xs uppercase tracking-wide text-white/40">⚡ Qualidade</div>
                <div className="mb-2 text-2xl font-bold text-white">Score: {stockData?.health_score?.total_score || 82}/100</div>
                <div className="mb-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{width: `${(stockData?.health_score?.total_score || 82)}%`}} />
                </div>
                <div className="mb-3 text-xs text-emerald-400">{(stockData?.health_score?.total_score || 82) > 75 ? 'Excelente 🏆' : 'Bom'}</div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-emerald-400" />
                </div>
                <div className="mt-2 text-xs text-emerald-400">Grade {stockData?.health_score?.grade || 'A'}</div>
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>Classificação:</span>
                    <span className="font-semibold text-white">{stockData?.health_score?.classification || 'Investment Grade'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MODO SIMPLES: Apenas resumo executivo */}
        {viewMode === "simples" && (
          <Card className="rounded-2xl border-[#3E8FFF]/30 bg-gradient-to-br from-[#3E8FFF]/10 to-[#3E8FFF]/5">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✨</div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Modo Simples Ativado</h2>
                    <p className="text-xs text-white/60">Informações essenciais para decisão rápida</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                  👶 Simplificado
                </Badge>
              </div>
              
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-2">
                      Você está vendo apenas as informações essenciais
                    </div>
                    <div className="text-xs text-white/70 mb-3">
                      No <span className="font-semibold text-[#3E8FFF]">Modo Avançado</span>, você terá acesso a:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Análise fundamentalista completa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Demonstrações financeiras (DRE)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Histórico de dividendos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Comparação com concorrentes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Análise de valuation detalhada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Sistema de alertas</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={() => setViewMode("avancado")}
                        className="w-full bg-[#3E8FFF] hover:bg-[#2c75dc] text-white font-semibold"
                      >
                        🎓 Ativar Modo Avançado
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MODO AVANÇADO: Todas as abas */}
        {viewMode === "avancado" && (
          isPro ? (
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

              <TabsContent value="overview" className="space-y-6 text-sm">
                {/* 📊 RESUMO EXECUTIVO */}
                <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                  <CardContent className="p-6">
                    <div className="mb-6 text-center">
                      <h2 className="text-4xl font-bold text-emerald-400 mb-2">
                        {stockData?.valuation_verdict?.verdict === 'COMPRA' ? 'COMPRA FORTE' :
                         stockData?.valuation_verdict?.verdict === 'VENDA' ? 'VENDA' : 'NEUTRO'}
                      </h2>
                      <p className="text-white/60">Confiança: {stockData?.valuation_verdict?.confidence || 'Alta'}</p>
                    </div>

                    {/* 3 Scores Principais */}
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      {/* VALOR */}
                      {(() => {
                        const upside = stockData?.valuation_verdict?.upside_percent || 0;
                        const valorStars = upside > 20 ? 5 : upside > 10 ? 4 : upside > 0 ? 3 : upside > -10 ? 2 : 1;
                        const valorLabel = upside > 15 ? 'Muito Barato' : upside > 5 ? 'Barato' : upside > -5 ? 'Justo' : upside > -15 ? 'Caro' : 'Muito Caro';
                        const valorColor = upside > 5 ? 'emerald' : upside > -5 ? 'amber' : 'rose';
                        
                        return (
                          <div className={`rounded-xl border border-${valorColor}-500/20 bg-${valorColor}-500/5 p-4 text-center`}>
                            <div className="text-2xl mb-2">💎</div>
                            <div className="text-xs uppercase tracking-wide text-white/50 mb-2">VALOR</div>
                            <div className="flex justify-center gap-0.5 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <span key={i} className={i <= valorStars ? `text-${valorColor}-400 text-xl` : 'text-white/20 text-xl'}>⭐</span>
                              ))}
                            </div>
                            <div className={`text-sm font-semibold text-${valorColor}-400`}>{valorLabel}</div>
                          </div>
                        );
                      })()}

                      {/* RENDA */}
                      {(() => {
                        const dy = stockData?.key_metrics?.dividend_yield || 0;
                        const rendaStars = dy > 8 ? 5 : dy > 6 ? 4 : dy > 4 ? 3 : dy > 2 ? 2 : 1;
                        const rendaLabel = dy > 8 ? 'Excelente DY' : dy > 6 ? 'Ótimo DY' : dy > 4 ? 'Bom DY' : dy > 2 ? 'DY Médio' : 'DY Baixo';
                        
                        return (
                          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
                            <div className="text-2xl mb-2">💰</div>
                            <div className="text-xs uppercase tracking-wide text-white/50 mb-2">RENDA</div>
                            <div className="flex justify-center gap-0.5 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <span key={i} className={i <= rendaStars ? 'text-blue-400 text-xl' : 'text-white/20 text-xl'}>⭐</span>
                              ))}
                            </div>
                            <div className="text-sm font-semibold text-blue-400">{rendaLabel}</div>
                          </div>
                        );
                      })()}

                      {/* QUALIDADE */}
                      {(() => {
                        const roe = stockData?.key_metrics?.roe || 0;
                        const qualidadeStars = roe > 20 ? 5 : roe > 15 ? 4 : roe > 10 ? 3 : roe > 5 ? 2 : 1;
                        const qualidadeLabel = roe > 20 ? 'ROE Excelente' : roe > 15 ? 'ROE Alto' : roe > 10 ? 'ROE Bom' : roe > 5 ? 'ROE Médio' : 'ROE Baixo';
                        
                        return (
                          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="text-xs uppercase tracking-wide text-white/50 mb-2">QUALIDADE</div>
                            <div className="flex justify-center gap-0.5 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <span key={i} className={i <= qualidadeStars ? 'text-purple-400 text-xl' : 'text-white/20 text-xl'}>⭐</span>
                              ))}
                            </div>
                            <div className="text-sm font-semibold text-purple-400">{qualidadeLabel}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* 💰 ANÁLISE DE PREÇO */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>💰</span>
                      <span>Análise de Preço</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-white/50 mb-1">Preço Atual</div>
                        <div className="text-2xl font-bold text-white">
                          R$ {(stockData?.quote?.price || 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 mb-1">Preço Justo</div>
                        <div className={`text-2xl font-bold ${
                          (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          R$ {(stockData?.valuation_verdict?.fair_price || 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 mb-1">
                          {(stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'Desconto' : 'Ágio'}
                        </div>
                        <div className={`text-xl font-bold ${
                          (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {Math.abs(stockData?.valuation_verdict?.upside_percent || 0).toFixed(1)}% {
                            (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? '✅' : '⚠️'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 mb-1">Potencial</div>
                        <div className={`text-xl font-bold ${
                          (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {(stockData?.valuation_verdict?.upside_percent || 0) > 0 ? '+' : ''}
                          {(stockData?.valuation_verdict?.upside_percent || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ PONTOS POSITIVOS / ⚠️ PONTOS NEGATIVOS */}
                {(() => {
                  const upside = stockData?.valuation_verdict?.upside_percent || 0;
                  const isPositive = upside > 0;
                  const dy = stockData?.key_metrics?.dividend_yield || 0;
                  const roe = stockData?.key_metrics?.roe || 0;
                  
                  return (
                    <Card className={`border-l-4 ${isPositive ? 'border-emerald-500' : 'border-rose-500'} bg-white/5`}>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4">
                          {isPositive ? '✅ Pontos Positivos' : '⚠️ Pontos de Atenção'}
                        </h3>
                        <div className="space-y-4">
                          {/* Valuation */}
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{isPositive ? '💎' : '⚠️'}</span>
                            <div>
                              <div className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                Preço {isPositive ? 'abaixo' : 'acima'} do justo
                              </div>
                              <div className="text-sm text-white/60">
                                {isPositive 
                                  ? `Oportunidade de entrada com desconto de ${Math.abs(upside).toFixed(1)}%`
                                  : `Ação negociando com ágio de ${Math.abs(upside).toFixed(1)}% sobre o valor justo`
                                }
                              </div>
                            </div>
                          </div>
                          
                          {/* Dividend Yield */}
                          {dy > 0 && (
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">💰</span>
                              <div>
                                <div className="font-semibold text-white">
                                  Dividend Yield de {dy.toFixed(1)}%
                                </div>
                                <div className="text-sm text-white/60">
                                  {dy > 6 ? 'Excelente retorno em dividendos' : 
                                   dy > 4 ? 'Bom retorno em dividendos' : 
                                   'Retorno moderado em dividendos'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* ROE */}
                          {roe > 0 && (
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">📈</span>
                              <div>
                                <div className="font-semibold text-white">
                                  ROE de {roe.toFixed(1)}%
                                </div>
                                <div className="text-sm text-white/60">
                                  {roe > 20 ? 'Empresa altamente rentável' :
                                   roe > 15 ? 'Empresa saudável e rentável' :
                                   roe > 10 ? 'Rentabilidade adequada' :
                                   'Rentabilidade moderada'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* ⚠️ RISCOS */}
                {(() => {
                  const beta = stockData?.key_metrics?.beta || 1;
                  const debtToEquity = stockData?.key_metrics?.debt_to_equity || 0;
                  const negatives = stockData?.quick_insights?.key_negatives || [];
                  
                  return (
                    <Card className="border-l-4 border-amber-500 bg-white/5">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4">⚠️ Riscos a Considerar</h3>
                        <div className="space-y-4">
                          {/* Volatilidade (Beta) */}
                          {beta > 1.2 && (
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">📉</span>
                              <div>
                                <div className="font-semibold text-white">Alta volatilidade</div>
                                <div className="text-sm text-white/60">
                                  Beta de {beta.toFixed(2)} indica maior oscilação que o mercado
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Endividamento */}
                          {debtToEquity > 1 && (
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">💳</span>
                              <div>
                                <div className="font-semibold text-white">Endividamento elevado</div>
                                <div className="text-sm text-white/60">
                                  Dívida/Patrimônio de {debtToEquity.toFixed(2)}x
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Riscos da API */}
                          {negatives.slice(0, 2).map((negative, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <span className="text-2xl">⚠️</span>
                              <div>
                                <div className="text-sm text-white/70">{negative}</div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Fallback se não houver riscos */}
                          {beta <= 1.2 && debtToEquity <= 1 && negatives.length === 0 && (
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">✅</span>
                              <div>
                                <div className="font-semibold text-emerald-400">Riscos controlados</div>
                                <div className="text-sm text-white/60">
                                  Empresa apresenta baixa volatilidade e endividamento saudável
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}


                {/* Eventos & documentos */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-white/60" />
                      <div className="text-xs uppercase tracking-wide text-white/40">Eventos & documentos recentes</div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {(analysis.fontes ?? []).slice(0, 5).map((fonte) => (
                        <div key={`${fonte.url}-${fonte.data}`} className="rounded-xl border border-white/10 bg-[#0F162B] p-3">
                          <div className="text-[10px] uppercase tracking-wide text-white/40">{formatShortDate(fonte.data)}</div>
                          <div className="mt-1 text-sm font-medium text-white">{fonte.nome}</div>
                          <a 
                            href={fonte.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-2 inline-flex items-center gap-1 text-xs text-[#3E8FFF] hover:text-[#2c75dc]"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            Abrir documento
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Red flags & Alertas */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-rose-400" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Red flags monitorados</div>
                      </div>
                      <div className="space-y-3">
                        {analysis.redflags.length ? (
                          analysis.redflags.map((flag) => (
                            <div key={`${flag.fonte}-${flag.termo}`} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-white/90">{flag.termo}</span>
                                <Badge className="bg-rose-500/20 text-rose-200 text-[10px] uppercase">{flag.materialidade}</Badge>
                              </div>
                              <div className="mt-2 text-xs text-white/60">{flag.trecho}</div>
                              <a 
                                href={flag.fonte} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-rose-300 hover:text-rose-200"
                              >
                                <ArrowUpRight className="h-3 w-3" />
                                Ver fonte
                              </a>
                            </div>
                          ))
                        ) : (
                          <EmptyState message="Nenhuma red flag relevante registrada." />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-white/60" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Alertas automáticos</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar por e-mail</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar in-app</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Halts e fatos relevantes</span>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="fundamentals" className="space-y-6 text-sm">
                {/* 📊 INDICADORES FUNDAMENTALISTAS */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span>📊</span>
                      <span>Indicadores Fundamentalistas</span>
                    </h3>

                    {/* 💰 VALUATION (vs Setor) */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">💰 VALUATION (vs Setor)</h4>
                      <div className="space-y-4">
                        {/* P/L */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">P/L: {stockData?.key_metrics?.pe_ratio ? `${stockData.key_metrics.pe_ratio.toFixed(1)}x` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.pe_ratio ? 'text-white/40' :
                              stockData.key_metrics.pe_ratio < 10 ? 'text-emerald-400' :
                              stockData.key_metrics.pe_ratio < 15 ? 'text-blue-400' :
                              stockData.key_metrics.pe_ratio < 20 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.pe_ratio ? 'N/D' :
                               stockData.key_metrics.pe_ratio < 10 ? 'Barato' :
                               stockData.key_metrics.pe_ratio < 15 ? 'Justo' :
                               stockData.key_metrics.pe_ratio < 20 ? 'Caro' :
                               'Muito caro'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.pe_ratio ? 'bg-white/20' :
                              stockData.key_metrics.pe_ratio < 10 ? 'bg-emerald-400' :
                              stockData.key_metrics.pe_ratio < 15 ? 'bg-blue-400' :
                              stockData.key_metrics.pe_ratio < 20 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.pe_ratio ? `${Math.min(100, (stockData.key_metrics.pe_ratio / 25) * 100)}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Setor: 9.0x</div>
                        </div>

                        {/* P/VP */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">P/VP: {stockData?.key_metrics?.pb_ratio ? `${stockData.key_metrics.pb_ratio.toFixed(1)}x` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.pb_ratio ? 'text-white/40' :
                              stockData.key_metrics.pb_ratio < 1.5 ? 'text-emerald-400' :
                              stockData.key_metrics.pb_ratio < 2.5 ? 'text-blue-400' :
                              stockData.key_metrics.pb_ratio < 4 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.pb_ratio ? 'N/D' :
                               stockData.key_metrics.pb_ratio < 1.5 ? 'Barato' :
                               stockData.key_metrics.pb_ratio < 2.5 ? 'Justo' :
                               stockData.key_metrics.pb_ratio < 4 ? 'Caro' :
                               'Muito caro'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.pb_ratio ? 'bg-white/20' :
                              stockData.key_metrics.pb_ratio < 1.5 ? 'bg-emerald-400' :
                              stockData.key_metrics.pb_ratio < 2.5 ? 'bg-blue-400' :
                              stockData.key_metrics.pb_ratio < 4 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.pb_ratio ? `${Math.min(100, (stockData.key_metrics.pb_ratio / 5) * 100)}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Setor: 1.5x</div>
                        </div>

                        {/* EV/EBITDA */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">EV/EBITDA: {stockData?.key_metrics?.ev_to_ebitda ? `${stockData.key_metrics.ev_to_ebitda.toFixed(1)}x` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.ev_to_ebitda ? 'text-white/40' :
                              stockData.key_metrics.ev_to_ebitda < 8 ? 'text-emerald-400' :
                              stockData.key_metrics.ev_to_ebitda < 12 ? 'text-blue-400' :
                              stockData.key_metrics.ev_to_ebitda < 15 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.ev_to_ebitda ? 'N/D' :
                               stockData.key_metrics.ev_to_ebitda < 8 ? 'Barato' :
                               stockData.key_metrics.ev_to_ebitda < 12 ? 'Justo' :
                               stockData.key_metrics.ev_to_ebitda < 15 ? 'Caro' :
                               'Muito caro'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.ev_to_ebitda ? 'bg-white/20' :
                              stockData.key_metrics.ev_to_ebitda < 8 ? 'bg-emerald-400' :
                              stockData.key_metrics.ev_to_ebitda < 12 ? 'bg-blue-400' :
                              stockData.key_metrics.ev_to_ebitda < 15 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.ev_to_ebitda ? `${Math.min(100, (stockData.key_metrics.ev_to_ebitda / 20) * 100)}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Setor: 6.2x</div>
                        </div>
                      </div>
                    </div>

                    {/* 💎 RENTABILIDADE */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">💎 RENTABILIDADE</h4>
                      <div className="space-y-4">
                        {/* ROE */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">ROE: {stockData?.key_metrics?.roe ? `${stockData.key_metrics.roe.toFixed(1)}%` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.roe ? 'text-white/40' :
                              stockData.key_metrics.roe > 20 ? 'text-emerald-400' :
                              stockData.key_metrics.roe > 10 ? 'text-blue-400' :
                              stockData.key_metrics.roe > 0 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.roe ? 'N/D' :
                               stockData.key_metrics.roe > 20 ? 'Excelente' :
                               stockData.key_metrics.roe > 10 ? 'Bom' :
                               stockData.key_metrics.roe > 0 ? 'Médio' :
                               'Prejuízo'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.roe ? 'bg-white/20' :
                              stockData.key_metrics.roe > 20 ? 'bg-emerald-400' :
                              stockData.key_metrics.roe > 10 ? 'bg-blue-400' :
                              stockData.key_metrics.roe > 0 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.roe ? `${Math.min(100, Math.max(0, (stockData.key_metrics.roe / 40) * 100))}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Top 10%: 25%+</div>
                        </div>

                        {/* ROA */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">ROA: {stockData?.key_metrics?.roa ? `${stockData.key_metrics.roa.toFixed(1)}%` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.roa ? 'text-white/40' :
                              stockData.key_metrics.roa > 10 ? 'text-emerald-400' :
                              stockData.key_metrics.roa > 5 ? 'text-blue-400' :
                              stockData.key_metrics.roa > 0 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.roa ? 'N/D' :
                               stockData.key_metrics.roa > 10 ? 'Ótimo' :
                               stockData.key_metrics.roa > 5 ? 'Bom' :
                               stockData.key_metrics.roa > 0 ? 'Médio' :
                               'Negativo'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.roa ? 'bg-white/20' :
                              stockData.key_metrics.roa > 10 ? 'bg-emerald-400' :
                              stockData.key_metrics.roa > 5 ? 'bg-blue-400' :
                              stockData.key_metrics.roa > 0 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.roa ? `${Math.min(100, Math.max(0, (stockData.key_metrics.roa / 20) * 100))}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Média: 10%</div>
                        </div>

                        {/* Margem Líquida */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">Margem Líq: {(stockData?.key_metrics?.profit_margin || 0).toFixed(1)}%</span>
                            <span className={`text-sm font-semibold ${
                              (stockData?.key_metrics?.profit_margin || 0) > 15 ? 'text-emerald-400' :
                              (stockData?.key_metrics?.profit_margin || 0) > 10 ? 'text-blue-400' :
                              (stockData?.key_metrics?.profit_margin || 0) > 0 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {(stockData?.key_metrics?.profit_margin || 0) > 15 ? 'Ótimo' :
                               (stockData?.key_metrics?.profit_margin || 0) > 10 ? 'Bom' :
                               (stockData?.key_metrics?.profit_margin || 0) > 0 ? 'Médio' :
                               'Prejuízo'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              (stockData?.key_metrics?.profit_margin || 0) > 15 ? 'bg-emerald-400' :
                              (stockData?.key_metrics?.profit_margin || 0) > 10 ? 'bg-blue-400' :
                              (stockData?.key_metrics?.profit_margin || 0) > 0 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: `${Math.min(100, Math.max(0, ((stockData?.key_metrics?.profit_margin || 0) + 10) * 3))}%` }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Média: 15%</div>
                        </div>
                      </div>
                    </div>

                    {/* 🏦 SAÚDE FINANCEIRA */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">🏦 SAÚDE FINANCEIRA</h4>
                      <div className="space-y-4">
                        {/* Dívida/EBITDA */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">Dív/EBITDA: {stockData?.key_metrics?.debt_to_ebitda ? `${stockData.key_metrics.debt_to_ebitda.toFixed(1)}x` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.debt_to_ebitda ? 'text-white/40' :
                              stockData.key_metrics.debt_to_ebitda < 2 ? 'text-emerald-400' :
                              stockData.key_metrics.debt_to_ebitda < 3 ? 'text-blue-400' :
                              stockData.key_metrics.debt_to_ebitda < 5 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.debt_to_ebitda ? 'N/D' :
                               stockData.key_metrics.debt_to_ebitda < 2 ? 'Baixo' :
                               stockData.key_metrics.debt_to_ebitda < 3 ? 'Moderado' :
                               stockData.key_metrics.debt_to_ebitda < 5 ? 'Alto' :
                               'Crítico'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.debt_to_ebitda ? 'bg-white/20' :
                              stockData.key_metrics.debt_to_ebitda < 2 ? 'bg-emerald-400' :
                              stockData.key_metrics.debt_to_ebitda < 3 ? 'bg-blue-400' :
                              stockData.key_metrics.debt_to_ebitda < 5 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.debt_to_ebitda ? `${Math.min(100, (stockData.key_metrics.debt_to_ebitda / 6) * 100)}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Ideal: &lt; 2.0x</div>
                        </div>

                        {/* Liquidez */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">Liquidez: {stockData?.key_metrics?.current_ratio ? `${stockData.key_metrics.current_ratio.toFixed(1)}x` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.current_ratio ? 'text-white/40' :
                              stockData.key_metrics.current_ratio >= 1.5 ? 'text-emerald-400' :
                              stockData.key_metrics.current_ratio >= 1.0 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.current_ratio ? 'N/D' :
                               stockData.key_metrics.current_ratio >= 1.5 ? 'Saudável' :
                               stockData.key_metrics.current_ratio >= 1.0 ? 'Adequado' :
                               'Baixo'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.current_ratio ? 'bg-white/20' :
                              stockData.key_metrics.current_ratio >= 1.5 ? 'bg-emerald-400' :
                              stockData.key_metrics.current_ratio >= 1.0 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.current_ratio ? `${Math.min(100, (stockData.key_metrics.current_ratio / 2) * 100)}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Mínimo: 1.5x</div>
                        </div>
                      </div>
                    </div>

                    {/* 💵 DIVIDENDOS */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">💵 DIVIDENDOS</h4>
                      <div className="space-y-4">
                        {/* Yield */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">Yield: {(stockData?.key_metrics?.dividend_yield || 0).toFixed(1)}%</span>
                            <span className={`text-sm font-semibold ${
                              (stockData?.key_metrics?.dividend_yield || 0) > 6 ? 'text-emerald-400' :
                              (stockData?.key_metrics?.dividend_yield || 0) > 4 ? 'text-blue-400' :
                              (stockData?.key_metrics?.dividend_yield || 0) > 0 ? 'text-amber-400' :
                              'text-white/40'
                            }`}>
                              {(stockData?.key_metrics?.dividend_yield || 0) > 6 ? 'Alto' :
                               (stockData?.key_metrics?.dividend_yield || 0) > 4 ? 'Bom' :
                               (stockData?.key_metrics?.dividend_yield || 0) > 0 ? 'Baixo' :
                               'Não paga'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              (stockData?.key_metrics?.dividend_yield || 0) > 6 ? 'bg-emerald-400' :
                              (stockData?.key_metrics?.dividend_yield || 0) > 4 ? 'bg-blue-400' :
                              (stockData?.key_metrics?.dividend_yield || 0) > 0 ? 'bg-amber-400' :
                              'bg-white/20'
                            }`} style={{ width: `${Math.min(100, ((stockData?.key_metrics?.dividend_yield || 0) / 10) * 100)}%` }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Setor: 5.2%</div>
                        </div>

                        {/* Payout */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/70">Payout: {stockData?.key_metrics?.payout_ratio ? `${stockData.key_metrics.payout_ratio.toFixed(0)}%` : 'N/D'}</span>
                            <span className={`text-sm font-semibold ${
                              !stockData?.key_metrics?.payout_ratio ? 'text-white/40' :
                              stockData.key_metrics.payout_ratio >= 30 && stockData.key_metrics.payout_ratio <= 60 ? 'text-emerald-400' :
                              stockData.key_metrics.payout_ratio < 80 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {!stockData?.key_metrics?.payout_ratio ? 'N/D' :
                               stockData.key_metrics.payout_ratio >= 30 && stockData.key_metrics.payout_ratio <= 60 ? 'Sustentável' :
                               stockData.key_metrics.payout_ratio < 80 ? 'Moderado' :
                               'Alto risco'}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              !stockData?.key_metrics?.payout_ratio ? 'bg-white/20' :
                              stockData.key_metrics.payout_ratio >= 30 && stockData.key_metrics.payout_ratio <= 60 ? 'bg-emerald-400' :
                              stockData.key_metrics.payout_ratio < 80 ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} style={{ width: stockData?.key_metrics?.payout_ratio ? `${Math.min(100, stockData.key_metrics.payout_ratio)}%` : '0%' }} />
                          </div>
                          <div className="mt-1 text-xs text-white/50">Ideal: 30-60%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. DASHBOARD DE MÉTRICAS - Grid 3x4 */}
                <Card className="rounded-2xl border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">KPIs Fundamentalistas</h3>
                      <Button variant="ghost" className="h-8 text-xs text-white/50 hover:text-white">
                        Comparar com Setor →
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      {/* Linha 1: Receita, Lucro, EBITDA, FCF */}
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>📈</span>
                          <span>Receita</span>
                        </div>
                        <div className="text-2xl font-bold text-white">R$ 201B</div>
                        <div className="mt-1 text-xs text-emerald-400">+7.5% YoY</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-5/6 rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>CAGR 5Y:</span>
                            <span className="font-semibold text-amber-400">4.3% ⚠️</span>
                          </div>
                          <div className="flex justify-between">
                            <span>vs Setor:</span>
                            <span className="font-semibold text-white">+2% 📊</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>💵</span>
                          <span>Lucro</span>
                        </div>
                        <div className="text-2xl font-bold text-white">R$ 68B</div>
                        <div className="mt-1 text-xs text-emerald-400">+12.3% YoY</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-full rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Marg Líq:</span>
                            <span className="font-semibold text-emerald-400">33.8% ✅</span>
                          </div>
                          <div className="flex justify-between">
                            <span>vs Setor:</span>
                            <span className="font-semibold text-emerald-400">+8pp 🏆</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>💰</span>
                          <span>EBITDA</span>
                        </div>
                        <div className="text-2xl font-bold text-white">R$ 97B</div>
                        <div className="mt-1 text-xs text-emerald-400">+8.9% YoY</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-5/6 rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Marg EBITDA:</span>
                            <span className="font-semibold text-emerald-400">48.5% 🏆</span>
                          </div>
                          <div className="flex justify-between">
                            <span>vs Setor:</span>
                            <span className="font-semibold text-emerald-400">+12pp 🏆</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>🏦</span>
                          <span>FCF</span>
                        </div>
                        <div className="text-2xl font-bold text-white">R$ 58B</div>
                        <div className="mt-1 text-xs text-emerald-400">+18.2% YoY</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-full rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Conversão:</span>
                            <span className="font-semibold text-emerald-400">85.3% ✅</span>
                          </div>
                          <div className="flex justify-between">
                            <span>FCF/LL:</span>
                            <span className="font-semibold text-emerald-400">219% 🏆</span>
                          </div>
                        </div>
                      </div>

                      {/* Linha 2: ROE, ROIC, ROA, Giro */}
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>💎</span>
                          <span>ROE</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {stockData?.key_metrics?.roe ? `${stockData.key_metrics.roe.toFixed(1)}%` : 'N/D'}
                        </div>
                        {stockData?.key_metrics?.roe ? (
                          <>
                            <div className="mt-1 text-xs text-white/60">Return on Equity</div>
                            <div className="mt-3 h-1.5 rounded-full bg-white/10">
                              <div className={`h-full rounded-full ${stockData.key_metrics.roe > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{width: `${Math.min(100, Math.abs(stockData.key_metrics.roe) / 40 * 100)}%`}} />
                            </div>
                            <div className="mt-3 space-y-1 text-xs text-white/60">
                              <div className="flex justify-between">
                                <span className={stockData.key_metrics.roe > 20 ? 'text-emerald-400' : 'text-white/60'}>
                                  {stockData.key_metrics.roe > 20 ? '🏆' : '📊'}
                                </span>
                                <span className={`font-semibold ${stockData.key_metrics.roe > 20 ? 'text-emerald-400' : 'text-white/60'}`}>
                                  {stockData.key_metrics.roe > 20 ? 'Top 10%' : stockData.key_metrics.roe > 10 ? 'Bom' : stockData.key_metrics.roe > 0 ? 'Médio' : 'Negativo'}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2">
                            <div className="text-xs text-amber-400">
                              {stockData?.key_metrics?.profit_margin < 0 ? (
                                <>
                                  <div className="font-semibold">⚠️ Empresa no prejuízo</div>
                                  <div className="text-white/60 mt-1">ROE não disponível</div>
                                </>
                              ) : (
                                <>
                                  <div className="font-semibold">ℹ️ Dado não disponível</div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>🎯</span>
                          <span>ROIC</span>
                        </div>
                        <div className="text-2xl font-bold text-white">15.8%</div>
                        <div className="mt-1 text-xs text-rose-400">-1.2pp YoY</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-4/5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>vs WACC:</span>
                            <span className="font-semibold text-emerald-400">+3.1pp ✅</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Spread:</span>
                            <span className="font-semibold text-emerald-400">Positivo ✅</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>💼</span>
                          <span>ROA</span>
                        </div>
                        <div className="text-2xl font-bold text-white">18.5%</div>
                        <div className="mt-1 text-xs text-emerald-400">+2.1pp YoY</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-4/5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Tendência:</span>
                            <span className="font-semibold text-emerald-400">↗️ Melhora</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Histórico:</span>
                            <span className="font-semibold text-white">P75 📊</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>⚙️</span>
                          <span>Giro</span>
                        </div>
                        <div className="text-2xl font-bold text-white">0.68x</div>
                        <div className="mt-1 text-xs text-emerald-400">+0.05x YoY</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-1/2 rounded-full bg-amber-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Asset Turn:</span>
                            <span className="font-semibold text-white">Estável</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Eficiência:</span>
                            <span className="font-semibold text-white">Média 📊</span>
                          </div>
                        </div>
                      </div>

                      {/* Linha 3: Dívida, Liquidez, Cobertura, Piotroski */}
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>🏛️</span>
                          <span>Dívida</span>
                        </div>
                        <div className="text-2xl font-bold text-white">0.9x</div>
                        <div className="mt-1 text-xs text-white/60">DL/EBITDA</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-5/6 rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Tendência:</span>
                            <span className="font-semibold text-emerald-400">↘️ Desalav.</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="font-semibold text-emerald-400">Saudável ✅</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>💧</span>
                          <span>Liquidez</span>
                        </div>
                        <div className="text-2xl font-bold text-white">1.85x</div>
                        <div className="mt-1 text-xs text-white/60">Corrente</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-4/5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Seca:</span>
                            <span className="font-semibold text-emerald-400">1.52x ✅</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Working Cap:</span>
                            <span className="font-semibold text-emerald-400">Positivo ✅</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>🛡️</span>
                          <span>Cobertura</span>
                        </div>
                        <div className="text-2xl font-bold text-white">9.4x</div>
                        <div className="mt-1 text-xs text-white/60">Juros</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-full rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>EBITDA/Jur:</span>
                            <span className="font-semibold text-emerald-400">18.2x 🏆</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Dív/Patrim:</span>
                            <span className="font-semibold text-emerald-400">0.35x ✅</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                          <span>📊</span>
                          <span>Piotroski</span>
                        </div>
                        <div className="text-2xl font-bold text-white">8/9</div>
                        <div className="mt-1 text-xs text-white/60">F-Score</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div className="h-full w-full rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Rentab:</span>
                            <span className="font-semibold text-emerald-400">3/3</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Qualidade:</span>
                            <span className="font-semibold text-emerald-400">Excelente 🏆</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Catalisadores e Riscos (lado a lado) */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Catalisadores (6-12m)</div>
                      </div>
                      <ul className="space-y-2.5">
                        {analysis.sumario.catalisadores.map((item, index) => (
                          <li key={`${analysis.ticker}-cat-${index}`} className="flex items-start gap-2 text-sm text-white/85">
                            <span className="text-emerald-400 flex-shrink-0">▲</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Riscos e mitigação</div>
                      </div>
                      <ul className="space-y-2.5">
                        {analysis.sumario.riscos.map((item, index) => (
                          <li key={`${analysis.ticker}-risk-${index}`} className="flex items-start gap-2 text-sm text-white/85">
                            <span className="text-amber-400 flex-shrink-0">⚠</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* 3. KPIs Detalhados (3 por linha) */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 text-xs uppercase tracking-wide text-white/40">KPIs fundamentalistas</div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        {
                          icon: TrendingUp,
                          label: stockData.key_metrics?.revenue_cagr_5y ? "CAGR Receita 5a" : "Crescimento Receita",
                          value: `${((analysis.kpis.cagrReceita5a ?? 0) * 100).toFixed(1)}%`,
                          subtitle: stockData.key_metrics?.revenue_cagr_5y ? "Crescimento médio anual" : "Crescimento anual (YoY)",
                          formula: "(ReceitaAtual / ReceitaInicial)^(1/n) - 1",
                          calculation: {
                            inputs: {
                              ReceitaAtual: analysis.financials?.receita?.[0] ?? 0,
                              ReceitaInicial: analysis.financials?.receita?.at?.(-1) ?? analysis.financials?.receita?.[0] ?? 0,
                              n: Math.max((analysis.financials?.receita?.length ?? 1) - 1, 1),
                            },
                            steps: ["Dividir receita atual pela inicial", "Aplicar raiz equivalente ao período", "Subtrair 1 para obter taxa"],
                          },
                          healthy: (analysis.kpis.cagrReceita5a ?? 0) > 0.05,
                        },
                        {
                          icon: Sparkles,
                          label: "Margem EBITDA",
                          value: `${((analysis.kpis.margemEBITDA ?? 0) * 100).toFixed(1)}%`,
                          subtitle: "Eficiência operacional",
                          formula: "EBITDA / Receita",
                          calculation: {
                            inputs: {
                              EBITDA: analysis.financials?.ebitda?.[0] ?? 0,
                              Receita: analysis.financials?.receita?.[0] ?? 1,
                            },
                            steps: ["Dividir EBITDA pela receita líquida"],
                          },
                          healthy: (analysis.kpis.margemEBITDA ?? 0) > 0.25,
                        },
                        {
                          icon: Database,
                          label: "ROIC",
                          value: `${((analysis.kpis?.roic ?? 0) * 100).toFixed(1)}%`,
                          subtitle: "Retorno sobre capital investido",
                          formula: "NOPAT / Capital Investido Médio",
                          calculation: {
                            inputs: {
                              NOPAT: (analysis.kpis?.roic ?? 0) * (analysis.financials?.dividaBruta?.[0] ?? 1),
                              CapitalInvestido: analysis.financials?.dividaBruta?.[0] ?? 1,
                            },
                            steps: ["Aplicar imposto sobre EBIT", "Dividir pelo capital investido médio"],
                          },
                          healthy: (analysis.kpis?.roic ?? 0) > 0.12,
                        },
                        {
                          icon: Layers,
                          label: "Dívida Líq./EBITDA",
                          value: `${(analysis.kpis.divLiqSobreEBITDA ?? 0).toFixed(1)}x`,
                          subtitle: "Alavancagem financeira",
                          formula: "Dívida Líquida / EBITDA",
                          calculation: {
                            inputs: {
                              DividaLiquida: analysis.kpis?.dividaLiquida ?? 0,
                              EBITDA: analysis.financials?.ebitda?.[0] ?? 1,
                            },
                            steps: ["Subtrair caixa da dívida bruta", "Dividir pelo EBITDA anualizado"],
                          },
                          healthy: (analysis.kpis.divLiqSobreEBITDA ?? 0) < 3,
                        },
                        {
                          icon: BarChart3,
                          label: "FCF / Lucro Líquido",
                          value: `${((analysis.kpis.fcfSobreLL ?? 0) * 100).toFixed(0)}%`,
                          subtitle: "Qualidade do lucro",
                          formula: "FCF / Lucro Líquido",
                          calculation: {
                            inputs: {
                              FCF: analysis.kpis?.fcf ?? 0,
                              LucroLiquido: analysis.financials?.lucroLiquido?.[0] ?? 1,
                            },
                            steps: ["Dividir FCF pelo lucro líquido"],
                          },
                          healthy: (analysis.kpis.fcfSobreLL ?? 0) > 0.7,
                        },
                        {
                          icon: CheckCircle2,
                          label: "Cobertura Juros",
                          value: `${(analysis.kpis.coberturaJuros ?? 0).toFixed(1)}x`,
                          subtitle: "Capacidade de pagamento",
                          formula: "EBIT / Despesa Financeira",
                          calculation: {
                            inputs: {
                              EBIT: analysis.financials?.ebit?.[0] ?? 0,
                              DespesaFinanceira: (analysis.financials?.ebit?.[0] ?? 0) * 0.1,
                            },
                            steps: ["Dividir EBIT pela despesa financeira"],
                          },
                          healthy: (analysis.kpis.coberturaJuros ?? 0) > 5,
                        },
                      ].map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                          <div key={kpi.label} className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                              <Icon className="h-4 w-4" />
                              <span>{kpi.label}</span>
                            </div>
                            <div className="mt-3 text-3xl font-semibold text-white">{kpi.value}</div>
                            <div className="mt-1 text-xs text-white/50">{kpi.subtitle}</div>
                            <div className="mt-3 h-1.5 rounded-full bg-white/10">
                              <div
                                className={`h-full rounded-full ${kpi.healthy ? "bg-emerald-400" : "bg-amber-400"}`}
                                style={{ width: kpi.healthy ? "75%" : "45%" }}
                              />
                            </div>
                            <ExplainMath
                              formula={kpi.formula}
                              calculation={kpi.calculation}
                              cite={primaryFonte}
                              triggerLabel="Explain the Math"
                              className="mt-4"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Gráficos de apoio */}
                <PerformanceCharts data={annualSeries} />

                {/* 5. Multiplicadores e Sensibilidade */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Múltiplos de mercado</div>
                      <div className="space-y-3">
                        {[
                          { label: "P/L", value: `${(analysis.kpis.pl ?? 0).toFixed(1)}x`, healthy: (analysis.kpis.pl ?? 0) < 15 },
                          { label: "EV/EBITDA", value: `${(analysis.kpis.evEbitda ?? 0).toFixed(1)}x`, healthy: (analysis.kpis.evEbitda ?? 0) < 10 },
                          { label: "P/VP", value: `${(analysis.kpis.pvp ?? 0).toFixed(1)}x`, healthy: (analysis.kpis.pvp ?? 0) < 3 },
                          { label: "Dividend Yield", value: `${((analysis.kpis.dividendYield ?? 0) * 100).toFixed(1)}%`, healthy: (analysis.kpis.dividendYield ?? 0) > 0.05 },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F162B] p-3">
                            <span className="text-sm text-white/70">{item.label}</span>
                            <span className={`text-lg font-semibold ${item.healthy ? "text-emerald-400" : "text-white"}`}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-[10px] uppercase tracking-wide text-white/30">
                        WACC base: {((analysis.valuation.dcf?.wacc ?? 0.105) * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Sensibilidade de valuation</div>
                      {analysis.valuation.dcf?.sensibilidades ? (
                        <div className="space-y-3">
                          {Object.entries(analysis.valuation.dcf.sensibilidades).map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F162B] p-3">
                              <span className="text-sm text-white/70">{label}</span>
                              <span className={`text-lg font-semibold ${value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {value >= 0 ? "+" : ""}{(value * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="Sem análise de sensibilidade disponível." />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 6. Red Flags & Alertas */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Red flags</div>
                      </div>
                      {analysis.redflags.length ? (
                        <div className="space-y-3">
                          {analysis.redflags.map((flag) => (
                            <div key={`${flag.fonte}-${flag.termo}`} className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/90">{flag.termo}</span>
                                <Badge className={`text-[10px] uppercase ${
                                  flag.materialidade === "alta" ? "bg-rose-500/30 text-rose-200" :
                                  flag.materialidade === "media" ? "bg-amber-500/30 text-amber-200" :
                                  "bg-white/10 text-white/60"
                                }`}>
                                  {flag.materialidade}
                                </Badge>
                              </div>
                              <div className="mt-2 text-xs text-white/60">{flag.trecho}</div>
                              <a href={flag.fonte} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-rose-300 hover:text-rose-200">
                                <ArrowUpRight className="h-3 w-3" />
                                Ver fonte
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="Nenhuma red flag identificada." />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-white/60" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Alertas automáticos</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar por e-mail</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar in-app</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Halts e fatos relevantes</span>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 7. Fontes e Confiabilidade */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4 text-white/60" />
                      <div className="text-xs uppercase tracking-wide text-white/40">Fontes e confiabilidade</div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(analysis.fontes ?? []).map((fonte) => (
                        <div key={`${fonte.url}-${fonte.data}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0F162B] px-3 py-2">
                          <div className="h-2 w-2 rounded-full bg-[#3E8FFF]" title="Alta confiabilidade" />
                          <span className="text-xs text-white/70">{fonte.nome}</span>
                          <span className="text-[10px] text-white/40">{formatShortDate(fonte.data)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-lg border border-[#3E8FFF]/20 bg-[#3E8FFF]/5 p-3 text-xs text-white/70">
                      <span className="font-semibold text-[#3E8FFF]">💡 Snapshot interpretativo:</span>
                      <p className="mt-1">
                        A empresa mantém rentabilidade sólida com ROIC acima do WACC e boa geração de caixa, mas a alavancagem ainda limita expansão.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="finance" className="space-y-6 text-sm">
                {/* 📈 DEMONSTRAÇÕES FINANCEIRAS */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span>📈</span>
                      <span>Demonstrações Financeiras</span>
                    </h3>

                    {/* 📊 RECEITA LÍQUIDA */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">📊 Receita Líquida (Evolução)</h4>
                      {stockData?.key_metrics?.revenue ? (
                        <div className="flex items-center justify-center h-48">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2">
                              R$ {(stockData.key_metrics.revenue / 1e9).toFixed(1)}bi
                            </div>
                            <div className="text-sm text-white/60">Receita Anual (TTM)</div>
                            {stockData.key_metrics.revenue_growth && (
                              <div className="mt-2 text-emerald-400 font-semibold">
                                {stockData.key_metrics.revenue_growth > 0 ? '+' : ''}
                                {stockData.key_metrics.revenue_growth.toFixed(1)}% YoY
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 text-white/40">
                          Dados não disponíveis
                        </div>
                      )}
                    </div>

                    {/* 💰 LUCRO LÍQUIDO */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">💰 Lucro Líquido</h4>
                      {stockData?.key_metrics?.net_income ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-emerald-400 mb-2">
                              R$ {(stockData.key_metrics.net_income / 1e9).toFixed(1)}bi
                            </div>
                            <div className="text-sm text-white/60">Lucro Líquido Anual (TTM)</div>
                            {stockData.key_metrics.profit_margin && (
                              <div className="mt-2 text-white/70">
                                Margem: {stockData.key_metrics.profit_margin.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 text-white/40">
                          Dados não disponíveis
                        </div>
                      )}
                    </div>

                    {/* 📊 MARGENS */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">📊 Margens (Atual)</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/50 mb-2">Margem Bruta</div>
                          <div className="text-2xl font-bold text-white">
                            {stockData?.key_metrics?.gross_margin?.toFixed(1) || 'N/D'}%
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/50 mb-2">Margem EBITDA</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            {stockData?.key_metrics?.ebitda_margin?.toFixed(1) || 'N/D'}%
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/50 mb-2">Margem Líquida</div>
                          <div className="text-2xl font-bold text-white">
                            {stockData?.key_metrics?.profit_margin?.toFixed(1) || 'N/D'}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 💵 FLUXO DE CAIXA */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">💵 Balanço Patrimonial</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <div className="text-xs text-white/50 mb-1">Caixa Total</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            {stockData?.key_metrics?.total_cash ? 
                              `R$ ${(stockData.key_metrics.total_cash / 1e9).toFixed(1)}bi` : 
                              'N/D'}
                          </div>
                        </div>
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                          <div className="text-xs text-white/50 mb-1">Dívida Total</div>
                          <div className="text-2xl font-bold text-rose-400">
                            {stockData?.key_metrics?.total_debt ? 
                              `R$ ${(stockData.key_metrics.total_debt / 1e9).toFixed(1)}bi` : 
                              'N/D'}
                          </div>
                        </div>
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                          <div className="text-xs text-white/50 mb-1">Dívida/Patrimônio</div>
                          <div className="text-2xl font-bold text-white">
                            {stockData?.key_metrics?.debt_to_equity?.toFixed(2) || 'N/D'}x
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 1 — Desempenho Financeiro (KPIs centrais) */}
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      metric: stockData.key_metrics?.revenue_cagr_5y ? "CAGR Receita 5a" : "Crescimento Receita (YoY)",
                      value: `${((analysis.kpis.cagrReceita5a ?? 0) * 100).toFixed(1)}%`,
                      explain: stockData.key_metrics?.revenue_cagr_5y ? "Crescimento médio anual — expansão moderada e estável." : "Crescimento anual (último ano) — CAGR 5Y não disponível.",
                      formula: "(ReceitaAtual / ReceitaInicial)^(1/n) - 1",
                      calculation: {
                        inputs: {
                          ReceitaAtual: analysis.financials?.receita?.[0] ?? 0,
                          ReceitaInicial: analysis.financials?.receita?.at?.(-1) ?? analysis.financials?.receita?.[0] ?? 0,
                          n: Math.max((analysis.financials?.receita?.length ?? 1) - 1, 1),
                        },
                        steps: ["Dividir receita atual pela inicial", "Aplicar raiz equivalente ao período", "Subtrair 1 para obter taxa"],
                      },
                      healthy: (analysis.kpis.cagrReceita5a ?? 0) > 0.05,
                    },
                    {
                      metric: "Margem EBITDA",
                      value: `${((analysis.kpis.margemEBITDA ?? 0) * 100).toFixed(1)}%`,
                      explain: "Eficiência operacional — forte geração de caixa.",
                      formula: "EBITDA / Receita",
                      calculation: {
                        inputs: {
                          EBITDA: analysis.financials?.ebitda?.[0] ?? 0,
                          Receita: analysis.financials?.receita?.[0] ?? 1,
                        },
                        steps: ["Dividir EBITDA pela receita líquida"],
                      },
                      healthy: (analysis.kpis.margemEBITDA ?? 0) > 0.25,
                    },
                    {
                      metric: "Margem Líquida",
                      value: `${((analysis.kpis.margemLiquida ?? 0) * 100).toFixed(1)}%`,
                      explain: "Lucratividade real — consistente com pares globais.",
                      formula: "Lucro Líquido / Receita",
                      calculation: {
                        inputs: {
                          LucroLiquido: analysis.financials?.lucroLiquido?.[0] ?? 0,
                          Receita: analysis.financials?.receita?.[0] ?? 1,
                        },
                        steps: ["Dividir lucro líquido pela receita"],
                      },
                      healthy: (analysis.kpis.margemLiquida ?? 0) > 0.1,
                    },
                  ].map((item) => (
                    <Card key={item.metric} className="border-white/10 bg-white/5">
                      <CardContent className="p-5">
                        <div className="text-xs uppercase tracking-wide text-white/40">{item.metric}</div>
                        <div className="mt-3 text-3xl font-bold text-white">{item.value}</div>
                        <div className="mt-2 text-xs leading-relaxed text-white/60">{item.explain}</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${item.healthy ? "bg-emerald-400" : "bg-amber-400"}`}
                            style={{ width: item.healthy ? "75%" : "45%" }}
                          />
                        </div>
                        <ExplainMath formula={item.formula} calculation={item.calculation} cite={primaryFonte} triggerLabel="Explain the math" className="mt-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      metric: "Dívida Líquida",
                      value: formatCurrency(analysis.kpis.dividaLiquida ?? 0),
                      explain: "Posição absoluta — queda de 8% vs ano anterior.",
                      formula: "Dívida Bruta - Caixa e Equivalentes",
                      calculation: {
                        inputs: {
                          DividaBruta: analysis.financials?.dividaBruta?.[0] ?? 0,
                          Caixa: analysis.financials?.caixa?.[0] ?? 0,
                        },
                        steps: ["Subtrair caixa da dívida bruta"],
                      },
                      healthy: (analysis.kpis.dividaLiquida ?? 0) < 100000000000,
                    },
                    {
                      metric: "Dívida Líq./EBITDA",
                      value: `${(analysis.kpis.divLiqSobreEBITDA ?? 0).toFixed(1)}x`,
                      explain: "Alavancagem — abaixo de 1x, sólida.",
                      formula: "Dívida Líquida / EBITDA",
                      calculation: {
                        inputs: {
                          DividaLiquida: analysis.kpis?.dividaLiquida ?? 0,
                          EBITDA: analysis.financials?.ebitda?.[0] ?? 1,
                        },
                        steps: ["Dividir dívida líquida pelo EBITDA anualizado"],
                      },
                      healthy: (analysis.kpis.divLiqSobreEBITDA ?? 0) < 2,
                    },
                    {
                      metric: "Cobertura de Juros",
                      value: `${(analysis.kpis.coberturaJuros ?? 0).toFixed(1)}x`,
                      explain: "Resiliência — 9,4x, confortável.",
                      formula: "EBIT / Despesa Financeira",
                      calculation: {
                        inputs: {
                          EBIT: analysis.financials?.ebit?.[0] ?? 0,
                          DespesaFinanceira: (analysis.financials?.ebit?.[0] ?? 0) * 0.1,
                        },
                        steps: ["Dividir EBIT pela despesa financeira"],
                      },
                      healthy: (analysis.kpis.coberturaJuros ?? 0) > 5,
                    },
                  ].map((item) => (
                    <Card key={item.metric} className="border-white/10 bg-white/5">
                      <CardContent className="p-5">
                        <div className="text-xs uppercase tracking-wide text-white/40">{item.metric}</div>
                        <div className="mt-3 text-3xl font-bold text-white">{item.value}</div>
                        <div className="mt-2 text-xs leading-relaxed text-white/60">{item.explain}</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${item.healthy ? "bg-emerald-400" : "bg-amber-400"}`}
                            style={{ width: item.healthy ? "75%" : "45%" }}
                          />
                        </div>
                        <ExplainMath formula={item.formula} calculation={item.calculation} cite={primaryFonte} triggerLabel="Explain the math" className="mt-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Bloco 2 — Guidance vs Realizado */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-3 text-xs uppercase tracking-wide text-white/40">Guidance vs realizado</div>
                    {analysis.guidance.length ? (
                      <>
                        <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-white/80">
                          <span className="font-semibold text-emerald-400">✓</span> A empresa cumpriu 97,5% do guidance operacional — dentro do esperado.
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                                <th className="pb-3 pr-4 font-medium">Métrica</th>
                                <th className="pb-3 pr-4 font-medium">Guidance</th>
                                <th className="pb-3 pr-4 font-medium">Realizado</th>
                                <th className="pb-3 pr-4 font-medium">Desvio</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analysis.guidance.map((row) => {
                                const erro = row.erroAbs ?? 0;
                                const isPositive = erro < 0.05;
                                return (
                                  <tr key={row.nome} className="border-b border-white/5">
                                    <td className="py-3 pr-4 text-white/90">{row.nome}</td>
                                    <td className="py-3 pr-4 text-white/70">
                                      {row.guia} {row.unidade}
                                    </td>
                                    <td className="py-3 pr-4 text-white/70">
                                      {row.realizado} {row.unidade}
                                    </td>
                                    <td className="py-3 pr-4">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                          {isPositive ? "⬆" : "⬇"} {(erro * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <EmptyState message="Sem dados de guidance para o período analisado." />
                    )}
                  </CardContent>
                </Card>

                {/* Bloco 3 — Estrutura de Capital (gráfico) */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Estrutura de capital e liquidez</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Receita vs Lucro */}
                      <div className="rounded-lg border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-3 text-xs uppercase text-white/50">Receita vs Lucro</div>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={annualSeries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                            <XAxis dataKey="ano" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                            <RechartsTooltip 
                              contentStyle={{ background: "#111A2E", borderRadius: 8, border: "1px solid rgba(148,163,184,.2)" }}
                            />
                            <Bar dataKey="receita" fill="#3E8FFF" />
                            <Bar dataKey="lucro" fill="#34d399" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* FCF Estimado */}
                      <div className="rounded-lg border border-white/10 bg-[#0F162B] p-4">
                        <div className="mb-3 text-xs uppercase text-white/50">FCF Estimado (EBITDA - CAPEX)</div>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={annualSeries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                            <XAxis dataKey="ano" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                            <RechartsTooltip 
                              contentStyle={{ background: "#111A2E", borderRadius: 8, border: "1px solid rgba(148,163,184,.2)" }}
                            />
                            <Area type="monotone" dataKey="fcf" stroke="#34d399" fill="#34d39920" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg border border-white/10 bg-[#0F162B] p-3 text-xs text-white/70">
                      <span className="font-semibold text-white/90">Relação caixa/dívida de curto prazo:</span> Quanto menor a dependência de refinanciamento, mais segura a estrutura.
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 4 — Múltiplos e Sensibilidade DCF */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Múltiplos principais</div>
                      <div className="space-y-3">
                        {[
                          { label: "P/L", value: `${(analysis.kpis.pl ?? 0).toFixed(1)}x`, healthy: (analysis.kpis.pl ?? 0) < 15 },
                          { label: "EV/EBITDA", value: `${(analysis.kpis.evEbitda ?? 0).toFixed(1)}x`, healthy: (analysis.kpis.evEbitda ?? 0) < 10 },
                          { label: "P/VP", value: `${(analysis.kpis.pvp ?? 0).toFixed(1)}x`, healthy: (analysis.kpis.pvp ?? 0) < 3 },
                          { label: "Dividend Yield", value: `${((analysis.kpis.dividendYield ?? 0) * 100).toFixed(1)}%`, healthy: (analysis.kpis.dividendYield ?? 0) > 0.05 },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F162B] p-3">
                            <span className="text-sm text-white/70">{item.label}</span>
                            <span className={`text-xl font-bold ${item.healthy ? "text-emerald-400" : "text-white"}`}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-[10px] uppercase tracking-wide text-white/30">
                        WACC base: {((analysis.valuation.dcf?.wacc ?? 0.105) * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Sensibilidade DCF</div>
                      {analysis.valuation.dcf?.sensibilidades ? (
                        <div className="space-y-3">
                          {Object.entries(analysis.valuation.dcf.sensibilidades).map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F162B] p-3">
                              <span className="text-sm text-white/70">{label}</span>
                              <span className={`text-xl font-bold ${value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {value >= 0 ? "+" : ""}{(value * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="Sem análise de sensibilidade disponível." />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Bloco 5 — Alertas e Red Flags */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-white/60" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Alertas automáticos</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar por e-mail</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar in-app</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Halts e fatos relevantes</span>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        <div className="text-xs uppercase tracking-wide text-white/40">Red flags monitorados</div>
                      </div>
                      {analysis.redflags.length ? (
                        <div className="space-y-3">
                          {analysis.redflags.map((flag) => (
                            <div key={`${flag.fonte}-${flag.termo}`} className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/90">{flag.termo}</span>
                                <Badge className={`text-[10px] uppercase ${
                                  flag.materialidade === "alta" ? "bg-rose-500/30 text-rose-200" :
                                  flag.materialidade === "media" ? "bg-amber-500/30 text-amber-200" :
                                  "bg-white/10 text-white/60"
                                }`}>
                                  {flag.materialidade}
                                </Badge>
                              </div>
                              <div className="mt-2 text-xs text-white/60">{flag.trecho}</div>
                              <a href={flag.fonte} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-rose-300 hover:text-rose-200">
                                <ArrowUpRight className="h-3 w-3" />
                                Ver fonte
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="Nenhuma red flag identificada." />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Bloco 6 — Contexto Interpretativo Final */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="rounded-lg border border-[#3E8FFF]/20 bg-[#3E8FFF]/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-xl">💬</div>
                        <div className="text-sm text-white/80 leading-relaxed">
                          A empresa mantém alavancagem controlada e sólida geração operacional, com margens estáveis e guidance em linha. 
                          O principal risco segue atrelado à volatilidade do minério e potenciais obrigações ESG.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dividends" className="space-y-6 text-sm">
                {/* 💰 HISTÓRICO DE DIVIDENDOS */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span>💰</span>
                      <span>Histórico de Dividendos</span>
                    </h3>

                    {/* 📊 YIELD ATUAL */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">📊 Dividend Yield Atual</h4>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
                        <div className="text-5xl font-bold text-emerald-400 mb-2">
                          {stockData?.key_metrics?.dividend_yield?.toFixed(2) || '0.00'}%
                        </div>
                        <div className="text-sm text-white/60">Últimos 12 meses</div>
                        {stockData?.key_metrics?.dividend_rate && (
                          <div className="mt-4 text-white/80">
                            <span className="text-xs text-white/50">Dividendo Anual: </span>
                            <span className="font-semibold">R$ {stockData.key_metrics.dividend_rate.toFixed(2)}/ação</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 💵 PAGAMENTOS RECENTES */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">💵 Pagamentos Recentes</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="pb-2 text-left text-xs text-white/50">Data</th>
                              <th className="pb-2 text-left text-xs text-white/50">Valor</th>
                              <th className="pb-2 text-left text-xs text-white/50">Tipo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.dividends.calendario?.slice(0, 4).map((div, idx) => (
                              <tr key={idx} className="border-b border-white/5">
                                <td className="py-3 text-sm text-white">{formatShortDate(div.dataEx)}</td>
                                <td className="py-3 text-sm font-semibold text-emerald-400">R$ {div.valor.toFixed(2)}</td>
                                <td className="py-3 text-xs text-white/60">{idx === 0 ? 'Projeção' : 'Ordinário'}</td>
                              </tr>
                            )) || (
                              <tr>
                                <td colSpan="3" className="py-4 text-center text-sm text-white/50">Sem dados disponíveis</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 📈 INFORMAÇÕES ADICIONAIS */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">📈 Informações Adicionais</h4>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-white/50 mb-1">Payout Ratio</div>
                            <div className="text-2xl font-bold text-white">
                              {stockData?.key_metrics?.payout_ratio?.toFixed(1) || 'N/D'}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-white/50 mb-1">Dividend Rate</div>
                            <div className="text-2xl font-bold text-white">
                              R$ {stockData?.key_metrics?.dividend_rate?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Análise de Sustentabilidade */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#3E8FFF]" />
                      <div className="text-sm font-semibold text-white">Análise de Sustentabilidade</div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="text-xs uppercase tracking-wide text-white/40">FCF vs Dividendos</div>
                        <div className="mt-3 flex items-end gap-3">
                          <div className="flex-1">
                            <div className="text-[10px] text-white/50">FCF</div>
                            <div className="mt-1 h-16 rounded bg-emerald-500/20" style={{ height: "64px" }} />
                            <div className="mt-1 text-xs font-semibold text-white">{formatCurrency(analysis.kpis.fcf ?? 0)}</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] text-white/50">Dividendos</div>
                            <div className="mt-1 h-12 rounded bg-blue-500/20" style={{ height: "48px" }} />
                            <div className="mt-1 text-xs font-semibold text-white">
                              {formatCurrency((analysis.dividends.totalPago12m ?? 0))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="text-xs uppercase tracking-wide text-white/40">Cobertura FCF</div>
                        <div className="mt-3 text-3xl font-bold text-white">
                          {((analysis.kpis.fcf ?? 0) / Math.max((analysis.dividends.totalPago12m ?? 1), 1)).toFixed(1)}x
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          {((analysis.kpis.fcf ?? 0) / Math.max((analysis.dividends.totalPago12m ?? 1), 1)) > 1.5 ? (
                            <><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="text-xs text-emerald-400">Saudável</span></>
                          ) : ((analysis.kpis.fcf ?? 0) / Math.max((analysis.dividends.totalPago12m ?? 1), 1)) > 1 ? (
                            <><AlertTriangle className="h-4 w-4 text-amber-400" /><span className="text-xs text-amber-400">Atenção</span></>
                          ) : (
                            <><AlertTriangle className="h-4 w-4 text-rose-400" /><span className="text-xs text-rose-400">Risco</span></>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                        <div className="text-xs uppercase tracking-wide text-white/40">Dividend Safety Score</div>
                        <div className="mt-3 text-3xl font-bold text-white">
                          {Math.min(100, Math.round(
                            ((analysis.dividends.yield12m ?? 0) < 0.15 ? 30 : 0) +
                            ((analysis.dividends.payout12m ?? 0) < 0.7 ? 30 : 0) +
                            ((analysis.kpis.divLiqSobreEBITDA ?? 0) < 2 ? 40 : 0)
                          ))}/100
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
                            style={{ width: `${Math.min(100, Math.round(
                              ((analysis.dividends.yield12m ?? 0) < 0.15 ? 30 : 0) +
                              ((analysis.dividends.payout12m ?? 0) < 0.7 ? 30 : 0) +
                              ((analysis.kpis.divLiqSobreEBITDA ?? 0) < 2 ? 40 : 0)
                            ))}%` }}
                          />
                        </div>
                        <div className="mt-2 text-[10px] text-white/50">Baseado em yield, payout e alavancagem</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Calendário Inteligente */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-white/60" />
                        <div className="text-sm font-semibold text-white">Calendário de Dividendos</div>
                      </div>
                      <Badge className="bg-[#3E8FFF]/20 text-[#3E8FFF] text-[10px] uppercase">
                        {analysis.dividends.calendario?.length ?? 0} eventos
                      </Badge>
                    </div>
                    {analysis.dividends.calendario?.length ? (
                      <div className="grid gap-3 md:grid-cols-3">
                        {analysis.dividends.calendario.slice(0, 6).map((item, idx) => (
                          <div
                            key={`${item.dataEx}-${item.valor}`}
                            className={`rounded-xl border p-4 ${
                              idx === 0
                                ? "border-[#3E8FFF]/30 bg-[#3E8FFF]/5"
                                : "border-white/10 bg-[#0F162B]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs uppercase tracking-wide text-white/40">Data Ex</div>
                              {idx === 0 && <Badge className="bg-[#3E8FFF]/20 text-[#3E8FFF] text-[9px]">Próximo</Badge>}
                            </div>
                            <div className="mt-2 text-xl font-bold text-white">{formatShortDate(item.dataEx)}</div>
                            <div className="mt-2 text-sm text-white/70">R$ {item.valor.toFixed(2)}/ação</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="Sem eventos de dividendos programados." />
                    )}
                  </CardContent>
                </Card>

                {/* 4. Insights Acionáveis */}
                <Card className="border-[#3E8FFF]/20 bg-[#3E8FFF]/5">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#3E8FFF]" />
                      <div className="text-sm font-semibold text-[#3E8FFF]">Insights Acionáveis</div>
                    </div>
                    <div className="space-y-3">
                      {(analysis.dividends.yield12m ?? 0) > 0.08 && (
                        <div className="flex items-start gap-3 text-sm text-white/80">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                          <span>Yield excepcional acima de 8% — excelente para carteira de renda passiva.</span>
                        </div>
                      )}
                      {(analysis.dividends.payout12m ?? 0) > 0.75 && (
                        <div className="flex items-start gap-3 text-sm text-white/80">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400 flex-shrink-0" />
                          <span>Payout elevado ({((analysis.dividends.payout12m ?? 0) * 100).toFixed(0)}%) — atenção à sustentabilidade de longo prazo.</span>
                        </div>
                      )}
                      {(analysis.dividends.cagrDividendos5a ?? 0) > 0.1 && (
                        <div className="flex items-start gap-3 text-sm text-white/80">
                          <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                          <span>Crescimento consistente de {((analysis.dividends.cagrDividendos5a ?? 0) * 100).toFixed(1)}% ao ano nos últimos 5 anos.</span>
                        </div>
                      )}
                      {((analysis.kpis.fcf ?? 0) / Math.max((analysis.dividends.totalPago12m ?? 1), 1)) < 1.2 && (
                        <div className="flex items-start gap-3 text-sm text-white/80">
                          <Info className="mt-0.5 h-4 w-4 text-blue-400 flex-shrink-0" />
                          <span>Cobertura de FCF apertada — investigar fundamentos e capacidade de manutenção.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Comparação com Setor */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Comparação com setor</div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Yield da empresa</span>
                            <span className="font-semibold text-white">{((analysis.dividends.yield12m ?? 0) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min((analysis.dividends.yield12m ?? 0) * 100 * 10, 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Média do setor</span>
                            <span className="font-semibold text-white/60">6.2%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-white/30" style={{ width: "62%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">CDI/SELIC</span>
                            <span className="font-semibold text-white/60">10.5%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-blue-400/50" style={{ width: "100%" }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="p-5">
                      <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Red Flags & Alertas</div>
                      <div className="space-y-3">
                        {(analysis.dividends.payout12m ?? 0) > 0.8 && (
                          <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-400 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-white/90">Payout insustentável</div>
                              <div className="mt-1 text-xs text-white/60">Payout acima de 80% pode comprometer dividendos futuros</div>
                            </div>
                          </div>
                        )}
                        {(analysis.kpis.fcf ?? 0) < 0 && (
                          <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-400 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-white/90">FCF negativo</div>
                              <div className="mt-1 text-xs text-white/60">Empresa pode estar pagando dividendos com dívida</div>
                            </div>
                          </div>
                        )}
                        {(analysis.kpis.divLiqSobreEBITDA ?? 0) > 3 && (
                          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-white/90">Dívida elevada</div>
                              <div className="mt-1 text-xs text-white/60">Alavancagem pode pressionar capacidade de pagamento</div>
                            </div>
                          </div>
                        )}
                        {!((analysis.dividends.payout12m ?? 0) > 0.8) && !((analysis.kpis.fcf ?? 0) < 0) && !((analysis.kpis.divLiqSobreEBITDA ?? 0) > 3) && (
                          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-white/90">Dividendos saudáveis</div>
                              <div className="mt-1 text-xs text-white/60">Nenhum alerta crítico identificado</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6 text-sm">
                {/* 🔔 ALERTAS E EVENTOS */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span>🔔</span>
                      <span>Alertas e Eventos</span>
                    </h3>

                    {/* ⚡ PRÓXIMOS EVENTOS */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">⚡ Próximos Eventos</h4>
                      <div className="space-y-3">
                        {[
                          { date: '15/Nov', title: 'Divulgação 3T24', icon: '📊', type: 'earnings' },
                          { date: '20/Nov', title: 'Pagamento dividendos', icon: '💰', type: 'dividend' },
                          { date: '05/Dez', title: 'Assembleia ordinária', icon: '📅', type: 'meeting' }
                        ].map((event, idx) => (
                          <div key={idx} className="rounded-xl border border-white/10 bg-[#0F162B] p-4 flex items-center gap-4">
                            <div className="text-3xl">{event.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold text-white">{event.title}</div>
                              <div className="text-xs text-white/60 mt-1">{event.date}</div>
                            </div>
                            <Badge className={`text-xs ${
                              event.type === 'earnings' ? 'bg-blue-500/20 text-blue-400' :
                              event.type === 'dividend' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {event.type === 'earnings' ? 'Resultados' :
                               event.type === 'dividend' ? 'Dividendos' : 'Evento'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 📰 NOTÍCIAS RECENTES */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">📰 Notícias Recentes (últimos 7 dias)</h4>
                      <div className="space-y-3">
                        {[
                          { title: 'Vale anuncia aumento de produção', source: 'InfoMoney', time: 'Há 2 dias' },
                          { title: 'Minério atinge US$ 120/ton', source: 'Valor', time: 'Há 4 dias' },
                          { title: 'Dividendos de R$ 1.03 aprovados', source: 'Status Invest', time: 'Há 6 dias' }
                        ].map((news, idx) => (
                          <div key={idx} className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                            <div className="font-semibold text-white">{news.title}</div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                              <span>{news.source}</span>
                              <span>•</span>
                              <span>{news.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 🎯 MEUS ALERTAS PERSONALIZADOS */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">🎯 Meus Alertas Personalizados</h4>
                      <div className="space-y-3 mb-4">
                        {[
                          { condition: 'Preço < R$ 60.00', status: 'active', triggered: false },
                          { condition: 'Dividend Yield > 8%', status: 'active', triggered: false },
                          { condition: 'P/L < 5.0x', status: 'active', triggered: true }
                        ].map((alert, idx) => (
                          <div key={idx} className={`rounded-xl border p-4 flex items-center justify-between ${
                            alert.triggered 
                              ? 'border-emerald-500/30 bg-emerald-500/10' 
                              : 'border-white/10 bg-[#0F162B]'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className="text-xl">{alert.triggered ? '✅' : '⚠️'}</div>
                              <div>
                                <div className="font-semibold text-white">{alert.condition}</div>
                                <div className="text-xs text-white/60 mt-1">
                                  {alert.triggered ? 'Alerta acionado!' : 'Monitorando...'}
                                </div>
                              </div>
                            </div>
                            <Switch defaultChecked={alert.status === 'active'} />
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-[#3E8FFF] hover:bg-[#2c75dc] text-white">
                        ➕ Criar novo alerta
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Sistema de Abas/Categorias */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Todos", count: 8, active: true },
                        { label: "🎯 Oportunidades", count: 2 },
                        { label: "⚠️ Red Flags", count: analysis.redflags?.length ?? 0 },
                        { label: "📅 Eventos", count: 3 },
                        { label: "💰 Preço", count: 1 },
                        { label: "📈 Fundamentos", count: 2 },
                      ].map((cat) => (
                        <Button
                          key={cat.label}
                          variant={cat.active ? "default" : "outline"}
                          className={`text-xs ${
                            cat.active
                              ? "bg-[#3E8FFF] text-white"
                              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          {cat.label}
                          {cat.count > 0 && (
                            <Badge className="ml-2 bg-white/20 text-white text-[10px]">{cat.count}</Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Feed de Alertas Inteligente */}
                <div className="space-y-3">
                  {/* Alerta de Oportunidade */}
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-white">Oportunidade de Compra Detectada</div>
                              <div className="mt-1 text-sm text-white/80">
                                {analysis.ticker} caiu 8% e está 15% abaixo do preço justo. P/L em {(analysis.kpis.pl ?? 0).toFixed(1)}x, 
                                abaixo da média histórica.
                              </div>
                            </div>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-white/60 hover:text-white">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Button className="h-8 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs">
                              📊 Ver Análise
                            </Button>
                            <Button variant="ghost" className="h-8 text-xs text-white/60 hover:text-white">
                              🔕 Silenciar
                            </Button>
                            <Button variant="ghost" className="h-8 text-xs text-white/60 hover:text-white">
                              ⚙️ Editar
                            </Button>
                          </div>
                          <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-wide text-white/40">
                            <span>Empresa: {analysis.ticker}</span>
                            <span>•</span>
                            <span>Há 2 horas</span>
                            <span>•</span>
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px]">Alta Prioridade</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Red Flags */}
                  {analysis.redflags?.length > 0 && analysis.redflags.map((flag, idx) => (
                    <Card key={`${flag.fonte}-${flag.termo}-${idx}`} className="border-rose-500/30 bg-rose-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20">
                            <AlertTriangle className="h-5 w-5 text-rose-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-white">{flag.termo}</div>
                                <div className="mt-1 text-sm text-white/80">{flag.trecho}</div>
                              </div>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-white/60 hover:text-white">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Button className="h-8 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs">
                                📊 Ver Detalhes
                              </Button>
                              <Button variant="ghost" className="h-8 text-xs text-white/60 hover:text-white">
                                🔕 Silenciar
                              </Button>
                              <a 
                                href={flag.fonte} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex h-8 items-center rounded-md px-3 text-xs text-white/60 hover:text-white"
                              >
                                🔗 Fonte
                              </a>
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-wide text-white/40">
                              <span>Empresa: {analysis.ticker}</span>
                              <span>•</span>
                              <span>Há 1 dia</span>
                              <span>•</span>
                              <Badge className={`text-[9px] ${
                                flag.materialidade === "alta" ? "bg-rose-500/30 text-rose-200" :
                                flag.materialidade === "media" ? "bg-amber-500/30 text-amber-200" :
                                "bg-white/10 text-white/60"
                              }`}>
                                {flag.materialidade}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Alerta de Evento */}
                  <Card className="border-[#3E8FFF]/30 bg-[#3E8FFF]/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3E8FFF]/20">
                          <CalendarDays className="h-5 w-5 text-[#3E8FFF]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-white">Dividendos em 3 Dias</div>
                              <div className="mt-1 text-sm text-white/80">
                                Data ex-dividendo se aproxima. Valor estimado: R$ {(analysis.dividends.calendario?.[0]?.valor ?? 1.25).toFixed(2)}/ação
                              </div>
                            </div>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-white/60 hover:text-white">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Button className="h-8 bg-[#3E8FFF]/20 text-[#3E8FFF] hover:bg-[#3E8FFF]/30 text-xs">
                              📅 Ver Calendário
                            </Button>
                            <Button variant="ghost" className="h-8 text-xs text-white/60 hover:text-white">
                              ➕ Adicionar ao Google Calendar
                            </Button>
                          </div>
                          <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-wide text-white/40">
                            <span>Empresa: {analysis.ticker}</span>
                            <span>•</span>
                            <span>Há 5 horas</span>
                            <span>•</span>
                            <Badge className="bg-[#3E8FFF]/20 text-[#3E8FFF] text-[9px]">Informativo</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alerta de Preço */}
                  {(() => {
                    const precoAtual = analysis.valuation.precoAtual ?? 64.27;
                    const precoJusto = parseFloat(analysis.valuation.dcf?.fairValue?.replace(/[^\d,.-]/g, '').replace(',', '.') ?? precoAtual);
                    const upside = ((precoJusto - precoAtual) / precoAtual) * 100;
                    
                    if (upside > 10) {
                      return (
                        <Card className="border-amber-500/30 bg-amber-500/5">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                                <TrendingUp className="h-5 w-5 text-amber-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-semibold text-white">Preço Entrou em Zona de Compra</div>
                                    <div className="mt-1 text-sm text-white/80">
                                      {analysis.ticker} está {upside.toFixed(1)}% abaixo do preço justo. 
                                      Preço atual: R$ {precoAtual.toFixed(2)}
                                    </div>
                                  </div>
                                  <Button variant="ghost" className="h-8 w-8 p-0 text-white/60 hover:text-white">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <Button className="h-8 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs">
                                    💰 Ver Valuation
                                  </Button>
                                  <Button variant="ghost" className="h-8 text-xs text-white/60 hover:text-white">
                                    🔔 Criar Alerta de Preço
                                  </Button>
                                </div>
                                <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-wide text-white/40">
                                  <span>Empresa: {analysis.ticker}</span>
                                  <span>•</span>
                                  <span>Há 30 min</span>
                                  <span>•</span>
                                  <Badge className="bg-amber-500/20 text-amber-300 text-[9px]">Média Prioridade</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* 4. Criador de Alertas Personalizados */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-[#3E8FFF]" />
                        <div className="text-sm font-semibold text-white">Criar Alerta Personalizado</div>
                      </div>
                      <Button className="h-8 bg-[#3E8FFF] text-white hover:bg-[#2c75dc] text-xs">
                        ➕ Novo Alerta
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: "💰", label: "Avisar quando P/L < 6", type: "Múltiplo" },
                        { icon: "📅", label: "Notificar antes de dividendos", type: "Evento" },
                        { icon: "📉", label: "Alerta: queda de -10% em 1 dia", type: "Preço" },
                        { icon: "⚠️", label: "Red flag: payout > 80%", type: "Fundamento" },
                      ].map((template) => (
                        <div
                          key={template.label}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F162B] p-3 hover:border-[#3E8FFF]/30 hover:bg-[#3E8FFF]/5 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-white">{template.label}</div>
                              <div className="text-xs text-white/50">{template.type}</div>
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-white/40" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Configurações de Notificação */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Preferências de Notificação</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar por e-mail</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Notificar in-app</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Push notifications</span>
                          <Switch />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Digest diário (resumo)</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Apenas prioridade alta</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Modo silencioso (22h-7h)</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="valuation" className="space-y-6 text-sm">
                {/* 💎 ANÁLISE DE VALUATION */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span>💎</span>
                      <span>Análise de Valuation</span>
                    </h3>

                    {/* 🎯 PREÇO JUSTO (da API) */}
                    <div className="mb-8 text-center">
                      <h4 className="text-lg font-semibold text-white mb-4">🎯 Preço Justo</h4>
                      <div className={`rounded-xl border p-6 ${
                        (stockData?.valuation_verdict?.upside_percent || 0) > 0 
                          ? 'border-emerald-500/20 bg-emerald-500/5' 
                          : 'border-white/10 bg-white/5'
                      }`}>
                        <div className={`text-5xl font-bold mb-4 ${
                          (stockData?.valuation_verdict?.upside_percent || 0) > 0 
                            ? 'text-emerald-400' 
                            : 'text-white'
                        }`}>
                          R$ {(stockData?.valuation_verdict?.fair_price || stockData?.quote?.price || 0).toFixed(2)}
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div>
                            <div className="text-xs text-white/50">Atual: R$ {(stockData?.quote?.price || 0).toFixed(2)}</div>
                            <div className="h-2 w-32 rounded-full bg-white/10 mt-1">
                              <div className="h-full bg-emerald-400 rounded-full" 
                                style={{ width: `${Math.min(100, ((stockData?.quote?.price || 0) / (stockData?.valuation_verdict?.fair_price || 1)) * 100)}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${
                          (stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {(stockData?.valuation_verdict?.upside_percent || 0) > 0 ? 'Desconto' : 'Prêmio'}: 
                          {(stockData?.valuation_verdict?.upside_percent || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* 📊 INDICADORES DE VALUATION */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">📊 Indicadores de Valuation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/50 mb-2">P/L (Price/Earnings)</div>
                          <div className="text-2xl font-bold text-white">
                            {stockData?.key_metrics?.pe_ratio?.toFixed(2) || 'N/D'}x
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/50 mb-2">P/VP (Price/Book)</div>
                          <div className="text-2xl font-bold text-white">
                            {stockData?.key_metrics?.pb_ratio?.toFixed(2) || 'N/D'}x
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/50 mb-2">EV/EBITDA</div>
                          <div className="text-2xl font-bold text-white">
                            {stockData?.key_metrics?.ev_to_ebitda?.toFixed(2) || 'N/D'}x
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/50 mb-2">Price/Sales</div>
                          <div className="text-2xl font-bold text-white">
                            {stockData?.key_metrics?.price_to_sales?.toFixed(2) || 'N/D'}x
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 📈 VEREDICTO */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">📈 Veredicto de Valuation</h4>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="text-center mb-4">
                          <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                            stockData?.valuation_verdict?.verdict === 'COMPRA' ? 'bg-emerald-500/20 text-emerald-400' :
                            stockData?.valuation_verdict?.verdict === 'VENDA' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {stockData?.valuation_verdict?.verdict || 'NEUTRO'}
                          </div>
                        </div>
                        <div className="text-center text-sm text-white/60">
                          Confiança: {stockData?.valuation_verdict?.confidence || 'Média'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Dashboard de Múltiplos Comparativos */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Múltiplos Comparativos</div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {[
                        { 
                          label: "P/L", 
                          value: analysis.kpis.pl ?? 0, 
                          setor: 8.5, 
                          ideal: 12,
                          format: (v) => `${v.toFixed(1)}x`
                        },
                        { 
                          label: "P/VP", 
                          value: analysis.kpis.pvp ?? 0, 
                          setor: 2.1, 
                          ideal: 2.5,
                          format: (v) => `${v.toFixed(1)}x`
                        },
                        { 
                          label: "EV/EBITDA", 
                          value: analysis.kpis.evEbitda ?? 0, 
                          setor: 6.8, 
                          ideal: 8,
                          format: (v) => `${v.toFixed(1)}x`
                        },
                        { 
                          label: "Div. Yield", 
                          value: (analysis.kpis.dividendYield ?? 0) * 100, 
                          setor: 6.2, 
                          ideal: 5,
                          format: (v) => `${v.toFixed(1)}%`
                        },
                      ].map((item) => {
                        const isAttractive = item.label === "Div. Yield" 
                          ? item.value > item.setor 
                          : item.value < item.setor;
                        
                        return (
                          <div key={item.label} className="rounded-xl border border-white/10 bg-[#0F162B] p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-xs uppercase tracking-wide text-white/40">{item.label}</div>
                              <Badge className={`text-[9px] ${
                                isAttractive 
                                  ? "bg-emerald-500/20 text-emerald-300" 
                                  : "bg-amber-500/20 text-amber-300"
                              }`}>
                                {isAttractive ? "✅ Atrativo" : "⚠️ Neutro"}
                              </Badge>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-white">{item.format(item.value)}</div>
                            <div className="mt-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between text-white/60">
                                <span>Média setor:</span>
                                <span className="font-semibold">{item.format(item.setor)}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/10">
                                <div 
                                  className={`h-full rounded-full ${isAttractive ? "bg-emerald-400" : "bg-amber-400"}`}
                                  style={{ width: `${Math.min((item.value / item.ideal) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Análise DCF Visual */}
                {(() => {
                  const fairPrice = stockData?.valuation_verdict?.fair_price || stockData?.quote?.price || 0;
                  const currentPrice = stockData?.quote?.price || 0;
                  const upside = stockData?.valuation_verdict?.upside_percent || 0;
                  const confidence = stockData?.valuation_verdict?.confidence || 'Média';
                  
                  // Calcular cenários
                  const pessimista = fairPrice * 0.85;
                  const otimista = fairPrice * 1.15;
                  
                  // WACC estimado (custo médio ponderado de capital)
                  const beta = stockData?.key_metrics?.beta || 1;
                  const wacc = 5 + (beta * 6); // Taxa livre de risco + (beta * prêmio de risco)
                  
                  // Crescimento perpétuo (baseado no crescimento histórico)
                  const revenueGrowth = stockData?.key_metrics?.revenue_growth || 0;
                  const terminalGrowth = Math.min(Math.max(revenueGrowth / 2, 2), 5); // Entre 2% e 5%
                  
                  // Confiança em %
                  const confidencePercent = confidence === 'Alta' ? 85 : confidence === 'Média' ? 65 : 45;
                  
                  return (
                    <Card className="border-white/10 bg-white/5">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-[#3E8FFF]" />
                          <div className="text-sm font-semibold text-white">Análise DCF (Discounted Cash Flow)</div>
                        </div>
                        
                        <div className="grid gap-4 lg:grid-cols-3">
                          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                            <div className="text-xs uppercase tracking-wide text-rose-300">Cenário Pessimista</div>
                            <div className="mt-2 text-2xl font-bold text-white">
                              R$ {pessimista.toFixed(2)}
                            </div>
                            <div className="mt-2 text-[10px] text-white/50">WACC +0,5pp, crescimento -2pp</div>
                          </div>
                          
                          <div className="rounded-xl border border-[#3E8FFF]/30 bg-[#3E8FFF]/10 p-4">
                            <div className="text-xs uppercase tracking-wide text-[#3E8FFF]">Cenário Base</div>
                            <div className="mt-2 text-3xl font-bold text-white">
                              R$ {fairPrice.toFixed(2)}
                            </div>
                            <div className="mt-2 text-[10px] text-white/50">Parâmetros atuais</div>
                          </div>
                          
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="text-xs uppercase tracking-wide text-emerald-300">Cenário Otimista</div>
                            <div className="mt-2 text-2xl font-bold text-white">
                              R$ {otimista.toFixed(2)}
                            </div>
                            <div className="mt-2 text-[10px] text-white/50">WACC -0,5pp, crescimento +2pp</div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-white/10 bg-[#0F162B] p-4">
                          <div className="mb-3 text-xs uppercase tracking-wide text-white/40">Parâmetros do Modelo</div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">WACC:</span>
                              <span className="font-semibold text-white">{wacc.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">Crescimento perpétuo:</span>
                              <span className="font-semibold text-white">{terminalGrowth.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">Upside potencial:</span>
                              <span className={`font-semibold ${upside > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {upside > 0 ? '+' : ''}{upside.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">Confiança:</span>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 rounded-full bg-white/10">
                                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${confidencePercent}%` }} />
                                </div>
                                <span className="text-xs text-white/60">{confidencePercent}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}



                {/* 6. Decisão Assistida */}
                <Card className="border-[#3E8FFF]/20 bg-[#3E8FFF]/5">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#3E8FFF]" />
                      <div className="text-sm font-semibold text-[#3E8FFF]">Decisão Assistida</div>
                    </div>
                    {(() => {
                      const precoAtual = analysis.valuation.precoAtual ?? 64.27;
                      const precoJusto = parseFloat(analysis.valuation.dcf?.fairValue?.replace(/[^\d,.-]/g, '').replace(',', '.') ?? precoAtual);
                      const upside = ((precoJusto - precoAtual) / precoAtual) * 100;
                      
                      if (upside > 10) {
                        return (
                          <div className="text-sm text-white/80 leading-relaxed">
                            <span className="font-semibold text-emerald-400">✅ Subavaliada:</span> Com base em múltiplos métodos de valuation, 
                            a ação apresenta desconto de {upside.toFixed(1)}%. Considere iniciar posição ou aumentar exposição.
                          </div>
                        );
                      } else if (upside < -10) {
                        return (
                          <div className="text-sm text-white/80 leading-relaxed">
                            <span className="font-semibold text-rose-400">⚠️ Sobrevalorizada:</span> Empresa está {Math.abs(upside).toFixed(1)}% 
                            acima do valor justo por múltiplos métodos. Considere aguardar correção ou realizar lucros parciais.
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-sm text-white/80 leading-relaxed">
                            <span className="font-semibold text-[#3E8FFF]">➡️ Preço Justo:</span> Ação negociando próxima ao valor justo. 
                            Avalie qualidade dos fundamentos e perspectivas futuras antes de decidir.
                          </div>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compare" className="space-y-6 text-sm">
                {/* ⚖️ COMPARAÇÃO COM CONCORRENTES */}
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span>⚖️</span>
                      <span>Comparação com Concorrentes</span>
                    </h3>

                    <PeerComparison ticker={currentTicker} stockData={stockData} />
                  </CardContent>
                </Card>

                {/* MODO EMPRESAS */}
                    {/* 1. Hero Section - Battle Mode */}
                    <Card className="border-white/10 bg-gradient-to-r from-[#3E8FFF]/5 to-emerald-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <div className="text-2xl font-bold text-white">{analysis.ticker}</div>
                            <div className="mt-2 text-sm text-white/60">{analysis.empresa}</div>
                            <div className="mt-3 text-3xl font-bold text-[#3E8FFF]">
                              R$ {(analysis.valuation.precoAtual ?? 64.27).toFixed(2)}
                            </div>
                            <div className="mt-2">
                              <Badge className="bg-[#3E8FFF]/20 text-[#3E8FFF]">Score: 78/100</Badge>
                            </div>
                          </div>
                          
                          <div className="text-center px-6">
                            <div className="text-4xl">⚔️</div>
                            <div className="mt-2 text-xs uppercase tracking-wide text-white/40">vs</div>
                          </div>
                          
                          <div className="text-center flex-1">
                            <div className="text-2xl font-bold text-white">RIO</div>
                            <div className="mt-2 text-sm text-white/60">Rio Tinto</div>
                            <div className="mt-3 text-3xl font-bold text-emerald-400">USD 58.30</div>
                            <div className="mt-2">
                              <Badge className="bg-emerald-500/20 text-emerald-300">Score: 71/100</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 text-center">
                          <div className="inline-flex items-center gap-2 rounded-full bg-[#3E8FFF]/20 px-4 py-2">
                            <span className="text-2xl">🏆</span>
                            <span className="text-sm font-semibold text-[#3E8FFF]">
                              Vencedor: {analysis.ticker} em 6 de 9 métricas
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. Heatmap Comparativo */}
                    <Card className="border-white/10 bg-white/5">
                      <CardContent className="p-5">
                        <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Comparação de Múltiplos</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="pb-3 pr-4 text-left text-xs uppercase tracking-wide text-white/40">Métrica</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">{analysis.ticker}</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">RIO</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">BHP</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">CSNA3</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { label: "P/L", values: [analysis.kpis.pl ?? 6.2, 8.4, 9.1, 7.3], format: (v) => `${v.toFixed(1)}x`, lower: true },
                                { label: "P/VP", values: [analysis.kpis.pvp ?? 1.8, 2.1, 2.4, 1.9], format: (v) => `${v.toFixed(1)}x`, lower: true },
                                { label: "ROE", values: [(analysis.kpis.roe ?? 0.32) * 100, 28.0, 26.0, 19.0], format: (v) => `${v.toFixed(1)}%`, lower: false },
                                { label: "Margem EBITDA", values: [(analysis.kpis.margemEBITDA ?? 0.325) * 100, 31.0, 28.0, 24.0], format: (v) => `${v.toFixed(1)}%`, lower: false },
                                { label: "Div. Yield", values: [(analysis.kpis.dividendYield ?? 0.071) * 100, 5.5, 4.9, 4.2], format: (v) => `${v.toFixed(1)}%`, lower: false },
                                { label: "Dív/EBITDA", values: [analysis.kpis.divLiqSobreEBITDA ?? 0.9, 1.2, 1.5, 2.1], format: (v) => `${v.toFixed(1)}x`, lower: true },
                              ].map((row) => {
                                const sortedValues = [...row.values].sort((a, b) => row.lower ? a - b : b - a);
                                const getColor = (val) => {
                                  const rank = sortedValues.indexOf(val);
                                  if (rank === 0) return "bg-emerald-500/20 text-emerald-300";
                                  if (rank === sortedValues.length - 1) return "bg-rose-500/20 text-rose-300";
                                  return "bg-amber-500/20 text-amber-300";
                                };
                                
                                return (
                                  <tr key={row.label} className="border-b border-white/5">
                                    <td className="py-3 pr-4 text-white/90">{row.label}</td>
                                    {row.values.map((val, idx) => (
                                      <td key={idx} className="py-3 pr-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="font-semibold text-white">{row.format(val)}</span>
                                          <Badge className={`text-[9px] ${getColor(val)}`}>
                                            {sortedValues.indexOf(val) === 0 ? "🏆" : sortedValues.indexOf(val) === sortedValues.length - 1 ? "🔴" : "🟡"}
                                          </Badge>
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 3. Scorecard Visual */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardContent className="p-4">
                          <div className="text-2xl">💰</div>
                          <div className="mt-2 text-xs uppercase tracking-wide text-white/40">Valuation</div>
                          <div className="mt-3">
                            <div className="text-sm text-white/70">Mais Barata:</div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xl">🏆</span>
                              <span className="text-lg font-bold text-white">{analysis.ticker}</span>
                            </div>
                            <div className="mt-1 text-xs text-emerald-400">P/L: {(analysis.kpis.pl ?? 6.2).toFixed(1)}x (-25%)</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-[#3E8FFF]/30 bg-[#3E8FFF]/5">
                        <CardContent className="p-4">
                          <div className="text-2xl">📈</div>
                          <div className="mt-2 text-xs uppercase tracking-wide text-white/40">Crescimento</div>
                          <div className="mt-3">
                            <div className="text-sm text-white/70">Maior Crescimento:</div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xl">🏆</span>
                              <span className="text-lg font-bold text-white">RIO</span>
                            </div>
                            <div className="mt-1 text-xs text-[#3E8FFF]">Rev 5Y: +12.5%</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="p-4">
                          <div className="text-2xl">💎</div>
                          <div className="mt-2 text-xs uppercase tracking-wide text-white/40">Dividendos</div>
                          <div className="mt-3">
                            <div className="text-sm text-white/70">Maior Yield:</div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xl">🏆</span>
                              <span className="text-lg font-bold text-white">{analysis.ticker}</span>
                            </div>
                            <div className="mt-1 text-xs text-amber-400">Yield: {((analysis.kpis.dividendYield ?? 0.071) * 100).toFixed(1)}%</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-rose-500/30 bg-rose-500/5">
                        <CardContent className="p-4">
                          <div className="text-2xl">🏛️</div>
                          <div className="mt-2 text-xs uppercase tracking-wide text-white/40">Solidez</div>
                          <div className="mt-3">
                            <div className="text-sm text-white/70">Melhor Balanço:</div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xl">🏆</span>
                              <span className="text-lg font-bold text-white">{analysis.ticker}</span>
                            </div>
                            <div className="mt-1 text-xs text-rose-400">D/EBITDA: {(analysis.kpis.divLiqSobreEBITDA ?? 0.9).toFixed(1)}x</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Comparação Detalhada com Pares */}
                    <Suspense fallback={<SkeletonBlock lines={5} />}>
                      <CompararTab analysis={analysis} peers={peerComparisons} onSelectTicker={handleSearch} />
                    </Suspense>

                    {/* MODO ANOS */}
                    {/* 1. Hero Section - Time Machine */}
                    <Card className="border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{analysis.ticker} - Evolução Temporal</div>
                          <div className="mt-4 flex items-center justify-center gap-4">
                            {[2020, 2021, 2022, 2023, 2024].map((year, idx) => (
                              <div key={year} className="flex items-center gap-2">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-white">{year}</div>
                                  <div className="mt-1 h-2 w-16 rounded-full bg-white/10">
                                    <div 
                                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                                      style={{ width: `${((idx + 1) / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                {idx < 4 && <ArrowUpRight className="h-4 w-4 text-white/40" />}
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                              <div className="text-xs text-white/60">📊 Melhor Ano</div>
                              <div className="mt-1 text-lg font-bold text-emerald-400">2021 (ROE 45.2%)</div>
                            </div>
                            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                              <div className="text-xs text-white/60">📉 Pior Ano</div>
                              <div className="mt-1 text-lg font-bold text-rose-400">2020 (Lucro -15%)</div>
                            </div>
                            <div className="rounded-lg border border-[#3E8FFF]/20 bg-[#3E8FFF]/5 p-3">
                              <div className="text-xs text-white/60">📈 Tendência</div>
                              <div className="mt-1 text-lg font-bold text-[#3E8FFF]">Melhoria em 4/6 métricas</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. Evolution Heatmap */}
                    <Card className="border-white/10 bg-white/5">
                      <CardContent className="p-5">
                        <div className="mb-4 text-xs uppercase tracking-wide text-white/40">Evolução de Métricas (2020-2024)</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="pb-3 pr-4 text-left text-xs uppercase tracking-wide text-white/40">Métrica</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">2020</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">2021</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">2022</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">2023</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">2024</th>
                                <th className="pb-3 pr-4 text-center text-xs uppercase tracking-wide text-white/40">ΔCAGR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { label: "Receita (R$B)", values: [154, 238, 195, 187, 201], cagr: 6.9, format: (v) => `${v}B` },
                                { label: "ROE", values: [18.2, 45.2, 32.1, 28.5, 32.0], cagr: 15.1, format: (v) => `${v.toFixed(1)}%` },
                                { label: "P/L", values: [12.5, 5.8, 7.2, 8.1, 6.2], cagr: -16.2, format: (v) => `${v.toFixed(1)}x` },
                                { label: "Div Yield", values: [5.8, 9.2, 7.5, 6.8, 7.1], cagr: 5.2, format: (v) => `${v.toFixed(1)}%` },
                                { label: "Dív/EBITDA", values: [2.8, 1.2, 1.5, 1.4, 0.9], cagr: -25.6, format: (v) => `${v.toFixed(1)}x` },
                              ].map((row) => (
                                <tr key={row.label} className="border-b border-white/5">
                                  <td className="py-3 pr-4 text-white/90">{row.label}</td>
                                  {row.values.map((val, idx) => {
                                    const max = Math.max(...row.values);
                                    const min = Math.min(...row.values);
                                    const isMax = val === max;
                                    const isMin = val === min;
                                    
                                    return (
                                      <td key={idx} className="py-3 pr-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="font-semibold text-white">{row.format(val)}</span>
                                          <Badge className={`text-[9px] ${
                                            isMax ? "bg-emerald-500/20 text-emerald-300" :
                                            isMin ? "bg-rose-500/20 text-rose-300" :
                                            "bg-amber-500/20 text-amber-300"
                                          }`}>
                                            {isMax ? "🟢" : isMin ? "🔴" : "🟡"}
                                          </Badge>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  <td className="py-3 pr-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className={`font-semibold ${row.cagr > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                        {row.cagr > 0 ? "+" : ""}{row.cagr.toFixed(1)}%
                                      </span>
                                      <span className="text-xs">{row.cagr > 0 ? "↗️" : "↘️"}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 3. AI Insights Temporal */}
                    <Card className="border-[#3E8FFF]/20 bg-[#3E8FFF]/5">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-[#3E8FFF]" />
                          <div className="text-sm font-semibold text-[#3E8FFF]">Análise Temporal AI</div>
                        </div>
                        <div className="space-y-3 text-sm text-white/80">
                          <div>
                            <span className="font-semibold text-white">📊 Resumo da Jornada:</span> De 2020 a 2024, {analysis.ticker} melhorou em 8 das 10 principais métricas. 
                            O ROE expandiu 76% e a empresa reduziu dívida em 68%. O período 2021-2022 marcou o superciclo de commodities, com lucros recordes.
                          </div>
                          <div>
                            <span className="font-semibold text-white">🎯 Pontos de Inflexão:</span>
                            <ul className="mt-2 space-y-1 pl-4">
                              <li>• <span className="text-emerald-400">2021:</span> Ano excepcional (ROE 45%, lucro +85%)</li>
                              <li>• <span className="text-amber-400">2022:</span> Normalização pós-superciclo (-18% lucro)</li>
                              <li>• <span className="text-[#3E8FFF]">2024:</span> Recuperação + desalavancagem completa</li>
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold text-white">⚖️ Melhor Timing:</span> O melhor momento para entrar foi em 2020 (P/L 12.5x). 
                            Retorno total se comprou em 2020: <span className="text-emerald-400 font-bold">+145%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          ) : (
            <Card className="rounded-2xl border-[#3E8FFF]/30 bg-gradient-to-br from-[#3E8FFF]/10 to-[#10192E]">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Avaliação Avançada - Plano Pro
                </h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">
                  Upgrade para acessar análise DCF completa, comparação com peers, alertas de preço e muito mais
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-[#3E8FFF] hover:bg-[#2c75dc] text-white text-lg px-8 py-6"
                >
                  ⭐ Upgrade para Pro - R$ 49/mês
                </Button>
                <div className="mt-6 text-sm text-white/40">
                  Cancele quando quiser • Sem compromisso
                </div>
              </CardContent>
            </Card>
          )
        )}


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

      {/* Debug Panel - Remover em produção */}
      {import.meta.env.DEV && <DebugPanel />}
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


