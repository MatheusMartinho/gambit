export const EPSILON = 1e-9;

export const cagr = (current: number, past: number, years: number) => {
  if (years <= 0) return 0;
  const base = Math.max(past, EPSILON);
  return Math.pow(current / base, 1 / years) - 1;
};

export const margem = (numerator: number, denominator: number) =>
  numerator / Math.max(denominator, EPSILON);

export const dividaLiquida = (bruta: number, caixa: number) => bruta - caixa;

export const divLiqSobreEbitda = (dividaLiq: number, ebitda: number) =>
  dividaLiq / Math.max(ebitda, EPSILON);

export const coberturaJuros = (ebit: number, despesaFinanceira: number) =>
  ebit / Math.max(despesaFinanceira, EPSILON);

export const fcf = (fco: number, capexManutencao: number) => fco - capexManutencao;

export const fcfSobreLucroLiquido = (fcfValue: number, lucroLiquido: number) =>
  fcfValue / Math.max(lucroLiquido, EPSILON);

export const roe = (lucro: number, patrimonioMedio: number) => lucro / Math.max(patrimonioMedio, EPSILON);

export const roic = (nopat: number, capitalInvestidoMedio: number) =>
  nopat / Math.max(capitalInvestidoMedio, EPSILON);

export const pl = (preco: number, lucroPorAcao: number) => preco / Math.max(lucroPorAcao, EPSILON);

export const evEbitda = (enterpriseValue: number, ebitda: number) =>
  enterpriseValue / Math.max(ebitda, EPSILON);

export const pvp = (preco: number, valorPatrimonialPorAcao: number) =>
  preco / Math.max(valorPatrimonialPorAcao, EPSILON);

export const dy = (dividendos12m: number, preco: number) => dividendos12m / Math.max(preco, EPSILON);

