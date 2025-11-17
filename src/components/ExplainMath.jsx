import { useMemo } from "react";
import { ArrowUpRight, Database, Info } from "lucide-react";

function formatCalcValue(value) {
  if (value === null || value === undefined) return "--";
  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 4,
    }).format(value);
  }
  return String(value);
}

export function ExplainMath({ formula, calculation, cite, triggerLabel = "Explain the math", className = "" }) {
  const hasContent = formula || calculation?.inputs || calculation?.steps || cite?.source || cite?.url;

  const formattedInputs = useMemo(() => {
    if (!calculation?.inputs) return [];
    return Object.entries(calculation.inputs).map(([key, val]) => ({
      key,
      value: formatCalcValue(val),
    }));
  }, [calculation]);

  if (!hasContent) {
    return null;
  }

  return (
    <details className={`mt-3 rounded-lg border border-white/10 bg-[#0F162B] p-3 text-xs text-white/60 ${className}`}>
      <summary className="flex cursor-pointer items-center gap-2 font-medium text-white/70 hover:text-white">
        <Info className="h-3 w-3" />
        {triggerLabel}
      </summary>
      <div className="mt-3 space-y-3">
        {formula && (
          <div className="rounded bg-[#13203B] p-2 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap">
            {formula}
          </div>
        )}

        {formattedInputs.length > 0 && (
          <div className="rounded border border-white/10 bg-[#111B32] p-2">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-white/40">Entradas</div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
              {formattedInputs.map(({ key, value }) => (
                <div key={key} className="text-white/70">
                  <dt className="text-[10px] uppercase tracking-wide text-white/40">{key}</dt>
                  <dd className="font-mono text-[11px] text-white/80">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {calculation?.steps?.length > 0 && (
          <div className="rounded border border-white/10 bg-[#111B32] p-2">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-white/40">Passos</div>
            <ol className="space-y-1 text-white/70">
              {calculation.steps.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[10px] text-white/40">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {(cite?.source || cite?.page || cite?.table || cite?.metric) && (
          <div className="flex flex-wrap items-center gap-1.5 text-white/40">
            <Database className="h-3 w-3" />
            {cite?.source && <span>Fonte: {cite.source}</span>}
            {cite?.page && <span>p. {cite.page}</span>}
            {cite?.table && <span>Tabela: {cite.table}</span>}
            {cite?.metric && <span>Métrica: {cite.metric}</span>}
          </div>
        )}

        {cite?.url && (
          <a
            href={cite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#3E8FFF] hover:underline"
          >
            <ArrowUpRight className="h-3 w-3" />
            Ver documento original
          </a>
        )}
      </div>
    </details>
  );
}



