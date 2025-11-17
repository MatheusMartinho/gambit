import { useState } from "react";
import { Check, X, AlertCircle, ChevronDown, ChevronUp, TrendingUp, Award, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Investment Quality Scorecard - Redesign Premium
 * Sistema de pontuação profissional, transparente e gamificado
 */
export function ProfessionalChecklist({ checklist }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  
  if (!checklist) return null;

  const categories = Object.values(checklist);

  // Calcular score total
  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const totalMaxScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
  const totalPercent = Math.round((totalScore / totalMaxScore) * 100);

  // Determinar grade
  const getGrade = (percent) => {
    if (percent >= 90) return { grade: "A+", label: "Exceptional", color: "emerald" };
    if (percent >= 85) return { grade: "A", label: "Excellent", color: "emerald" };
    if (percent >= 80) return { grade: "A-", label: "Excellent", color: "emerald" };
    if (percent >= 75) return { grade: "B+", label: "Good", color: "blue" };
    if (percent >= 70) return { grade: "B", label: "Good", color: "blue" };
    if (percent >= 60) return { grade: "C+", label: "Fair", color: "amber" };
    return { grade: "C", label: "Fair", color: "amber" };
  };

  const gradeInfo = getGrade(totalPercent);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Ícones por categoria
  const categoryIcons = {
    "SAÚDE FINANCEIRA": "💪",
    "CRESCIMENTO": "📈",
    "RENTABILIDADE": "💎",
    "QUALIDADE DOS LUCROS": "🔍",
    "GOVERNANÇA": "🏛️",
    "DIVIDENDOS": "💰"
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO SECTION - Score Agregado */}
      <Card className="relative overflow-hidden rounded-2xl border-white/10 bg-gradient-to-br from-[#0D1425] via-[#10192E] to-[#0D1425]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(62,143,255,0.1),transparent_60%)]" />
        <CardContent className="relative p-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-white">INVESTMENT QUALITY SCORE</h2>
          </div>

          {/* Score Central */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/10 bg-white/5">
              <div>
                <div className="text-5xl font-bold text-white">{totalScore}</div>
                <div className="text-xs text-white/50">de {totalMaxScore}</div>
              </div>
            </div>
            <div className={`text-2xl font-bold text-${gradeInfo.color}-400`}>{gradeInfo.label}</div>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-white/60">
              <span>Grade: <span className="font-semibold text-white">{gradeInfo.grade}</span></span>
              <span>•</span>
              <span>{totalPercent >= 70 ? 'Investment Grade' : totalPercent >= 50 ? 'Speculative Grade' : 'High Risk'}</span>
              <span>•</span>
              <span>Risk: <span className={totalPercent >= 70 ? 'text-emerald-400' : totalPercent >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                {totalPercent >= 70 ? 'Baixo' : totalPercent >= 50 ? 'Médio' : 'Alto'}
              </span></span>
            </div>
          </div>

          {/* Distribuição do Score */}
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-white/50">📊 Distribuição do Score:</div>
            {categories.map((category) => {
              const scorePercent = Math.round((category.score / category.maxScore) * 100);
              const emoji = scorePercent >= 80 ? "🟢" : scorePercent >= 60 ? "🟡" : "🔴";
              return (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">{category.category}:</span>
                    <span className="font-semibold text-white">
                      {category.score}/{category.maxScore} ({scorePercent}%) {emoji}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        scorePercent >= 80
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : scorePercent >= 60
                          ? "bg-gradient-to-r from-amber-500 to-amber-400"
                          : "bg-gradient-to-r from-rose-500 to-rose-400"
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="ghost" className="h-9 text-xs text-white/70 hover:text-white">
              Ver Detalhamento Completo
            </Button>
            <Button variant="ghost" className="h-9 text-xs text-white/70 hover:text-white">
              Comparar com Setor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. CHECKLIST EXPANDIDO - Cards por Dimensão */}
      <div className="space-y-4">
        {categories.map((category) => {
          const scorePercent = Math.round((category.score / category.maxScore) * 100);
          const isExpanded = expandedCategories[category.category];
          const icon = categoryIcons[category.category] || "📊";
          const stars = Math.round((scorePercent / 100) * 5);

          return (
            <Card key={category.category} className="rounded-2xl border-white/10 bg-white/5">
              <CardContent className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < stars ? "text-amber-400" : "text-white/20"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <Badge className="bg-white/10 text-sm font-bold text-white">
                        {category.score}/{category.maxScore}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        scorePercent >= 80
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : scorePercent >= 60
                          ? "bg-gradient-to-r from-amber-500 to-amber-400"
                          : "bg-gradient-to-r from-rose-500 to-rose-400"
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right text-xs font-semibold text-white/70">{scorePercent}%</div>
                </div>

                {/* Items Preview (primeiros 3) */}
                <div className="space-y-3">
                  {category.items.slice(0, isExpanded ? undefined : 3).map((item, idx) => {
                    const points = item.status ? "+5" : item.note ? "+3" : "+0";
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/10 bg-[#0F162B] p-4"
                      >
                        <div className="flex items-start gap-3">
                          {item.status ? (
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                              <Check className="h-4 w-4 text-emerald-400" />
                            </div>
                          ) : item.note ? (
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                              <AlertCircle className="h-4 w-4 text-amber-400" />
                            </div>
                          ) : (
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20">
                              <X className="h-4 w-4 text-rose-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-medium text-white">{item.check}</div>
                              <Badge className="bg-white/10 text-xs text-white/70">{points} pontos</Badge>
                            </div>
                            {item.note && (
                              <div className="mt-2 space-y-1 text-xs text-white/60">
                                <div>💡 <span className="font-semibold">Por quê importa:</span> {item.note}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expand/Collapse Button */}
                {category.items.length > 3 && (
                  <Button
                    variant="ghost"
                    onClick={() => toggleCategory(category.category)}
                    className="mt-4 w-full text-xs text-white/50 hover:text-white"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Recolher Critérios
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Expandir Todos os Critérios ({category.items.length - 3} mais)
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. RESUMO FINAL */}
      {totalPercent >= 70 && (
        <Card className="rounded-2xl border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <div className="text-lg font-semibold text-emerald-400">Empresa de Qualidade</div>
                <div className="text-sm text-white/70">
                  Score acima de 70 pontos indica fundamentos sólidos e baixo risco de investimento.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {totalPercent < 70 && totalPercent >= 50 && (
        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="text-lg font-semibold text-amber-400">Empresa com Ressalvas</div>
                <div className="text-sm text-white/70">
                  Score entre 50-70 pontos indica alguns pontos de atenção. Avalie os riscos antes de investir.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {totalPercent < 50 && (
        <Card className="rounded-2xl border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <div className="text-lg font-semibold text-rose-400">Empresa de Alto Risco</div>
                <div className="text-sm text-white/70">
                  Score abaixo de 50 pontos indica fundamentos fracos. Investimento não recomendado.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfessionalChecklist;
