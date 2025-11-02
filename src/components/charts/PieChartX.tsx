import { useMemo, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
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

type PieDatum = {
  key: string;
  value: number;
};

type PieChartXProps = {
  title: string;
  description?: string;
  data: PieDatum[];
  innerRadius?: number;
  height?: number;
  insight?: string;
  className?: string;
};

const palette = [
  'rgba(56,189,248,0.95)',
  'rgba(244,114,182,0.95)',
  'rgba(167,139,250,0.95)',
  'rgba(251,191,36,0.95)',
  'rgba(110,231,183,0.95)',
];

const GENDER_COLORS = {
  male: '#38bdf8',
  female: '#f472b6',
  unknown: '#94a3b8',
};

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
                  labelLine={false}
                  isAnimationActive
                  animationDuration={650}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={colorOf(entry.key, index)}
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth={1}
                    />
                  ))}
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
