import { cn } from "@/lib/utils";

export function Badge({ className, children, variant = "default", ...props }) {
  const variants = {
    default: "bg-white/10 text-white",
    secondary: "bg-white/10 text-white/80",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
