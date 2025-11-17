const yahooFinance = require('yahoo-finance2').default;
const yahooService = require('./yahoo-service');
const brapiService = require('./brapi-service');

// Configuração
const TOLERANCE = 0.05; // 5% de tolerância
const TICKER_TEST = 'VALE3';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Função auxiliar para calcular divergência
function calculateDivergence(apiValue, realValue) {
  if (!apiValue || !realValue || realValue === 0) return null;
  return Math.abs((apiValue - realValue) / realValue);
}

// Função auxiliar para formatar status
function formatStatus(divergence, tolerance = TOLERANCE) {
  if (divergence === null) return `${colors.yellow}⚠️  N/D${colors.reset}`;
  if (divergence < tolerance) return `${colors.green}✅ OK${colors.reset}`;
  if (divergence < tolerance * 2) return `${colors.yellow}⚠️  ALERTA${colors.reset}`;
  return `${colors.red}❌ ERRO${colors.reset}`;
}

// Função principal de validação
async function validateAPI() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}🔍 VALIDAÇÃO COMPLETA DA API DE AÇÕES${colors.reset}`);
  console.log('='.repeat(80) + '\n');
  
  console.log(`${colors.blue}📋 Ticker:${colors.reset} ${TICKER_TEST}`);
  console.log(`${colors.blue}📅 Data:${colors.reset} ${new Date().toLocaleString('pt-BR')}`);
  console.log(`${colors.blue}🎯 Tolerância:${colors.reset} ${TOLERANCE * 100}%\n`);
  
  try {
    // 1. Buscar dados da nossa API
    console.log(`${colors.cyan}📊 Buscando dados da nossa API...${colors.reset}`);
    const apiData = await yahooService.getCompleteData(TICKER_TEST);
    
    // 2. Buscar dados do Yahoo Finance (referência)
    console.log(`${colors.cyan}📊 Buscando dados do Yahoo Finance (referência)...${colors.reset}\n`);
    const yahooTicker = `${TICKER_TEST}.SA`;
    const yahooQuote = await yahooFinance.quote(yahooTicker);
    const yahooSummary = await yahooFinance.quoteSummary(yahooTicker, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData']
    });
    
    // 3. Validar campos críticos
    console.log('='.repeat(80));
    console.log(`${colors.cyan}📈 VALIDAÇÃO DE CAMPOS CRÍTICOS${colors.reset}`);
    console.log('='.repeat(80) + '\n');
    
    const validations = [];
    
    // PREÇO ATUAL
    const priceDivergence = calculateDivergence(apiData.quote.price, yahooQuote.regularMarketPrice);
    validations.push({
      field: 'Preço Atual',
      apiValue: `R$ ${apiData.quote.price?.toFixed(2) || 'N/D'}`,
      realValue: `R$ ${yahooQuote.regularMarketPrice?.toFixed(2) || 'N/D'}`,
      divergence: priceDivergence,
      status: formatStatus(priceDivergence),
      critical: true
    });
    
    // P/L
    const peDivergence = calculateDivergence(
      apiData.fundamentals.pe_ratio,
      yahooSummary.summaryDetail?.trailingPE || yahooSummary.defaultKeyStatistics?.trailingPE
    );
    validations.push({
      field: 'P/L (Price to Earnings)',
      apiValue: apiData.fundamentals.pe_ratio?.toFixed(2) || 'N/D',
      realValue: (yahooSummary.summaryDetail?.trailingPE || yahooSummary.defaultKeyStatistics?.trailingPE)?.toFixed(2) || 'N/D',
      divergence: peDivergence,
      status: formatStatus(peDivergence),
      critical: true
    });
    
    // P/VP
    const pbDivergence = calculateDivergence(
      apiData.fundamentals.pb_ratio,
      yahooSummary.defaultKeyStatistics?.priceToBook
    );
    validations.push({
      field: 'P/VP (Price to Book)',
      apiValue: apiData.fundamentals.pb_ratio?.toFixed(2) || 'N/D',
      realValue: yahooSummary.defaultKeyStatistics?.priceToBook?.toFixed(2) || 'N/D',
      divergence: pbDivergence,
      status: formatStatus(pbDivergence),
      critical: true
    });
    
    // ROE
    const roeDivergence = calculateDivergence(
      apiData.fundamentals.roe,
      (yahooSummary.financialData?.returnOnEquity || 0) * 100
    );
    validations.push({
      field: 'ROE (Return on Equity)',
      apiValue: apiData.fundamentals.roe ? `${apiData.fundamentals.roe.toFixed(2)}%` : 'N/D',
      realValue: yahooSummary.financialData?.returnOnEquity ? `${(yahooSummary.financialData.returnOnEquity * 100).toFixed(2)}%` : 'N/D',
      divergence: roeDivergence,
      status: formatStatus(roeDivergence),
      critical: true
    });
    
    // MARGEM LÍQUIDA
    const marginDivergence = calculateDivergence(
      apiData.fundamentals.profit_margin,
      (yahooSummary.financialData?.profitMargins || 0) * 100
    );
    validations.push({
      field: 'Margem Líquida',
      apiValue: apiData.fundamentals.profit_margin ? `${apiData.fundamentals.profit_margin.toFixed(2)}%` : 'N/D',
      realValue: yahooSummary.financialData?.profitMargins ? `${(yahooSummary.financialData.profitMargins * 100).toFixed(2)}%` : 'N/D',
      divergence: marginDivergence,
      status: formatStatus(marginDivergence),
      critical: true
    });
    
    // DIVIDEND YIELD
    const dyDivergence = calculateDivergence(
      apiData.fundamentals.dividend_yield,
      (yahooSummary.summaryDetail?.dividendYield || 0) * 100
    );
    validations.push({
      field: 'Dividend Yield',
      apiValue: apiData.fundamentals.dividend_yield ? `${apiData.fundamentals.dividend_yield.toFixed(2)}%` : 'N/D',
      realValue: yahooSummary.summaryDetail?.dividendYield ? `${(yahooSummary.summaryDetail.dividendYield * 100).toFixed(2)}%` : 'N/D',
      divergence: dyDivergence,
      status: formatStatus(dyDivergence),
      critical: false
    });
    
    // VOLUME
    const volumeDivergence = calculateDivergence(apiData.quote.volume, yahooQuote.regularMarketVolume);
    validations.push({
      field: 'Volume',
      apiValue: apiData.quote.volume?.toLocaleString('pt-BR') || 'N/D',
      realValue: yahooQuote.regularMarketVolume?.toLocaleString('pt-BR') || 'N/D',
      divergence: volumeDivergence,
      status: formatStatus(volumeDivergence),
      critical: false
    });
    
    // Imprimir tabela de validações
    console.log('┌' + '─'.repeat(78) + '┐');
    console.log(`│ ${'Campo'.padEnd(25)} │ ${'API'.padEnd(15)} │ ${'Yahoo'.padEnd(15)} │ ${'Status'.padEnd(15)} │`);
    console.log('├' + '─'.repeat(78) + '┤');
    
    validations.forEach(v => {
      const divergenceStr = v.divergence !== null ? `${(v.divergence * 100).toFixed(1)}%` : 'N/D';
      console.log(`│ ${v.field.padEnd(25)} │ ${v.apiValue.toString().padEnd(15)} │ ${v.realValue.toString().padEnd(15)} │ ${divergenceStr.padEnd(8)} ${v.status.padEnd(7)} │`);
    });
    
    console.log('└' + '─'.repeat(78) + '┘\n');
    
    // 4. Resumo Executivo
    console.log('='.repeat(80));
    console.log(`${colors.cyan}📊 RESUMO EXECUTIVO${colors.reset}`);
    console.log('='.repeat(80) + '\n');
    
    const totalFields = validations.length;
    const okFields = validations.filter(v => v.divergence !== null && v.divergence < TOLERANCE).length;
    const warningFields = validations.filter(v => v.divergence !== null && v.divergence >= TOLERANCE && v.divergence < TOLERANCE * 2).length;
    const errorFields = validations.filter(v => v.divergence !== null && v.divergence >= TOLERANCE * 2).length;
    const naFields = validations.filter(v => v.divergence === null).length;
    
    console.log(`${colors.green}✅ Campos Corretos:${colors.reset} ${okFields}/${totalFields} (${((okFields/totalFields)*100).toFixed(1)}%)`);
    console.log(`${colors.yellow}⚠️  Pequenas Divergências:${colors.reset} ${warningFields}/${totalFields} (${((warningFields/totalFields)*100).toFixed(1)}%)`);
    console.log(`${colors.red}❌ Erros Críticos:${colors.reset} ${errorFields}/${totalFields} (${((errorFields/totalFields)*100).toFixed(1)}%)`);
    console.log(`${colors.yellow}🚫 Campos N/D:${colors.reset} ${naFields}/${totalFields} (${((naFields/totalFields)*100).toFixed(1)}%)\n`);
    
    // 5. Erros Críticos
    const criticalErrors = validations.filter(v => v.critical && v.divergence !== null && v.divergence >= TOLERANCE);
    
    if (criticalErrors.length > 0) {
      console.log('='.repeat(80));
      console.log(`${colors.red}❌ ERROS CRÍTICOS IDENTIFICADOS${colors.reset}`);
      console.log('='.repeat(80) + '\n');
      
      criticalErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${colors.red}${error.field}${colors.reset}`);
        console.log(`   Valor API: ${error.apiValue}`);
        console.log(`   Valor Real: ${error.realValue}`);
        console.log(`   Divergência: ${(error.divergence * 100).toFixed(2)}%`);
        console.log(`   Impacto: ${colors.red}CRÍTICO${colors.reset}\n`);
      });
    }
    
    // 6. Conclusão
    console.log('='.repeat(80));
    console.log(`${colors.cyan}🎯 CONCLUSÃO${colors.reset}`);
    console.log('='.repeat(80) + '\n');
    
    if (errorFields === 0 && okFields >= totalFields * 0.7) {
      console.log(`${colors.green}✅ API APROVADA PARA PRODUÇÃO!${colors.reset}`);
      console.log(`${colors.green}   Todos os campos críticos estão dentro da tolerância.${colors.reset}\n`);
      return true;
    } else if (errorFields > 0) {
      console.log(`${colors.red}❌ API NÃO APROVADA PARA PRODUÇÃO!${colors.reset}`);
      console.log(`${colors.red}   ${errorFields} campo(s) com erros críticos detectados.${colors.reset}`);
      console.log(`${colors.red}   Corrija os erros antes de colocar em produção.${colors.reset}\n`);
      return false;
    } else {
      console.log(`${colors.yellow}⚠️  API PARCIALMENTE APROVADA${colors.reset}`);
      console.log(`${colors.yellow}   Alguns campos estão com pequenas divergências.${colors.reset}`);
      console.log(`${colors.yellow}   Recomenda-se revisão antes de produção.${colors.reset}\n`);
      return false;
    }
    
  } catch (error) {
    console.error(`\n${colors.red}❌ ERRO FATAL NA VALIDAÇÃO:${colors.reset}`, error.message);
    console.error(error.stack);
    return false;
  }
}

// Executar validação
if (require.main === module) {
  validateAPI()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { validateAPI };
