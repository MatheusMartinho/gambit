import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1F] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  default: "bg-[#3E8FFF] text-white hover:bg-[#2c75dc]",
  outline: "border border-white/10 bg-transparent text-white hover:bg-white/10",
  ghost: "bg-transparent text-[#3E8FFF] hover:bg-white/10",
  secondary: "bg-[#14213D] text-white hover:bg-[#172847]",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant] ?? variants.default, sizes[size] ?? sizes.default, className)}
      {...props}
    />
  );
});
