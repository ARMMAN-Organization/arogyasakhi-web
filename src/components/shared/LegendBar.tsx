import './LegendBar.css';

export interface LegendBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

/** A single named value rendered as a legend row with a proportional bar underneath. */
export function LegendBar({ label, value, maxValue, color }: LegendBarProps) {
  const widthPercent = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div className="legend-bar">
      <div className="legend-bar__row">
        <span className="legend-bar__name">
          <span className="legend-bar__dot" style={{ background: color }} />
          {label}
        </span>
        <span className="legend-bar__value">{value.toLocaleString()}</span>
      </div>
      <div className="legend-bar__track">
        <div
          className="legend-bar__fill"
          style={{ width: `${widthPercent}%`, background: color }}
        />
      </div>
    </div>
  );
}
