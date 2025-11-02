import { useMemo, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Label, // ⬅️ tambahkan ini
} from 'recharts';
import { Download, PieChart as PieIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type PieDatum = { key: string; value: number };

type PieChartXProps = {
  title: string;
  description?: string;
  data: PieDatum[];
  innerRadius?: number;
  height?: number;
  insight?: string;
  className?: string;
  // optional: ubah subtitle tengah kalau perlu
  centerSubtitle?: string;
};

const palette = [
  'rgba(56,189,248,0.95)',
  'rgba(244,114,182,0.95)',
  'rgba(167,139,250,0.95)',
  'rgba(251,191,36,0.95)',
  'rgba(110,231,183,0.95)',
];

const GENDER_COLORS = { male: '#38bdf8', female: '#f472b6', unknown: '#94a3b8' };

const normalizeGender = (raw: string) => {
  const v = (raw || '').trim().toLowerCase();
  if (['m', 'male', 'l', 'laki-laki', 'laki', 'lk'].includes(v)) return 'male';
  if (['f', 'female', 'p', 'perempuan', 'wanita', 'pr'].includes(v)) return 'female';
  return 'unknown';
};

const prettyGender = (raw: string) => {
  const n = normalizeGender(raw);
  if (n === 'male') return 'Laki-laki';
  if (n === 'female') return 'Perempuan';
  return raw || 'Tidak diketahui';
};

export const PieChartX = ({
  title,
  description,
  data,
  innerRadius = 68,
  height = 320,
  insight,
  className,
  centerSubtitle = 'mahasiswa',
}: PieChartXProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);
  const looksLikeGender = useMemo(
    () => data.every((d) => ['male', 'female', 'unknown'].includes(normalizeGender(d.key))),
    [data],
  );

  const colorOf = (key: string, index: number) => {
    if (looksLikeGender) {
      const n = normalizeGender(key);
      if (n === 'male') return GENDER_COLORS.male;
      if (n === 'female') return GENDER_COLORS.female;
      return GENDER_COLORS.unknown;
    }
    return palette[index % palette.length];
  };

  const legendPayload = data.map((d, i) => ({
    id: d.key,
    value: looksLikeGender ? prettyGender(d.key) : d.key,
    color: colorOf(d.key, i),
    type: 'circle' as const,
  }));

  const handleDownload = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { cacheBust: true, quality: 0.95 });
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // === Label persen di luar slice (dengan leader line) ===
  const RAD = Math.PI / 180;
  // ⬇️ label persen + leader line berwarna sesuai slice
  const renderPercentLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, index, payload } = props;
    const p = Math.round((percent ?? 0) * 100);
    if (p <= 0 || p < 5) return null; // sembunyikan label sangat kecil (opsional)

    // warna mengikuti slice (Perempuan => pink via colorOf + normalizeGender)
    const color = colorOf(payload?.key ?? '', index);

    // titik-titik garis
    const r1 = outerRadius + 4;
    const r2 = outerRadius + 14;
    const txr = r2 + 10;

    const x1 = cx + r1 * Math.cos(-midAngle * RAD);
    const y1 = cy + r1 * Math.sin(-midAngle * RAD);
    const x2 = cx + r2 * Math.cos(-midAngle * RAD);
    const y2 = cy + r2 * Math.sin(-midAngle * RAD);
    const tx = cx + txr * Math.cos(-midAngle * RAD);
    const ty = cy + txr * Math.sin(-midAngle * RAD);

    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} />
        <text
          x={tx}
          y={ty}
          textAnchor={tx > cx ? 'start' : 'end'}
          dominantBaseline="central"
          style={{ fontSize: 14, fontWeight: 700, fill: color }}
        >
          {p}%
        </text>
      </g>
    );
  };
  // === Label pusat: TOTAL + angka + subtitle ===
  const renderCenterLabel = ({ viewBox }: any) => {
    const { cx, cy } = viewBox || {};
    if (cx == null || cy == null) return null;
    return (
      <g>
        <text
          x={cx}
          y={cy - 16}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 11, letterSpacing: 2, fontWeight: 600, fill: 'rgba(148,163,184,0.9)' }}
        >
          TOTAL
        </text>
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 26, fontWeight: 800, fill: 'var(--chart-center, #e2e8f0)' }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 12, fill: 'rgba(148,163,184,0.9)' }}
        >
          {centerSubtitle}
        </text>
      </g>
    );
  };

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Button variant="ghost" size="icon" onClick={handleDownload} aria-label="Unduh PNG">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div
          ref={ref}
          className="relative h-full w-full overflow-hidden rounded-[28px] p-5 backdrop-blur-2xl"
          style={{
            background: 'var(--chart-surface-bg)',
            border: '1px solid var(--chart-surface-border)',
            boxShadow: 'var(--chart-surface-shadow)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{ background: 'var(--chart-surface-overlay)' }}
          />
          <div className="relative z-10 h-full w-full">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={innerRadius}
                  outerRadius={110}
                  paddingAngle={3}
                  isAnimationActive
                  animationDuration={650}
                  labelLine={false} // ⬅️ matikan bawaan
                  label={renderPercentLabel} // ⬅️ pakai renderer custom di atas
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={colorOf(entry.key, index)} // female => '#f472b6'
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth={1}
                    />
                  ))}
                  <Label content={renderCenterLabel} />
                </Pie>

                <RechartsTooltip
                  formatter={(val: unknown, _name: unknown, props: any) => {
                    const v = Number(val ?? 0);
                    const pct = total === 0 ? 0 : Math.round((v / total) * 100);
                    const rawKey = props?.payload?.key as string;
                    const label = looksLikeGender ? prettyGender(rawKey) : rawKey;
                    return [`${v} (${pct}%)`, label];
                  }}
                  contentStyle={{
                    borderRadius: 18,
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    color: 'var(--chart-tooltip-color)',
                    boxShadow: '0 18px 45px rgba(244, 114, 182, 0.22)',
                    backdropFilter: 'blur(12px)',
                  }}
                  itemStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 500 }}
                  labelStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 600 }}
                  cursor={{ fill: 'rgba(56,189,248,0.1)' }}
                />

                <Legend
                  payload={legendPayload}
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 12 }}
                  formatter={(value: string) => (
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>

      {insight && (
        <CardFooter className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-slate-600 dark:text-slate-300">
          <PieIcon className="mt-1 h-4 w-4 text-pink-500" aria-hidden />
          <p>{insight}</p>
        </CardFooter>
      )}
    </Card>
  );
};
