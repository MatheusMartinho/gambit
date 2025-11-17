import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Slider = forwardRef(function Slider(
  {
    className,
    value,
    defaultValue = [0],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    ...props
  },
  ref
) {
  const isControlled = Array.isArray(value);
  const initial = isControlled ? value[0] ?? 0 : defaultValue[0] ?? 0;
  const [internal, setInternal] = useState(initial);

  useEffect(() => {
    if (isControlled) {
      setInternal(value[0] ?? 0);
    }
  }, [isControlled, value]);

  const handleChange = (event) => {
    const nextValue = Number(event.target.value);
    if (!isControlled) {
      setInternal(nextValue);
    }
    onValueChange?.([nextValue]);
  };

  return (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={internal}
      onChange={handleChange}
      className={cn("w-full cursor-pointer", className)}
      {...props}
    />
  );
});
