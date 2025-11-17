const yahooFinance = require('yahoo-finance2').default;

async function debugDividend() {
  console.log('\n🔍 DEBUG: DIVIDEND YIELD DO ITUB3\n');
  console.log('='.repeat(80));
  
  try {
    const ticker = 'ITUB3.SA';
    
    // Buscar dados completos
    const quote = await yahooFinance.quote(ticker);
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'price']
    });
    
    console.log('\n📊 DADOS BRUTOS DO YAHOO FINANCE:');
    console.log('='.repeat(80));
    
    console.log('\n1️⃣ Quote (regularMarket):');
    console.log(`   dividendRate: ${quote.dividendRate}`);
    console.log(`   dividendYield: ${quote.dividendYield}`);
    console.log(`   trailingAnnualDividendRate: ${quote.trailingAnnualDividendRate}`);
    console.log(`   trailingAnnualDividendYield: ${quote.trailingAnnualDividendYield}`);
    
    console.log('\n2️⃣ SummaryDetail:');
    console.log(`   dividendRate: ${summary.summaryDetail?.dividendRate}`);
    console.log(`   dividendYield: ${summary.summaryDetail?.dividendYield}`);
    console.log(`   trailingAnnualDividendRate: ${summary.summaryDetail?.trailingAnnualDividendRate}`);
    console.log(`   trailingAnnualDividendYield: ${summary.summaryDetail?.trailingAnnualDividendYield}`);
    
    console.log('\n3️⃣ DefaultKeyStatistics:');
    console.log(`   lastDividendValue: ${summary.defaultKeyStatistics?.lastDividendValue}`);
    console.log(`   lastDividendDate: ${summary.defaultKeyStatistics?.lastDividendDate}`);
    
    console.log('\n4️⃣ Price:');
    console.log(`   regularMarketPrice: ${summary.price?.regularMarketPrice}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('\n🧮 CÁLCULOS:');
    console.log('='.repeat(80));
    
    const price = summary.price?.regularMarketPrice || quote.regularMarketPrice;
    const dividendRate = quote.trailingAnnualDividendRate || quote.dividendRate;
    const dividendYield = quote.trailingAnnualDividendYield || quote.dividendYield;
    
    console.log(`\n📊 Preço Atual: R$ ${price?.toFixed(2)}`);
    console.log(`💵 Dividend Rate (anual): R$ ${dividendRate?.toFixed(4)}`);
    console.log(`📈 Dividend Yield (Yahoo): ${dividendYield?.toFixed(6)}`);
    
    if (dividendRate && price) {
      const calculatedYield = (dividendRate / price) * 100;
      console.log(`\n🧮 Dividend Yield Calculado: ${calculatedYield.toFixed(2)}%`);
      console.log(`   Fórmula: (${dividendRate.toFixed(4)} / ${price.toFixed(2)}) × 100`);
    }
    
    if (dividendYield) {
      console.log(`\n📊 Dividend Yield do Yahoo (×100): ${(dividendYield * 100).toFixed(2)}%`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ VALOR CORRETO ESPERADO: 8.40%');
    console.log('❌ VALOR QUE ESTAMOS RETORNANDO: 0.64%');
    console.log('\n💡 SOLUÇÃO: Usar trailingAnnualDividendYield ao invés de dividendYield');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

debugDividend();
