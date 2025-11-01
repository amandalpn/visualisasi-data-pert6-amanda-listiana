import { format } from 'date-fns';

const numberFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat('id-ID', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatPercent = (value: number) => percentFormatter.format(value);

export const formatDateFromWeek = (baseDate: Date, week: number) => {
  const day = new Date(baseDate);
  day.setDate(day.getDate() + week * 7);
  return format(day, 'dd MMM yyyy');
};
