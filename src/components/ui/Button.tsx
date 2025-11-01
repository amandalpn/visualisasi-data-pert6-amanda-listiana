import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
};

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-sky-500/80 text-white shadow-glass hover:bg-sky-500/95 dark:bg-sky-500/70 dark:hover:bg-sky-400/80',
  secondary:
    'border border-slate-200/70 bg-white/80 text-slate-800 shadow-sm hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-white/10',
  outline:
    'border border-slate-200/70 bg-transparent text-slate-700 hover:bg-slate-100/70 dark:text-slate-200 dark:border-white/20 dark:hover:bg-white/10',
};

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-variant={variant}
        aria-busy={loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-r-transparent"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
