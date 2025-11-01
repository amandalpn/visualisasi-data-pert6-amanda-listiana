import { cloneElement, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickAway } from '@uidotdev/usehooks';
import { cn } from '@/lib/utils';

type DropdownItem = {
  id: string;
  label: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
};

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
};

export const Dropdown = ({ trigger, items, align = 'start', className }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));

  const triggerElement = useMemo(() => {
    if (!trigger || typeof trigger !== 'object') {
      throw new Error('Trigger dropdown harus berupa elemen React.');
    }
    return trigger as React.ReactElement;
  }, [trigger]);

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      {triggerElement &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cloneElement(triggerElement as any, {
          onClick: () => setOpen((prev: boolean) => !prev),
        })}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              'absolute top-[calc(100%+8px)] z-50 w-56 rounded-2xl border border-white/20 bg-white/90 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90',
              align === 'start' ? 'left-0' : 'right-0',
            )}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-100 dark:hover:bg-white/10"
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
              >
                {item.icon && <span className="text-slate-500">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
