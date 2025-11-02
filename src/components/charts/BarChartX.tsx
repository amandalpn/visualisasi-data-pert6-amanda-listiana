import { useId, useRef } from 'react';
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
import { Download, TrendingUp } from 'lucide-react';
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

type BarChartDatum = {
  key: string;
  value: number;
  [key: string]: unknown;
};

export type BarChartXProps = {
  title: string;
  description?: string;
  data: BarChartDatum[];
  onBarClick?: (key: string, datum: BarChartDatum) => void;
  height?: number;
  insight?: string;
  className?: string;
};

export const BarChartX = ({
  title,
  description,
  data,
  onBarClick,
  height = 320,
  insight,
  className,
}: BarChartXProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const gradientId = useId().replace(/:/g, '-');

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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleDownload} aria-label="Unduh PNG">
            <Download className="h-4 w-4" />
          </Button>
        </div>
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
              <BarChart data={data} barSize={28}>
                <CartesianGrid
                  strokeDasharray="4 6"
                  stroke="var(--chart-grid-color)"
                  vertical={false}
                />
                <XAxis
                  dataKey="key"
                  tick={{ fill: 'var(--chart-axis-color)' }}
                  tickLine={false}
                  axisLine={false}
                  padding={{ left: 16, right: 16 }}
                />
                <YAxis
                  tick={{ fill: 'var(--chart-axis-color)' }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(56,189,248,0.08)' }}
                  contentStyle={{
                    borderRadius: 18,
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    color: 'var(--chart-tooltip-color)',
                    boxShadow: '0 20px 46px rgba(14, 165, 233, 0.22)',
                    backdropFilter: 'blur(12px)',
                  }}
                  labelStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 600 }}
                  itemStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 500 }}
                />
                <Bar
                  dataKey="value"
                  fill={`url(#${gradientId}-bar)`}
                  radius={[14, 14, 10, 10]}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={1}
                  onClick={({ payload }) => {
                    if (payload) {
                      onBarClick?.(payload.key as string, payload as BarChartDatum);
                    }
                  }}
                />
                <defs>
                  <linearGradient id={`${gradientId}-bar`} x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-series-1)" stopOpacity="0.95" />
                    <stop offset="55%" stopColor="var(--chart-series-3)" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="var(--chart-series-2)" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
      {insight && (
        <CardFooter className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-slate-600 dark:text-slate-300">
          <TrendingUp className="mt-1 h-4 w-4 text-sky-500" aria-hidden />
          <p>{insight}</p>
        </CardFooter>
      )}
    </Card>
  );
};
