/**
 * Calcula o Valuation Verdict baseado em múltiplos, DCF e yield total.
 * 
 * Critérios:
 * - Upside > 15% → "desconto"
 * - -10% a +15% → "justo"
 * - < -10% → "prêmio"
 * 
 * @param {Object} analysis - Análise fundamentalista
 * @param {Array} peers - Empresas comparáveis (opcional)
 * @returns {Object} Verdict com status, upside e rationale
 */
export function buildValuationVerdict(analysis, peers) {
  const rationale = [];
  let upsideBase = 0;
  
  // 1. Comparação de múltiplos com pares
  if (peers && Array.isArray(peers) && peers.length > 0) {
    const evEbitdaValues = peers.map(p => p?.evEbitda).filter(v => typeof v === 'number' && v > 0);
    const avgEvEbitda = calculateAverage(evEbitdaValues);
    const currentEvEbitda = analysis?.kpis?.evEbitda ?? 0;
    
    if (avgEvEbitda > 0 && currentEvEbitda > 0) {
      const multipleDiscount = (avgEvEbitda - currentEvEbitda) / avgEvEbitda;
      upsideBase += multipleDiscount * 0.5; // 50% de peso
      
      if (multipleDiscount > 0.1) {
        rationale.push(
          `EV/EBITDA atual ${currentEvEbitda.toFixed(1)}x vs pares ${avgEvEbitda.toFixed(1)}x`
        );
      }
    }
  }
  
  // 2. Dividend Yield
  const dividendYield = analysis.kpis.dividendYield ?? 0;
  if (dividendYield > 0.05) {
    upsideBase += 0.05;
    rationale.push(`Dividend Yield acima de ${(dividendYield * 100).toFixed(1)}%`);
  }
  
  // 3. ROIC vs WACC (qualidade)
  const roic = analysis.kpis.roic ?? 0;
  const wacc = analysis.valuation.dcf?.wacc ?? 0.12;
  const spread = roic - wacc;
  
  if (spread > 0.03) {
    upsideBase += 0.08;
    rationale.push(`Spread ROIC-WACC positivo`);
  }
  
  // 4. Crescimento sustentável
  const cagrReceita = analysis.kpis.cagrReceita5a ?? 0;
  if (cagrReceita > 0.08) {
    upsideBase += 0.05;
    rationale.push(`Crescimento consistente ${(cagrReceita * 100).toFixed(1)}%`);
  }
  
  // Determinar status
  let status;
  if (upsideBase > 0.15) {
    status = "desconto";
  } else if (upsideBase < -0.10) {
    status = "premio";
  } else {
    status = "justo";
  }
  
  // Range de sensibilidade
  const range = {
    bear: Math.max(upsideBase - 0.10, -0.30),
    bull: Math.min(upsideBase + 0.15, 0.50),
  };
  
  return {
    status,
    upsideBase: Number(upsideBase.toFixed(4)),
    range,
    rationale,
    assumptions: {
      wacc: wacc,
      g: 0.02, // crescimento terminal
      ebitdaDelta: 0.05, // variação esperada
    },
  };
}

function calculateAverage(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calcula o preço-alvo implícito baseado no upside
 */
export function calculateTargetPrice(currentPrice, upside) {
  return currentPrice * (1 + upside);
}

/**
 * Calcula sensibilidade do valuation a mudanças em WACC e crescimento
 */
export function calculateSensitivity(baseWacc, baseGrowth, currentEV) {
  // Simplificado - em produção usaria modelo DCF completo
  return {
    "WACC +0,5 p.p.": -0.06,
    "WACC -0,5 p.p.": 0.07,
    "Crescimento +1 p.p.": 0.12,
    "Crescimento -1 p.p.": -0.10,
  };
}
