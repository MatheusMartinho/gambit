function formatNumber(value, options = {}) {
  const { digits = 1, suffix = "%" } = options;
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return `${value.toFixed(digits).replace(".", ",")}${suffix ?? ""}`;
}

export function buildInsights({ price, valuation, profitability, dividends, leverage, growth }) {
  const drivers = [];
  const risks = [];

  if (valuation?.pe && valuation.pe > 0 && valuation.pe < 9) {
    drivers.push(`P/L em ${formatNumber(valuation.pe, { digits: 2, suffix: "x" })}, abaixo da média histórica da B3`);
  }

  if (dividends?.dividendYield && dividends.dividendYield >= 6) {
    drivers.push(`Dividend yield de ${formatNumber(dividends.dividendYield, { digits: 1 })} com histórico consistente`);
  }

  if (profitability?.roic && profitability.roic >= 12) {
    drivers.push(`ROIC elevado (${formatNumber(profitability.roic, { digits: 1 })}) sinaliza disciplina de capital`);
  }

  if (leverage?.netDebtToEbitda && leverage.netDebtToEbitda > 3) {
    risks.push(
      `Alavancagem de ${formatNumber(leverage.netDebtToEbitda, { digits: 1, suffix: "x" })} exige monitoramento de geração de caixa`
    );
  }

  if (growth?.revenueCagr5y && growth.revenueCagr5y < 0) {
    risks.push(`Receita encolheu ${formatNumber(Math.abs(growth.revenueCagr5y), { digits: 1 })} nos últimos 5 anos`);
  }

  if (profitability?.marginNet && profitability.marginNet < 8) {
    risks.push(`Margem líquida de ${formatNumber(profitability.marginNet, { digits: 1 })} pode pressionar retorno`);
  }

  const thesisParts = [];
  if (drivers.length) {
    thesisParts.push(`Tese apoiada em ${drivers[0].toLowerCase()}`);
  }
  if (price?.changePercent12m !== null && price?.changePercent12m !== undefined) {
    thesisParts.push(
      `Ação acumula ${formatNumber(price.changePercent12m, { digits: 1 })} em 12 meses; mercado precifica ${price.changePercent12m >= 0 ? "recuperação" : "pressão recente"}`
    );
  }
  if (risks.length) {
    thesisParts.push(`Monitorar ${risks[0].toLowerCase()}`);
  }

  return {
    thesis: thesisParts.join(". "),
    drivers,
    risks,
  };
}
