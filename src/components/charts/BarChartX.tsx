import { useRef } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
        <div ref={ref} className="h-full w-full rounded-2xl bg-white/20 p-4 dark:bg-white/5">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
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
                cursor={{ fill: 'rgba(79, 70, 229, 0.08)' }}
              />
              _ <Legend />
              <Bar
                dataKey="value"
                fill="url(#glass-bar-gradient)"
                radius={12} // 👈 PROP 'radius' DITAMBAHKAN DI SINI
                onClick={({ payload }) => {
                  if (payload) {
                    onBarClick?.(payload.key as string, payload as BarChartDatum);
                  }
                }}
              />
              <defs>
                <linearGradient id="glass-bar-gradient" x1="0" x2="1" y1="0" y2="1">
                  _ <stop offset="0" stopColor="rgba(14,165,233,0.9)" />
                  <stop offset="1" stopColor="rgba(139,92,246,0.7)" />
                </linearGradient>
              </defs>
            </BarChart>
            {/* 👆 PERBAIKAN SELESAI DI SINI 👆 */}
          </ResponsiveContainer>
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
