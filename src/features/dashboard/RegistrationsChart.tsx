import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { RegistrationsSeriesPoint } from './dashboardApi';

export interface RegistrationsChartProps {
  series: RegistrationsSeriesPoint[];
}

/** Area chart of registrations per month, used inside the dashboard's chart panel. */
export function RegistrationsChart({ series }: RegistrationsChartProps) {
  const { t } = useTranslation();

  if (series.length === 0) {
    return <p>{t('common.empty')}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--g50)" vertical={false} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11.5, fill: 'var(--g200)' }}
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
          labelStyle={{ color: 'var(--g400)', fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name={t('dashboard.chart.registrations')}
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="var(--color-primary)"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
