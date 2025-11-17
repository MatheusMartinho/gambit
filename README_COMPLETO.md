# 🎯 GAMBIT - Análise Fundamentalista PRO

> **Risco calculado, retorno claro**

Plataforma completa de análise fundamentalista para empresas da B3, com Health Score inteligente, Valuation Verdict e explicabilidade total.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [Componentes Principais](#componentes-principais)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)

---

## 🎨 Visão Geral

### Stack Tecnológica

- **Frontend**: React 18 + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts + ECharts
- **Tipagem**: TypeScript (opcional, suporta JavaScript)
- **Ícones**: Lucide React
- **State**: React Hooks + SWR

### Diferenciais

✅ **Explicabilidade Total**: Cada métrica mostra fórmula, inputs e fontes  
✅ **Health Score Automático**: 4 pilares (Rentabilidade, Crescimento, Estrutura, Caixa)  
✅ **Valuation Verdict**: Análise de desconto/prêmio com rationale  
✅ **Responsivo**: Mobile-first com breakpoints otimizados  
✅ **Acessível**: ARIA labels, navegação por teclado, screen readers  
✅ **Performance**: Lazy loading, memoização, skeletons  

---

## 🚀 Funcionalidades

### ✅ MVP (Fase 1 - Concluído)

- [x] Fix de encoding UTF-8 robusto
- [x] Visão Geral com 3 KPIs principais
- [x] Gráficos: Receita vs Lucro, FCF
- [x] Health Score básico
- [x] Loading states com skeletons
- [x] Error boundaries

### ✅ CORE (Fase 2 - Concluído)

- [x] Health Score completo (4 pilares)
- [x] Valuation Verdict automático
- [x] "Explain the Math" em todos os KPIs
- [x] Abas: Fundamentos, Valuation, Dividendos
- [x] Validação de ticker
- [x] Tooltips explicativos
- [x] Acessibilidade WCAG 2.1

### 🔜 POLIMENTO (Fase 3 - Em Progresso)

- [ ] Aba Comparar (pares setoriais)
- [ ] Aba Alertas (Red Flags + halts)
- [ ] Export PDF
- [ ] Heatmaps de margens
- [ ] Cache com fallback
- [ ] Rate limiting
- [ ] Testes automatizados

---

## 🏗️ Arquitetura

```
gambit/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ErrorBoundary.jsx
│   │   ├── ExplainMath.jsx
│   │   ├── ProfessionalChecklist.jsx
│   │   ├── ComparePeers.jsx
│   │   ├── Skeleton.jsx     # Loading states
│   │   └── SimpleTooltip.jsx
│   ├── data/
│   │   ├── analysisTemplate.json
│   │   └── repository.ts    # Data layer
│   ├── features/
│   │   └── fundamentals/
│   │       └── hooks.ts     # useFundamentals
│   ├── hooks/
│   │   └── useMediaQuery.js
│   ├── models/
│   │   └── fundamentals.ts  # TypeScript types
│   ├── utils/
│   │   ├── encoding.js      # Fix de acentos
│   │   ├── validation.js    # Validação de ticker
│   │   ├── healthScore.js   # Cálculo de Health Score
│   │   └── valuation.js     # Cálculo de Valuation Verdict
│   ├── App.jsx
│   ├── Screen.jsx           # Componente principal
│   └── main.jsx
├── tsconfig.json
├── vite.config.js
└── package.json
```

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/gambit.git
cd gambit

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
http://localhost:5173
```

---

## 💻 Uso

### Buscar Análise

```jsx
// Digite um ticker válido (ex: VALE3, PETR4, ITUB4)
// Pressione Enter ou clique em "Pesquisar"
```

### Navegar pelas Abas

- **Visão Geral**: KPIs principais, Health Score, Valuation Verdict
- **Fundamentos**: Tese de investimento, catalisadores, riscos
- **Financeiro**: Métricas detalhadas, guidance vs realizado
- **Dividendos**: Yield, payout, calendário
- **Valuation**: Múltiplos, sensibilidade DCF
- **Comparar**: Pares setoriais, radar de métricas
- **Alertas**: Red flags, halts, fatos relevantes

### Explicabilidade

Clique em **"Ver conta"** em qualquer métrica para ver:
- Fórmula matemática
- Inputs utilizados
- Passos do cálculo
- Fonte dos dados (CVM, B3, RI, BCB)

---

## 🧩 Componentes Principais

### 1. Health Score

**Arquivo**: `src/utils/healthScore.js`

Calcula score de 0-100 baseado em 4 pilares:

```javascript
import { buildHealthScore } from '@/utils/healthScore';

const score = buildHealthScore(analysis);
// => { total: 82, max: 100, pillars: [...] }
```

**Pilares**:
1. **Rentabilidade** (25 pts): ROIC vs WACC, ROE, Margens
2. **Crescimento** (25 pts): CAGR Receita, Consistência
3. **Estrutura** (25 pts): Alavancagem, Cobertura de juros
4. **Geração de Caixa** (25 pts): FCF/LL, Dividend Yield

### 2. Valuation Verdict

**Arquivo**: `src/utils/valuation.js`

Determina se a ação está em desconto, justa ou com prêmio:

```javascript
import { buildValuationVerdict } from '@/utils/valuation';

const verdict = buildValuationVerdict(analysis, peers);
// => { status: "desconto", upsideBase: 0.18, rationale: [...] }
```

**Critérios**:
- Upside > 15% → **desconto**
- -10% a +15% → **justo**
- < -10% → **prêmio**

### 3. Skeleton Components

**Arquivo**: `src/components/Skeleton.jsx`

Loading states profissionais:

```jsx
import { SkeletonKpiChips, SkeletonChart } from '@/components/Skeleton';

{isLoading ? <SkeletonKpiChips /> : <KpiChips data={data} />}
```

### 4. Tooltips

**Arquivo**: `src/components/SimpleTooltip.jsx`

Tooltips acessíveis:

```jsx
import { SimpleTooltip } from '@/components/SimpleTooltip';

<SimpleTooltip content="CAGR = (Final/Inicial)^(1/n) - 1">
  <span>Crescimento</span>
</SimpleTooltip>
```

---

## 📊 Health Score - Detalhamento

### Pilar 1: Rentabilidade (25 pontos)

| Métrica | Peso | Critério Excelente | Critério Bom |
|---------|------|-------------------|--------------|
| ROIC vs WACC | 10 pts | Spread > 5% | Spread > 0% |
| ROE | 8 pts | > 15% | > 10% |
| Margem EBITDA | 7 pts | > 15% | > 10% |

### Pilar 2: Crescimento (25 pontos)

| Métrica | Peso | Critério Excelente | Critério Bom |
|---------|------|-------------------|--------------|
| CAGR Receita 5a | 15 pts | > 10% | > 5% |
| Consistência | 10 pts | Sem quedas | Máx 1 queda |

### Pilar 3: Estrutura de Capital (25 pontos)

| Métrica | Peso | Critério Excelente | Critério Bom |
|---------|------|-------------------|--------------|
| Dív. Líq./EBITDA | 15 pts | < 1,5x | < 3x |
| Cobertura Juros | 10 pts | > 5x | > 3x |

### Pilar 4: Geração de Caixa (25 pontos)

| Métrica | Peso | Critério Excelente | Critério Bom |
|---------|------|-------------------|--------------|
| FCF/LL | 15 pts | > 1,5x | > 0,8x |
| Dividend Yield | 10 pts | > 6% | > 3% |

---

## 🎯 Valuation Verdict - Metodologia

### Componentes do Upside

1. **Múltiplos vs Pares** (50% peso)
   - Compara EV/EBITDA com média setorial
   - Desconto > 10% adiciona upside

2. **Dividend Yield** (peso fixo)
   - Yield > 5% adiciona +5% upside

3. **Qualidade (ROIC-WACC)** (peso fixo)
   - Spread > 3% adiciona +8% upside

4. **Crescimento** (peso fixo)
   - CAGR > 8% adiciona +5% upside

### Range de Sensibilidade

- **Bear**: Upside base - 10%
- **Base**: Upside calculado
- **Bull**: Upside base + 15%

---

## 🔧 Configuração

### Encoding UTF-8

**Arquivo**: `src/utils/encoding.js`

```javascript
import { fetchTextWithCharset } from '@/utils/encoding';

// Detecta automaticamente charset (ISO-8859-1 ou UTF-8)
const text = await fetchTextWithCharset('https://api.cvm.gov.br/...');
```

### Validação de Ticker

**Arquivo**: `src/utils/validation.js`

```javascript
import { validateTicker } from '@/utils/validation';

try {
  validateTicker('VALE3'); // ✅ OK
  validateTicker('INVALID'); // ❌ Throws Error
} catch (error) {
  console.error(error.message);
}
```

---

## 🎨 Responsividade

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Exemplo de Uso

```jsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

const isMobile = useMediaQuery('(max-width: 768px)');

<ResponsiveContainer height={isMobile ? 250 : 400}>
  <AreaChart data={data} />
</ResponsiveContainer>
```

---

## ♿ Acessibilidade

### ARIA Labels

```jsx
// Screen readers
<div className="sr-only" aria-live="polite">
  {isLoading ? 'Carregando...' : 'Dados atualizados'}
</div>

// Inputs
<Input aria-label="Buscar ticker" />

// Tooltips
<div role="tooltip" id="tooltip">...</div>
```

### Navegação por Teclado

- **Enter**: Buscar ticker
- **Tab**: Navegar entre elementos
- **Esc**: Fechar modais/tooltips

---

## 📈 Roadmap

### Fase 3: Polimento (Q2 2025)

- [ ] **Comparar**: Heatmaps, radar de métricas
- [ ] **Alertas**: Red flags automáticos
- [ ] **Export PDF**: Relatório completo
- [ ] **Cache**: Fallback com dados expirados
- [ ] **Rate Limiting**: p-throttle

### Fase 4: Escalabilidade (Q3 2025)

- [ ] **APIs Reais**: CVM, B3, BCB
- [ ] **Crawler**: RI, guidance, fatos relevantes
- [ ] **Backend**: Node.js + PostgreSQL
- [ ] **Auth**: Login, watchlists personalizadas
- [ ] **Testes**: Vitest + Playwright

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código

- **ESLint**: Seguir configuração do projeto
- **Prettier**: Formatação automática
- **Commits**: Conventional Commits

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

- **Equipe GAMBIT** - Análise fundamentalista inteligente

---

## 🙏 Agradecimentos

- shadcn/ui pela biblioteca de componentes
- Recharts pela biblioteca de gráficos
- Comunidade React pela inspiração

---

**GAMBIT** - Transformando dados em decisões inteligentes 🚀
