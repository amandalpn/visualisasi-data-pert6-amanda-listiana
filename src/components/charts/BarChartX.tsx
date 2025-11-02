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
  isClickable?: boolean;
  height?: number;
  insight?: string;
  className?: string;
  /** Formatter label kategori (sumbu-X) */
  formatCategoryLabel?: (raw: string) => string;
  xTickFontSize?: number;
  xTickAngle?: number; // rotasi
  forceAllXTicks?: boolean; // tampilkan semua tick
  xTickDx?: number;
  xTickDy?: number;
  leftMargin?: number; // ⬅️ baru
  leftPadding?: number; // ⬅️ baru
  showGridHorizontal?: boolean; // default: true
  showGridVertical?: boolean; // default: false (biar tidak mengubah chart lain)
  gridDash?: string; // default: '3 6'
};

export const BarChartX = ({
  title,
  description,
  data,
  onBarClick,
  isClickable = true,
  height = 320,
  insight,
  className,
  formatCategoryLabel, // ⬅️ baru
  xTickFontSize = 10,
  xTickAngle = -12,
  forceAllXTicks = true,
  xTickDx = 14, // ⬅️ geser label lebih ke kanan (naikkan kalau perlu)
  xTickDy = 4,
  leftMargin = 28, // ⬅️ ruang di luar plot area
  leftPadding = 40, // ⬅️ ruang di dalam sumbu X
  showGridHorizontal = true,
  showGridVertical = false,
  gridDash = '3 6',
}: BarChartXProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const gradientId = useId().replace(/:/g, '-');
  const CustomTick: React.FC<any> = ({ x, y, payload }) => {
    const raw = String(payload?.value ?? '');
    const label = formatCategoryLabel ? formatCategoryLabel(raw) : raw;
    return (
      <text
        x={x}
        y={y}
        dx={xTickDx} // ⬅️ geser kanan
        dy={xTickDy}
        fontSize={xTickFontSize}
        fill="var(--chart-axis-color)"
        textAnchor="end"
        transform={`rotate(${xTickAngle}, ${x + xTickDx}, ${y + xTickDy})`}
      >
        {label}
      </text>
    );
  };

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
              <BarChart
                data={data}
                barSize={28}
                margin={{ top: 8, right: 12, bottom: xTickAngle ? 40 : 16, left: leftMargin }} // ⬅️
              >
                <CartesianGrid
                  strokeDasharray={gridDash}
                  stroke="var(--chart-grid-color)"
                  horizontal={showGridHorizontal}
                  vertical={showGridVertical}
                />
                <XAxis
                  dataKey="key"
                  tick={<CustomTick />}
                  tickLine={false}
                  axisLine={false}
                  interval={forceAllXTicks ? 0 : 'preserveEnd'}
                  minTickGap={0}
                  height={xTickAngle ? 40 : 24}
                  allowDuplicatedCategory={false}
                  padding={{ left: leftPadding, right: 16 }} // ⬅️
                />

                <YAxis
                  tick={{ fill: 'var(--chart-axis-color)' }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <RechartsTooltip
                  // Label di tooltip tetap nama lengkap (raw)
                  labelFormatter={(label) => String(label)}
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
                  onClick={
                    isClickable && onBarClick
                      ? ({ payload }) =>
                          payload && onBarClick(payload.key as string, payload as BarChartDatum)
                      : undefined // ⬅️ matikan handler jika tidak clickable
                  }
                  style={{ cursor: isClickable ? 'pointer' : 'default' }} // ⬅️ kursor normal saat non-clickable
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
