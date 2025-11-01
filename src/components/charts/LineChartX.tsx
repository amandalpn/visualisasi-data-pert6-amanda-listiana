import { useRef } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Brush,
} from 'recharts';
import { toPng } from 'html-to-image';
import { Download, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type LineDatum = {
  key: string;
  value: number;
  average?: number;
  [key: string]: unknown;
};

type LineChartXProps = {
  title: string;
  description?: string;
  data: LineDatum[];
  onBrushChange?: (startIndex: number, endIndex: number) => void;
  height?: number;
  insight?: string;
  className?: string;
};

export const LineChartX = ({
  title,
  description,
  data,
  onBrushChange,
  height = 320,
  insight,
  className,
}: LineChartXProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

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
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" />
              <XAxis dataKey="key" tick={{ fill: 'var(--chart-axis-color, #334155)' }} />
              <YAxis tick={{ fill: 'var(--chart-axis-color, #334155)' }} />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: 16,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'white',
                }}
                cursor={{ stroke: 'rgba(79, 70, 229, 0.25)', strokeWidth: 2 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgba(14,165,233,1)"
                strokeWidth={3}
                dot={{ stroke: 'rgba(14,165,233,1)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="rgba(139,92,246,0.8)"
                strokeDasharray="6 4"
                strokeWidth={2}
              />
              <ReferenceLine y={0} stroke="rgba(148,163,184,0.4)" />
              <Brush
                dataKey="key"
                height={20}
                stroke="rgba(14,165,233,0.8)"
                travellerWidth={12}
                onChange={(range) => {
                  if (!range) return;
                  const { startIndex = 0, endIndex = data.length - 1 } = range;
                  onBrushChange?.(startIndex, endIndex);
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {insight && (
        <CardFooter className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-slate-600 dark:text-slate-300">
          <Activity className="mt-1 h-4 w-4 text-emerald-500" aria-hidden />
          <p>{insight}</p>
        </CardFooter>
      )}
    </Card>
  );
};
