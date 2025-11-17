const axios = require('axios');

async function testVale3() {
  console.log('\n🔍 TESTANDO VALUATION DA VALE3\n');
  console.log('='.repeat(80));
  
  try {
    const response = await axios.get('http://localhost:3000/api/v1/stocks/VALE3');
    const data = response.data.data;
    
    console.log('\n📊 DADOS DISPONÍVEIS:');
    console.log('Keys:', Object.keys(data));
    
    console.log('\n💰 QUOTE:');
    console.log('   Price:', data.quote?.price);
    
    console.log('\n🎯 VALUATION_VERDICT:');
    console.log('   Existe?', !!data.valuation_verdict);
    console.log('   Conteúdo:', JSON.stringify(data.valuation_verdict, null, 2));
    
    console.log('\n📈 KEY_METRICS:');
    console.log('   PE Ratio:', data.key_metrics?.pe_ratio);
    console.log('   PB Ratio:', data.key_metrics?.pb_ratio);
    
    // Calcular manualmente
    const currentPrice = data.quote?.price || 59.75;
    const fairPrice = data.valuation_verdict?.fair_price || currentPrice * 1.15;
    const upside = ((fairPrice - currentPrice) / currentPrice) * 100;
    
    console.log('\n🧮 CÁLCULO MANUAL:');
    console.log(`   Preço Atual: R$ ${currentPrice.toFixed(2)}`);
    console.log(`   Preço Justo: R$ ${fairPrice.toFixed(2)}`);
    console.log(`   Upside: ${upside.toFixed(2)}%`);
    
    if (upside > 0) {
      console.log(`   ✅ Desconto: ${upside.toFixed(1)}%`);
      console.log(`   💡 Ação negociando ABAIXO do valor justo`);
    } else {
      console.log(`   ⚠️ Ágio: ${Math.abs(upside).toFixed(1)}%`);
      console.log(`   ⚠️ Ação negociando ACIMA do valor justo`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testVale3();
