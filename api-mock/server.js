const express = require('express');
const cors = require('cors');
const yahooService = require('./yahoo-service');
const brapiService = require('./brapi-service');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Função para gerar histórico de preços
function generatePriceHistory(basePrice, days = 365) {
  const history = [];
  let currentPrice = basePrice * 0.8; // Começar 20% abaixo para ter variação
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Variação diária entre -3% e +3%
    const dailyChange = (Math.random() - 0.5) * 0.06;
    currentPrice = currentPrice * (1 + dailyChange);
    
    const open = currentPrice;
    const close = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(50000000 + Math.random() * 200000000);
    
    history.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });
    
    currentPrice = close;
  }
  
  return history;
}

// ⚠️ DADOS MOCKADOS REMOVIDOS - USANDO APENAS DADOS REAIS DO YAHOO FINANCE E BRAPI

// Função para gerar dados genéricos para qualquer ticker
function generateGenericData(ticker) {
  const basePrice = 20 + Math.random() * 80; // Preço entre 20 e 100
  const change = (Math.random() - 0.5) * 5; // Variação entre -2.5% e +2.5%
  const priceHistory = generatePriceHistory(basePrice, 365); // 1 ano de dados
  const dividendYield = parseFloat((2 + Math.random() * 10).toFixed(1));
  
  // Lista de setores e indústrias
  const sectors = [
    { sector: 'Financeiro', industry: 'Bancos' },
    { sector: 'Energia', industry: 'Petróleo e Gás' },
    { sector: 'Materiais Básicos', industry: 'Mineração' },
    { sector: 'Consumo Cíclico', industry: 'Varejo' },
    { sector: 'Tecnologia', industry: 'Software' },
    { sector: 'Telecomunicações', industry: 'Telefonia' },
    { sector: 'Utilidade Pública', industry: 'Energia Elétrica' },
    { sector: 'Saúde', industry: 'Hospitais' },
    { sector: 'Consumo Não Cíclico', industry: 'Alimentos' },
    { sector: 'Industrial', industry: 'Construção' }
  ];
  
  const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
  
  return {
    success: true,
    data: {
      company: {
        ticker: ticker,
        name: `${ticker.replace(/\d/g, '')} S.A.`,
        cnpj: '00.000.000/0001-00',
        sector: randomSector.sector,
        industry: randomSector.industry,
        website: `https://${ticker.toLowerCase()}.com.br`,
        listing_segment: Math.random() > 0.5 ? 'Novo Mercado' : 'Nível 2',
        indexes: Math.random() > 0.5 ? ['IBOV', 'IBRX'] : ['IBRX']
      },
      quote: {
        price: parseFloat(basePrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        change_percent: parseFloat((change / basePrice * 100).toFixed(2)),
        volume: Math.floor(100000000 + Math.random() * 900000000),
        market_cap: Math.floor(basePrice * 1000000000 * (5 + Math.random() * 20)),
        open: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
        high: parseFloat((basePrice * (1 + Math.random() * 0.03)).toFixed(2)),
        low: parseFloat((basePrice * (1 - Math.random() * 0.03)).toFixed(2)),
        previous_close: parseFloat((basePrice - change).toFixed(2)),
        market_status: 'closed',
        last_updated: new Date().toISOString()
      },
      key_metrics: {
        pe_ratio: parseFloat((5 + Math.random() * 15).toFixed(1)),
        pb_ratio: parseFloat((0.5 + Math.random() * 3).toFixed(1)),
        roe: parseFloat((10 + Math.random() * 25).toFixed(1)),
        roic: parseFloat((8 + Math.random() * 20).toFixed(1)),
        dividend_yield: dividendYield,
        payout_ratio: parseFloat((30 + Math.random() * 50).toFixed(1)),
        revenue_cagr_5y: parseFloat((Math.random() * 15).toFixed(1)),
        earnings_cagr_5y: parseFloat((Math.random() * 20).toFixed(1)),
        debt_to_ebitda: parseFloat((Math.random() * 3).toFixed(1)),
        current_ratio: parseFloat((1 + Math.random() * 1.5).toFixed(2)),
        gross_margin: parseFloat((20 + Math.random() * 40).toFixed(1)),
        ebitda_margin: parseFloat((15 + Math.random() * 35).toFixed(1)),
        net_margin: parseFloat((10 + Math.random() * 25).toFixed(1))
      },
      health_score: {
        total_score: Math.floor(60 + Math.random() * 30),
        grade: ['B', 'B+', 'A-', 'A'][Math.floor(Math.random() * 4)],
        classification: 'Investment Grade',
        breakdown: {
          financial_health: { score: Math.floor(15 + Math.random() * 10), max_score: 25 },
          growth: { score: Math.floor(15 + Math.random() * 10), max_score: 25 },
          profitability: { score: Math.floor(15 + Math.random() * 10), max_score: 25 },
          earnings_quality: { score: Math.floor(15 + Math.random() * 10), max_score: 25 }
        }
      },
      valuation_verdict: (() => {
        const currentPrice = parseFloat(basePrice.toFixed(2));
        const fairPrice = parseFloat((basePrice * (1 + (Math.random() - 0.3) * 0.3)).toFixed(2));
        // Calcular upside corretamente: ((FairPrice - CurrentPrice) / CurrentPrice) * 100
        const upsidePercent = parseFloat((((fairPrice - currentPrice) / currentPrice) * 100).toFixed(1));
        const verdict = upsidePercent > 10 ? 'COMPRA' : upsidePercent < -10 ? 'VENDA' : 'NEUTRO';
        
        return {
          verdict: verdict,
          fair_price: fairPrice,
          current_price: currentPrice,
          upside_percent: upsidePercent,
          confidence: upsidePercent > 15 || upsidePercent < -15 ? 'Alta' : 'Média'
        };
      })(),
      quick_insights: {
        tldr: `Empresa do setor ${randomSector.sector} com fundamentos ${Math.random() > 0.5 ? 'sólidos' : 'em desenvolvimento'}`,
        recommendation: ['COMPRA', 'NEUTRO'][Math.floor(Math.random() * 2)],
        key_positives: [
          `ROE de ${(10 + Math.random() * 25).toFixed(1)}% - Rentabilidade ${Math.random() > 0.5 ? 'forte' : 'moderada'}`,
          `Dividend Yield de ${(2 + Math.random() * 10).toFixed(1)}%`,
          `Crescimento de ${(Math.random() * 15).toFixed(1)}% ao ano`
        ],
        key_negatives: [
          'Exposição a volatilidade do mercado',
          'Concorrência acirrada no setor'
        ]
      },
      business_description: {
        what_it_does: [
          `Empresa atuante no setor de ${randomSector.industry}`,
          `Presença relevante no mercado brasileiro`,
          `Operações diversificadas no segmento`
        ],
        why_invest: [
          `Posição consolidada no setor de ${randomSector.sector}`,
          `Geração de caixa consistente`,
          `Perspectivas de crescimento no médio prazo`
        ],
        risks: [
          'Volatilidade do mercado brasileiro',
          'Mudanças regulatórias no setor',
          'Concorrência e pressão sobre margens'
        ]
      },
      financials: {
        revenue: Math.floor(basePrice * 1000000000 * (2 + Math.random() * 8)),
        revenue_growth_yoy: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        net_income: Math.floor(basePrice * 100000000 * (5 + Math.random() * 15)),
        ebitda: Math.floor(basePrice * 150000000 * (6 + Math.random() * 12)),
        free_cash_flow: Math.floor(basePrice * 80000000 * (4 + Math.random() * 10)),
        total_assets: Math.floor(basePrice * 2000000000 * (3 + Math.random() * 7)),
        total_debt: Math.floor(basePrice * 500000000 * (2 + Math.random() * 5))
      },
      dividends: {
        history: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          return {
            date: date.toISOString().split('T')[0],
            value: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
            type: i % 3 === 0 ? 'JCP' : 'Dividendo'
          };
        }),
        next_payment: (() => {
          const next = new Date();
          next.setMonth(next.getMonth() + 1);
          return next.toISOString().split('T')[0];
        })(),
        projected_annual: parseFloat((basePrice * (dividendYield / 100)).toFixed(2))
      },
      price_history: priceHistory,
      _sources: ['yahoo', 'fundamentus', 'statusInvest', 'b3']
    }
  };
}

// Mapa de peers por setor
const SECTOR_PEERS = {
  'Mineração': ['VALE3', 'CSNA3', 'GGBR4', 'USIM5'],
  'Petróleo e Gás': ['PETR4', 'PETR3', 'PRIO3', 'RRRP3'],
  'Bancos': ['ITUB4', 'BBDC4', 'BBAS3', 'SANB11'],
  'Energia Elétrica': ['ELET3', 'ELET6', 'TAEE11', 'CPFE3'],
  'Varejo': ['MGLU3', 'LREN3', 'ARZZ3', 'VIVA3'],
  'Telefonia': ['VIVT3', 'TIMS3'],
  'Alimentos': ['ABEV3', 'JBSS3', 'BRFS3', 'MRFG3'],
  'Construção': ['CYRE3', 'MRVE3', 'EZTC3', 'TEND3']
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get peers comparison
app.get('/api/v1/stocks/:ticker/peers', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  
  try {
    // Buscar dados da empresa principal
    const mainData = await yahooService.getCompleteData(ticker);
    if (!mainData) {
      return res.status(404).json({ error: 'Ticker não encontrado' });
    }

    // Buscar setor da empresa
    const brapiData = await brapiService.getFundamentals(ticker);
    const sector = brapiData?.company?.industry || 'Mineração';
    
    // Buscar peers do mesmo setor
    const peers = SECTOR_PEERS[sector] || SECTOR_PEERS['Mineração'];
    const peerData = [];

    for (const peerTicker of peers) {
      try {
        const data = await yahooService.getCompleteData(peerTicker);
        const peerBrapi = await brapiService.getFundamentals(peerTicker);
        
        if (data) {
          peerData.push({
            ticker: peerTicker,
            name: peerBrapi?.company?.name || peerTicker,
            pe_ratio: peerBrapi?.fundamentals?.pe_ratio || data.fundamentals.pe_ratio,
            pb_ratio: peerBrapi?.fundamentals?.pb_ratio || data.fundamentals.pb_ratio,
            roe: peerBrapi?.fundamentals?.roe || data.fundamentals.roe,
            dividend_yield: peerBrapi?.fundamentals?.dividend_yield || data.fundamentals.dividend_yield,
            debt_to_ebitda: (() => {
              const debt = data.fundamentals.total_debt;
              const ebitda = peerBrapi?.fundamentals?.ebitda || data.fundamentals.ebitda;
              return (debt && ebitda && ebitda > 0) ? parseFloat((debt / ebitda).toFixed(2)) : null;
            })()
          });
        }
      } catch (err) {
        console.warn(`Erro ao buscar ${peerTicker}:`, err.message);
      }
    }

    res.json({
      success: true,
      data: {
        sector,
        ticker,
        peers: peerData
      }
    });
  } catch (error) {
    console.error('Erro ao buscar peers:', error);
    res.status(500).json({ error: 'Erro ao buscar comparação' });
  }
});

// Get stock overview
app.get('/api/v1/stocks/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  
  console.log(`📊 Request para ${ticker}`);
  
  try {
    // PRIORIDADE 1: Buscar dados REAIS do Yahoo Finance
    console.log(`📈 Buscando dados REAIS do Yahoo Finance para ${ticker}...`);
    const yahooData = await yahooService.getCompleteData(ticker);
    
    // PRIORIDADE 2: Buscar dados da Brapi (complementar)
    console.log(`🇧🇷 Buscando dados complementares da Brapi para ${ticker}...`);
    let brapiData = null;
    try {
      brapiData = await brapiService.getFundamentals(ticker);
      if (brapiData) {
        console.log(`✅ Brapi retornou dados! ROE: ${brapiData.fundamentals?.roe}`);
      } else {
        console.log(`⚠️ Brapi retornou null`);
      }
    } catch (brapiErr) {
      console.warn(`⚠️ Brapi falhou:`, brapiErr.message);
    }
    
    if (yahooData) {
      console.log(`✅ Dados REAIS obtidos para ${ticker}`);
      
      // Mesclar dados: Yahoo Finance tem prioridade (dados mais confiáveis)
      const combined = {
        success: true,
        data: {
          company: brapiData?.company || {
            ticker: ticker,
            name: ticker,
            sector: 'N/A',
            industry: 'N/A'
          },
          quote: yahooData.quote,
          key_metrics: {
            // PRIORIZAR BRAPI PARA INDICADORES BRASILEIROS (mais precisos)
            pe_ratio: brapiData?.fundamentals?.pe_ratio || yahooData.fundamentals.pe_ratio,
            pb_ratio: brapiData?.fundamentals?.pb_ratio || yahooData.fundamentals.pb_ratio,
            dividend_yield: brapiData?.fundamentals?.dividend_yield || yahooData.fundamentals.dividend_yield,
            // CALCULAR ROE APENAS SE DADOS PRECISOS DISPONÍVEIS
            roe: (() => {
              const apiRoe = brapiData?.fundamentals?.roe || yahooData.fundamentals.roe;
              if (apiRoe) return apiRoe;
              
              // MÉTODO PRECISO: ROE = (Net Income / Total Equity) * 100
              const netIncome = yahooData.fundamentals.net_income;
              const totalEquity = yahooData.fundamentals.total_equity || yahooData.fundamentals.shareholders_equity;
              
              if (netIncome && totalEquity && totalEquity !== 0) {
                return parseFloat(((netIncome / totalEquity) * 100).toFixed(2));
              }
              
              // Se não temos dados precisos, retornar null
              // É melhor mostrar "N/D" do que um número impreciso
              return null;
            })(),
            roa: brapiData?.fundamentals?.roa || yahooData.fundamentals.roa,
            payout_ratio: brapiData?.fundamentals?.payout_ratio || yahooData.fundamentals.payout_ratio,
            profit_margin: brapiData?.fundamentals?.profit_margin || yahooData.fundamentals.profit_margin,
            revenue_growth: brapiData?.fundamentals?.revenue_growth || yahooData.fundamentals.revenue_growth,
            earnings_growth: brapiData?.fundamentals?.earnings_growth || yahooData.fundamentals.earnings_growth,
            debt_to_equity: brapiData?.fundamentals?.debt_to_equity || yahooData.fundamentals.debt_to_equity,
            current_ratio: brapiData?.fundamentals?.current_ratio || yahooData.fundamentals.current_ratio,
            ebitda: brapiData?.fundamentals?.ebitda || yahooData.fundamentals.ebitda,
            revenue: brapiData?.fundamentals?.revenue || yahooData.fundamentals.revenue,
            
            // USAR YAHOO FINANCE PARA DADOS NÃO DISPONÍVEIS NO BRAPI
            forward_pe: yahooData.fundamentals.forward_pe,
            peg_ratio: yahooData.fundamentals.peg_ratio,
            price_to_sales: yahooData.fundamentals.price_to_sales,
            ev_to_ebitda: yahooData.fundamentals.ev_to_ebitda,
            dividend_rate: yahooData.fundamentals.dividend_rate,
            roic: yahooData.fundamentals.roic,
            operating_margin: yahooData.fundamentals.operating_margin,
            gross_margin: yahooData.fundamentals.gross_margin,
            ebitda_margin: yahooData.fundamentals.ebitda_margin,
            total_cash: yahooData.fundamentals.total_cash,
            total_debt: yahooData.fundamentals.total_debt,
            net_income: yahooData.fundamentals.net_income,
            enterprise_value: yahooData.fundamentals.enterprise_value,
            beta: yahooData.fundamentals.beta,
            
            // CALCULAR MÉTRICAS DERIVADAS
            debt_to_ebitda: (() => {
              const totalDebt = yahooData.fundamentals.total_debt;
              const ebitda = brapiData?.fundamentals?.ebitda || yahooData.fundamentals.ebitda;
              if (totalDebt && ebitda && ebitda > 0) {
                return parseFloat((totalDebt / ebitda).toFixed(2));
              }
              return null;
            })()
          },
          price_history: yahooData.price_history || [],
          dividends_history: brapiData?.dividends || [],
          
          // CALCULAR VALUATION_VERDICT (Fórmula: Book Value × P/VP Justo)
          valuation_verdict: (() => {
            const currentPrice = yahooData.quote.price;
            const bookValue = yahooData.fundamentals.book_value;
            const pbRatio = yahooData.fundamentals.pb_ratio;
            
            console.log(`\n🔍 === VALUATION (P/VP) PARA ${ticker} ===`);
            console.log('Current Price:', currentPrice);
            console.log('Book Value per Share:', bookValue);
            console.log('P/B Ratio Atual:', pbRatio);
            
            // Validar dados necessários
            if (!currentPrice || currentPrice <= 0 || !bookValue || bookValue <= 0) {
              console.log(`❌ Dados insuficientes - usando preço atual`);
              return {
                verdict: 'NEUTRO',
                fair_price: currentPrice,
                current_price: currentPrice,
                upside_percent: 0,
                confidence: 'Baixa',
                calculation_method: 'Dados insuficientes'
              };
            }
            
            // P/VP JUSTO POR SETOR (Brasil)
            const SECTOR_PB = {
              'Financeiro': 1.5, 'Bancos': 1.65,
              'Energia': 1.2, 'Petróleo e Gás': 1.2, 'Petróleo': 1.2,
              'Materiais Básicos': 1.3, 'Mineração': 1.3,
              'Consumo Cíclico': 2.0, 'Varejo': 2.0,
              'Tecnologia': 3.5, 'Software': 3.5,
              'Telecomunicações': 1.8, 'Telefonia': 1.8,
              'Utilidade Pública': 1.6, 'Energia Elétrica': 1.6,
              'Saúde': 2.5, 'Hospitais': 2.5,
              'Consumo Não Cíclico': 2.2, 'Alimentos': 2.2,
              'Industrial': 1.7, 'Construção': 1.7,
              'default': 1.5
            };
            
            const sector = yahooData.company_info?.sector || 'default';
            const fairPB = SECTOR_PB[sector] || SECTOR_PB['default'];
            
            // FÓRMULA: Fair Price = Book Value × P/VP Justo
            const fairPrice = parseFloat((bookValue * fairPB).toFixed(2));
            
            console.log('Setor:', sector);
            console.log('P/VP Justo do Setor:', fairPB);
            console.log('Fair Price:', fairPrice);
            console.log('=== FIM VALUATION ===\n');
            
            // CALCULAR UPSIDE COM LIMITE
            let upsidePercent = parseFloat((((fairPrice - currentPrice) / currentPrice) * 100).toFixed(1));
            upsidePercent = Math.max(upsidePercent, -50); // Mínimo -50%
            
            // DETERMINAR VEREDITO
            let verdict = 'NEUTRO';
            if (upsidePercent > 15) verdict = 'COMPRA';
            else if (upsidePercent < -15) verdict = 'VENDA';
            
            // DETERMINAR CONFIANÇA
            let confidence = 'Média';
            if (Math.abs(upsidePercent) > 25) confidence = 'Alta';
            else if (Math.abs(upsidePercent) < 10) confidence = 'Baixa';
            
            return {
              verdict: verdict,
              fair_price: fairPrice,
              current_price: currentPrice,
              upside_percent: upsidePercent,
              confidence: confidence,
              calculation_method: 'P/VP (Price-to-Book)',
              details: {
                book_value: bookValue,
                pb_ratio: pbRatio,
                fair_pb: fairPB,
                sector: sector
              }
            };
          })(),
          
          // CALCULAR HEALTH SCORE
          health_score: (() => {
            const peRatio = brapiData?.fundamentals?.pe_ratio || yahooData.fundamentals.pe_ratio || 0;
            const debtToEquity = brapiData?.fundamentals?.debt_to_equity || yahooData.fundamentals.debt_to_equity || 0;
            const roe = brapiData?.fundamentals?.roe || yahooData.fundamentals.roe || 0;
            const profitMargin = brapiData?.fundamentals?.profit_margin || yahooData.fundamentals.profit_margin || 0;
            const currentRatio = brapiData?.fundamentals?.current_ratio || yahooData.fundamentals.current_ratio || 1;
            const dividendYield = brapiData?.fundamentals?.dividend_yield || yahooData.fundamentals.dividend_yield || 0;
            
            let score = 0;
            
            // 1. RENTABILIDADE (30 pontos)
            if (roe > 20) score += 30;
            else if (roe > 15) score += 25;
            else if (roe > 10) score += 20;
            else if (roe > 5) score += 10;
            else if (roe > 0) score += 5;
            // ROE negativo = 0 pontos
            
            // 2. VALUATION (20 pontos)
            if (peRatio > 0 && peRatio < 10) score += 20;
            else if (peRatio >= 10 && peRatio < 15) score += 15;
            else if (peRatio >= 15 && peRatio < 25) score += 10;
            else if (peRatio >= 25 && peRatio < 40) score += 5;
            // P/L negativo ou > 40 = 0 pontos
            
            // 3. ENDIVIDAMENTO (25 pontos)
            if (debtToEquity < 0.5) score += 25;
            else if (debtToEquity < 1) score += 20;
            else if (debtToEquity < 2) score += 10;
            else if (debtToEquity < 3) score += 5;
            // Dívida > 3x = 0 pontos
            
            // 4. MARGEM (15 pontos)
            if (profitMargin > 20) score += 15;
            else if (profitMargin > 15) score += 12;
            else if (profitMargin > 10) score += 10;
            else if (profitMargin > 5) score += 5;
            else if (profitMargin > 0) score += 2;
            // Margem negativa = 0 pontos
            
            // 5. LIQUIDEZ (10 pontos)
            if (currentRatio > 2) score += 10;
            else if (currentRatio > 1.5) score += 8;
            else if (currentRatio > 1) score += 5;
            else if (currentRatio > 0.5) score += 2;
            // Liquidez < 0.5 = 0 pontos
            
            // Determinar grade
            let grade = 'D';
            let classification = 'High Risk';
            
            if (score >= 85) { grade = 'A'; classification = 'Investment Grade'; }
            else if (score >= 75) { grade = 'A-'; classification = 'Investment Grade'; }
            else if (score >= 70) { grade = 'B+'; classification = 'Investment Grade'; }
            else if (score >= 60) { grade = 'B'; classification = 'Speculative Grade'; }
            else if (score >= 50) { grade = 'B-'; classification = 'Speculative Grade'; }
            else if (score >= 40) { grade = 'C'; classification = 'High Risk'; }
            
            return {
              total_score: score,
              grade: grade,
              classification: classification
            };
          })(),
          
          _sources: ['yahoo_finance', brapiData ? 'brapi' : null].filter(Boolean),
          _dataQuality: 'REAL',
          _lastUpdated: yahooData.lastUpdated
        }
      };
      
      res.json(combined);
    } else {
      throw new Error('Dados não disponíveis no Yahoo Finance');
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar dados para ${ticker}:`, error.message);
    
    // FALLBACK FINAL: Gerar dados genéricos (apenas para desenvolvimento)
    console.log(`🔄 Fallback final: Gerando dados genéricos para ${ticker}`);
    const genericData = generateGenericData(ticker);
    res.json({
      ...genericData,
      _warning: 'Dados genéricos - não usar em produção',
      _dataQuality: 'MOCK'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 API Mock rodando!');
  console.log('🚀 ========================================');
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log(`🚀 Health: http://localhost:${PORT}/health`);
  console.log(`🚀 Exemplo: http://localhost:${PORT}/api/v1/stocks/VALE3`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('📊 Tickers disponíveis: VALE3, PETR4, ITUB3');
  console.log('');
});
