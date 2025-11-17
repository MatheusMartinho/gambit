import { useState } from "react";

/**
 * Tooltip simples e acessível
 * Alternativa leve ao Radix UI Tooltip
 */
export function SimpleTooltip({ children, content, className = "" }) {
  const [show, setShow] = useState(false);

  if (!content) return children;

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-describedby={show ? "tooltip" : undefined}
      >
        {children}
      </div>
      {show && (
        <div
          id="tooltip"
          role="tooltip"
          className={`absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/20 bg-[#0F162B] px-3 py-2 text-xs text-white shadow-lg ${className}`}
        >
          {content}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-[#0F162B]" />
        </div>
      )}
    </div>
  );
}
