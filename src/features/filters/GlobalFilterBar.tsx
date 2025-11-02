import { useMemo } from 'react';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const buildOptions = (values: string[]) =>
  Array.from(new Set(values))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));

export const GlobalFilterBar = () => {
  const { data } = useOuladData();
  const filters = useAppStore((s) => s.filters);
  const setFilter = useAppStore((s) => s.setFilter);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const activeFilters = useMemo(() => {
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

  const options = useMemo(() => {
    if (!data) {
      return {
        modules: [],
        presentations: [],
        regions: [],
        ageBands: [],
        educationLevels: [],
        genders: [],
        disabilities: [],
      };
    }
    return {
      modules: buildOptions(data.moduleOutcome.map((row) => row.code_module)),
      presentations: buildOptions(data.moduleOutcome.map((row) => row.code_presentation)),
      regions: buildOptions(data.regionChoropleth.map((row) => row.region)),
      ageBands: buildOptions(data.studentActivity.map((row) => row.age_band)),
      educationLevels: buildOptions(data.studentActivity.map((row) => row.highest_education)),
      genders: buildOptions(data.studentActivity.map((row) => row.gender)),
      disabilities: buildOptions(data.studentActivity.map((row) => row.disability)),
    };
  }, [data]);

  return (
    <Card className="shadow-glass dark:shadow-black/40">
      <CardHeader className="items-start gap-4 border-b border-slate-200/70 pb-4 dark:border-white/10">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-200">
            <Filter className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base">Filter Global</CardTitle>
            <CardDescription>
              Pilihan diterapkan otomatis setiap kali Anda mengubah opsi di bawah ini.
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
            aria-label="Reset Filter"
            className="rounded-lg"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Modul"
            placeholder="Semua Modul"
            options={options.modules}
            value={filters.modules}
            onChange={(value) => setFilter('modules', value)}
          />
          <Select
            label="Presentasi"
            placeholder="Semua Presentasi"
            options={options.presentations}
            value={filters.presentations}
            onChange={(value) => setFilter('presentations', value)}
          />
          <Select
            label="Region"
            placeholder="Semua Region"
            options={options.regions}
            value={filters.regions}
            onChange={(value) => setFilter('regions', value)}
          />
          <Select
            label="Rentang Usia"
            placeholder="Semua"
            options={options.ageBands}
            value={filters.ageBands}
            onChange={(value) => setFilter('ageBands', value)}
          />
          <Select
            label="Pendidikan"
            placeholder="Semua"
            options={options.educationLevels}
            value={filters.educationLevels}
            onChange={(value) => setFilter('educationLevels', value)}
          />
          <Select
            label="Gender"
            placeholder="Semua"
            options={options.genders}
            value={filters.genders}
            onChange={(value) => setFilter('genders', value)}
          />
          <Select
            label="Disabilitas"
            placeholder="Semua"
            options={options.disabilities}
            value={filters.disabilities}
            onChange={(value) => setFilter('disabilities', value)}
          />
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <SlidersHorizontal className="h-4 w-4" />
              Rentang Minggu
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
              {filters.weekRange[0]} - {filters.weekRange[1]}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="range"
              min={-4}
              max={filters.weekRange[1]}
              value={filters.weekRange[0]}
              onChange={(event) =>
                setFilter('weekRange', [Number(event.target.value), filters.weekRange[1]])
              }
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
            />
            <input
              type="range"
              min={filters.weekRange[0]}
              max={52}
              value={filters.weekRange[1]}
              onChange={(event) =>
                setFilter('weekRange', [filters.weekRange[0], Number(event.target.value)])
              }
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
            Geser titik biru untuk menyesuaikan periode analisis. Grafik akan beradaptasi secara
            real time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
