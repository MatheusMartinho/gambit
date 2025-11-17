export function cleanText(input) {
  if (!input && input !== 0) return "";
  return String(input).replace(/\s+/g, " ").trim();
}

export function parseBrazilianNumber(value) {
  if (!value && value !== 0) return null;
  const asString = String(value)
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.+-]/g, "");
  if (!asString || asString === "-" || asString === ".") return null;
  const numeric = Number(asString);
  return Number.isFinite(numeric) ? numeric : null;
}

export function parsePercent(value) {
  const numeric = parseBrazilianNumber(value);
  if (numeric === null) return null;
  return numeric;
}

export function safeDivide(numerator, denominator) {
  if (!denominator || !Number.isFinite(denominator)) return null;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}
