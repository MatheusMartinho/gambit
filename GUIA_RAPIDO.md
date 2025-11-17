# 🚀 Guia Rápido - GAMBIT

## ⚡ Início Rápido (3 minutos)

### 1. Instalar e Rodar

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

### 2. Buscar uma Empresa

Digite um ticker válido (ex: **VALE3**, **PETR4**, **ITUB4**) e pressione **Enter**.

### 3. Explorar a Análise

A tela mostra automaticamente:

- ✅ **3 KPIs principais**: Crescimento, Rentabilidade, Alavancagem
- ✅ **Health Score**: 0-100 pontos (4 pilares)
- ✅ **Valuation Verdict**: Desconto, Justo ou Prêmio
- ✅ **Gráficos**: Receita vs Lucro, FCF

---

## 📊 Entendendo o Health Score

### Score Total: 0-100 pontos

| Faixa | Classificação | Significado |
|-------|---------------|-------------|
| 80-100 | 🟢 Excelente | Empresa de alta qualidade |
| 60-79 | 🟡 Bom | Fundamentos sólidos |
| 40-59 | 🟠 Regular | Atenção a alguns pontos |
| 0-39 | 🔴 Fraco | Fundamentos preocupantes |

### 4 Pilares (25 pts cada)

1. **Rentabilidade**: ROIC vs WACC, ROE, Margens
2. **Crescimento**: CAGR Receita, Consistência
3. **Estrutura**: Alavancagem, Cobertura de juros
4. **Geração de Caixa**: FCF/LL, Dividend Yield

**Exemplo**:
```
Health Score: 82/100
├─ Rentabilidade: 22/25 ✅
├─ Crescimento: 18/25 ✅
├─ Estrutura: 20/25 ✅
└─ Geração de Caixa: 22/25 ✅
```

---

## 💰 Entendendo o Valuation Verdict

### Status

- **🟢 Desconto**: Upside > 15% → Oportunidade de compra
- **🟡 Justo**: -10% a +15% → Preço alinhado aos fundamentos
- **🔴 Prêmio**: < -10% → Negociando acima do valor justo

### Rationale (Justificativa)

Cada verdict mostra **por que** chegou naquela conclusão:

**Exemplo**:
```
Status: Desconto
Upside Base: 18%
Range: 8% (bear) a 28% (bull)

Rationale:
✓ EV/EBITDA atual 5,1x vs pares 6,0x
✓ Dividend Yield acima de 7,1%
✓ Spread ROIC-WACC positivo
✓ Crescimento consistente 4,3%
```

---

## 🔍 Explicabilidade ("Ver conta")

Clique em **"Ver conta"** em qualquer métrica para ver:

### 1. Fórmula
```
CAGR = (ReceitaAtual / ReceitaInicial)^(1/n) - 1
```

### 2. Inputs (Campos Usados)
```
ReceitaAtual: R$ 267,2 bi
ReceitaInicial: R$ 230,0 bi
Períodos: 4 anos
```

### 3. Passos do Cálculo
```
1. Dividir receita atual pela inicial
2. Aplicar raiz equivalente (1/4)
3. Subtrair 1
```

### 4. Fonte
```
📄 CVM - DFP 2024
🔗 https://www.cvm.gov.br/dfp
📅 Atualizado em: 15/02/2025
```

---

## 📱 Navegação por Abas

### Visão Geral
- KPIs principais
- Health Score
- Valuation Verdict
- Gráficos de performance

### Fundamentos
- Tese de investimento
- Catalisadores
- Riscos
- Qualidade do negócio (moat)
- KPIs detalhados

### Financeiro
- Métricas financeiras
- Margens
- Alavancagem
- Guidance vs Realizado

### Dividendos
- Yield 12m
- Payout
- Calendário de proventos

### Valuation
- Múltiplos (P/L, EV/EBITDA, P/VP)
- Sensibilidade DCF
- Comparação com pares

### Comparar
- Pares setoriais
- Radar de métricas
- Heatmap de margens

### Alertas
- Red Flags
- Halts e fatos relevantes
- Configuração de notificações

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| **Enter** | Buscar ticker |
| **Tab** | Navegar entre elementos |
| **Esc** | Fechar modais/tooltips |
| **?** | Mostrar ajuda (futuro) |

---

## 🎯 Casos de Uso

### 1. Análise Rápida (30 segundos)

1. Digite o ticker
2. Veja o Health Score
3. Veja o Valuation Verdict
4. Decisão: Comprar, Aguardar ou Evitar

### 2. Análise Profunda (5 minutos)

1. Leia a **Tese** (aba Fundamentos)
2. Verifique **Catalisadores** e **Riscos**
3. Analise **Margens** e **Alavancagem** (aba Financeiro)
4. Compare com **Pares** (aba Comparar)
5. Verifique **Red Flags** (aba Alertas)

### 3. Monitoramento Contínuo

1. Adicione à **Watchlist**
2. Configure **Alertas** automáticos
3. Receba notificações de:
   - Mudanças no Health Score
   - Fatos relevantes
   - Halts de negociação
   - Mudanças no guidance

---

## 🔧 Personalização

### Filtros de Oportunidades

Na seção **"Filtrar oportunidades"**:

- **Yield mínimo**: Ajuste de 0% a 15%
- **P/L máximo**: Ajuste de 0 a 30
- **Alavancagem máxima**: Ajuste de 0x a 6x

**Exemplo**:
```
Yield mínimo: 5%
P/L máximo: 12
Alavancagem máxima: 2x

Resultados:
✓ VALE3 - Yield 7,1%
✓ PETR4 - Yield 14,8%
```

---

## 📊 Interpretando os Gráficos

### Receita vs Lucro (Área)
- **Azul**: Receita
- **Verde**: Lucro Líquido
- **Tendência**: Crescimento consistente é positivo

### FCF Estimado (Barras)
- **Laranja**: Free Cash Flow (EBITDA - Capex)
- **Positivo**: Empresa gera caixa
- **Negativo**: Empresa consome caixa

### Comparação com Pares (Barras)
- **Azul**: P/L
- **Ciano**: EV/EBITDA
- **Laranja**: Dividend Yield
- **Compare**: Sua empresa vs concorrentes

### Radar de Métricas
- **Azul**: Empresa analisada
- **Laranja**: Média dos pares
- **Quanto maior, melhor**: Exceto P/L (inverso)

---

## ⚠️ Avisos Importantes

### Red Flags

Fique atento a:
- 🔴 **Jurídico**: Processos, multas, passivos
- 🔴 **Contábil**: Mudanças de critério, reapresentação
- 🔴 **Governança**: Conflitos, relacionadas
- 🔴 **Liquidez**: Problemas de caixa

### Guidance

Compare **Guia** vs **Realizado**:
- ✅ Erro < 5%: Empresa cumpre o prometido
- ⚠️ Erro 5-10%: Atenção
- 🔴 Erro > 10%: Credibilidade questionável

---

## 💡 Dicas Profissionais

### 1. Combine Métricas
Não olhe apenas o Health Score. Combine:
- Health Score + Valuation Verdict
- Múltiplos + Crescimento
- Yield + Payout (sustentabilidade)

### 2. Contexto Setorial
Compare sempre com pares:
- Margem EBITDA da empresa vs setor
- P/L da empresa vs média setorial
- Crescimento vs concorrentes

### 3. Tendências
Olhe a evolução histórica:
- Margens melhorando ou piorando?
- Alavancagem aumentando ou diminuindo?
- FCF crescendo ou caindo?

### 4. Fontes
Sempre verifique as fontes:
- Clique em "Ver conta"
- Confira a data de atualização
- Acesse o documento original

---

## 🆘 Troubleshooting

### Ticker não encontrado
- ✅ Verifique o formato: 4 letras + 1-2 números
- ✅ Exemplo correto: VALE3, PETR4, ITUB4
- ❌ Exemplo errado: VALE, PETR, ITU4B

### Dados desatualizados
- Verifique a data no rodapé
- Clique em "Pesquisar" novamente
- Aguarde próxima atualização (diária)

### Gráfico não carrega
- Verifique sua conexão
- Recarregue a página (F5)
- Limpe o cache do navegador

### Erro ao carregar
- Veja a mensagem de erro
- Tente outro ticker
- Reporte o bug (GitHub Issues)

---

## 📚 Recursos Adicionais

### Documentação Completa
- `README_COMPLETO.md` - Guia técnico completo
- `MELHORIAS_2025.md` - Changelog detalhado

### Aprenda Mais
- [Análise Fundamentalista](https://www.investopedia.com/fundamental-analysis)
- [Valuation](https://www.investopedia.com/valuation)
- [DCF](https://www.investopedia.com/dcf)

### Suporte
- 📧 Email: suporte@gambit.com
- 💬 Discord: discord.gg/gambit
- 🐛 Issues: github.com/gambit/issues

---

## ✅ Checklist de Análise

Use este checklist para análises completas:

- [ ] Health Score > 60?
- [ ] Valuation Verdict = Desconto ou Justo?
- [ ] ROIC > WACC?
- [ ] Alavancagem < 3x?
- [ ] FCF positivo?
- [ ] Dividend Yield > 3%?
- [ ] Sem Red Flags críticos?
- [ ] Guidance cumprido (erro < 10%)?
- [ ] Melhor que pares setoriais?
- [ ] Tese de investimento clara?

**Se 7+ itens = ✅**: Empresa de qualidade, considere investir  
**Se 4-6 itens = ✅**: Empresa OK, analise mais profundamente  
**Se < 4 itens = ✅**: Evite ou aguarde melhores condições

---

**GAMBIT** - Análise fundamentalista em 30 segundos 🚀
