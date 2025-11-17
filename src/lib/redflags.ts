export interface RedFlagDetection {
  term: string;
  context: string;
  index: number;
}

const DEFAULT_TERMS = [
  "impairment",
  "going concern",
  "covenant",
  "adverse opinion",
  "reclassificação",
  "reclassificacao",
  "investigação",
  "investigacao",
  "material weakness",
  "halting",
];

export function detectRedFlags(input: string, terms: string[] = DEFAULT_TERMS): RedFlagDetection[] {
  if (!input) return [];

  const lower = input.toLowerCase();
  return terms
    .map((term) => {
      const normalizedTerm = term.toLowerCase();
      const index = lower.indexOf(normalizedTerm);
      if (index === -1) return null;
      const context = input.slice(Math.max(0, index - 60), Math.min(input.length, index + normalizedTerm.length + 60));
      return {
        term,
        context,
        index,
      };
    })
    .filter((item): item is RedFlagDetection => Boolean(item));
}

