import { useId, useMemo, useRef } from 'react';
import { bin } from 'd3-array';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toPng } from 'html-to-image';
import { ChartColumn as HistogramIcon, Download } from 'lucide-react';
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

type HistogramDatum = {
  value: number;
};

type HistogramXProps = {
  title: string;
  description?: string;
  data: HistogramDatum[];
  bins?: number;
  height?: number;
  insight?: string;
  className?: string;
};

export const HistogramX = ({
  title,
  description,
  data,
  bins = 10,
  height = 320,
  insight,
  className,
}: HistogramXProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const gradientId = useId().replace(/:/g, '-');

  const histogramData = useMemo(() => {
    const values = data.map((item) => item.value);
    if (values.length === 0) return [];
    const domainMin = Math.min(...values);
    const domainMax = Math.max(...values);
    const generator = bin().domain([domainMin, domainMax]).thresholds(bins);
    const binsArray = generator(values);
    return binsArray.map((bucket) => ({
      key: `${Math.round(bucket.x0 ?? 0)} - ${Math.round(bucket.x1 ?? 0)}`,
      count: bucket.length,
    }));
  }, [data, bins]);

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
              <BarChart data={histogramData} barSize={24}>
                <CartesianGrid
                  strokeDasharray="4 6"
                  stroke="var(--chart-grid-color)"
                  vertical={false}
                />
                <XAxis
                  dataKey="key"
                  angle={-20}
                  textAnchor="end"
                  height={50}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--chart-axis-color)', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'var(--chart-axis-color)' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(236,72,153,0.08)' }}
                  contentStyle={{
                    borderRadius: 18,
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    color: 'var(--chart-tooltip-color)',
                    boxShadow: '0 18px 42px rgba(236, 72, 153, 0.18)',
                    backdropFilter: 'blur(12px)',
                  }}
                  labelStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 600 }}
                  itemStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 500 }}
                />
                <Bar
                  dataKey="count"
                  fill={`url(#${gradientId}-hist)`}
                  radius={[12, 12, 10, 10]}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth={0.8}
                />
                <defs>
                  <linearGradient id={`${gradientId}-hist`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-series-2)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--chart-series-3)" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
      {insight && (
        <CardFooter className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-slate-600 dark:text-slate-300">
          <HistogramIcon className="mt-1 h-4 w-4 text-violet-500" aria-hidden />
          <p>{insight}</p>
        </CardFooter>
      )}
    </Card>
  );
};
