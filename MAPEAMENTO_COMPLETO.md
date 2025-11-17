# 🎯 MAPEAMENTO COMPLETO - DADOS DINÂMICOS

## 📋 CHECKLIST DE ATUALIZAÇÃO

### ✅ JÁ ATUALIZADO
- [x] Header principal (nome, ticker, preço, variação)
- [x] Banner Hero (setor, índices, preço)
- [x] Cards de Veredicto, Health Score, Oportunidade, Momentum
- [x] Métricas inline (Market Cap, P/L, ROE, Yield)
- [x] Dados do gráfico intraday (volume, máx, mín, abertura)

### 🔄 PRECISA ATUALIZAR
- [ ] Quick Insights (tese de investimento)
- [ ] Métricas âncora (Crescimento, Rentabilidade, Alavancagem)
- [ ] Tese, Catalisadores e Riscos
- [ ] KPIs Detalhados (CAGR, Margem EBITDA, ROIC, etc.)
- [ ] Múltiplos de mercado
- [ ] Comparação com pares
- [ ] Gráficos de performance
- [ ] Dividendos
- [ ] Red Flags

---

## 🗺️ MAPA DE DADOS DA API

### **Dados Disponíveis na API Mock:**

```javascript
stockData = {
  company: {
    ticker: "VALE3",
    name: "Vale S.A.",
    sector: "Mineração",
    industry: "Minério de Ferro",
    listing_segment: "Novo Mercado",
    indexes: ["IBOV", "IBRX", "IDIV"]
  },
  quote: {
    price: 64.27,
    change: -0.78,
    change_percent: -1.21,
    volume: 1018380000,
    market_cap: 285000000000,
    open: 65.20,
    high: 66.15,
    low: 63.80
  },
  key_metrics: {
    pe_ratio: 6.2,
    pb_ratio: 1.6,
    roe: 32.0,
    roic: 15.8,
    dividend_yield: 7.1,
    payout_ratio: 52.0,
    revenue_cagr_5y: 4.3,
    earnings_cagr_5y: 8.7,
    debt_to_ebitda: 0.9,
    current_ratio: 1.85,
    gross_margin: 45.2,
    ebitda_margin: 52.8,
    net_margin: 28.3
  },
  health_score: {
    total_score: 82,
    grade: "A-",
    classification: "Investment Grade"
  },
  valuation_verdict: {
    verdict: "COMPRA",
    fair_price: 75.83,
    current_price: 64.27,
    upside_percent: 18.0,
    confidence: "Alta"
  },
  quick_insights: {
    tldr: "Negociando 18% abaixo do preço justo...",
    recommendation: "COMPRA",
    key_positives: [...],
    key_negatives: [...]
  }
}
```

---

## 🎯 PLANO DE AÇÃO

Vou atualizar em ordem de prioridade:

1. **Quick Insights** - Usar `stockData.quick_insights`
2. **KPIs Detalhados** - Usar `stockData.key_metrics`
3. **Múltiplos** - Usar `stockData.key_metrics`
4. **Tese/Catalisadores/Riscos** - Usar `quick_insights.key_positives/negatives`

---

**Vou começar agora!** 🚀
