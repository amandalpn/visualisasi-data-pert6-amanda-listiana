import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCopy, Check } from 'lucide-react';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import {
  computeKpis,
  craftActivityInsight,
  craftModuleInsight,
  craftScatterInsight,
  craftHistogramInsight,
  craftDemographicInsight,
  buildRegionInsight,
  filterModuleOutcomes,
  filterActivityByWeek,
  filterGradeDistribution,
  filterOutcomeByDemographic,
  filterActivities,
  filterRegionChoropleth,
} from '@/lib/analytics';
import { GlobalFilterBar } from '@/features/filters/GlobalFilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const InsightsPage = () => {
  const { data, loading } = useOuladData();
  const filters = useAppStore((state) => state.filters);
  const [copied, setCopied] = useState(false);

  const insights = useMemo(() => {
    if (!data) {
      return [];
    }

    const moduleOutcome = filterModuleOutcomes(data.moduleOutcome, filters);
    const activity = filterActivityByWeek(data.activityByWeek, filters, filters.weekRange);
    const grade = filterGradeDistribution(data.gradeDistribution, filters);
    const demo = filterOutcomeByDemographic(data.outcomeByDemographic, filters);
    const region = filterRegionChoropleth(data.regionChoropleth, filters);
    const students = filterActivities(data.studentActivity, filters, filters.weekRange);

    const kpis = computeKpis({
      students: data.studentActivity,
      activity: data.activityByWeek,
      moduleOutcome: data.moduleOutcome,
    });

    return [
      {
        title: 'Konteks Umum',
        body: [
          `Dataset aktif berisi ${kpis.studentCount} mahasiswa dan ${kpis.moduleCount} kombinasi modul-presentasi sesuai filter saat ini.`,
          `Rata-rata skor akhir mahasiswa berada pada ${kpis.averageScore.toFixed(
            1,
          )} dan keterlibatan empat pekan awal tercatat ${kpis.weeklyEngagement.toFixed(
            1,
          )} klik per pekan.`,
        ],
      },
      {
        title: 'Outcome Modul',
        body: [craftModuleInsight(moduleOutcome)],
      },
      {
        title: 'Aktivitas VLE',
        body: [craftActivityInsight(activity)],
      },
      {
        title: 'Distribusi Nilai',
        body: [craftHistogramInsight(grade)],
      },
      {
        title: 'Demografi',
        body: [craftDemographicInsight(demo)],
      },
      {
        title: 'Sebaran Wilayah',
        body: [buildRegionInsight(region)],
      },
      {
        title: 'Mahasiswa Berisiko',
        body: [craftScatterInsight(students)],
      },
    ];
  }, [data, filters]);

  const handleCopy = async () => {
    const text = insights
      .map(
        (section) =>
          `${section.title}\n${section.body
            .map((item) => `• ${item}`)
            .join('\n')}`,
      )
      .join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading || !data) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="h-16 animate-pulse rounded-3xl bg-white/40 dark:bg-white/10" />
        <div className="h-[300px] animate-pulse rounded-3xl bg-white/40 dark:bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header className="space-y-4 rounded-3xl bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-violet-500/20 p-6 text-slate-900 shadow-glass backdrop-blur-2xl dark:text-white">
          <h1 className="text-3xl font-bold">Narasi Insight Otomatis</h1>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
            Laporan ringkas berisi temuan utama dari visualisasi yang sedang aktif. Gunakan tombol salin untuk menempelkan insight ini ke laporan tugas atau bahan koordinasi manajemen kampus.
          </p>
        </header>

        <GlobalFilterBar />

        <Card className="bg-white/70 dark:bg-slate-900/80">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Temuan Utama</CardTitle>
            <Button variant="primary" size="sm" onClick={handleCopy}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
              {copied ? 'Tersalin' : 'Salin Insight'}
            </Button>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            {insights.map((section) => (
              <section key={section.title} className="mb-6">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <ul>
                  {section.body.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};

export default InsightsPage;
