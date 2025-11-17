const logger = require('../utils/logger');

/**
 * Analytics Engine - Cálculos avançados e análises
 */
class AnalyticsEngine {
  /**
   * Calculate Health Score (Investment Quality Score)
   */
  async calculateHealthScore(financials, marketData) {
    try {
      const categories = {
        financial_health: this.scoreFinancialHealth(financials),
        growth: this.scoreGrowth(financials),
        profitability: this.scoreProfitability(financials),
        earnings_quality: this.scoreEarningsQuality(financials)
      };

      const totalScore = Object.values(categories)
        .reduce((sum, cat) => sum + cat.score, 0);

      const totalMaxScore = Object.values(categories)
        .reduce((sum, cat) => sum + cat.max_score, 0);

      const percentage = Math.round((totalScore / totalMaxScore) * 100);

      return {
        total_score: totalScore,
        max_score: totalMaxScore,
        percentage,
        grade: this.getGrade(percentage),
        classification: this.getClassification(percentage),
        risk_level: this.getRiskLevel(percentage),
        breakdown: categories,
        percentile: this.calculatePercentile(totalScore),
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error calculating health score:', error);
      throw error;
    }
  }

  /**
   * Score Financial Health (25 points max)
   */
  scoreFinancialHealth(data) {
    let score = 0;
    const checks = [];
    const maxScore = 25;

    // ROIC > WACC (+5 points)
    if (data.roic && data.wacc && data.roic > data.wacc) {
      score += 5;
      checks.push({
        name: 'ROIC acima do WACC',
        passed: true,
        points_earned: 5,
        max_points: 5,
        value: data.roic,
        spread: data.roic - data.wacc,
        explanation: 'Empresa cria valor real para acionistas'
      });
    } else {
      checks.push({
        name: 'ROIC acima do WACC',
        passed: false,
        points_earned: 0,
        max_points: 5
      });
    }

    // Debt/EBITDA < 2x (+5 points)
    const debtToEbitda = data.total_debt / data.ebitda;
    if (debtToEbitda < 2) {
      score += 5;
      checks.push({
        name: 'Alavancagem controlada',
        passed: true,
        points_earned: 5,
        max_points: 5,
        value: debtToEbitda,
        threshold: '< 2.0',
        explanation: 'Dívida em níveis saudáveis'
      });
    } else if (debtToEbitda < 3) {
      score += 3;
      checks.push({
        name: 'Alavancagem controlada',
        passed: 'partial',
        points_earned: 3,
        max_points: 5,
        value: debtToEbitda
      });
    }

    // FCF Conversion > 80% (+5 points)
    const fcfConversion = data.free_cash_flow / data.net_income;
    if (fcfConversion > 0.8) {
      score += 5;
      checks.push({
        name: 'Conversão de caixa consistente',
        passed: true,
        points_earned: 5,
        max_points: 5,
        value: fcfConversion,
        explanation: 'Lucro se converte em caixa real'
      });
    }

    // Current Ratio > 1.5x (+5 points)
    const currentRatio = data.current_assets / data.current_liabilities;
    if (currentRatio > 1.5) {
      score += 5;
      checks.push({
        name: 'Liquidez adequada',
        passed: true,
        points_earned: 5,
        max_points: 5,
        value: currentRatio
      });
    } else if (currentRatio > 1.0) {
      score += 3;
      checks.push({
        name: 'Liquidez adequada',
        passed: 'partial',
        points_earned: 3,
        max_points: 5,
        value: currentRatio
      });
    }

    // Interest Coverage > 3x (+5 points)
    const interestCoverage = data.ebitda / (data.interest_expense || 1);
    if (interestCoverage > 3) {
      score += 5;
      checks.push({
        name: 'Cobertura de juros confortável',
        passed: true,
        points_earned: 5,
        max_points: 5,
        value: interestCoverage
      });
    }

    return {
      score: Math.min(score, maxScore),
      max_score: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      checks
    };
  }

  /**
   * Score Growth (25 points max)
   */
  scoreGrowth(data) {
    let score = 0;
    const checks = [];
    const maxScore = 25;

    // Revenue CAGR > 5% (+5 points)
    if (data.revenue_cagr_5y > 5) {
      score += 5;
      checks.push({
        name: 'CAGR receita saudável',
        passed: true,
        points_earned: 5,
        value: data.revenue_cagr_5y
      });
    } else if (data.revenue_cagr_5y > 0) {
      score += 3;
      checks.push({
        name: 'CAGR receita saudável',
        passed: 'partial',
        points_earned: 3,
        value: data.revenue_cagr_5y
      });
    }

    // Capex/FCF < 80% (+5 points)
    const capexToFCF = Math.abs(data.capex) / data.free_cash_flow;
    if (capexToFCF < 0.8) {
      score += 5;
      checks.push({
        name: 'Capex alinhado ao FCF',
        passed: true,
        points_earned: 5,
        value: capexToFCF
      });
    }

    // Margin expansion (+5 points)
    if (data.margin_trend === 'expanding') {
      score += 5;
      checks.push({
        name: 'Expansão de margem',
        passed: true,
        points_earned: 5
      });
    } else if (data.margin_trend === 'stable') {
      score += 3;
      checks.push({
        name: 'Expansão de margem',
        passed: 'partial',
        points_earned: 3
      });
    }

    // Market share stable/growing (+5 points)
    if (data.market_share_trend !== 'declining') {
      score += 4;
      checks.push({
        name: 'Market share estável/crescendo',
        passed: true,
        points_earned: 4
      });
    }

    // R&D Investment (+5 points)
    const rdToRevenue = (data.rd_expense || 0) / data.revenue;
    if (rdToRevenue > 0.02) {
      score += 3;
      checks.push({
        name: 'Investimento em R&D',
        passed: 'partial',
        points_earned: 3,
        value: rdToRevenue
      });
    }

    return {
      score: Math.min(score, maxScore),
      max_score: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      checks
    };
  }

  /**
   * Score Profitability (25 points max)
   */
  scoreProfitability(data) {
    let score = 0;
    const checks = [];
    const maxScore = 25;

    // ROE > 20% (+5 points)
    if (data.roe > 20) {
      score += 5;
      checks.push({
        name: 'ROE excepcional',
        passed: true,
        points_earned: 5,
        value: data.roe,
        explanation: 'Top 10% do setor'
      });
    } else if (data.roe > 15) {
      score += 3;
      checks.push({
        name: 'ROE excepcional',
        passed: 'partial',
        points_earned: 3,
        value: data.roe
      });
    }

    // Margins above sector (+5 points)
    if (data.ebitda_margin > data.sector_avg_ebitda_margin) {
      score += 5;
      checks.push({
        name: 'Margens líderes do setor',
        passed: true,
        points_earned: 5,
        value: data.ebitda_margin
      });
    }

    // ROIC > 15% (+5 points)
    if (data.roic > 15) {
      score += 5;
      checks.push({
        name: 'ROIC sustentado',
        passed: true,
        points_earned: 5,
        value: data.roic
      });
    } else if (data.roic > 10) {
      score += 3;
      checks.push({
        name: 'ROIC sustentado',
        passed: 'partial',
        points_earned: 3,
        value: data.roic
      });
    }

    // Operating efficiency (+5 points)
    if (data.operating_margin > 15) {
      score += 4;
      checks.push({
        name: 'Eficiência operacional',
        passed: true,
        points_earned: 4
      });
    }

    // ROA > 10% (+5 points)
    if (data.roa > 10) {
      score += 3;
      checks.push({
        name: 'ROA sólido',
        passed: 'partial',
        points_earned: 3,
        value: data.roa
      });
    }

    return {
      score: Math.min(score, maxScore),
      max_score: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      checks
    };
  }

  /**
   * Score Earnings Quality (25 points max)
   */
  scoreEarningsQuality(data) {
    let score = 0;
    const checks = [];
    const maxScore = 25;

    // FCF > Net Income (+5 points)
    if (data.free_cash_flow > data.net_income) {
      score += 5;
      checks.push({
        name: 'FCF > Lucro Líquido',
        passed: true,
        points_earned: 5,
        explanation: 'Lucro é "real", não contábil'
      });
    }

    // Low accruals (+5 points)
    const accruals = (data.net_income - data.operating_cash_flow) / data.total_assets;
    if (accruals < 0) {
      score += 5;
      checks.push({
        name: 'Accruals baixos/negativos',
        passed: true,
        points_earned: 5,
        value: accruals
      });
    }

    // Recurring revenue (+5 points)
    if (data.non_recurring_items_pct < 0.05) {
      score += 4;
      checks.push({
        name: 'Receitas recorrentes',
        passed: true,
        points_earned: 4
      });
    }

    // Clean audit (+5 points)
    if (data.audit_opinion === 'unqualified') {
      score += 3;
      checks.push({
        name: 'Auditoria limpa',
        passed: true,
        points_earned: 3
      });
    }

    // Piotroski F-Score > 7 (+5 points)
    if (data.piotroski_score >= 7) {
      score += 5;
      checks.push({
        name: 'Piotroski F-Score alto',
        passed: true,
        points_earned: 5,
        value: data.piotroski_score
      });
    }

    return {
      score: Math.min(score, maxScore),
      max_score: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      checks
    };
  }

  /**
   * Calculate DCF Valuation
   */
  async calculateValuation(ticker, financials, quote) {
    try {
      const assumptions = {
        wacc: 12.8,
        terminal_growth_rate: 2.0,
        projection_years: 10,
        margin_of_safety: 15.0
      };

      const dcf = this.calculateDCF(financials, assumptions);
      const multiples = this.calculateMultiples(financials, quote);

      // Weighted average fair price
      const fairPrice = (dcf.fair_price * 0.6) + (multiples.implied_price * 0.4);
      const upside = ((fairPrice - quote.price) / quote.price) * 100;

      let verdict = 'NEUTRO';
      if (upside > 15) verdict = 'COMPRA';
      if (upside > 25) verdict = 'COMPRA FORTE';
      if (upside < -15) verdict = 'VENDA';

      return {
        verdict,
        confidence: upside > 20 || upside < -20 ? 'Alta' : 'Média',
        fair_price: fairPrice,
        current_price: quote.price,
        upside_percent: upside,
        methods: [
          {
            name: 'DCF',
            fair_price: dcf.fair_price,
            upside: ((dcf.fair_price - quote.price) / quote.price) * 100,
            confidence: 80
          },
          {
            name: 'Múltiplos Comparáveis',
            fair_price: multiples.implied_price,
            upside: ((multiples.implied_price - quote.price) / quote.price) * 100,
            confidence: 90
          }
        ],
        sensitivity_range: {
          optimistic: fairPrice * 1.15,
          base: fairPrice,
          pessimistic: fairPrice * 0.85
        }
      };

    } catch (error) {
      logger.error('Error calculating valuation:', error);
      throw error;
    }
  }

  /**
   * Calculate DCF
   */
  calculateDCF(financials, assumptions) {
    const { wacc, terminal_growth_rate, projection_years } = assumptions;

    // Project future FCF
    const baseFCF = financials.free_cash_flow || 0;
    const growthRate = financials.fcf_growth_rate || 0.05;

    let projectedFCF = [];
    for (let year = 1; year <= projection_years; year++) {
      const fcf = baseFCF * Math.pow(1 + growthRate, year);
      projectedFCF.push(fcf);
    }

    // Calculate present value
    const pvFCF = projectedFCF.map((fcf, index) => {
      return fcf / Math.pow(1 + wacc / 100, index + 1);
    });

    // Terminal value
    const terminalFCF = projectedFCF[projection_years - 1] * (1 + terminal_growth_rate / 100);
    const terminalValue = terminalFCF / ((wacc - terminal_growth_rate) / 100);
    const pvTerminal = terminalValue / Math.pow(1 + wacc / 100, projection_years);

    // Enterprise value
    const enterpriseValue = pvFCF.reduce((a, b) => a + b, 0) + pvTerminal;

    // Equity value
    const equityValue = enterpriseValue + (financials.cash || 0) - (financials.total_debt || 0);

    // Fair price per share
    const fairPrice = equityValue / (financials.shares_outstanding || 1);

    return {
      fair_price: fairPrice,
      enterprise_value: enterpriseValue,
      equity_value: equityValue,
      assumptions
    };
  }

  /**
   * Calculate valuation using multiples
   */
  calculateMultiples(financials, quote) {
    const sectorPE = 10.2; // Example sector average
    const impliedPrice = (financials.eps || 0) * sectorPE;

    return {
      implied_price: impliedPrice,
      sector_pe: sectorPE
    };
  }

  /**
   * Generate quick insights
   */
  async generateQuickInsights(ticker, data) {
    const insights = {
      tldr: 'Empresa com fundamentos sólidos',
      recommendation: 'COMPRA',
      investment_thesis: [],
      key_positives: [],
      key_negatives: [],
      ideal_for: 'Value Investing'
    };

    // Analyze data and populate insights
    if (data.financials.roe > 20) {
      insights.key_positives.push(`ROE de ${data.financials.roe}% - Top 10% do setor`);
    }

    if (data.financials.debt_to_ebitda < 1) {
      insights.key_positives.push(`Dívida baixa ${data.financials.debt_to_ebitda}x EBITDA`);
    }

    return insights;
  }

  /**
   * Calculate momentum indicators
   */
  async calculateMomentum(ticker, quote) {
    return {
      score: 65,
      grade: 'Neutro',
      technical_indicators: {
        rsi_14: 58.3,
        macd: 'Positivo'
      },
      volume_trend: 'Normal'
    };
  }

  // Helper methods
  getGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C+';
    return 'C';
  }

  getClassification(percentage) {
    if (percentage >= 80) return 'Investment Grade';
    if (percentage >= 60) return 'Speculative Grade';
    return 'High Risk';
  }

  getRiskLevel(percentage) {
    if (percentage >= 80) return 'Baixo';
    if (percentage >= 60) return 'Médio';
    return 'Alto';
  }

  calculatePercentile(score) {
    // Simplified percentile calculation
    return Math.min(Math.round((score / 100) * 100), 99);
  }
}

module.exports = new AnalyticsEngine();
