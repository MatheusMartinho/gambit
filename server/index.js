import 'dotenv/config'
import process from 'node:process'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { fetchTickerSnapshot } from './services/tickerService.js'
import { fetchIntradayChart } from './services/chartService.js'
import { summarizeController } from './controllers/summarize.js'

const PORT = Number(process.env.PORT) || 4000

const app = express()

app.use(cors())
app.use(express.json())
app.use(
  morgan('dev', {
    skip: () => process.env.NODE_ENV === 'test'
  })
)

app.get('/', (_req, res) => {
  res.json({
    name: 'GAMBIT API',
    message: 'Bem-vindo! Utilize os endpoints abaixo para consumir dados.',
    endpoints: {
      health: '/api/health',
      stockSnapshot: '/api/stocks/:ticker',
      summarize: '/api/summarize',
      chart: '/api/stocks/:ticker/chart'
    },
    docs: 'Consulte README.md para mais detalhes.'
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/stocks/:ticker', async (req, res, next) => {
  const { ticker } = req.params
  try {
    const snapshot = await fetchTickerSnapshot(ticker)
    res.json(snapshot)
  } catch (error) {
    next(error)
  }
})

app.get('/api/stocks/:ticker/chart', async (req, res, next) => {
  const { ticker } = req.params
  const { interval, range } = req.query

  try {
    const data = await fetchIntradayChart(ticker, { interval, range })
    res.json({
      ticker: ticker.toUpperCase(),
      interval: interval ?? undefined,
      range: range ?? undefined,
      data
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/summarize', summarizeController)

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.path
  })
})

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
  const status = error.status ?? 500
  const message = error.message ?? 'Erro interno'

  res.status(status).json({
    error: message,
    status,
    details: error.details ?? undefined
  })
})

app.listen(PORT, () => {
  console.log(`API GAMBIT pronta em http://localhost:${PORT}`)
})
