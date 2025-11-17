const yahooService = require('./yahoo-service');

async function testITUB3() {
  console.log('\n🔍 TESTANDO DADOS REAIS DE ITUB3\n');
  console.log('='.repeat(80));
  
  try {
    const data = await yahooService.getCompleteData('ITUB3');
    
    console.log('\n📊 COTAÇÃO:');
    console.log(`   Preço: R$ ${data.quote.price?.toFixed(2)}`);
    console.log(`   Volume: ${data.quote.volume?.toLocaleString('pt-BR')}`);
    console.log(`   Market Cap: R$ ${(data.quote.market_cap / 1e9)?.toFixed(2)}B`);
    
    console.log('\n📈 INDICADORES FUNDAMENTALISTAS:');
    console.log(`   P/L: ${data.fundamentals.pe_ratio?.toFixed(2) || 'N/D'}`);
    console.log(`   P/VP: ${data.fundamentals.pb_ratio?.toFixed(2) || 'N/D'}`);
    console.log(`   Dividend Yield: ${data.fundamentals.dividend_yield?.toFixed(2)}%`);
    console.log(`   ROE: ${data.fundamentals.roe?.toFixed(2)}%`);
    console.log(`   Beta: ${data.fundamentals.beta?.toFixed(2) || 'N/D'}`);
    
    console.log('\n💰 MARGENS:');
    console.log(`   Margem Líquida: ${data.fundamentals.profit_margin?.toFixed(2)}%`);
    console.log(`   Margem EBITDA: ${data.fundamentals.ebitda_margin?.toFixed(2)}%`);
    
    console.log('\n📊 COMPARAÇÃO COM YAHOO FINANCE (REAL):');
    console.log('='.repeat(80));
    
    const yahooReal = {
      price: 33.73,
      pe_ratio: 8.63,
      pb_ratio: 1.7,
      dividend_yield: 8.40,
      roe: 22.7,
      beta: 0.31,
      market_cap: 376.4e9
    };
    
    console.log(`\n💰 Preço:`);
    console.log(`   Nossa API: R$ ${data.quote.price?.toFixed(2)}`);
    console.log(`   Yahoo Real: R$ ${yahooReal.price.toFixed(2)}`);
    const priceDiff = Math.abs(((data.quote.price - yahooReal.price) / yahooReal.price) * 100);
    console.log(`   Divergência: ${priceDiff.toFixed(2)}% ${priceDiff < 5 ? '✅' : '❌'}`);
    
    console.log(`\n📊 P/L:`);
    console.log(`   Nossa API: ${data.fundamentals.pe_ratio?.toFixed(2)}`);
    console.log(`   Yahoo Real: ${yahooReal.pe_ratio.toFixed(2)}`);
    const peDiff = Math.abs(((data.fundamentals.pe_ratio - yahooReal.pe_ratio) / yahooReal.pe_ratio) * 100);
    console.log(`   Divergência: ${peDiff.toFixed(2)}% ${peDiff < 5 ? '✅' : '❌'}`);
    
    console.log(`\n📊 P/VP:`);
    console.log(`   Nossa API: ${data.fundamentals.pb_ratio?.toFixed(2)}`);
    console.log(`   Yahoo Real: ${yahooReal.pb_ratio.toFixed(2)}`);
    const pbDiff = Math.abs(((data.fundamentals.pb_ratio - yahooReal.pb_ratio) / yahooReal.pb_ratio) * 100);
    console.log(`   Divergência: ${pbDiff.toFixed(2)}% ${pbDiff < 5 ? '✅' : '❌'}`);
    
    console.log(`\n💵 DIVIDEND YIELD:`);
    console.log(`   Nossa API: ${data.fundamentals.dividend_yield?.toFixed(2)}%`);
    console.log(`   Yahoo Real: ${yahooReal.dividend_yield.toFixed(2)}%`);
    const dyDiff = Math.abs(((data.fundamentals.dividend_yield - yahooReal.dividend_yield) / yahooReal.dividend_yield) * 100);
    console.log(`   Divergência: ${dyDiff.toFixed(2)}% ${dyDiff < 5 ? '✅' : dyDiff < 10 ? '⚠️' : '❌ CRÍTICO!'}`);
    
    console.log(`\n📈 ROE:`);
    console.log(`   Nossa API: ${data.fundamentals.roe?.toFixed(2)}%`);
    console.log(`   Yahoo Real: ${yahooReal.roe.toFixed(2)}%`);
    const roeDiff = Math.abs(((data.fundamentals.roe - yahooReal.roe) / yahooReal.roe) * 100);
    console.log(`   Divergência: ${roeDiff.toFixed(2)}% ${roeDiff < 5 ? '✅' : roeDiff < 10 ? '⚠️' : '❌'}`);
    
    console.log(`\n📊 BETA:`);
    console.log(`   Nossa API: ${data.fundamentals.beta?.toFixed(2) || 'N/D'}`);
    console.log(`   Yahoo Real: ${yahooReal.beta.toFixed(2)}`);
    if (data.fundamentals.beta) {
      const betaDiff = Math.abs(((data.fundamentals.beta - yahooReal.beta) / yahooReal.beta) * 100);
      console.log(`   Divergência: ${betaDiff.toFixed(2)}% ${betaDiff < 5 ? '✅' : betaDiff < 10 ? '⚠️' : '❌ CRÍTICO!'}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 RESUMO:');
    
    const errors = [];
    if (priceDiff >= 5) errors.push('Preço');
    if (peDiff >= 5) errors.push('P/L');
    if (pbDiff >= 5) errors.push('P/VP');
    if (dyDiff >= 10) errors.push('Dividend Yield');
    if (roeDiff >= 10) errors.push('ROE');
    if (data.fundamentals.beta && Math.abs(((data.fundamentals.beta - yahooReal.beta) / yahooReal.beta) * 100) >= 10) errors.push('Beta');
    
    if (errors.length === 0) {
      console.log('✅ TODOS OS DADOS ESTÃO CORRETOS!');
    } else {
      console.log(`❌ ERROS ENCONTRADOS EM: ${errors.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

testITUB3();
