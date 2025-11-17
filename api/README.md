# Gambit API - Análise Fundamentalista de Ações B3

API REST completa para análise fundamentalista de ações da B3, com dados em tempo real, cálculos avançados e sistema de scoring profissional.

## 🚀 Features

- **Busca e Discovery**: Busca inteligente de ações por ticker, nome ou setor
- **Dados em Tempo Real**: Cotações, gráficos intraday e dados de mercado
- **Análise Fundamentalista**: Demonstrações financeiras completas (DRE, Balanço, DFC)
- **Health Score**: Sistema de pontuação profissional (Investment Quality Score)
- **Valuation**: DCF, múltiplos comparáveis e análise de sensibilidade
- **Dividendos**: Histórico completo, yield, payout e análise de sustentabilidade
- **Comparação**: Compare múltiplas ações lado a lado
- **Alertas**: Sistema de alertas personalizados
- **WebSocket**: Dados em tempo real via WebSocket

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 15
- Redis >= 7
- npm >= 9.0.0

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gambit-api.git
cd gambit-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrations
npm run migrate

# (Opcional) Popule o banco com dados de exemplo
npm run seed

# Inicie o servidor
npm run dev
```

## 🌐 Endpoints Principais

### Search & Discovery

```http
GET /api/v1/search?q=VALE&limit=10
```

### Stock Overview

```http
GET /api/v1/stocks/VALE3
GET /api/v1/stocks/VALE3?include=health_score,valuation_verdict,quick_insights
```

### Fundamentals

```http
GET /api/v1/stocks/VALE3/fundamentals
```

### Dividends

```http
GET /api/v1/stocks/VALE3/dividends
```

### Valuation

```http
GET /api/v1/stocks/VALE3/valuation
```

### Health Score

```http
GET /api/v1/stocks/VALE3/health-score
```

### Comparison

```http
POST /api/v1/compare
Content-Type: application/json

{
  "tickers": ["VALE3", "PETR4", "ITUB4"],
  "metrics": ["pe_ratio", "dividend_yield", "roe"]
}
```

## 📊 Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "company": {
      "ticker": "VALE3",
      "name": "Vale S.A.",
      "sector": "Mineração",
      "industry": "Minério de Ferro"
    },
    "quote": {
      "price": 64.27,
      "change": -1.21,
      "change_percent": -1.21,
      "volume": 1018380000,
      "market_cap": 285000000000
    },
    "health_score": {
      "total_score": 82,
      "grade": "A-",
      "classification": "Investment Grade",
      "breakdown": {
        "financial_health": {
          "score": 22,
          "max_score": 25,
          "percentage": 88
        }
      }
    }
  },
  "meta": {
    "request_id": "req_abc123",
    "generated_at": "2025-10-14T17:50:00Z",
    "execution_time_ms": 324,
    "cache_hit": false
  }
}
```

## 🔐 Autenticação

A API suporta autenticação via JWT:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Use o token retornado no header:

```http
Authorization: Bearer <token>
```

## ⚡ Rate Limiting

- **Anonymous**: 10 req/min, 100 req/hour, 500 req/day
- **Authenticated**: 60 req/min, 1000 req/hour, 10000 req/day
- **Premium**: 300 req/min, 10000 req/hour, 100000 req/day

## 🔌 WebSocket

Conecte-se ao WebSocket para dados em tempo real:

```javascript
const ws = new WebSocket('ws://localhost:8080');

// Subscribe to ticker
ws.send(JSON.stringify({
  type: 'subscribe',
  ticker: 'VALE3'
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Quote update:', data);
};
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📦 Estrutura do Projeto

```
api/
├── src/
│   ├── controllers/      # Controllers das rotas
│   ├── services/         # Lógica de negócio
│   ├── models/           # Modelos do banco de dados
│   ├── routes/           # Definição de rotas
│   ├── middleware/       # Middlewares (auth, validation, etc.)
│   ├── utils/            # Utilitários
│   ├── cache/            # Gerenciamento de cache
│   ├── database/         # Configuração do banco
│   ├── websocket/        # Servidor WebSocket
│   ├── monitoring/       # Métricas e monitoring
│   └── server.js         # Entry point
├── tests/                # Testes
├── logs/                 # Logs da aplicação
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json
└── README.md
```

## 🛠️ Tecnologias

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **Cache**: Redis
- **Queue**: Bull
- **WebSocket**: ws
- **Logging**: Winston
- **Metrics**: Prometheus
- **Testing**: Jest + Supertest
- **Validation**: Joi

## 📈 Fontes de Dados

- B3 API (oficial)
- CVM API (oficial)
- Banco Central do Brasil API
- Yahoo Finance API
- Alpha Vantage API
- Fundamentus (scraping)
- Status Invest (scraping)

## 🚀 Deploy

### Docker

```bash
# Build
docker build -t gambit-api .

# Run
docker run -p 3000:3000 --env-file .env gambit-api
```

### Docker Compose

```bash
docker-compose up -d
```

## 📝 Licença

MIT

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou PR.

## 📧 Contato

- Email: contato@gambit.com
- Website: https://gambit.com
- Documentação: https://docs.gambit.com

---

**Desenvolvido com ❤️ pela equipe Gambit**
