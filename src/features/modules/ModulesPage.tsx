import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Columns } from 'lucide-react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper, type SortingState } from '@tanstack/react-table';
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
import { GlobalFilterBar } from '@/features/filters/GlobalFilterBar';
import { craftHistogramInsight, craftScatterInsight, filterActivities } from '@/lib/analytics';
import type { StudentActivityRecord } from '@/lib/types';
import { formatNumber } from '@/lib/format';

const columnHelper = createColumnHelper<StudentActivityRecord>();

const ModulesPage = () => {
  const params = useParams<{ moduleId?: string }>();
  const { data, loading } = useOuladData();
  const filters = useAppStore((state) => state.filters);
  const setSelection = useAppStore((state) => state.setSelection);
  const [selectedStudent, setSelectedStudent] = useState<StudentActivityRecord | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    gender: true,
    region: true,
    highest_education: true,
    age_band: true,
  });

  const moduleParam = params.moduleId?.split('-');
  const moduleFilter = moduleParam ? { code_module: moduleParam[0], code_presentation: moduleParam[1] } : null;

  const filteredStudents = useMemo(() => {
    if (!data) return [];
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
        student,
      })),
    [filteredStudents],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('id_student', {
        header: 'ID Mahasiswa',
        cell: (info) => <span className="font-semibold text-slate-800 dark:text-slate-100">{info.getValue()}</span>,
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
    },
    enableSorting: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportCsv = () => {
    const header = columns
      .map((col) => col.id ?? col.accessorKey)
      .filter((key) => columnVisibility[key ?? ''] !== false);
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
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header className="space-y-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-sky-500/10 to-blue-500/20 p-6 text-slate-900 shadow-glass backdrop-blur-2xl dark:text-white">
          <h1 className="text-3xl font-bold">{moduleHeading}</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-700 dark:text-slate-200">
            Gunakan halaman ini untuk menganalisis performa mahasiswa pada modul tertentu. Scatter plot mendukung seleksi untuk menyorot mahasiswa at-risk, sedangkan histogram memperlihatkan distribusi nilai yang terjadi.
          </p>
        </header>

        <GlobalFilterBar />

        <section className="grid gap-8 lg:grid-cols-2">
          <HistogramX
            title="Distribusi Nilai Modul"
            description="Histogram skor akhir mahasiswa yang terkait modul saat ini."
            data={histogramData}
            insight={craftHistogramInsight(histogramSummary)}
          />

          <ScatterX
            title="Aktivitas vs Skor Akhir"
            description="Klik titik untuk membuka detail mahasiswa dan gunakan brush untuk seleksi massal."
            data={scatterData}
            insight={craftScatterInsight(filteredStudents)}
            onPointClick={(datum) => setSelectedStudent(datum.student as StudentActivityRecord)}
            onBrushSelection={(ids) => setSelection({ studentIds: ids })}
          />
        </section>

        <Card className="bg-white/60 dark:bg-slate-900/80">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Daftar Mahasiswa</CardTitle>
              <CardDescription>
                Tabel interaktif dengan sort, visibilitas kolom, dan ekspor CSV untuk modul yang dipilih.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
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
          <CardContent>
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
                          className="bg-white/90 px-4 py-3 align-middle text-sm text-slate-700 transition first:rounded-l-2xl last:rounded-r-2xl group-hover:bg-sky-50/80 dark:bg-white/10 dark:text-slate-200 dark:group-hover:bg-slate-800/60"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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
                    <p className="text-lg font-semibold">{formatNumber(selectedStudent.final_score)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total Klik</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedStudent.total_clicks)}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Gender" value={selectedStudent.gender} />
                  <DetailRow label="Region" value={selectedStudent.region} />
                  <DetailRow label="Pendidikan" value={selectedStudent.highest_education} />
                  <DetailRow label="Disabilitas" value={selectedStudent.disability} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Aktivitas Mingguan</p>
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

export default ModulesPage;

