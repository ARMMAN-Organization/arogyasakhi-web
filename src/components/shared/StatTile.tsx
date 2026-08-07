import './StatTile.css';

export type StatTileVariant = 'sponsor' | 'project' | 'sakhi' | 'village' | 'beneficiary';

export interface StatTileProps {
  label: string;
  value: number;
  variant: StatTileVariant;
}

/** Flat colored stat tile used on the dashboard's summary row. */
export function StatTile({ label, value, variant }: StatTileProps) {
  return (
    <div className={`stat-tile stat-tile--${variant}`}>
      <span className="stat-tile__value">{value.toLocaleString()}</span>
      <span className="stat-tile__label">{label}</span>
    </div>
  );
}
