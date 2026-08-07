import type { ReactNode } from 'react';

import './Panel.css';

export interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Card surface used to group a dashboard chart or list under a titled header. */
export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">{title}</h2>
        {subtitle && <span className="panel__subtitle">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}
