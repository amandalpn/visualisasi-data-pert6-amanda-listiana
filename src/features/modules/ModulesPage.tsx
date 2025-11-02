// 🔼 Tambah import ini di atas
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Columns, Filter as FilterIcon, ChevronDown, Check } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import { HistogramX } from '@/components/charts/HistogramX';
import { ScatterX } from '@/components/charts/ScatterX';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
// ⬇️ ganti GlobalFilterBar dengan Sidebar/Drawer
import { FilterSidebar, FilterDrawer } from '@/features/filters/FilterSidebar';
import { craftHistogramInsight, craftScatterInsight, filterActivities } from '@/lib/analytics';
import type { StudentActivityRecord } from '@/lib/types';
import { formatNumber } from '@/lib/format';

const columnHelper = createColumnHelper<StudentActivityRecord>();
const ALL_PAGE_SIZE = Number.MAX_SAFE_INTEGER;

const ModulesPage = () => {
  const params = useParams<{ moduleId?: string }>();
  const { data, loading } = useOuladData();
  const filters = useAppStore((state) => state.filters);
  const setSelection = useAppStore((state) => state.setSelection);

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [selectedStudent, setSelectedStudent] = useState<StudentActivityRecord | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    gender: true,
    region: true,
    highest_education: true,
    age_band: true,
  });
  const [openFilter, setOpenFilter] = useState(false); // ⬅️ state untuk drawer di mobile

  const moduleParam = params.moduleId?.split('-');
  const moduleFilter = moduleParam
    ? { code_module: moduleParam[0], code_presentation: moduleParam[1] }
    : null;

  const filteredStudents = useMemo(() => {
    if (!data) return [] as StudentActivityRecord[];
    const withModule = moduleFilter
      ? data.studentActivity.filter(
          (student) =>
            student.code_module === moduleFilter.code_module &&
            student.code_presentation === moduleFilter.code_presentation,
        )
      : data.studentActivity;
    return filterActivities(withModule, filters, filters.weekRange);
  }, [data, filters, moduleFilter]);

  const histogramSummary = useMemo(() => {
    const bucket = new Map<string, number>();
    filteredStudents.forEach((student) => {
      const band = `${Math.floor(student.final_score / 10) * 10}`;
      bucket.set(band, (bucket.get(band) ?? 0) + 1);
    });
    return Array.from(bucket.entries()).map(([band, students]) => ({
      band,
      code_module: moduleFilter?.code_module ?? 'ALL',
      code_presentation: moduleFilter?.code_presentation ?? 'ALL',
      students,
    }));
  }, [filteredStudents, moduleFilter]);

  const histogramData = useMemo(
    () =>
      histogramSummary.flatMap((row) =>
        Array.from({ length: row.students }).map(() => ({ value: Number(row.band) })),
      ),
    [histogramSummary],
  );

  const scatterData = useMemo(
    () =>
      filteredStudents.map((student) => ({
        id: student.id_student,
        x: student.total_clicks,
        y: student.final_score,
        group: student.final_score >= 40 ? 'Lulus' : 'Berisiko',
      })),
    [filteredStudents],
  );

  const studentById = useMemo(() => {
    const map = new Map<string, StudentActivityRecord>();
    filteredStudents.forEach((student) => {
      map.set(student.id_student, student);
    });
    return map;
  }, [filteredStudents]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id_student', {
        header: 'ID Mahasiswa',
        cell: (info) => (
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {info.getValue()}
          </span>
        ),
      }),
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
        cell: (info) => `${formatNumber(info.getValue())}`,
      }),
      columnHelper.accessor('total_clicks', {
        header: 'Total Klik',
        cell: (info) => formatNumber(info.getValue()),
      }),
      columnHelper.accessor('gender', {
        header: 'Gender',
      }),
      columnHelper.accessor('region', {
        header: 'Region',
      }),
      columnHelper.accessor('highest_education', {
        header: 'Pendidikan',
      }),
      columnHelper.accessor('age_band', {
        header: 'Rentang Usia',
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredStudents,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    enableSorting: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportCsv = () => {
    const header = columns
      .map((col: any) => col.id ?? col.accessorKey)
      .filter((key: string | undefined) => columnVisibility[key ?? ''] !== false);
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
    saveAs(blob, 'module-students.csv');
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

  const moduleHeading = moduleFilter
    ? `Detail Modul ${moduleFilter.code_module} ${moduleFilter.code_presentation}`
    : 'Eksplorasi Modul';

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-3 py-8 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header className="space-y-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-sky-500/10 to-blue-500/20 p-5 text-slate-900 shadow-glass backdrop-blur-2xl dark:text-white sm:p-6">
          <h1 className="text-2xl font-bold sm:text-3xl">{moduleHeading}</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-700 dark:text-slate-200 sm:text-base">
            Gunakan halaman ini untuk menganalisis performa mahasiswa pada modul tertentu. Scatter
            plot mendukung seleksi untuk menyorot mahasiswa at-risk, sedangkan histogram
            memperlihatkan distribusi nilai yang terjadi.
          </p>
        </header>
        {/* Tombol filter untuk mobile */}
        <div className="flex items-center justify-end lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setOpenFilter(true)}>
            <FilterIcon className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[var(--fsb-w,320px),minmax(0,1fr)]">
          {/* Sidebar hanya tampil di desktop */}
          <FilterSidebar className="hidden lg:block" />

          {/* Konten utama */}
          <div className="space-y-8 min-w-0">
            {' '}
            {/* ⬅️ penting: min-w-0 */}
            {/* ====== CHART SECTION ====== */}
            {/* ⬇️ ganti section chart supaya children-nya boleh menyusut dan rapi tingginya */}
            <section className="grid gap-8 lg:grid-cols-2 [grid-auto-rows:minmax(0,1fr)]">
              {/* Histogram */}
              <VizCard>
                {' '}
                {/* ⬅️ pembungkus anti-offside */}
                <HistogramX
                  title="Distribusi Nilai Modul"
                  description="Histogram skor akhir mahasiswa yang terkait modul saat ini."
                  data={histogramData}
                  insight={craftHistogramInsight(histogramSummary)}
                />
              </VizCard>

              {/* Scatter */}
              <VizCard>
                <ScatterX
                  title="Aktivitas vs Skor Akhir"
                  description="Klik titik untuk membuka detail mahasiswa dan gunakan brush untuk seleksi massal."
                  data={scatterData}
                  insight={craftScatterInsight(filteredStudents)}
                  onPointClick={(id) => {
                    const student = studentById.get(id);
                    if (student) setSelectedStudent(student);
                  }}
                  onBrushSelection={(ids) => setSelection({ studentIds: ids })}
                />
              </VizCard>
            </section>
            <Card className="bg-white/60 dark:bg-slate-900/80">
              <CardHeader className="w-full grid gap-3 items-center sm:grid-cols-[1fr_auto] !px-4">
                <div>
                  <CardTitle>Daftar Mahasiswa</CardTitle>
                  <CardDescription>
                    Tabel interaktif dengan sort, visibilitas kolom, dan ekspor CSV untuk modul yang
                    dipilih.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center -mb-3 gap-3 justify-end lg:-mr-2">
                  <Dropdown
                    align="end"
                    trigger={
                      <Button variant="secondary" size="sm">
                        <Columns className="mr-2 h-4 w-4" />
                        Kolom
                      </Button>
                    }
                    items={table.getAllLeafColumns().map((column) => ({
                      id: column.id,
                      label: (
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={(event) => column.toggleVisibility(event.target.checked)}
                            className="h-3 w-3 rounded border-slate-300 accent-sky-500"
                          />
                          {column.columnDef.header as string}
                        </span>
                      ),
                      onSelect: () => column.toggleVisibility(),
                    }))}
                  />
                  <Button variant="primary" size="sm" onClick={exportCsv}>
                    <Save className="mr-2 h-4 w-4" />
                    Ekspor CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 !px-4">
                {' '}
                {/* ⬅️ biar isi tidak dorong lebar grid */}
                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-600 mb-3 dark:text-slate-300">Tampilkan</span>
                    <Dropdown
                      align="start"
                      trigger={
                        <button
                          type="button"
                          className="inline-flex items-center mb-3 gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:border-sky-300 hover:bg-white/20 dark:border-white/15 dark:bg-white/10 dark:text-slate-100"
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
                    <span className="text-slate-500 mb-3 dark:text-slate-400">baris</span>
                  </div>
                  <div className="flex flex-col mb-3 gap-2 text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:gap-4">
                    <span>
                      {totalRows === 0
                        ? 'Tidak ada data'
                        : `Menampilkan ${startRow}-${endRow} dari ${totalRows} mahasiswa`}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
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
                <div className="max-h-[520px] overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 p-2 dark:border-slate-700/60 dark:bg-white/5">
                  <div className="max-h-[480px] overflow-auto rounded-3xl border border-slate-200/70 bg-white/60 p-2 dark:border-slate-700/60 dark:bg-white/5">
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
        {/* Modal detail mahasiswa */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <DialogContent
            title="Detail Mahasiswa"
            description="Ringkasan aktivitas dan performa mahasiswa untuk mendukung percakapan akademik personal."
          >
            {selectedStudent && (
              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">ID Mahasiswa</p>
                    <p className="text-lg font-semibold">{selectedStudent.id_student}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Outcome</p>
                    <Badge className="mt-1">{selectedStudent.outcome}</Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Skor Akhir</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(selectedStudent.final_score)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total Klik</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(selectedStudent.total_clicks)}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Gender" value={selectedStudent.gender} />
                  <DetailRow label="Region" value={selectedStudent.region} />
                  <DetailRow label="Pendidikan" value={selectedStudent.highest_education} />
                  <DetailRow label="Disabilitas" value={selectedStudent.disability} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Aktivitas Mingguan
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedStudent.weeks.map((week) => (
                      <span
                        key={week.week}
                        className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-200"
                      >
                        M{week.week}: {week.clicks} klik
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Drawer filter untuk mobile */}
        <FilterDrawer open={openFilter} onClose={() => setOpenFilter(false)} />
      </motion.div>
    </main>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
      {value || 'Tidak tersedia'}
    </p>
  </div>
);

// Panel pembungkus chart agar responsif & anti-offside
const VizCard = ({ children }: { children: ReactNode }) => (
  <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 p-3 sm:p-4 dark:border-slate-700/60 dark:bg-white/5">
    <div className="min-w-0 w-full h-full">{children}</div>
  </div>
);

export default ModulesPage;
