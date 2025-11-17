import { forwardRef, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const base =
  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1F]";

export const Switch = forwardRef(function Switch(
  { className, checked, defaultChecked = false, onCheckedChange, disabled = false, ...props },
  ref
) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(checked ?? defaultChecked);

  useEffect(() => {
    if (isControlled) {
      setInternal(Boolean(checked));
    }
  }, [checked, isControlled]);

  const isOn = useMemo(() => Boolean(internal), [internal]);

  const toggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) {
      setInternal(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      ref={ref}
      onClick={toggle}
      className={cn(
        base,
        isOn ? "bg-[#3E8FFF]" : "bg-white/10",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform",
          isOn && "translate-x-6"
        )}
      />
    </button>
  );
});
