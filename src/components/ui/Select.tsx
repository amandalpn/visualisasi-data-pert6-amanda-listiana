import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickAway } from '@uidotdev/usehooks';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const highlightMatch = (label: string, query: string) => {
  if (!query) return label;
  const normalized = query.toLowerCase();
  const index = label.toLowerCase().indexOf(normalized);
  if (index === -1) return label;
  const before = label.slice(0, index);
  const match = label.slice(index, index + query.length);
  const after = label.slice(index + query.length);
  return (
    <>
      {before}
      <span className="text-sky-600 dark:text-sky-300">{match}</span>
      {after}
    </>
  );
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
    if (!searchable) return options;
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((option) => option.label.toLowerCase().includes(trimmed));
  }, [options, query, searchable]);

  const toggleValue = (nextValue: string) => {
    onChange(
      value.includes(nextValue) ? value.filter((item) => item !== nextValue) : [...value, nextValue],
    );
  };

  const selectedLabels = useMemo(
    () => options.filter((option) => value.includes(option.value)).map((option) => option.label),
    [options, value],
  );

  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels[0]} +${selectedLabels.length - 1}`;

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
          'flex w-full items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-left text-sm font-medium text-slate-800 shadow-inner backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/10 dark:bg-white/10 dark:text-slate-100',
        )}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown aria-hidden className="ml-2 h-4 w-4 text-slate-500" />
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
            className="absolute top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:ring-white/10"
          >
            {searchable && (
              <div className="flex items-center gap-2 border-b border-slate-200/70 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Cari pilihan…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
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
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-100 dark:hover:bg-white/10',
                      selected && 'bg-sky-100/70 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
                    )}
                  >
                    <span className="flex-1 text-left">
                      {highlightMatch(option.label, searchable ? query.trim() : '')}
                    </span>
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
