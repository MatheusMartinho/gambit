/**
 * Utilitários para lidar com encoding de APIs brasileiras
 * que podem retornar ISO-8859-1 ou UTF-8
 */

/**
 * Faz fetch de texto com detecção automática de charset
 * @param url - URL para fazer fetch
 * @param fallbackCharset - Charset padrão se não detectado (default: 'utf-8')
 * @returns Texto decodificado e normalizado
 */
export async function fetchTextWithCharset(
  url: string,
  fallbackCharset = 'utf-8'
): Promise<string> {
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  const contentType = res.headers.get('content-type') || '';
  const charsetMatch = /charset=([^;]+)/i.exec(contentType);
  const charset = (charsetMatch?.[1] || fallbackCharset).toLowerCase();
  
  const buffer = await res.arrayBuffer();
  const decoder = new TextDecoder(charset, { fatal: false });
  
  // Normaliza para NFC (Canonical Decomposition, followed by Canonical Composition)
  return decoder.decode(buffer).normalize('NFC');
}

/**
 * Normaliza string removendo caracteres de substituição (�)
 * e garantindo encoding correto
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\uFFFD/g, '') // Remove replacement characters
    .normalize('NFC')
    .trim();
}
