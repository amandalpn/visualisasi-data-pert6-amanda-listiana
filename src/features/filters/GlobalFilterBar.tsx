import { useMemo } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

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
    <Card className="bg-white/40 p-3 dark:bg-slate-900/70">
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <div className="col-span-full flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Filter className="h-4 w-4" /> Filter Global
        </div>
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

        <div className="col-span-full flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rentang Minggu
            <span className="rounded-full bg-white/40 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-200">
              {filters.weekRange[0]} - {filters.weekRange[1]}
            </span>
          </label>
          <input
            type="range"
            min={-4}
            max={52}
            value={filters.weekRange[0]}
            onChange={(event) =>
              setFilter('weekRange', [Number(event.target.value), filters.weekRange[1]])
            }
            className="h-2 w-40 cursor-pointer rounded-full bg-slate-200 accent-sky-500"
          />
          <input
            type="range"
            min={filters.weekRange[0]}
            max={52}
            value={filters.weekRange[1]}
            onChange={(event) =>
              setFilter('weekRange', [filters.weekRange[0], Number(event.target.value)])
            }
            className="h-2 w-40 cursor-pointer rounded-full bg-slate-200 accent-sky-500"
          />
          <Button
            type="button"
            variant="ghost"
            className="ml-auto"
            onClick={resetFilters}
            aria-label="Reset Filter"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
