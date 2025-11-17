import { Buffer } from 'node:buffer'
import cheerio from 'cheerio'
import iconv from 'iconv-lite'
import { cached } from '../lib/cache.js'
import {
  cleanText,
  parseBrazilianNumber,
  parsePercent,
  safeDivide
} from '../lib/parsers.js'

const BASE_URL = 'https://fundamentus.com.br/detalhes.php'
const TTL_MS = 10 * 60 * 1000 // 10 minutes

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  Referer: 'https://fundamentus.com.br/'
}

function buildMap($) {
  const data = new Map()
  const assign = (key, value) => {
    if (!data.has(key)) {
      data.set(key, value)
    } else {
      const existing = data.get(key)
      if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        data.set(key, [existing, value])
      }
    }
  }

  $('td').each((_, td) => {
    const raw = $(td).text()
    if (!raw.includes('?')) {
      return
    }
    const label = cleanText(raw.replace(/\?/g, ''))
    const value = cleanText($(td).next().text())
    if (!label || !value) return
    assign(label, value)
  })

  return data
}

function pickExact($, label) {
  return cleanText(
    $('td')
      .filter((_, td) => cleanText($(td).text()) === label)
      .next()
      .text()
  )
}

function getValue(map, label) {
  if (!map.has(label)) return null
  return map.get(label)
}

function getFirstAsNumber(map, label) {
  const value = getValue(map, label)
  if (Array.isArray(value)) {
    return parseBrazilianNumber(value[0])
  }
  return parseBrazilianNumber(value)
}

function getSecondAsNumber(map, label) {
  const value = getValue(map, label)
  if (Array.isArray(value) && value.length > 1) {
    return parseBrazilianNumber(value[1])
  }
  return null
}

function computeLeverageExtras(map) {
  const firmValue = parseBrazilianNumber(getValue(map, 'Valor da firma'))
  const evToEbitda = parseBrazilianNumber(getValue(map, 'EV / EBITDA'))
  const netDebt = parseBrazilianNumber(getValue(map, 'Dív. Líquida'))
  if (!firmValue || !evToEbitda) {
    return {
      ebitda: null,
      netDebtEbitda: null
    }
  }
  const ebitda = safeDivide(firmValue, evToEbitda)
  const netDebtEbitda = netDebt ? safeDivide(netDebt, ebitda) : null
  return {
    ebitda,
    netDebtEbitda
  }
}

export async function fetchFundamentusSnapshot(ticker) {
  const normalized = ticker.toUpperCase()
  const url = `${BASE_URL}?papel=${encodeURIComponent(normalized)}`

  return cached(`fundamentus:${normalized}`, TTL_MS, async () => {
    const response = await fetch(url, { headers: HEADERS })
    if (!response.ok) {
      throw new Error(`Fundamentus request failed (${response.status})`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const text = iconv.decode(buffer, 'ISO-8859-1')
    const $ = cheerio.load(text)

    const map = buildMap($)

    const changeDay = parsePercent(pickExact($, 'Dia'))
    const changeMonth = parsePercent(pickExact($, 'Mês'))
    const change30d = parsePercent(pickExact($, '30 dias'))
    const change12m = parsePercent(pickExact($, '12 meses'))

    const { ebitda, netDebtEbitda } = computeLeverageExtras(map)

    const revenue12m = getFirstAsNumber(map, 'Receita Líquida')
    const revenue3m = getSecondAsNumber(map, 'Receita Líquida')
    const ebit12m = getFirstAsNumber(map, 'EBIT')
    const ebit3m = getSecondAsNumber(map, 'EBIT')
    const netIncome12m = getFirstAsNumber(map, 'Lucro Líquido')
    const netIncome3m = getSecondAsNumber(map, 'Lucro Líquido')

    return {
      ticker: normalized,
      fetchedAt: new Date().toISOString(),
      company: {
        name: cleanText(getValue(map, 'Empresa')),
        type: cleanText(getValue(map, 'Tipo')),
        sector: cleanText(getValue(map, 'Setor')),
        subsector: cleanText(getValue(map, 'Subsetor')),
        lastQuoteDate: cleanText(getValue(map, 'Data últ cot'))
      },
      price: {
        close: parseBrazilianNumber(getValue(map, 'Cotação')),
        changePercentDay: changeDay,
        changePercentMonth: changeMonth,
        changePercent30d: change30d,
        changePercent12m: change12m,
        min52w: parseBrazilianNumber(getValue(map, 'Min 52 sem')),
        max52w: parseBrazilianNumber(getValue(map, 'Max 52 sem'))
      },
      marketData: {
        marketCap: parseBrazilianNumber(getValue(map, 'Valor de mercado')),
        firmValue: parseBrazilianNumber(getValue(map, 'Valor da firma')),
        shares: parseBrazilianNumber(getValue(map, 'Nro. Ações')),
        volumeAvg2m: parseBrazilianNumber(getValue(map, 'Vol $ méd (2m)'))
      },
      valuation: {
        pe: parseBrazilianNumber(getValue(map, 'P/L')),
        pb: parseBrazilianNumber(getValue(map, 'P/VP')),
        psr: parseBrazilianNumber(getValue(map, 'PSR')),
        pebit: parseBrazilianNumber(getValue(map, 'P/EBIT')),
        pAssets: parseBrazilianNumber(getValue(map, 'P/Ativos')),
        pWorkingCapital: parseBrazilianNumber(getValue(map, 'P/Cap. Giro')),
        pNetCurrentAssets: parseBrazilianNumber(
          getValue(map, 'P/Ativ Circ Liq')
        ),
        evEbitda: parseBrazilianNumber(getValue(map, 'EV / EBITDA')),
        evEbit: parseBrazilianNumber(getValue(map, 'EV / EBIT'))
      },
      profitability: {
        marginGross: parsePercent(getValue(map, 'Marg. Bruta')),
        marginEbit: parsePercent(getValue(map, 'Marg. EBIT')),
        marginNet: parsePercent(getValue(map, 'Marg. Líquida')),
        roic: parsePercent(getValue(map, 'ROIC')),
        roe: parsePercent(getValue(map, 'ROE')),
        ebitOverAssets: parsePercent(getValue(map, 'EBIT / Ativo')),
        assetTurnover: parsePercent(getValue(map, 'Giro Ativos'))
      },
      dividends: {
        dividendYield: parsePercent(getValue(map, 'Div. Yield')),
        dividendPayout: parsePercent(getValue(map, 'Payout')),
        dividendOnEquity: parsePercent(getValue(map, 'Div Br/ Patrim'))
      },
      leverage: {
        grossDebt: parseBrazilianNumber(getValue(map, 'Dív. Bruta')),
        cashAndEquivalents: parseBrazilianNumber(
          getValue(map, 'Disponibilidades')
        ),
        netDebt: parseBrazilianNumber(getValue(map, 'Dív. Líquida')),
        currentRatio: parseBrazilianNumber(getValue(map, 'Liquidez Corr')),
        netDebtToEquity: parsePercent(getValue(map, 'Div Br/ Patrim')),
        netDebtToEbitda: netDebtEbitda
      },
      financials: {
        revenue12m,
        revenue3m,
        ebit12m,
        ebit3m,
        ebitda12m: ebitda,
        netIncome12m,
        netIncome3m
      },
      growth: {
        revenueCagr5y: parsePercent(getValue(map, 'Cres. Rec (5a)'))
      },
      raw: Object.fromEntries(map.entries())
    }
  })
}
