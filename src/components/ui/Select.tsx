import { useState, useMemo, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickAway } from '@uidotdev/usehooks';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  label?: string;
  searchable?: boolean;
  emptyMessage?: string;
};

export const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi',
  className,
  label,
  searchable = true,
  emptyMessage = 'Tidak ada pilihan',
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const labelId = useId();
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));

  const filtered = useMemo(() => {
    if (!searchable || query.trim().length === 0) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [options, query, searchable]);

  const toggleValue = (nextValue: string) => {
    onChange(
      value.includes(nextValue) ? value.filter((item) => item !== nextValue) : [...value, nextValue],
    );
  };

  return (
    <div ref={ref} className={cn('relative flex flex-col gap-1', className)}>
      {label && (
        <span id={labelId} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      )}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? labelId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-left text-sm text-slate-700 shadow-inner backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/10 dark:bg-white/10 dark:text-slate-100',
        )}
      >
        <span className="truncate">
          {value.length === 0
            ? placeholder
            : `${value.length} dipilih (${options
                .filter((option) => value.includes(option.value))
                .slice(0, 3)
                .map((option) => option.label)
                .join(', ')}${value.length > 3 ? '…' : ''})`}
        </span>
        <span aria-hidden className="ml-2 text-xs text-slate-500">
          ▼
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-multiselectable
            tabIndex={-1}
            className="absolute top-[calc(100%+4px)] z-40 w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-50/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
          >
            {searchable && (
              <div className="border-b border-white/20 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <input
                  type="search"
                  placeholder="Cari…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-lg border border-white/40 bg-white/60 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-slate-500">{emptyMessage}</p>
              )}
              {filtered.map((option) => {
                const selected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-100 dark:hover:bg-white/10',
                    )}
                  >
                    <span>{option.label}</span>
                    {selected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
