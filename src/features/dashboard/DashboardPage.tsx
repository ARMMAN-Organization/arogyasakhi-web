import { useTranslation } from 'react-i18next';

import './DashboardPage.css';
import { FilterBar } from './FilterBar';
import { RegistrationsChart } from './RegistrationsChart';
import { SakhisByDistrictPanel } from './SakhisByDistrictPanel';
import { useGetDashboardStatsQuery } from './dashboardApi';

import { Panel } from '@/components/shared/Panel';
import { StatTile } from '@/components/shared/StatTile';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useGetDashboardStatsQuery();

  if (isLoading) return <p role="status">{t('common.loading')}</p>;
  if (isError)
    return (
      <div role="alert">
        <p>{t('common.error')}</p>
        <button type="button" onClick={() => void refetch()}>
          {t('common.retry')}
        </button>
      </div>
    );
  if (!data) return <p>{t('common.empty')}</p>;
  const hasStats =
    data.sponsors > 0 ||
    data.projects > 0 ||
    data.sakhis > 0 ||
    data.villages > 0 ||
    data.beneficiaries > 0;
  if (!hasStats) return <p>{t('common.empty')}</p>;

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-page__title">{t('nav.dashboard')}</h2>

      <FilterBar />

      <section className="dashboard-page__stats">
        <StatTile variant="sponsor" label={t('dashboard.stats.sponsors')} value={data.sponsors} />
        <StatTile variant="project" label={t('dashboard.stats.projects')} value={data.projects} />
        <StatTile variant="sakhi" label={t('dashboard.stats.sakhis')} value={data.sakhis} />
        <StatTile variant="village" label={t('dashboard.stats.villages')} value={data.villages} />
        <StatTile
          variant="beneficiary"
          label={t('dashboard.stats.beneficiaries')}
          value={data.beneficiaries}
        />
      </section>

      <section className="dashboard-page__panels">
        <Panel title={t('dashboard.chart.title')} subtitle={t('dashboard.chart.subtitle')}>
          <RegistrationsChart series={data.registrationsSeries} />
        </Panel>
        <Panel title={t('dashboard.districts.title')} subtitle={t('dashboard.districts.subtitle')}>
          <SakhisByDistrictPanel entries={data.sakhisByDistrict} />
        </Panel>
      </section>
    </div>
  );
}

export default DashboardPage;
