import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import './FilterBar.css';

import { Select } from '@/components/shared/Select';

export type DashboardFilterField =
  | 'sponsor'
  | 'project'
  | 'duration'
  | 'state'
  | 'district'
  | 'block'
  | 'phc'
  | 'subcentre'
  | 'village';

export interface FilterBarProps {
  onFilterChange?: (field: DashboardFilterField, value: string) => void;
}

const ALL_OPTION = (label: string) => [{ value: 'all', label }];

/** Dashboard filter bar: sponsor/project/duration plus a secondary geography row. */
export function FilterBar({ onFilterChange }: FilterBarProps) {
  const { t } = useTranslation();

  const fieldHandler = (field: DashboardFilterField) => (event: ChangeEvent<HTMLSelectElement>) =>
    onFilterChange?.(field, event.target.value);

  return (
    <section className="filter-bar" aria-label={t('dashboard.filters.title')}>
      <div className="filter-bar__row">
        <Select
          label={t('dashboard.filters.sponsor')}
          options={ALL_OPTION(t('dashboard.filters.allSponsors'))}
          defaultValue="all"
          onChange={fieldHandler('sponsor')}
        />
        <Select
          label={t('dashboard.filters.project')}
          options={ALL_OPTION(t('dashboard.filters.allProjects'))}
          defaultValue="all"
          onChange={fieldHandler('project')}
        />
        <Select
          label={t('dashboard.filters.duration')}
          options={ALL_OPTION(t('dashboard.filters.allDurations'))}
          defaultValue="all"
          onChange={fieldHandler('duration')}
        />
      </div>
      <div className="filter-bar__row filter-bar__row--secondary">
        <Select
          label={t('dashboard.filters.state')}
          options={ALL_OPTION(t('dashboard.filters.allStates'))}
          defaultValue="all"
          onChange={fieldHandler('state')}
        />
        <Select
          label={t('dashboard.filters.district')}
          options={ALL_OPTION(t('dashboard.filters.allDistricts'))}
          defaultValue="all"
          onChange={fieldHandler('district')}
        />
        <Select
          label={t('dashboard.filters.block')}
          options={ALL_OPTION(t('dashboard.filters.allBlocks'))}
          defaultValue="all"
          onChange={fieldHandler('block')}
        />
        <Select
          label={t('dashboard.filters.phc')}
          options={ALL_OPTION(t('dashboard.filters.allPhcs'))}
          defaultValue="all"
          onChange={fieldHandler('phc')}
        />
        <Select
          label={t('dashboard.filters.subcentre')}
          options={ALL_OPTION(t('dashboard.filters.allSubcentres'))}
          defaultValue="all"
          onChange={fieldHandler('subcentre')}
        />
        <Select
          label={t('dashboard.filters.village')}
          options={ALL_OPTION(t('dashboard.filters.allVillages'))}
          defaultValue="all"
          onChange={fieldHandler('village')}
        />
      </div>
    </section>
  );
}
