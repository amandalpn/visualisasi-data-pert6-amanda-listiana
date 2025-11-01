import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'outline';
};

const variantStyle: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-sky-500/80 text-white',
  success: 'bg-emerald-500/80 text-white',
  warning: 'bg-amber-400/80 text-slate-900',
  outline: 'border border-white/40 bg-transparent text-slate-700 dark:text-slate-100',
};

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-xl',
      variantStyle[variant],
      className,
    )}
    {...props}
  />
);
