const yahooService = require('./yahoo-service');

async function testPETR4() {
  console.log('\n🔍 TESTANDO DADOS REAIS DE PETR4\n');
  console.log('='.repeat(80));
  
  try {
    const data = await yahooService.getCompleteData('PETR4');
    
    console.log('\n📊 COTAÇÃO:');
    console.log(`   Preço: R$ ${data.quote.price?.toFixed(2)}`);
    console.log(`   Abertura: R$ ${data.quote.open?.toFixed(2)}`);
    console.log(`   Máxima: R$ ${data.quote.high?.toFixed(2)}`);
    console.log(`   Mínima: R$ ${data.quote.low?.toFixed(2)}`);
    console.log(`   Volume: ${data.quote.volume?.toLocaleString('pt-BR')}`);
    
    console.log('\n📈 INDICADORES FUNDAMENTALISTAS:');
    console.log(`   P/L: ${data.fundamentals.pe_ratio?.toFixed(2) || 'N/D'}`);
    console.log(`   P/VP: ${data.fundamentals.pb_ratio?.toFixed(2) || 'N/D'}`);
    console.log(`   Dividend Yield: ${data.fundamentals.dividend_yield?.toFixed(2)}%`);
    console.log(`   ROE: ${data.fundamentals.roe?.toFixed(2)}%`);
    console.log(`   ROA: ${data.fundamentals.roa?.toFixed(2)}%`);
    console.log(`   ROIC: ${data.fundamentals.roic?.toFixed(2)}%`);
    
    console.log('\n💰 MARGENS:');
    console.log(`   Margem Líquida: ${data.fundamentals.profit_margin?.toFixed(2)}%`);
    console.log(`   Margem EBITDA: ${data.fundamentals.ebitda_margin?.toFixed(2)}%`);
    console.log(`   Margem Bruta: ${data.fundamentals.gross_margin?.toFixed(2)}%`);
    console.log(`   Margem Operacional: ${data.fundamentals.operating_margin?.toFixed(2)}%`);
    
    console.log('\n🏦 BALANÇO:');
    console.log(`   Dívida/Patrimônio: ${data.fundamentals.debt_to_equity?.toFixed(2) || 'N/D'}`);
    console.log(`   Liquidez Corrente: ${data.fundamentals.current_ratio?.toFixed(2) || 'N/D'}`);
    console.log(`   Caixa Total: R$ ${(data.fundamentals.total_cash / 1e9)?.toFixed(2)}B`);
    console.log(`   Dívida Total: R$ ${(data.fundamentals.total_debt / 1e9)?.toFixed(2)}B`);
    
    console.log('\n📊 CRESCIMENTO:');
    console.log(`   Crescimento Receita: ${data.fundamentals.revenue_growth?.toFixed(2)}%`);
    console.log(`   Crescimento Lucro: ${data.fundamentals.earnings_growth?.toFixed(2)}%`);
    
    console.log('\n✅ DADOS OBTIDOS COM SUCESSO!');
    console.log('='.repeat(80));
    
    // Comparar com os valores esperados do Status Invest
    console.log('\n📋 COMPARAÇÃO COM STATUS INVEST (outubro 2025):');
    console.log('='.repeat(80));
    
    const statusInvestData = {
      pe_ratio: 5.01,
      pb_ratio: 0.97,
      dividend_yield: 17.41,
      roe: 19.38,
      ebitda_margin: 52.8,
      net_margin: 28.3
    };
    
    console.log(`\nP/L:`);
    console.log(`   Status Invest: ${statusInvestData.pe_ratio}`);
    console.log(`   Yahoo Finance: ${data.fundamentals.pe_ratio?.toFixed(2)}`);
    console.log(`   Divergência: ${Math.abs(((data.fundamentals.pe_ratio - statusInvestData.pe_ratio) / statusInvestData.pe_ratio) * 100).toFixed(2)}%`);
    
    console.log(`\nP/VP:`);
    console.log(`   Status Invest: ${statusInvestData.pb_ratio}`);
    console.log(`   Yahoo Finance: ${data.fundamentals.pb_ratio?.toFixed(2)}`);
    console.log(`   Divergência: ${Math.abs(((data.fundamentals.pb_ratio - statusInvestData.pb_ratio) / statusInvestData.pb_ratio) * 100).toFixed(2)}%`);
    
    console.log(`\nDividend Yield:`);
    console.log(`   Status Invest: ${statusInvestData.dividend_yield}%`);
    console.log(`   Yahoo Finance: ${data.fundamentals.dividend_yield?.toFixed(2)}%`);
    console.log(`   Divergência: ${Math.abs(((data.fundamentals.dividend_yield - statusInvestData.dividend_yield) / statusInvestData.dividend_yield) * 100).toFixed(2)}%`);
    
    console.log(`\nROE:`);
    console.log(`   Status Invest: ${statusInvestData.roe}%`);
    console.log(`   Yahoo Finance: ${data.fundamentals.roe?.toFixed(2)}%`);
    console.log(`   Divergência: ${Math.abs(((data.fundamentals.roe - statusInvestData.roe) / statusInvestData.roe) * 100).toFixed(2)}%`);
    
    console.log('\n' + '='.repeat(80));
    console.log('\n⚠️  NOTA: Pequenas divergências são normais devido a:');
    console.log('   - Diferenças de timing de atualização');
    console.log('   - Metodologias de cálculo diferentes');
    console.log('   - Fontes de dados diferentes (Yahoo vs Status Invest)');
    console.log('   - Yahoo Finance usa dados em USD, Status Invest em BRL\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

testPETR4();
