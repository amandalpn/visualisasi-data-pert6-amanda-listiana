import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DownloadCloud } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { saveAs } from 'file-saver';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import { filterActivities } from '@/lib/analytics';
import type { StudentActivityRecord } from '@/lib/types';
import { GlobalFilterBar } from '@/features/filters/GlobalFilterBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/format';

const columnHelper = createColumnHelper<StudentActivityRecord>();

const StudentsPage = () => {
  const { data, loading } = useOuladData();
  const filters = useAppStore((state) => state.filters);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return filterActivities(data.studentActivity, filters, filters.weekRange);
  }, [data, filters]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id_student', {
        header: 'ID Mahasiswa',
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-slate-100">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('code_module', {
        header: 'Modul',
      }),
      columnHelper.accessor('code_presentation', {
        header: 'Presentasi',
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
      columnHelper.accessor('region', {
        header: 'Region',
      }),
      columnHelper.accessor('highest_education', {
        header: 'Pendidikan',
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 64,
    getScrollElement: () => document.getElementById('students-table-scroll'),
    overscan: 8,
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <header className="space-y-4 rounded-3xl bg-gradient-to-r from-violet-500/20 via-sky-500/10 to-cyan-500/20 p-6 text-slate-900 shadow-glass backdrop-blur-2xl dark:text-white">
          <h1 className="text-3xl font-bold">Students Explorer</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-700 dark:text-slate-200">
            Lihat daftar mahasiswa dengan metrik keterlibatan penting. Gunakan pencarian, sortir, dan ekspor untuk mendukung penelusuran advokasi maupun monitoring retention.
          </p>
        </header>

        <GlobalFilterBar />

        <Card className="bg-white/60 dark:bg-slate-900/80">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Daftar Mahasiswa Terfilter</CardTitle>
              <CardDescription>
                Tabel virtualized dengan sparkline aktivitas untuk membantu identifikasi pola belajar individu.
              </CardDescription>
            </div>
            <Button variant="primary" size="sm" onClick={exportCsv}>
              <DownloadCloud className="mr-2 h-4 w-4" />
              Ekspor CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div
              id="students-table-scroll"
              className="max-h-[600px] overflow-auto rounded-2xl border border-white/30"
            >
              <table className="min-w-full border-collapse text-sm text-slate-700 dark:text-slate-200">
                <thead className="sticky top-0 bg-white/70 backdrop-blur-xl dark:bg-slate-900/80">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    return (
                      <tr
                        key={row.id}
                        className="absolute inset-x-0 border-b border-white/20 bg-white/40 text-sm last:border-b-0 dark:bg-white/5"
                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3 align-top">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
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
    <svg viewBox="0 0 100 100" className="h-12 w-32 overflow-visible">
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
