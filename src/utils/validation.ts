/**
 * Validações e sanitização de inputs
 */

export const TICKER_REGEX = /^[A-Z]{4}[0-9]{1,2}$/;

/**
 * Valida se um ticker está no formato correto da B3
 * @param ticker - Ticker para validar (ex: VALE3, PETR4)
 * @returns true se válido
 * @throws Error se inválido
 */
export function validateTicker(ticker: string): boolean {
  const normalized = ticker.trim().toUpperCase();
  
  if (!TICKER_REGEX.test(normalized)) {
    throw new Error(
      `Ticker inválido: "${ticker}". Formato esperado: 4 letras + 1-2 números (ex: VALE3)`
    );
  }
  
  return true;
}

/**
 * Normaliza ticker para formato padrão
 */
export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

/**
 * Valida se um CNPJ está no formato correto
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/[^\d]/g, '');
  return cleaned.length === 14;
}
