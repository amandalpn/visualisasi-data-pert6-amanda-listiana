import { useMemo, useRef } from 'react';
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
        <div ref={ref} className="h-full w-full rounded-2xl bg-white/20 p-4 dark:bg-white/5">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" />
              <XAxis
                dataKey="key"
                angle={-25}
                textAnchor="end"
                height={60}
                tick={{ fill: '#334155' }}
              />
              <YAxis tick={{ fill: '#334155' }} />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: 16,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'white',
                }}
              />
              <Bar dataKey="count" fill="rgba(56,189,248,0.85)" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
