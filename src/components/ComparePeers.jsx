import { memo, useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const EmptyState = ({ message }) => (
  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/50">
    {message}
  </div>
);

const formatMultiple = (value, suffix = "x") => {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return `${Number(value).toFixed(1)}${suffix}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return `${(Number(value) * 100).toFixed(1)}%`;
};

const ComparePeers = memo(({ analysis, peers, onSelectTicker }) => {
  const hasPeers = peers?.length;
  const base = hasPeers ? peers[0] : undefined;
  const others = hasPeers ? peers.slice(1) : [];
  const isMobile = useMediaQuery("(max-width: 768px)");

  const multiplesData = useMemo(() => {
    if (!hasPeers) return [];
    return peers.map((item) => ({
      ticker: item.ticker,
      pl: item.pl ?? 0,
      evEbitda: item.evEbitda ?? 0,
      dividendYield: (item.dividendYield ?? 0) * 100,
    }));
  }, [hasPeers, peers]);

  const radarData = useMemo(() => {
    if (!base) return [];
    const avg = (field) => {
      if (!others.length) return base[field] ?? 0;
      const values = others.map((item) => item[field] ?? 0);
      const sum = values.reduce((acc, value) => acc + value, 0);
      return values.length ? sum / values.length : 0;
    };

    const inverse = (value) => {
      if (!value) return 0;
      return 1 / value;
    };

    return [
      {
        metric: "Margem EBITDA",
        Base: (base.margemEbitda ?? 0) * 100,
        Setor: avg("margemEbitda") * 100,
      },
      {
        metric: "ROE",
        Base: (base.roe ?? 0) * 100,
        Setor: avg("roe") * 100,
      },
      {
        metric: "Dividend Yield",
        Base: (base.dividendYield ?? 0) * 100,
        Setor: avg("dividendYield") * 100,
      },
      {
        metric: "Inverso P/L",
        Base: inverse(base.pl ?? 0) * 100,
        Setor: inverse(avg("pl")) * 100,
      },
    ];
  }, [base, others]);

  const heatmapData = useMemo(() => {
    if (!hasPeers) return [];
    return peers.map((item) => ({
      ticker: item.ticker,
      empresa: item.empresa,
      margemEbitda: (item.margemEbitda ?? 0) * 100,
      roe: (item.roe ?? 0) * 100,
      dividendYield: (item.dividendYield ?? 0) * 100,
    }));
  }, [hasPeers, peers]);

  if (!hasPeers) {
    return (
      <Card className="rounded-2xl border-white/10 bg-[#10192E]">
        <CardContent className="p-5">
          <EmptyState message="Sem pares cadastrados para comparar ainda." />
        </CardContent>
      </Card>
    );
  }

  const baseCompany = analysis?.empresa ?? base?.empresa ?? analysis?.ticker;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-2xl border-white/10 bg-[#10192E]">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between text-white/80">
            <div>
              <div className="text-xs uppercase tracking-wide text-white/40">Comparavel setorial</div>
              <div className="text-lg font-semibold text-white">{baseCompany}</div>
            </div>
            <Badge className="border-white/10 bg-white/10 text-white/70">Pares {peers.length - 1}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-white/70">
              <thead>
                <tr className="text-white/40">
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">Ticker</th>
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">P/L</th>
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">EV/EBITDA</th>
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">Dividend Yield</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {peers.map((item) => (
                  <tr key={item.ticker} className="border-t border-white/10 text-white/80">
                    <td className="py-2 pr-4 font-medium text-white">{item.ticker}</td>
                    <td className="py-2 pr-4">{formatMultiple(item.pl)}</td>
                    <td className="py-2 pr-4">{formatMultiple(item.evEbitda)}</td>
                    <td className="py-2 pr-4">{formatPercent(item.dividendYield)}</td>
                    <td className="py-2 pr-0 text-right">
                      <Button size="sm" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" onClick={() => onSelectTicker?.(item.ticker)}>
                        <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                        Analisar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ height: isMobile ? 220 : 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiplesData} margin={isMobile ? { top: 16, right: 16, left: -12, bottom: 0 } : { top: 20, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="ticker" stroke="#94a3b8" />
                <YAxis yAxisId="left" orientation="left" stroke="#3E8FFF" />
                <YAxis yAxisId="right" orientation="right" stroke="#F97316" />
                <RechartsTooltip
                  formatter={(value, name) => {
                    if (name === "dividendYield") return [`${Number(value).toFixed(1)}%`, "Dividend Yield"];
                    return [`${Number(value).toFixed(1)}x`, name === "pl" ? "P/L" : "EV/EBITDA"];
                  }}
                  contentStyle={{ background: "#111A2E", borderRadius: 12, border: "1px solid rgba(148,163,184,.2)" }}
                />
                <Bar yAxisId="left" dataKey="pl" name="P/L" fill="#3E8FFF" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="evEbitda" name="EV/EBITDA" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="dividendYield" name="Dividend Yield" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-white/10 bg-[#10192E]">
        <CardContent className="space-y-4 p-5">
          <div className="text-xs uppercase tracking-wide text-white/40">Sensibilidade e qualitativos</div>
          <div style={{ height: isMobile ? 220 : 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1f2a44" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#1f2a44" />
                <Radar name={analysis?.ticker ?? "Base"} dataKey="Base" stroke="#3E8FFF" fill="#3E8FFF" fillOpacity={0.45} />
                <Radar name="Peers" dataKey="Setor" stroke="#F97316" fill="#F97316" fillOpacity={0.25} />
                <RechartsTooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {heatmapData.map((item) => {
              const intensity = Math.min(1, Math.max(0, item.margemEbitda / 40));
              const background = `linear-gradient(120deg, rgba(62,143,255,${intensity}) 0%, rgba(16,25,46,0.8) 100%)`;
              return (
                <div key={item.ticker} className="rounded-xl border border-white/10 p-3 text-xs text-white/80" style={{ background }}>
                  <div className="flex items-center justify-between text-sm text-white">
                    <span>{item.ticker}</span>
                    <Badge className="border-white/10 bg-white/10 text-white/70">{item.empresa}</Badge>
                  </div>
                  <div className="mt-2 grid gap-1">
                    <span>Margem EBITDA: <strong>{item.margemEbitda.toFixed(1)}%</strong></span>
                    <span>ROE: <strong>{item.roe.toFixed(1)}%</strong></span>
                    <span>Dividend Yield: <strong>{item.dividendYield.toFixed(1)}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ComparePeers;
