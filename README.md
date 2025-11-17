# GAMBIT UI Prototype

Interface demonstrativa inspirada no conceito **Perplexity para investimentos**, construída com React + Vite, Tailwind CSS e um conjunto enxuto de componentes utilitários no estilo shadcn/ui. Os indicadores financeiros agora são buscados em tempo quase real via crawlers próprios.

## Requisitos

- Node.js 20.12+ (recomendado 20.19 ou superior, conforme exigência do Vite)
- npm 9+

## Instalação

```bash
npm install
```

## Desenvolvimento

1. Inicie a API que consolida os dados da B3:
   ```bash
   npm run dev:api
   ```
   A API sobe em `http://localhost:4000`.

2. Em outro terminal, rode o front-end:
   ```bash
   npm run dev
   ```
   O Vite utiliza proxy para `/api`, então as requisições do front são redirecionadas automaticamente para a API local.

## Endpoints principais

- `GET /api/health` &rarr; verifica o status do serviço.
- `GET /api/stocks/:ticker` &rarr; retorna um snapshot consolidado para o ticker informado (ex.: `VALE3`, `PETR4`), combinando:
  - Cotação intradiária e metadados via Brapi.
  - Indicadores fundamentalistas, margens, ROIC/ROE, dividend yield, etc., via scrapping do Fundamentus.
  - Heurísticas de *drivers* e *risks* geradas a partir dos indicadores.

O serviço mantém cache em memória (TTL padrão de 1 minuto para Brapi e 10 minutos para Fundamentus) para evitar rate limits.

### Variáveis de ambiente

- `PORT`: porta da API (padrão: `4000`).
- `BRAPI_TOKEN`: opcional. Caso possua uma chave da Brapi, informe para aumentar o limite de requisições.

## Build de produção

```bash
npm run build
```

O bundle estático é gerado em `dist/`. A API pode ser executada com:

```bash
node server/index.js
```

Durante a publicação, sirva os arquivos de `dist/` e mantenha a API do diretório `server/` rodando (pode ser no mesmo host ou em serviço separado).

## Estrutura relevante

- `src/Screen.jsx`: tela principal que consome a API e renderiza a experiência “GAMBIT”.
- `src/services/api.js`: client leve que abstrai as chamadas ao backend.
- `src/components/ui/*`: wrappers estilizados inspirados no shadcn/ui.
- `server/services/*`: crawlers e consolidadores (Fundamentus, Brapi, heurísticas).
- `server/index.js`: configuração do Express (CORS + logging + rotas).
- `tailwind.config.js` / `src/index.css`: tokens de tema e reset.

## Observações

- Alguns elementos ainda exibem conteúdo estático (ex.: cards de documentos) para manter a experiência visual coesa. Os principais indicadores numéricos, entretanto, refletem dados reais.
- A Brapi funciona sem token para volumes baixos; se a API retornar HTML ou falhar com 403, confirme se a chave foi configurada.
- A UI exibe o horário da última captura no card de “Fontes & Confiança” para facilitar a auditoria manual.
