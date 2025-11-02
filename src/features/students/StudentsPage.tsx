import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, DownloadCloud, ChevronDown, Check } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type PaginationState,
} from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import { filterActivities } from '@/lib/analytics';
import type { StudentActivityRecord } from '@/lib/types';
import { FilterSidebar, FilterDrawer } from '@/features/filters/FilterSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/format';
import { Dropdown } from '@/components/ui/Dropdown';

const columnHelper = createColumnHelper<StudentActivityRecord>();
const ALL_PAGE_SIZE = Number.MAX_SAFE_INTEGER;

const StudentsPage = () => {
  const { data, loading } = useOuladData();
  const filters = useAppStore((state) => state.filters);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [openFilter, setOpenFilter] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return filterActivities(data.studentActivity, filters, filters.weekRange);
  }, [data, filters]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id_student', {
        header: 'ID Mahasiswa',
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('code_module', { header: 'Modul' }),
      columnHelper.accessor('code_presentation', { header: 'Presentasi' }),
      columnHelper.accessor('outcome', {
        header: 'Outcome',
        cell: (info) => (
          <Badge
            variant={
              info.getValue() === 'Pass'
                ? 'success'
                : info.getValue() === 'Fail'
                  ? 'warning'
                  : 'outline'
            }
          >
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('final_score', {
        header: 'Skor Akhir',
        cell: (info) => `${formatNumber(info.getValue())} / 100`,
      }),
      columnHelper.accessor('total_clicks', {
        header: 'Total Klik',
        cell: (info) => formatNumber(info.getValue()),
      }),
      columnHelper.display({
        id: 'sparkline',
        header: 'Aktivitas Mingguan',
        cell: (info) => <Sparkline weeks={info.row.original.weeks} />,
      }),
      columnHelper.accessor('region', { header: 'Region' }),
      columnHelper.accessor('highest_education', { header: 'Pendidikan' }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  const exportCsv = () => {
    const header = table
      .getAllLeafColumns()
      .filter((column) => column.id !== 'sparkline')
      .map((column) => column.id);
    const rows = filteredStudents.map((student) =>
      header
        .map((key) => {
          const value = student[key as keyof StudentActivityRecord];
          return typeof value === 'string' || typeof value === 'number' ? value : '';
        })
        .join(','),
    );
    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'students-explorer.csv');
  };

  useEffect(() => {
    setPagination((prev) => ({
      pageIndex: 0,
      pageSize: prev.pageSize,
    }));
  }, [filteredStudents.length]);

  const totalRows = filteredStudents.length;
  const pageSizeValue =
    pagination.pageSize === ALL_PAGE_SIZE ? Math.max(totalRows, 1) : pagination.pageSize;
  const currentRows = table.getRowModel().rows.length;
  const startRow = totalRows === 0 ? 0 : pagination.pageIndex * pageSizeValue + 1;
  const endRow = totalRows === 0 ? 0 : startRow + currentRows - 1;
  const pageSizeLabel =
    pagination.pageSize === ALL_PAGE_SIZE ? 'Semua' : String(pagination.pageSize);
  const pageSizeOptions = [10, 20, 30, 50];

  if (loading || !data) {
    return (
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="h-16 animate-pulse rounded-3xl bg-white/40 dark:bg-white/10" />
        <div className="h-[600px] animate-pulse rounded-3xl bg-white/40 dark:bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header className="space-y-4 rounded-3xl bg-gradient-to-r from-violet-500/20 via-sky-500/10 to-cyan-500/20 p-6 text-slate-900 shadow-glass backdrop-blur-2xl dark:text-white">
          <h1 className="text-3xl font-bold">Students Explorer</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-700 dark:text-slate-200">
            Lihat daftar mahasiswa dengan metrik keterlibatan penting. Gunakan pencarian, sortir,
            dan ekspor untuk mendukung penelusuran advokasi maupun monitoring retention.
          </p>
        </header>

        {/* tombol filter untuk mobile */}
        <div className="flex items-center justify-end lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setOpenFilter(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        {/* 2 kolom: sidebar kiri (desktop) + konten kanan */}
        <div className="grid gap-6 lg:grid-cols-[var(--fsb-w,320px),minmax(0,1fr)]">
          <FilterSidebar className="hidden lg:block" />

          <div className="space-y-6 min-w-0">
            {' '}
            {/* penting: biar bisa menyusut */}
            <Card className="bg-white/60 dark:bg-slate-900/80">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Daftar Mahasiswa Terfilter</CardTitle>
                  <CardDescription>
                    Kombinasi sparkline dan metrik utama untuk membantu identifikasi pola belajar
                    individu.
                  </CardDescription>
                </div>
                <Button variant="primary" size="sm" onClick={exportCsv}>
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Ekspor CSV
                </Button>
              </CardHeader>
              <CardContent className="min-w-0">
                <div className="mb-4 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300">Tampilkan</span>
                    <Dropdown
                      align="start"
                      trigger={
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:border-sky-300 hover:bg-white/20 dark:border-white/15 dark:bg-white/10 dark:text-slate-100"
                        >
                          {pageSizeLabel}
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </button>
                      }
                      items={[
                        ...pageSizeOptions.map((size) => ({
                          id: String(size),
                          label: (
                            <span className="flex items-center gap-2">
                              {size}
                              {pagination.pageSize === size && (
                                <Check className="h-4 w-4 text-sky-500" />
                              )}
                            </span>
                          ),
                          onSelect: () =>
                            setPagination({
                              pageIndex: 0,
                              pageSize: size,
                            }),
                        })),
                        {
                          id: 'all',
                          label: (
                            <span className="flex items-center gap-2">
                              Semua
                              {pagination.pageSize === ALL_PAGE_SIZE && (
                                <Check className="h-4 w-4 text-sky-500" />
                              )}
                            </span>
                          ),
                          onSelect: () =>
                            setPagination({
                              pageIndex: 0,
                              pageSize: ALL_PAGE_SIZE,
                            }),
                        },
                      ]}
                    />
                    <span className="text-slate-500 dark:text-slate-400">baris</span>
                  </div>
                  <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300 md:flex-row md:items-center md:gap-4">
                    <span>
                      {totalRows === 0
                        ? 'Tidak ada data'
                        : `Menampilkan ${startRow}-${endRow} dari ${totalRows} mahasiswa`}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-lg"
                      >
                        Prev
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-lg"
                      >
                        Next
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setPagination({
                            pageIndex: 0,
                            pageSize: ALL_PAGE_SIZE,
                          })
                        }
                        disabled={pagination.pageSize === ALL_PAGE_SIZE}
                        className="rounded-lg"
                      >
                        All
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="max-h-[600px] overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 p-2 dark:border-slate-700/60 dark:bg-white/5">
                  <div className="max-h-[560px] overflow-auto rounded-3xl border border-slate-200/70 bg-white/60 p-2 dark:border-slate-700/60 dark:bg-white/5">
                    <table className="min-w-full border-separate border-spacing-x-0 border-spacing-y-2 text-sm text-slate-700 dark:text-slate-200">
                      <thead className="sticky top-0 z-10 rounded-2xl bg-white/95 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur-xl dark:bg-slate-900/90 dark:text-slate-300">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th key={header.id} className="px-4 py-3 text-left">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="group">
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="bg-white/90 px-4 py-3 align-top text-sm text-slate-700 transition first:rounded-l-2xl last:rounded-r-2xl group-hover:bg-sky-50/80 dark:bg-white/10 dark:text-slate-200 dark:group-hover:bg-slate-800/60"
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* drawer untuk mobile */}
      <FilterDrawer open={openFilter} onClose={() => setOpenFilter(false)} />
    </main>
  );
};

const Sparkline = ({ weeks }: { weeks: Array<{ week: number; clicks: number }> }) => {
  if (!weeks || weeks.length === 0) {
    return <span className="text-xs text-slate-500">Tidak ada data</span>;
  }
  const maxClicks = Math.max(...weeks.map((week) => week.clicks));
  const points = weeks
    .map((week, index) => {
      const x = (index / Math.max(weeks.length - 1, 1)) * 100;
      const y = maxClicks === 0 ? 50 : 100 - (week.clicks / maxClicks) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="h-12 w-[120px] md:w-32 overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="rgba(56,189,248,0.9)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default StudentsPage;
