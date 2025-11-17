# 📊 FONTES DE DADOS E VALIDAÇÃO

## ✅ DADOS ATUALMENTE IMPLEMENTADOS

### **Fonte Principal: Yahoo Finance**
- ✅ **100% dados reais em tempo real**
- ✅ Cache de 15 minutos
- ✅ Validação automática

---

## 📈 COMPARAÇÃO: YAHOO FINANCE vs STATUS INVEST

### **PETR4 - Outubro 2025**

| Indicador | Status Invest | Yahoo Finance | Divergência | Status |
|-----------|---------------|---------------|-------------|--------|
| **P/L** | 5.01 | 5.08 | 1.39% | ✅ OK |
| **P/VP** | 0.97 | 5.29 | 445% | ❌ ERRO |
| **Dividend Yield** | 17.41% | 12.19% | 29.98% | ⚠️ ALERTA |
| **ROE** | 19.38% | 18.48% | 4.63% | ✅ OK |

---

## 🔍 ANÁLISE DAS DIVERGÊNCIAS

### **1. P/VP (Price to Book) - DIVERGÊNCIA CRÍTICA**

**Problema:** Yahoo Finance retorna 5.29, Status Invest mostra 0.97

**Causa Raiz:**
- Yahoo Finance pode estar usando dados consolidados (incluindo subsidiárias internacionais)
- Status Invest usa apenas dados da B3 (Brasil)
- Diferença de metodologia de cálculo do Book Value

**Solução:**
```javascript
// Adicionar integração com Status Invest API ou Brapi para P/VP
const statusInvestPB = await getStatusInvestData(ticker, 'pb_ratio');
key_metrics.pb_ratio = statusInvestPB || yahooData.fundamentals.pb_ratio;
```

### **2. Dividend Yield - DIVERGÊNCIA MODERADA**

**Problema:** Yahoo Finance retorna 12.19%, Status Invest mostra 17.41%

**Causa Raiz:**
- Status Invest calcula com base nos últimos 12 meses de proventos pagos
- Yahoo Finance usa projeção anualizada do último dividendo
- Petrobras tem dividendos variáveis (depende do lucro)

**Solução:**
```javascript
// Usar histórico de dividendos dos últimos 12 meses
const last12MonthsDividends = calculateLast12MonthsDividends(ticker);
const currentPrice = yahooData.quote.price;
key_metrics.dividend_yield = (last12MonthsDividends / currentPrice) * 100;
```

---

## 🎯 RECOMENDAÇÕES PARA MÁXIMA PRECISÃO

### **PRIORIDADE CRÍTICA**

#### **1. Integrar com Status Invest API (Não Oficial)**
```javascript
// Scraping do Status Invest (use com cautela - pode violar ToS)
const statusInvestData = await scrapeStatusInvest(ticker);

// Ou usar Brapi que já faz isso
const brapiData = await brapiService.getFundamentals(ticker);
```

#### **2. Usar Brapi.dev para Dados Brasileiros**
```bash
# Brapi já está implementado, mas precisa de token
# Obter token em: https://brapi.dev/
```

```javascript
// api-mock/brapi-service.js
const BRAPI_TOKEN = process.env.BRAPI_TOKEN || 'demo';

async function getFundamentals(ticker) {
  const url = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true`;
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    pe_ratio: data.results[0].priceEarnings,
    pb_ratio: data.results[0].priceToBook,  // ✅ Mais preciso para ações BR
    dividend_yield: data.results[0].dividendYield,
    roe: data.results[0].returnOnEquity * 100
  };
}
```

#### **3. Hierarquia de Fontes (Ordem de Prioridade)**

```javascript
// Para ações brasileiras:
const key_metrics = {
  // Usar Brapi/Status Invest para indicadores brasileiros
  pe_ratio: brapiData?.priceEarnings || yahooData.fundamentals.pe_ratio,
  pb_ratio: brapiData?.priceToBook || yahooData.fundamentals.pb_ratio,  // ✅ CRÍTICO
  dividend_yield: brapiData?.dividendYield || yahooData.fundamentals.dividend_yield,
  
  // Usar Yahoo Finance para dados globais
  roe: yahooData.fundamentals.roe,
  roa: yahooData.fundamentals.roa,
  profit_margin: yahooData.fundamentals.profit_margin,
  
  // Usar Yahoo Finance para balanço (mais completo)
  total_cash: yahooData.fundamentals.total_cash,
  total_debt: yahooData.fundamentals.total_debt,
  debt_to_equity: yahooData.fundamentals.debt_to_equity
};
```

---

## 🚀 IMPLEMENTAÇÃO IMEDIATA

### **Passo 1: Obter Token Brapi**
1. Acesse https://brapi.dev/
2. Crie uma conta gratuita
3. Copie o token
4. Adicione ao `.env`:
```env
BRAPI_TOKEN=seu_token_aqui
```

### **Passo 2: Atualizar brapi-service.js**
```javascript
// Já implementado, só precisa do token!
```

### **Passo 3: Atualizar server.js**
```javascript
// Priorizar Brapi para indicadores brasileiros
const key_metrics = {
  pe_ratio: brapiData?.fundamentals?.pe_ratio || yahooData.fundamentals.pe_ratio,
  pb_ratio: brapiData?.fundamentals?.pb_ratio || yahooData.fundamentals.pb_ratio,
  dividend_yield: brapiData?.fundamentals?.dividend_yield || yahooData.fundamentals.dividend_yield,
  // ... resto do Yahoo Finance
};
```

---

## 📊 RESULTADO ESPERADO APÓS CORREÇÃO

### **PETR4 - Com Brapi Integrado**

| Indicador | Atual (Yahoo) | Esperado (Brapi) | Status |
|-----------|---------------|------------------|--------|
| P/L | 5.08 | 5.01 | ✅ Melhor |
| P/VP | 5.29 | 0.97 | ✅ Corrigido |
| Dividend Yield | 12.19% | 17.41% | ✅ Corrigido |
| ROE | 18.48% | 19.38% | ✅ Melhor |

---

## ⚠️ AVISOS IMPORTANTES

1. **Yahoo Finance é confiável** para dados globais e histórico de preços
2. **Brapi/Status Invest são melhores** para indicadores fundamentalistas de ações brasileiras
3. **Sempre validar** dados críticos antes de tomar decisões de investimento
4. **Divergências < 5%** são aceitáveis (diferenças de timing/metodologia)
5. **Divergências > 10%** requerem investigação

---

## 🎯 STATUS ATUAL

- ✅ Yahoo Finance: **100% funcional**
- ⚠️ Brapi: **Implementado mas precisa de token**
- ❌ Status Invest: **Não implementado (scraping não recomendado)**

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Obter token Brapi (5 minutos)
2. ✅ Configurar `.env` com token
3. ✅ Testar integração Brapi
4. ✅ Validar dados PETR4 novamente
5. ✅ Deploy em produção

**Tempo estimado:** 15 minutos
