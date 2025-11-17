import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  getStockOverview,
  getStockChart
} from '../services/api';

const StockContext = createContext();

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const [currentTicker, setCurrentTicker] = useState('VALE3');
  const [stockData, setStockData] = useState(null);
  const [fundamentals, setFundamentals] = useState(null);
  const [dividends, setDividends] = useState(null);
  const [valuation, setValuation] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const normalizeApiPayload = useCallback((payload) => {
    if (!payload) return null;

    const fundamentalsData = payload.fundamentals ?? {};
    const valuationData = fundamentalsData.valuation ?? {};
    const profitability = fundamentalsData.profitability ?? {};
    const dividendsData = fundamentalsData.dividends ?? {};
    const leverage = fundamentalsData.leverage ?? {};
    const financials = fundamentalsData.financials ?? {};
    const growth = fundamentalsData.growth ?? {};
    const marketData = fundamentalsData.marketData ?? {};

    const keyMetrics = {
      revenue_cagr_5y: growth.revenueCagr5y ?? null,
      revenue_growth: growth.revenueCagr5y ?? null,
      ebitda_margin: profitability.marginEbit ?? null,
      net_margin: profitability.marginNet ?? null,
      profit_margin: profitability.marginNet ?? null,
      dividend_yield: dividendsData.dividendYield ?? null,
      payout_ratio: dividendsData.dividendPayout ?? null,
      dividend_on_equity: dividendsData.dividendOnEquity ?? null,
      debt_to_ebitda: leverage.netDebtToEbitda ?? null,
      debt_to_equity: leverage.netDebtToEquity ?? null,
      current_ratio: leverage.currentRatio ?? null,
      roe: profitability.roe ?? null,
      roic: profitability.roic ?? null,
      roa: profitability.assetTurnover ?? null,
      pe_ratio: valuationData.pe ?? null,
      pb_ratio: valuationData.pb ?? null,
      ev_ebitda: valuationData.evEbitda ?? null,
      ev_ebit: valuationData.evEbit ?? null,
      ps_ratio: valuationData.psr ?? null,
      price_to_sales: valuationData.psr ?? null,
      market_cap: marketData.marketCap ?? payload.raw?.quote?.fundamentals?.marketCap ?? null,
      volume_avg: marketData.volumeAvg2m ?? null,
      shares_outstanding: marketData.shares ?? null,
      revenue: financials.revenue12m ?? null,
      ebitda: financials.ebitda12m ?? null,
      net_income: financials.netIncome12m ?? null,
    };

    const quote = payload.quote ?? (payload.price
      ? {
          price: payload.price.last ?? null,
          open: payload.price.open ?? null,
          high: payload.price.high ?? null,
          low: payload.price.low ?? null,
          previous_close: payload.price.previousClose ?? null,
          change: payload.price.change ?? null,
          change_percent: payload.price.changePercent ?? null,
          change_percent_30d: payload.price.changePercent30d ?? null,
          change_percent_12m: payload.price.changePercent12m ?? null,
          day_range: payload.price.dayRange ?? null,
          market_time: payload.price.marketTime ?? null,
          year_low: payload.price.min52w ?? null,
          year_high: payload.price.max52w ?? null,
          market_cap: keyMetrics.market_cap,
          volume: keyMetrics.volume_avg,
          last_updated: payload.price.marketTime ?? payload.fetchedAt,
        }
      : null);

    const quickInsights = payload.quick_insights ?? {
      tldr: payload.insights?.thesis ?? null,
      key_positives: payload.insights?.drivers ?? [],
      key_negatives: payload.insights?.risks ?? [],
    };

    const buildHealthScore = () => {
      const pillars = [
        {
          label: 'Rentabilidade',
          score: Math.max(0, Math.min(25, (keyMetrics.roe ?? 0) * 1.2)),
          maxScore: 25,
          rationale: keyMetrics.roe ? [`ROE em ${keyMetrics.roe.toFixed(1)}%`] : [],
        },
        {
          label: 'Crescimento',
          score: Math.max(0, Math.min(20, (keyMetrics.revenue_growth ?? 0) + 20)),
          maxScore: 20,
          rationale: keyMetrics.revenue_growth ? [`Receita ${keyMetrics.revenue_growth.toFixed(1)}% nos últimos 5 anos`] : [],
        },
        {
          label: 'Dividendos',
          score: Math.max(0, Math.min(20, (keyMetrics.dividend_yield ?? 0) * 2)),
          maxScore: 20,
          rationale: keyMetrics.dividend_yield ? [`Dividend yield de ${keyMetrics.dividend_yield.toFixed(1)}%`] : [],
        },
        {
          label: 'Alavancagem',
          score: Math.max(0, Math.min(20, 20 - (keyMetrics.debt_to_ebitda ?? 0) * 4)),
          maxScore: 20,
          rationale: keyMetrics.debt_to_ebitda ? [`Dívida líquida / EBITDA de ${keyMetrics.debt_to_ebitda.toFixed(1)}x`] : [],
        },
        {
          label: 'Eficiência',
          score: Math.max(0, Math.min(15, (keyMetrics.ebitda_margin ?? 0))),
          maxScore: 15,
          rationale: keyMetrics.ebitda_margin ? [`Margem EBITDA em ${keyMetrics.ebitda_margin.toFixed(1)}%`] : [],
        },
      ];

      const total = Math.round(
        pillars.reduce((acc, pillar) => acc + pillar.score, 0)
      );
      const boundedTotal = Math.max(20, Math.min(95, total));
      const grade = boundedTotal >= 80 ? 'A' : boundedTotal >= 65 ? 'B' : boundedTotal >= 50 ? 'C' : 'D';

      return {
        total_score: boundedTotal,
        grade,
        classification:
          grade === 'A' ? 'Investment Grade' : grade === 'B' ? 'Estável' : grade === 'C' ? 'Em observação' : 'Risco elevado',
        updatedAt: payload.fetchedAt,
        pillars,
        max: 100,
      };
    };

    const valuationVerdict = payload.valuation_verdict ?? (() => {
      if (!quote?.price) return null;
      const fairPrice = keyMetrics.pb_ratio && keyMetrics.pb_ratio > 0
        ? quote.price * Math.max(0.7, Math.min(1.3, 1.1 - (keyMetrics.pb_ratio - 1) * 0.1))
        : quote.price;
      const upsidePercent = ((fairPrice - quote.price) / quote.price) * 100;
      const status = upsidePercent > 5 ? 'desconto' : upsidePercent < -5 ? 'premio' : 'justo';

      return {
        verdict: status === 'desconto' ? 'COMPRA' : status === 'premio' ? 'VENDA' : 'MANTER',
        status,
        fair_price: Number(fairPrice.toFixed(2)),
        upside_percent: Number(upsidePercent.toFixed(1)),
        confidence: 'Média',
        range: {
          bear: Number((upsidePercent - 10).toFixed(1)) / 100,
          bull: Number((upsidePercent + 10).toFixed(1)) / 100,
        },
        rationale: quickInsights.key_positives,
        assumptions: {
          wacc: 0.10,
          g: 0.02,
          ebitdaDelta: 0.05,
        },
      };
    })();

    return {
      ...payload,
      quote,
      key_metrics: keyMetrics,
      quick_insights: quickInsights,
      valuation_verdict: valuationVerdict,
      health_score: payload.health_score ?? buildHealthScore(),
      dividends_history: payload.dividends_history ?? [],
      price_history: payload.price_history ?? [],
    };
  }, []);

  /**
   * Carregar TODOS os dados de uma ação
   */
  const loadStockData = useCallback(async (ticker) => {
    try {
      setLoading(true);
      setError(null);
      const upperTicker = ticker.toUpperCase();
      setCurrentTicker(upperTicker);

      console.log(`🔄 Carregando dados de ${upperTicker}...`);

      const [overviewResult, chartResult] = await Promise.allSettled([
        getStockOverview(upperTicker),
        getStockChart(upperTicker)
      ]);

      if (overviewResult.status === 'rejected') {
        throw overviewResult.reason ?? new Error('Erro ao carregar dados do overview');
      }

      const overviewResponse = overviewResult.value;
      const chartResponse = chartResult.status === 'fulfilled' ? chartResult.value : null;
      const data = overviewResponse?.data ?? overviewResponse;

      if (!data || data.error) {
        throw new Error(data?.error ?? 'Erro ao carregar dados');
      }

      const chartPayload = chartResponse?.data ?? chartResponse;
      const chartSeries = Array.isArray(chartPayload)
        ? chartPayload
        : Array.isArray(chartPayload?.data)
          ? chartPayload.data
          : [];
      const normalized = normalizeApiPayload({
        ...data,
        price_history: data.price_history?.length
          ? data.price_history
          : chartSeries
      });
      setStockData(normalized);

      // Extrair dados específicos do response completo
      setFundamentals(normalized?.key_metrics || normalized?.fundamentals || null);
      setDividends(normalized?.dividends_history || normalized?.fundamentals?.dividends || null);
      setValuation(normalized?.valuation_verdict || normalized?.fundamentals?.valuation || null);
      setHealthScore(normalized?.health_score || normalized?.insights?.healthScore || null);

      console.log('✅ Todos os dados carregados:', data);
      console.log(`✅ Dados de ${upperTicker} carregados com sucesso!`);

    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados da ação');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  }, [normalizeApiPayload]);

  /**
   * Mudar ticker
   */
  const changeTicker = useCallback((newTicker) => {
    if (newTicker && newTicker.toUpperCase() !== currentTicker) {
      loadStockData(newTicker);
    }
  }, [currentTicker, loadStockData]);

  /**
   * Recarregar dados
   */
  const refreshData = useCallback(() => {
    if (currentTicker) {
      loadStockData(currentTicker);
    }
  }, [currentTicker, loadStockData]);

  // Carregar dados iniciais ao montar o componente
  useEffect(() => {
    if (!initialized) {
      console.log('🚀 Inicializando StockContext com', currentTicker);
      setInitialized(true);
      loadStockData(currentTicker);
    }
  }, [initialized, currentTicker, loadStockData]);

  const value = {
    currentTicker,
    stockData,
    fundamentals,
    dividends,
    valuation,
    healthScore,
    loading,
    error,
    changeTicker,
    refreshData,
    loadStockData
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};
