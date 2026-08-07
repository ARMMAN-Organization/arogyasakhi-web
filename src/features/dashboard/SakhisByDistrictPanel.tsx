import { useTranslation } from 'react-i18next';

import type { SakhisByDistrictEntry } from './dashboardApi';

import { LegendBar } from '@/components/shared/LegendBar';

const BAR_COLORS = [
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-1)',
  'var(--chart-5)',
];

export interface SakhisByDistrictPanelProps {
  entries: SakhisByDistrictEntry[];
}

/** Legend/bar breakdown of Arogya Sakhi counts per district. */
export function SakhisByDistrictPanel({ entries }: SakhisByDistrictPanelProps) {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return <p>{t('common.empty')}</p>;
  }

  const maxValue = Math.max(...entries.map((entry) => entry.count));

  return (
    <div>
      {entries.map((entry, index) => (
        <LegendBar
          key={entry.district}
          label={entry.district}
          value={entry.count}
          maxValue={maxValue}
          color={BAR_COLORS[index % BAR_COLORS.length]}
        />
      ))}
    </div>
  );
}
