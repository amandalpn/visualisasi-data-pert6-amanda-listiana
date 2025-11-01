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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
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
  'rgba(14,165,233,0.85)',
  'rgba(236,72,153,0.85)',
  'rgba(56,189,248,0.85)',
  'rgba(139,92,246,0.85)',
  'rgba(248,113,113,0.85)',
];

export const PieChartX = ({
  title,
  description,
  data,
  innerRadius = 60,
  height = 320,
  insight,
  className,
}: PieChartXProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);

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
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                innerRadius={innerRadius}
                outerRadius={100}
                paddingAngle={4}
                label={({ value }) => {
                  if (total === 0) return '0%';
                  const percent = Math.round((Number(value) / total) * 100);
                  return `${percent}%`;
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.key} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => `${value} (${total === 0 ? 0 : Math.round((value / total) * 100)}%)`}
                contentStyle={{
                  borderRadius: 16,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'white',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
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
