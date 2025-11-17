import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext(null);

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(
    controlledValue ?? defaultValue ?? null
  );
  const id = useId();

  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue, isControlled]);

  const setValue = useCallback(
    (next) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const contextValue = useMemo(
    () => ({
      value: internalValue,
      setValue,
      id,
    }),
    [internalValue, setValue, id]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export const TabsList = forwardRef(function TabsList(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex items-center justify-start rounded-lg bg-white/5 p-1",
        className
      )}
      {...props}
    />
  );
});

export const TabsTrigger = forwardRef(function TabsTrigger(
  { className, value, disabled = false, children, ...props },
  ref
) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const isActive = context.value === value;

  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      disabled={disabled}
      aria-selected={isActive}
      aria-controls={`${context.id}-content-${value}`}
      id={`${context.id}-trigger-${value}`}
      onClick={() => context.setValue(value)}
      className={cn(
        "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8FFF]",
        isActive
          ? "bg-[#3E8FFF] text-white shadow"
          : "text-white/70 hover:text-white",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export const TabsContent = forwardRef(function TabsContent({ className, value, ...props }, ref) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const hidden = context.value !== value;

  return (
    <div
      ref={ref}
      role="tabpanel"
      tabIndex={hidden ? -1 : 0}
      aria-labelledby={`${context.id}-trigger-${value}`}
      id={`${context.id}-content-${value}`}
      hidden={hidden}
      className={cn("ring-offset-background focus-visible:outline-none", className)}
      {...props}
    />
  );
});
