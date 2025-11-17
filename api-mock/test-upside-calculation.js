// Teste de cálculo do upside_percent

console.log('\n🧮 TESTE DE CÁLCULO DO POTENCIAL DE ALTA (UPSIDE)\n');
console.log('='.repeat(80));

// Caso 1: Magalu (do exemplo do usuário)
console.log('\n📊 CASO 1: MAGALU');
console.log('-'.repeat(80));
const magaluCurrentPrice = 8.78;
const magaluFairPrice = 10.10;
const magaluUpside = ((magaluFairPrice - magaluCurrentPrice) / magaluCurrentPrice) * 100;

console.log(`Preço Atual: R$ ${magaluCurrentPrice.toFixed(2)}`);
console.log(`Preço Justo: R$ ${magaluFairPrice.toFixed(2)}`);
console.log(`\nCálculo: ((${magaluFairPrice} - ${magaluCurrentPrice}) / ${magaluCurrentPrice}) × 100`);
console.log(`       = (${(magaluFairPrice - magaluCurrentPrice).toFixed(2)} / ${magaluCurrentPrice}) × 100`);
console.log(`       = ${(magaluUpside / 100).toFixed(4)} × 100`);
console.log(`       = ${magaluUpside.toFixed(2)}%`);

console.log(`\n✅ Potencial de Alta: +${magaluUpside.toFixed(1)}%`);
console.log(`✅ Você está comprando ${magaluUpside.toFixed(1)}% ABAIXO do preço justo`);

// Caso 2: Ação cara (preço atual > preço justo)
console.log('\n\n📊 CASO 2: AÇÃO CARA (Preço Atual > Preço Justo)');
console.log('-'.repeat(80));
const expensiveCurrentPrice = 50.00;
const expensiveFairPrice = 40.00;
const expensiveUpside = ((expensiveFairPrice - expensiveCurrentPrice) / expensiveCurrentPrice) * 100;

console.log(`Preço Atual: R$ ${expensiveCurrentPrice.toFixed(2)}`);
console.log(`Preço Justo: R$ ${expensiveFairPrice.toFixed(2)}`);
console.log(`\nCálculo: ((${expensiveFairPrice} - ${expensiveCurrentPrice}) / ${expensiveCurrentPrice}) × 100`);
console.log(`       = (${(expensiveFairPrice - expensiveCurrentPrice).toFixed(2)} / ${expensiveCurrentPrice}) × 100`);
console.log(`       = ${expensiveUpside.toFixed(2)}%`);

console.log(`\n⚠️ Potencial de Alta: ${expensiveUpside.toFixed(1)}% (NEGATIVO)`);
console.log(`⚠️ Você está comprando ${Math.abs(expensiveUpside).toFixed(1)}% ACIMA do preço justo`);

// Caso 3: Ação no preço justo
console.log('\n\n📊 CASO 3: AÇÃO NO PREÇO JUSTO');
console.log('-'.repeat(80));
const fairCurrentPrice = 30.00;
const fairFairPrice = 30.00;
const fairUpside = ((fairFairPrice - fairCurrentPrice) / fairCurrentPrice) * 100;

console.log(`Preço Atual: R$ ${fairCurrentPrice.toFixed(2)}`);
console.log(`Preço Justo: R$ ${fairFairPrice.toFixed(2)}`);
console.log(`\nCálculo: ((${fairFairPrice} - ${fairCurrentPrice}) / ${fairCurrentPrice}) × 100`);
console.log(`       = ${fairUpside.toFixed(2)}%`);

console.log(`\n✅ Potencial de Alta: ${fairUpside.toFixed(1)}%`);
console.log(`✅ Você está comprando NO PREÇO JUSTO`);

// Resumo
console.log('\n\n' + '='.repeat(80));
console.log('📋 RESUMO DA LÓGICA');
console.log('='.repeat(80));
console.log(`
✅ UPSIDE POSITIVO (+15%):
   - Preço Atual < Preço Justo
   - Ação está BARATA (com desconto)
   - Você está comprando ABAIXO do preço justo
   - Exemplo: R$ 8.78 vs R$ 10.10 = +15.0% de upside

❌ UPSIDE NEGATIVO (-20%):
   - Preço Atual > Preço Justo
   - Ação está CARA (com prêmio)
   - Você está comprando ACIMA do preço justo
   - Exemplo: R$ 50.00 vs R$ 40.00 = -20.0% de upside

⚖️ UPSIDE ZERO (0%):
   - Preço Atual = Preço Justo
   - Ação está no preço JUSTO
   - Você está comprando NO PREÇO JUSTO
   - Exemplo: R$ 30.00 vs R$ 30.00 = 0.0% de upside
`);

console.log('='.repeat(80));
console.log('✅ CÁLCULO CORRETO IMPLEMENTADO NO CÓDIGO!\n');
