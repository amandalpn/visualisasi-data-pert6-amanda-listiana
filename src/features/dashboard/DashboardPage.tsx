import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Layers, Award, Zap } from 'lucide-react';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import {
  computeKpis,
  craftActivityInsight,
  craftModuleInsight,
  craftDemographicInsight,
  craftHistogramInsight,
  buildRegionInsight,
  filterOutcomeByDemographic,
  filterRegionChoropleth,
} from '@/lib/analytics';
import { GlobalFilterBar } from '@/features/filters/GlobalFilterBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChartX } from '@/components/charts/BarChartX';
import { LineChartX } from '@/components/charts/LineChartX';
import { PieChartX } from '@/components/charts/PieChartX';
import { HistogramX } from '@/components/charts/HistogramX';
import { ChoroplethMap } from '@/components/map/ChoroplethMap';
import { formatNumber } from '@/lib/format';
import { filterActivityByWeek, filterModuleOutcomes, filterGradeDistribution } from '@/lib/analytics';

const DashboardPage = () => {
  const { data, loading, error } = useOuladData();
  const navigate = useNavigate();
  const filters = useAppStore((state) => state.filters);
  const setSelection = useAppStore((state) => state.setSelection);

  const memoized = useMemo(() => {
    if (!data) {
      return {
        kpis: null,
        moduleOutcomeData: [],
        filteredModuleOutcome: [],
        filteredActivity: [],
        filteredOutcomeByDemo: [],
        filteredRegion: [],
        filteredGradeDistribution: [],
        activityData: [],
        demographicData: [],
        histogramData: [],
        mapData: {},
      };
    }

    const filteredModuleOutcome = filterModuleOutcomes(data.moduleOutcome, filters);
    const filteredActivity = filterActivityByWeek(data.activityByWeek, filters, filters.weekRange);
    const filteredOutcomeByDemo = filterOutcomeByDemographic(data.outcomeByDemographic, filters);
    const filteredRegion = filterRegionChoropleth(data.regionChoropleth, filters);
    const filteredGradeDistribution = filterGradeDistribution(data.gradeDistribution, filters);

    const moduleOutcomeData = filteredModuleOutcome.map((row) => {
      const total = row.pass + row.fail + row.withdrawn + row.distinction;
      const code = `${row.code_module}-${row.code_presentation}`;
      return {
        key: code,
        value: Math.round((row.pass / Math.max(total, 1)) * 100),
        pass: row.pass,
        fail: row.fail,
        withdrawn: row.withdrawn,
      };
    });

    const activityData = filteredActivity.map((row) => ({
      key: `M${row.week}`,
      value: row.sum_clicks,
      average: row.avg_final_score,
    }));

    const demographicData = data.studentActivity.reduce<Record<string, number>>((acc, student) => {
      if (filters.modules.length && !filters.modules.includes(student.code_module)) return acc;
      if (
        filters.presentations.length &&
        !filters.presentations.includes(student.code_presentation)
      )
        return acc;
      const key = student.gender ?? 'Tidak diketahui';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const histogramData = filteredGradeDistribution.flatMap((row) =>
      Array.from({ length: row.students }).map(() => ({
        value: Number(row.band),
      })),
    );

    const mapData = filteredRegion.reduce<Record<string, { value: number; average_score: number }>>(
      (acc, row) => {
        acc[row.region] = {
          value: row.students,
          average_score: row.average_score,
        };
        return acc;
      },
      {},
    );

    const kpis = computeKpis({
      students: data.studentActivity,
      activity: data.activityByWeek,
      moduleOutcome: data.moduleOutcome,
    });

    return {
      kpis,
      moduleOutcomeData,
      filteredModuleOutcome,
      filteredActivity,
      filteredOutcomeByDemo,
      filteredRegion,
      filteredGradeDistribution,
      activityData,
      demographicData: Object.entries(demographicData).map(([key, value]) => ({ key, value })),
      histogramData,
      mapData,
    };
  }, [data, filters]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 rounded-3xl bg-white/40 dark:bg-white/10" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 rounded-3xl bg-white/40 dark:bg-white/10" />
            ))}
          </div>
          <div className="h-[480px] rounded-3xl bg-white/40 dark:bg-white/10" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="rounded-3xl bg-red-500/10 p-8 text-lg font-semibold text-red-500">
          Gagal memuat data: {error}
        </p>
      </main>
    );
  }

  if (!data || !memoized.kpis) {
    return null;
  }

  const {
    kpis,
    moduleOutcomeData,
    filteredModuleOutcome,
    filteredActivity,
    filteredOutcomeByDemo,
    filteredRegion,
    filteredGradeDistribution,
    activityData,
    demographicData,
    histogramData,
    mapData,
  } = memoized;

  const kpiItems = [
    {
      title: 'Mahasiswa Aktif',
      value: formatNumber(kpis.studentCount),
      description: 'Jumlah mahasiswa unik di dataset terpilih',
      icon: Users,
    },
    {
      title: 'Modul Dipantau',
      value: formatNumber(kpis.moduleCount),
      description: 'Total kombinasi modul dan presentasi',
      icon: Layers,
    },
    {
      title: 'Skor Rata-Rata',
      value: `${formatNumber(kpis.averageScore)} / 100`,
      description: 'Nilai akhir rata-rata mahasiswa',
      icon: Award,
    },
    {
      title: 'Klik per Pekan',
      value: formatNumber(kpis.weeklyEngagement),
      description: 'Rata-rata keterlibatan empat pekan pertama',
      icon: Zap,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header className="space-y-4 rounded-3xl bg-gradient-to-r from-sky-500/20 via-fuchsia-500/10 to-violet-500/20 p-6 text-slate-900 shadow-glass backdrop-blur-2xl dark:text-white">
          <h1 className="text-3xl font-bold">Visualisasi Analitik Pembelajaran OULAD</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-700 dark:text-slate-200">
            Dasbor ini memperlihatkan pola keterlibatan, performa, dan disparitas demografis mahasiswa
            Open University. Manfaatkan filter untuk melakukan analisis lintas modul dan region, serta
            gunakan insight otomatis di setiap visualisasi sebagai bahan kebijakan intervensi kampus.
          </p>
        </header>

        <GlobalFilterBar />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpiItems.map((item) => (
            <Card key={item.title} className="relative overflow-hidden bg-white/50 dark:bg-slate-900/80">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5" />
              <CardHeader className="relative flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sky-500">
                  <item.icon className="h-6 w-6" />
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
                <CardContent className="px-0 pb-0">
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  <CardDescription className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <BarChartX
            title="Outcome Akademik per Modul"
            description="Bandingkan tingkat kelulusan antar modul dan klik untuk membuka detail modul."
            data={moduleOutcomeData}
            insight={craftModuleInsight(filteredModuleOutcome)}
            onBarClick={(key) => {
              const [code_module, code_presentation] = key.split('-');
              setSelection({
                moduleForDrilldown: { code_module, code_presentation },
              });
              navigate(`/modules/${key}`);
            }}
          />
          <LineChartX
            title="Tren Klik Mingguan"
            description="Pantau dinamika aktivitas belajar mahasiswa di lingkungan VLE."
            data={activityData}
            insight={craftActivityInsight(filteredActivity)}
            onBrushChange={(start, end) =>
              setSelection({
                studentIds: data.studentActivity
                  .filter((student) =>
                    student.weeks.some((w) => w.week >= start && w.week <= end),
                  )
                  .map((student) => student.id_student),
              })
            }
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <PieChartX
            title="Komposisi Gender"
            description="Proporsi gender mahasiswa yang terdaftar pada filter aktif."
            data={demographicData}
            insight={craftDemographicInsight(filteredOutcomeByDemo)}
          />
          <HistogramX
            title="Distribusi Skor Akhir"
            description="Sebaran skor akhir mahasiswa yang memenuhi filter."
            data={histogramData}
            insight={craftHistogramInsight(filteredGradeDistribution)}
          />
        </section>

        <section className="grid gap-6">
          <ChoroplethMap
            title="Sebaran Region Mahasiswa"
            description="Klik wilayah untuk menerapkan filter region dan melihat detail pada visualisasi lain."
            metricByRegion={mapData}
            insight={buildRegionInsight(filteredRegion)}
            onRegionClick={(region) => {
              const currentRegions = new Set(filters.regions);
              if (currentRegions.has(region)) {
                currentRegions.delete(region);
              } else {
                currentRegions.add(region);
              }
              useAppStore.getState().setFilter('regions', Array.from(currentRegions));
            }}
          />
        </section>
      </motion.div>
    </main>
  );
};

export default DashboardPage;
