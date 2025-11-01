import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
};

export const Tabs = ({ defaultValue, value: valueProp, onValueChange, children, className }: TabsProps) => {
  const [valueState, setValueState] = useState(defaultValue);
  const value = valueProp ?? valueState;
  const baseId = useId();

  const setValue = (next: string) => {
    if (!valueProp) {
      setValueState(next);
    }
    onValueChange?.(next);
  };

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value,
      setValue,
      baseId,
    }),
    [value, baseId],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('flex w-full flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="tablist"
    className={cn(
      'inline-flex rounded-full border border-white/30 bg-white/10 p-1 text-sm dark:border-white/10 dark:bg-white/5',
      className,
    )}
    {...props}
  />
);

export const TabsTrigger = ({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger harus berada di dalam Tabs.');
  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`${ctx.baseId}-${value}`}
      id={`${ctx.baseId}-${value}-trigger`}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
        isActive
          ? 'bg-sky-500/80 text-white shadow-lg'
          : 'text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/10',
        className,
      )}
      type="button"
      onClick={() => ctx.setValue(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent harus berada di dalam Tabs.');
  const isActive = ctx.value === value;
  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`${ctx.baseId}-${value}`}
      aria-labelledby={`${ctx.baseId}-${value}-trigger`}
      className={cn(className)}
    >
      {isActive && children}
    </div>
  );
};
