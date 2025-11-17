# Análise Fundamentalista Completa - GAMBIT

## 📋 Visão Geral

Este documento detalha a estrutura de dados completa para análise fundamentalista no GAMBIT, seguindo as melhores práticas para profissionais e investidores intermediários.

## 🎯 Princípios

1. **Auditável**: Toda métrica tem citação e fonte
2. **"Explain the Math"**: Fórmulas visíveis com cálculo passo a passo
3. **Sem achismos**: Números conferíveis em documentos oficiais (CVM, RI, B3)
4. **Acionável**: Red flags, catalisadores e checklist profissional

## 📊 Estrutura de Dados

### 1. Sumário Executivo (30-60s)

```json
{
  "summary": {
    "thesis": ["Bullet 1", "Bullet 2", "Bullet 3"],
    "anchorMetrics": [
      {
        "label": "CAGR Receita 5a",
        "value": "4,3%",
        "context": "Prêmio de qualidade...",
        "cite": {
          "source": "DFP 2020-2024",
          "url": "https://www.cvm.gov.br/...",
          "page": "62",
          "metric": "Receita líquida"
        }
      }
    ],
    "catalysts": [...],
    "risks": [...]
  }
}
```

**Componente UI**: Card "Tese Resumida" + 3 números-âncora com chips

---

### 2. Qualidade do Negócio

```json
{
  "quality": {
    "moat": ["Vantagem 1", "Vantagem 2"],
    "cashCycle": ["Conversão de lucro em caixa média de 87%"],
    "pricingPower": ["Contratos indexados..."],
    "roicAnalysis": {
      "roic5y": [
        { "year": 2020, "value": 12.3 },
        { "year": 2024, "value": 15.8 }
      ],
      "wacc": 10.5,
      "spread": 5.3,
      "consistency": "ROIC > WACC por 5 anos consecutivos"
    }
  }
}
```

**Indicadores-chave**:
- ✅ ROIC > WACC consistente
- ✅ FCF/Receita estável/crescente
- ✅ Capex/Receita declinante ao longo do ciclo

**Componente UI**: Gráfico de barras ROIC vs WACC com evolução 5 anos

---

### 3. Setor e Posição Competitiva

```json
{
  "sector": {
    "overview": ["Demanda global moderada...", "Projetos concorrentes atrasados..."],
    "tam": {
      "size": "US$ 180 bi",
      "growth": "2,5% CAGR 2024-2028",
      "drivers": ["Infraestrutura asiática", "Transição energética"]
    },
    "marketShare": {
      "global": "12,3%",
      "rank": 1,
      "competitors": ["Rio Tinto", "BHP"]
    },
    "regulation": {
      "type": "Não regulado (preço livre)",
      "environmentalRisks": "Licenciamento ambiental rigoroso"
    },
    "metrics": [
      {
        "label": "Cash cost",
        "value": "US$ 41/t",
        "trend": "-3% a/a",
        "benchmark": "Quartil inferior da curva de custo global"
      }
    ]
  }
}
```

**Métricas setoriais por segmento**:

| Setor | Métricas específicas |
|-------|---------------------|
| **Bancos** | NIM, cost-to-income, inadimplência, cobertura |
| **Commodities** | C1 cash cost, strip price, hedge |
| **Utilities** | Base de ativos regulatória, RAP, perdas não-técnicas |
| **Varejo** | SSS (same-store sales), ticket, giro de estoques |

---

### 4. Demonstrações Financeiras (DRE, Balanço, FCF)

#### 4.1 DRE - Crescimento e Margens

```json
{
  "financials": {
    "dre": [
      {
        "metric": "CAGR Receita 5a",
        "value": "4,3%",
        "formula": "(Receita_2024 / Receita_2019)^(1/5) - 1",
        "calculation": {
          "inputs": {
            "Receita_2024": 267211000000,
            "Receita_2019": 218493000000
          },
          "steps": [
            "Razão: 267211 / 218493 = 1,223",
            "Raiz quinta: 1,223^(1/5) = 1,043",
            "CAGR: 1,043 - 1 = 0,043 = 4,3%"
          ]
        },
        "explain": "Crescimento sustentado por prêmio de qualidade...",
        "cite": {
          "source": "DFP 2024, DFP 2019",
          "url": "https://www.cvm.gov.br/...",
          "page": "62",
          "table": "Demonstração do Resultado do Exercício"
        }
      }
    ]
  }
}
```

**Fórmulas principais**:
- CAGR = `(Receita_t / Receita_t-5)^(1/5) - 1`
- Margem EBITDA = `EBITDA / Receita`
- Margem Líquida = `Lucro Líquido / Receita`

#### 4.2 Balanço - Solidez

```json
{
  "balance": [
    {
      "metric": "Dívida Líquida/EBITDA",
      "value": "0,9x",
      "formula": "(Dívida Bruta - Caixa e Equivalentes) / EBITDA",
      "calculation": {
        "inputs": {
          "DividaBruta": 122450000000,
          "Caixa": 44213000000,
          "EBITDA": 86842000000
        },
        "steps": [
          "Dívida Líquida: 122450 - 44213 = 78237",
          "Alavancagem: 78237 / 86842 = 0,90x"
        ]
      },
      "explain": "Confortável para manutenção de rating investment grade (BBB+).",
      "cite": { "source": "DFP 4T24", "page": "54" }
    }
  ]
}
```

**Fórmulas principais**:
- Dívida Líquida = `Dívida Bruta - Caixa`
- Cobertura de Juros = `EBIT / Despesa Financeira`
- Capital de Giro = `Ativo Circulante Operacional - Passivo Circulante Operacional`

#### 4.3 Fluxo de Caixa - Qualidade de Lucro

```json
{
  "fcf": [
    {
      "metric": "FCF 12m",
      "value": "US$ 9,8 bi",
      "formula": "Fluxo Caixa Operacional - Capex de Manutenção",
      "calculation": {
        "inputs": {
          "FCO": 15700000000,
          "CapexManutencao": 5900000000
        },
        "steps": ["FCF: 15700 - 5900 = 9800 milhões"]
      },
      "explain": "Conversão de lucro em caixa de 92%, acima da média histórica.",
      "cite": { "source": "DFP 4T24", "page": "70" }
    }
  ]
}
```

**Red flags**:
- ❌ FCO fraco vs lucro contábil
- ❌ Capitalização excessiva de despesas
- ❌ Variações recorrentes de working capital

---

### 5. Alocação de Capital e Dividendos

```json
{
  "capitalAllocation": {
    "policy": {
      "description": "Distribuir 30-40% do FCF em dividendos...",
      "priority": "1) Manutenção, 2) Projetos aprovados, 3) Dividendos base, 4) Recompra"
    },
    "dividends": {
      "payout12m": "45%",
      "yield12m": "7,1%",
      "paymentFrequency": "Semestral + extraordinários",
      "history5y": [
        { "year": 2020, "total": 2.15, "yield": 3.8 },
        { "year": 2024, "total": 4.56, "yield": 7.1 }
      ]
    },
    "buyback": {
      "program": "Ativo desde 2023",
      "purchased12m": "1,8% do float",
      "amountRemaining": "US$ 2,5 bi autorizados"
    },
    "reinvestmentROIC": {
      "formula": "∆EBIT / Capex Incremental",
      "value": "14,2%"
    }
  }
}
```

**Indicadores**:
- Payout 12m, Yield 12m
- Recompra (% do float)
- ROIC pós-investimentos

---

### 6. Guidance vs Realizado (Accountability)

```json
{
  "guidance": {
    "accuracy3y": "92%",
    "history": [
      {
        "year": 2024,
        "metrics": [
          {
            "metric": "Produção minério (Mt)",
            "guidance": "320",
            "actual": "312",
            "error": "-2,5%",
            "cite": { "source": "Guidance 2024" }
          }
        ]
      }
    ]
  }
}
```

**Componente UI**: Tabela "Guidance vs Realizado" + chip "acurácia 3 anos"

---

### 7. Valuation

#### 7.1 Múltiplos Comparáveis

```json
{
  "valuation": {
    "multiples": {
      "pe": 6.4,
      "ev_ebitda": 4.4,
      "pv": 1.8,
      "dividendYield": 7.1
    },
    "comparables": [
      {
        "company": "Rio Tinto",
        "multiple": "EV/EBITDA",
        "value": "5,2x",
        "premium": "+18%",
        "justification": "Maior diversificação geográfica"
      }
    ]
  }
}
```

#### 7.2 Fluxo de Caixa Descontado (DCF)

```json
{
  "dcf": {
    "fairValue": "R$ 72,50",
    "upside": "12,8%",
    "wacc": 10.5,
    "terminalGrowth": 2.5,
    "sensitivities": [
      { "label": "WACC +0,5 p.p.", "impact": "-6% no preço alvo" },
      { "label": "Minério -US$10/t", "impact": "-8% no preço alvo" }
    ]
  }
}
```

**Componente UI**: Gráfico aranha (sensibilidade) + tabela de comparáveis

---

### 8. Riscos e Mitigação

```json
{
  "redFlags": [
    {
      "label": "Passivos ESG",
      "severity": "alto",
      "recency": "contínuo",
      "description": "Processos Brumadinho/Mariana podem gerar novos desembolsos...",
      "materiality": "alta",
      "cite": { "source": "Notas Explicativas 4T24", "page": "124" }
    }
  ]
}
```

**Categorias de risco**:
- **Operacionais**: Interrupções, execução de projetos
- **Financeiros**: Liquidez, covenants, refinancing wall
- **Jurídico/ESG**: Contingências, multas, licenças
- **Macro/Preço**: Commodities, câmbio, juros

**Componente UI**: Card "Red Flags" com pontuação (recência × severidade × materialidade)

---

### 9. Catalisadores e Eventos (6-12m)

```json
{
  "catalysts": [
    {
      "date": "2025-05-03",
      "title": "Resultado 1T25",
      "detail": "Atualização de guidance e capex...",
      "type": "resultado"
    }
  ]
}
```

**Tipos de eventos**:
- Vendas de ativos
- Aprovações regulatórias
- Ramp-up de projetos
- AGO, publicação de resultados

---

### 10. Checklist Profissional

```json
{
  "checklist": {
    "health": {
      "category": "Saúde financeira",
      "score": 4,
      "maxScore": 5,
      "items": [
        { "check": "ROIC > WACC por 3-5 anos", "status": true },
        { "check": "Cobertura de juros > 3x", "status": true },
        { "check": "Working capital eficiente", "status": false, "note": "Negativo (ok para modelo)" }
      ]
    },
    "growth": { ... },
    "governance": { ... },
    "valuation": { ... }
  }
}
```

**Componente UI**: Cards com score visual (4/5 ⭐) e checkboxes

---

## 🔍 "Explain the Math" - Padrão GAMBIT

Cada métrica deve ter:

1. **Fórmula** (visível)
2. **Inputs** (valores usados)
3. **Steps** (cálculo passo a passo)
4. **Citação** (fonte + página + tabela/célula)
5. **Link** (CVM/RI/B3)

**Exemplo**:

```jsx
<ExplainMath
  formula="(Dívida Bruta - Caixa) / EBITDA"
  calculation={{
    inputs: {
      DividaBruta: 122450000000,
      Caixa: 44213000000,
      EBITDA: 86842000000
    },
    steps: [
      "Dívida Líquida: 122450 - 44213 = 78237",
      "Alavancagem: 78237 / 86842 = 0,90x"
    ]
  }}
  cite={{
    source: "DFP 4T24",
    url: "https://www.cvm.gov.br/...",
    page: "54",
    table: "Endividamento"
  }}
/>
```

---

## 🚨 Red Flags - Palavras-gatilho

O crawler deve captar automaticamente:

- `impairment`, `going concern`, `covenant`
- `reclassificação`, `investigação`, `adverse opinion`
- Mudança metodológica: "reclassificamos", "alteramos estimativas"
- FRs com alteração de guidance, halting na B3, material weakness

**Pontuação**: recência × severidade × materialidade

---

## 📁 Estrutura de Abas no GAMBIT

### 1. Aba "Visão Geral"
- 3 números-âncora + tese + drivers e riscos
- Card "Eventos & Documentos" com citações

### 2. Aba "Fundamentos"
- DRE/Balanço/FCF com 6-8 KPIs e botão "Explain the Math"
- ROIC vs WACC com gráfico de evolução 5 anos
- Setor e posição competitiva

### 3. Aba "Financeiro"
- DRE, Balanço, FCF com detalhes
- Tabela "Guidance vs Realizado" (com acurácia)

### 4. Aba "Dividendos"
- Histórico 12-60m
- Política de alocação de capital
- Calendário próximo
- Payout, yield, recompras

### 5. Aba "Benchmarks/Comparar"
- Pares setoriais
- Múltiplos
- Radar de sensibilidade

### 6. Aba "Alertas"
- FR novo
- Mudança de guidance
- Margem > limiar
- Red flags

---

## 🌐 Fontes (Fixas e Auditáveis)

### Primárias
- **CVM**: DFPs, ITRs, Fatos Relevantes
- **RI**: Releases, apresentações, atas
- **B3**: Halts, calendário, proventos

### Secundárias (quando aplicável)
- **IBGE/BCB**: Macro que impacta teses

---

## 🛠️ Uso do Template JSON

1. **Carregar template**: `src/data/analysisTemplate.json`
2. **Popular com crawler**: Extrair dados de DFPs/ITRs/RIs
3. **Renderizar no front**: Componentes React já preparados
4. **Validar citações**: Todos os `cite.url` devem apontar para documentos reais

---

## 📝 Exemplo Completo (VALE3)

Ver arquivo: `src/data/analysisTemplate.json`

O template inclui um exemplo completo com dados da Vale S.A. (fictícios para demonstração), mostrando:
- Todas as seções preenchidas
- Fórmulas e cálculos passo a passo
- Citações completas (fonte + página + tabela)
- Red flags e catalisadores reais

---

## 🚀 Próximos Passos

1. ✅ Template JSON criado
2. ✅ Componentes UI implementados (ROIC/WACC, Explain the Math, Dividendos)
3. ⏳ Integrar crawler para popular automaticamente
4. ⏳ Adicionar gráficos interativos (Chart.js ou Recharts)
5. ⏳ Sistema de alertas e notificações
6. ⏳ Comparação entre múltiplos tickers

---

## 📚 Referências

- CVM: https://www.cvm.gov.br
- B3: https://www.b3.com.br
- RI das empresas (específico por ticker)

---

**Feito com ❤️ para o GAMBIT** • "Risco calculado, retorno certo"
