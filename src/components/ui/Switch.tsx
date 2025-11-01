import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-12 items-center rounded-full border border-white/30 bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/10 dark:bg-white/10',
          checked && 'bg-sky-500/80 border-sky-400/60 dark:bg-sky-500/70',
          className,
        )}
        {...props}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden
          className={cn(
            'absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-all dark:bg-slate-900',
            checked && 'translate-x-6',
          )}
        />
      </button>
    );
  },
);

Switch.displayName = 'Switch';
