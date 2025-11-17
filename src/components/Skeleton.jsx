/**
 * Componentes de Skeleton para estados de loading
 * Melhora a percepção de performance e UX
 */

export const SkeletonLine = ({ className = "" }) => (
  <div className={`h-4 rounded bg-white/10 animate-pulse ${className}`} />
);

export const SkeletonBlock = ({ lines = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLine key={index} />
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-[#10192E] p-5 ${className}`}>
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-white/10" />
      <div className="h-8 w-1/2 rounded bg-white/10" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
      </div>
    </div>
  </div>
);

export const SkeletonKpiChips = () => (
  <div className="grid gap-3 md:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4"
      >
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/10" />
          </div>
          <div className="h-8 w-32 rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/10" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ height = 280 }) => (
  <div 
    className="rounded-2xl border border-white/10 bg-[#10192E] p-4"
    style={{ height }}
  >
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-1/4 rounded bg-white/10" />
      <div className="flex h-full items-end justify-around gap-2 pt-4">
        {[60, 80, 70, 90, 75].map((h, i) => (
          <div
            key={i}
            className="w-full rounded-t bg-white/10"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="h-4 w-1/4 rounded bg-white/10" />
        <div className="h-4 w-1/4 rounded bg-white/10" />
        <div className="h-4 w-1/4 rounded bg-white/10" />
        <div className="h-4 w-1/4 rounded bg-white/10" />
      </div>
    ))}
  </div>
);
