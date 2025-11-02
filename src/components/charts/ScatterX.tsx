import { useMemo, useRef } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ZAxis,
  Legend,
  Brush,
} from 'recharts';
import { toPng } from 'html-to-image';
import { Download, Target } from 'lucide-react';
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

type ScatterDatum = {
  id: string;
  x: number;
  y: number;
  group?: string;
};

type ScatterXProps = {
  title: string;
  description?: string;
  data: ScatterDatum[];
  onPointClick?: (id: string) => void;
  onBrushSelection?: (ids: string[]) => void;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  insight?: string;
  className?: string;
};

const palette = [
  'rgba(56,189,248,0.95)',
  'rgba(244,114,182,0.95)',
  'rgba(167,139,250,0.95)',
  'rgba(251,191,36,0.95)',
];

export const ScatterX = ({
  title,
  description,
  data,
  onPointClick,
  onBrushSelection,
  xLabel = 'Total Klik',
  yLabel = 'Skor Akhir',
  height = 320,
  insight,
  className,
}: ScatterXProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const grouped = useMemo(() => {
    const groups = new Map<string, ScatterDatum[]>();
    data.forEach((datum) => {
      const key = datum.group ?? 'Lainnya';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(datum);
    });
    return Array.from(groups.entries()).map(([group, values], index) => ({
      group,
      values,
      color: palette[index % palette.length],
    }));
  }, [data]);

  const xDomain = useMemo(() => {
    if (data.length === 0) return [0, 1] as [number, number];
    return [0, Math.max(...data.map((d) => d.x)) * 1.08] as [number, number];
  }, [data]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 1] as [number, number];
    return [0, Math.max(...data.map((d) => d.y)) * 1.08] as [number, number];
  }, [data]);

  const flattened = useMemo(() => grouped.flatMap((group) => group.values), [grouped]);
  const brushEndIndex = Math.max(flattened.length - 1, 0);

  const handleDownload = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { cacheBust: true, quality: 0.95 });
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-' ).toLowerCase()}.png`;
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
              <ScatterChart margin={{ top: 12, right: 20, bottom: 12, left: 12 }}>
                <CartesianGrid
                  strokeDasharray="4 6"
                  stroke="var(--chart-grid-color)"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={xLabel}
                  domain={xDomain}
                  tick={{ fill: 'var(--chart-axis-color)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={yLabel}
                  domain={yDomain}
                  tick={{ fill: 'var(--chart-axis-color)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ZAxis type="number" range={[80]} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 12 }}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                      {value}
                    </span>
                  )}
                />
                <RechartsTooltip
                  cursor={{ strokeDasharray: '4 4', stroke: 'rgba(56,189,248,0.45)' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'x') return [`${value} klik`, xLabel];
                    if (name === 'y') return [`${value} skor`, yLabel];
                    return [value, name];
                  }}
                  contentStyle={{
                    borderRadius: 18,
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    color: 'var(--chart-tooltip-color)',
                    boxShadow: '0 18px 45px rgba(56, 189, 248, 0.18)',
                    backdropFilter: 'blur(12px)',
                  }}
                  itemStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 500 }}
                  labelStyle={{ color: 'var(--chart-tooltip-color)', fontWeight: 600 }}
                />
                {grouped.map((group) => (
                  <Scatter
                    name={group.group}
                    key={group.group}
                    data={group.values}
                    fill={group.color}
                    fillOpacity={0.95}
                    stroke="rgba(255,255,255,0.65)"
                    strokeWidth={1.4}
                    shape="circle"
                    cursor="pointer"
                    isAnimationActive={false}
                    onClick={({ payload }) => {
                      if (payload) {
                        onPointClick?.((payload as ScatterDatum).id);
                      }
                    }}
                  />
                ))}
                <Brush
                  dataKey="x"
                  height={22}
                  stroke="rgba(244,114,182,0.9)"
                  travellerWidth={12}
                  fill="rgba(244,114,182,0.08)"
                  startIndex={0}
                  endIndex={brushEndIndex}
                  data={flattened}
                  onChange={(range) => {
                    if (!range) return;
                    const { startIndex = 0, endIndex = flattened.length - 1 } = range;
                    const start = flattened[startIndex]?.x ?? 0;
                    const end = flattened[endIndex]?.x ?? 0;
                    const selectedIds = flattened
                      .filter((datum) => datum.x >= start && datum.x <= end)
                      .map((datum) => datum.id);
                    onBrushSelection?.(selectedIds);
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
      {insight && (
        <CardFooter className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-slate-600 dark:text-slate-300">
          <Target className="mt-1 h-4 w-4 text-rose-500" aria-hidden />
          <p>{insight}</p>
        </CardFooter>
      )}
    </Card>
  );
};









