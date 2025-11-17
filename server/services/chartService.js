import yahooFinance from 'yahoo-finance2'
import { cached } from '../lib/cache.js'

/**
 * Time to live for cached chart data (1 minute)
 */
const TTL_MS = 60 * 1000 // 1 minuto

/**
 * Default interval for chart data (5 minutes)
 */
const DEFAULT_INTERVAL = '5m'

/**
 * Default range for chart data (1 day)
 */
const DEFAULT_RANGE = '1d'

/**
 * Normalizes a ticker symbol by converting to uppercase, removing non-alphanumeric characters, and appending '.SA' if necessary.
 *
 * @param {string} raw - The raw ticker symbol
 * @returns {string|null} The normalized ticker symbol, or null if invalid
 */
function normalizeTicker(raw) {
  if (!raw) return null
  const cleaned = String(raw)
    .toUpperCase()
    .replace(/[^A-Z0-9.]/g, '')
  if (!cleaned) return null
  return cleaned.endsWith('.SA') ? cleaned : `${cleaned}.SA`
}

/**
 * Fetches intraday chart data for a given ticker symbol.
 *
 * @param {string} ticker - The ticker symbol to fetch data for
 * @param {object} [options] - Optional parameters
 * @param {string} [options.interval=DEFAULT_INTERVAL] - The interval for chart data (e.g. '5m', '1h', '1d')
 * @param {string} [options.range=DEFAULT_RANGE] - The range for chart data (e.g. '1d', '5d', '1mo')
 * @returns {Promise<object[]>} A promise resolving to an array of chart data points
 */
export async function fetchIntradayChart(ticker, { interval, range } = {}) {
  const symbol = normalizeTicker(ticker)
  if (!symbol) {
    const error = new Error('Ticker inválido')
    error.status = 400
    throw error
  }

  const resolvedInterval =
    typeof interval === 'string' && interval.trim()
      ? interval
      : DEFAULT_INTERVAL
  const resolvedRange =
    typeof range === 'string' && range.trim() ? range : DEFAULT_RANGE

  const cacheKey = `chart:${symbol}:${resolvedInterval}:${resolvedRange}`

  return cached(cacheKey, TTL_MS, async () => {
    const queryOptions = {
      interval: resolvedInterval,
      range: resolvedRange
    }

    const response = await yahooFinance.chart(symbol, queryOptions)
    const timestamps = response?.timestamp ?? []
    const quotes = response?.indicators?.quote?.[0] ?? {}

    if (!timestamps.length) {
      return []
    }

    return timestamps
      .map((ts, index) => ({
        timestamp: new Date(ts * 1000).toISOString(),
        open: quotes.open?.[index] ?? null,
        high: quotes.high?.[index] ?? null,
        low: quotes.low?.[index] ?? null,
        close: quotes.close?.[index] ?? null,
        volume: quotes.volume?.[index] ?? null
      }))
      .filter(point => point.close !== null)
  })
}
