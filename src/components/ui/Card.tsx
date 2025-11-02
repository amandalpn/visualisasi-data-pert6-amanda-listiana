import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'overflow-visible rounded-3xl border border-slate-200/70 bg-white/80 shadow-glass backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-900/70',
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-start justify-between gap-4 p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      'font-heading text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100',
      className,
    )}
    {...props}
  />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      'text-sm text-justify leading-relaxed text-slate-500 dark:text-slate-300',
      className,
    )}
    {...props}
  />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 pb-6', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 pb-6 pt-0', className)} {...props} />
);
