/**
 * @typedef {Object} SummSnippet
 * @property {string} id
 * @property {string} text
 * @property {Record<string, any>} cite
 *
 * @typedef {Object.<string, { value: number|string, unit?: string, cite: Record<string, any> }>} SummNumbers
 *
 * @typedef {Object} SummDiff
 * @property {string} what
 * @property {string} prev
 * @property {string} now
 * @property {string | undefined} [delta]
 * @property {Record<string, any>} cite
 *
 * @typedef {Object} SummInput
 * @property {string} question
 * @property {string | undefined} [company]
 * @property {SummSnippet[]} snippets
 * @property {SummNumbers} numbers
 * @property {SummDiff[] | undefined} [diff]
 *
 * @typedef {Object} SummBullet
 * @property {string} text
 * @property {Record<string, any>[]} cites
 *
 * @typedef {Object} SummOutput
 * @property {SummBullet[]} bullets
 * @property {string} paragraph
 */

/**
 * Abstract provider interface. Extend and implement summarize.
 */
export class LLMProvider {
  /**
   * @param {SummInput} input
   * @param {{ maxTokens?: number }} [opts]
   * @returns {Promise<SummOutput>}
   */
  async summarize(input, opts) {
    void input;
    void opts;
    throw new Error("summarize não implementado");
  }
}

/**
 * @param {unknown} value
 * @returns {value is SummOutput}
 */
export function isSummOutput(value) {
  if (!value || typeof value !== "object") return false;
  const payload = /** @type {Record<string, any>} */ (value);
  if (!Array.isArray(payload.bullets) || typeof payload.paragraph !== "string") return false;
  return payload.bullets.every(
    (bullet) =>
      bullet &&
      typeof bullet.text === "string" &&
      Array.isArray(bullet.cites) &&
      bullet.cites.every((cite) => cite && typeof cite === "object")
  );
}
