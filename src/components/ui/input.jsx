import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/10 bg-[#0F162B] px-3 py-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1F]",
        className
      )}
      {...props}
    />
  );
});
