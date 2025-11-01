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
  student?: unknown;
};

type ScatterXProps = {
  title: string;
  description?: string;
  data: ScatterDatum[];
  onPointClick?: (datum: ScatterDatum) => void;
  onBrushSelection?: (ids: string[]) => void;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  insight?: string;
  className?: string;
};

const colors = [
  'rgba(14,165,233,0.9)',
  'rgba(236,72,153,0.9)',
  'rgba(59,130,246,0.9)',
  'rgba(139,92,246,0.9)',
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
      color: colors[index % colors.length],
    }));
  }, [data]);

  const xDomain = useMemo(() => {
    if (data.length === 0) return [0, 1] as [number, number];
    return [0, Math.max(...data.map((d) => d.x)) * 1.1] as [number, number];
  }, [data]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 1] as [number, number];
    return [0, Math.max(...data.map((d) => d.y)) * 1.1] as [number, number];
  }, [data]);

  const flattened = useMemo(() => grouped.flatMap((group) => group.values), [grouped]);

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
        <div ref={ref} className="h-full w-full rounded-2xl bg-white/20 p-4 dark:bg-white/5">
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 12, right: 20, bottom: 12, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" />
              <XAxis
                type="number"
                dataKey="x"
                name={xLabel}
                domain={xDomain}
                tick={{ fill: '#334155' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={yLabel}
                domain={yDomain}
                tick={{ fill: '#334155' }}
              />
              <ZAxis type="number" range={[80]} />
              <Legend />
              <RechartsTooltip
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(14,165,233,0.4)' }}
                formatter={(value: number, name: string, { payload }) => {
                  if (name === 'x') return [`${value} klik`, xLabel];
                  if (name === 'y') return [`${value} skor`, yLabel];
                  return [value, name];
                }}
                contentStyle={{
                  borderRadius: 18,
                  backgroundColor: 'rgba(15, 23, 42, 0.78)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  color: '#f8fafc',
                  boxShadow: '0 18px 45px rgba(14, 165, 233, 0.15)',
                  backdropFilter: 'blur(12px)',
                }}
                itemStyle={{ color: '#e0f2fe' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
              />
              {grouped.map((group) => (
                <Scatter
                  name={group.group}
                  key={group.group}
                  data={group.values}
                  fill={group.color}
                  shape="circle"
                  onClick={({ payload }) => {
                    if (payload) {
                      onPointClick?.(payload as ScatterDatum);
                    }
                  }}
                />
              ))}
              <Brush
                dataKey="x"
                height={20}
                stroke="rgba(236,72,153,0.8)"
                travellerWidth={12}
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
