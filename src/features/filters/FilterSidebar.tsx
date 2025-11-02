import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, RotateCcw, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

// Utils
export type Option = { label: string; value: string };
const buildOptions = (values: string[]): Option[] =>
  Array.from(new Set(values))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));

function useActiveFiltersCount() {
  const filters = useAppStore((s) => s.filters);
  return useMemo(() => {
    let total = 0;
    if (filters.modules.length) total += 1;
    if (filters.presentations.length) total += 1;
    if (filters.regions.length) total += 1;
    if (filters.ageBands.length) total += 1;
    if (filters.educationLevels.length) total += 1;
    if (filters.genders.length) total += 1;
    if (filters.disabilities.length) total += 1;
    if (filters.weekRange[0] !== 0 || filters.weekRange[1] !== 52) total += 1;
    return total;
  }, [filters]);
}

function FilterBody() {
  const { data } = useOuladData();
  const filters = useAppStore((s) => s.filters);
  const setFilter = useAppStore((s) => s.setFilter);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const activeFilters = useActiveFiltersCount();

  const options = useMemo(() => {
    if (!data) {
      return {
        modules: [] as Option[],
        presentations: [] as Option[],
        regions: [] as Option[],
        ageBands: [] as Option[],
        educationLevels: [] as Option[],
        genders: [] as Option[],
        disabilities: [] as Option[],
      };
    }
    return {
      modules: buildOptions(data.moduleOutcome.map((r) => r.code_module)),
      presentations: buildOptions(data.moduleOutcome.map((r) => r.code_presentation)),
      regions: buildOptions(data.regionChoropleth.map((r) => r.region)),
      ageBands: buildOptions(data.studentActivity.map((r) => r.age_band)),
      educationLevels: buildOptions(data.studentActivity.map((r) => r.highest_education)),
      genders: buildOptions(data.studentActivity.map((r) => r.gender)),
      disabilities: buildOptions(data.studentActivity.map((r) => r.disability)),
    };
  }, [data]);

  return (
    <>
      <CardHeader className="items-start gap-4 border-b border-slate-200/70 pb-4 dark:border-white/10">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-200">
            <Filter className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base">Filter Global</CardTitle>
            <CardDescription className="text-left">
              Pilihan diterapkan otomatis saat Anda mengubah opsi.
            </CardDescription>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {activeFilters > 0 && (
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
              {activeFilters} filter aktif
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="rounded-lg"
            title="Reset filter"
            aria-label="Reset filter"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4">
          <Select
            label="Modul"
            placeholder="Semua Modul"
            options={options.modules}
            value={filters.modules}
            onChange={(v) => setFilter('modules', v)}
          />
          <Select
            label="Presentasi"
            placeholder="Semua Presentasi"
            options={options.presentations}
            value={filters.presentations}
            onChange={(v) => setFilter('presentations', v)}
          />
          <Select
            label="Region"
            placeholder="Semua Region"
            options={options.regions}
            value={filters.regions}
            onChange={(v) => setFilter('regions', v)}
          />
          <Select
            label="Rentang Usia"
            placeholder="Semua"
            options={options.ageBands}
            value={filters.ageBands}
            onChange={(v) => setFilter('ageBands', v)}
          />
          <Select
            label="Pendidikan"
            placeholder="Semua"
            options={options.educationLevels}
            value={filters.educationLevels}
            onChange={(v) => setFilter('educationLevels', v)}
          />
          <Select
            label="Gender"
            placeholder="Semua"
            options={options.genders}
            value={filters.genders}
            onChange={(v) => setFilter('genders', v)}
          />
          <Select
            label="Disabilitas"
            placeholder="Semua"
            options={options.disabilities}
            value={filters.disabilities}
            onChange={(v) => setFilter('disabilities', v)}
          />
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <SlidersHorizontal className="h-4 w-4" /> Rentang Minggu
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
              {filters.weekRange[0]} - {filters.weekRange[1]}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="range"
              min={-4}
              max={filters.weekRange[1]}
              value={filters.weekRange[0]}
              onChange={(e) =>
                setFilter('weekRange', [Number(e.target.value), filters.weekRange[1]])
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
              aria-label="Minggu awal"
            />
            <input
              type="range"
              min={filters.weekRange[0]}
              max={52}
              value={filters.weekRange[1]}
              onChange={(e) =>
                setFilter('weekRange', [filters.weekRange[0], Number(e.target.value)])
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
              aria-label="Minggu akhir"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
            Geser titik biru untuk menyesuaikan periode analisis. Grafik akan beradaptasi real-time.
          </p>
        </div>
      </CardContent>
    </>
  );
}

export function FilterSidebar({ className = '' }: { className?: string }) {
  // collapsed state: simpan di localStorage + atur CSS var lebar sidebar
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('filters.sidebarCollapsed') === '1';
  });

  const resetFilters = useAppStore((s) => s.resetFilters);
  const activeFilters = useActiveFiltersCount();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--fsb-w', collapsed ? '64px' : '320px');
      window.localStorage.setItem('filters.sidebarCollapsed', collapsed ? '1' : '0');
    }
  }, [collapsed]);

  // Set nilai awal jika belum ada
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const stored = window.localStorage.getItem('filters.sidebarCollapsed');
      if (!stored) {
        document.documentElement.style.setProperty('--fsb-w', '320px');
      } else {
        document.documentElement.style.setProperty('--fsb-w', stored === '1' ? '64px' : '320px');
      }
    }
  }, []);

  return (
    <aside className={`sticky top-24 h-fit ${className}`} aria-expanded={!collapsed}>
      <div className={`relative transition-[width] ${collapsed ? 'w-16' : 'w-[320px]'}`}>
        {/* Toggle button mengambang di tepi kanan */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-4 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/80 text-slate-600 shadow dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200"
          title={collapsed ? 'Tampilkan filter' : 'Sembunyikan filter'}
          aria-label={collapsed ? 'Tampilkan filter' : 'Sembunyikan filter'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <Card className="shadow-glass overflow-visible dark:shadow-black/40">
          {/* Mode collapsed: tampilkan ikon-ikon ringkas */}
          {collapsed ? (
            <div className="flex flex-col items-center gap-3 p-3">
              <div className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <Filter className="h-5 w-5" />
                </span>
                {activeFilters > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {activeFilters}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                title="Reset filter"
                aria-label="Reset filter"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <FilterBody />
          )}
        </Card>
      </div>
    </aside>
  );
}

export function FilterDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
          }}
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-sm overflow-auto rounded-l-[32px] border border-white/30 bg-white/80 p-4 shadow-2xl dark:border-white/10 dark:bg-slate-900/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Filter Global
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border px-2 py-1 text-slate-600 dark:border-white/10 dark:text-slate-200"
                title="Tutup drawer"
                aria-label="Tutup drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Card className="border-none bg-transparent shadow-none">
              <FilterBody />
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
