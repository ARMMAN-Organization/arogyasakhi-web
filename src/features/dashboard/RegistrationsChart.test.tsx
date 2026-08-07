import { screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { RegistrationsChart } from './RegistrationsChart';

import { renderWithProviders } from '@/test/renderWithProviders';

// recharts' ResponsiveContainer measures its parent via ResizeObserver +
// getBoundingClientRect, neither of which reports a real size in jsdom — stub both
// so the chart actually renders instead of staying at its 0x0 fallback.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      width: 560,
      height: 220,
      top: 0,
      left: 0,
      right: 560,
      bottom: 220,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });

  class MockResizeObserver {
    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [{ target, contentRect: { width: 560, height: 220 } } as ResizeObserverEntry],
        this,
      );
    }

    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

describe('RegistrationsChart', () => {
  it('renders a chart svg for a non-empty series', () => {
    const { container } = renderWithProviders(
      <RegistrationsChart
        series={[
          { month: 'Mar', count: 100 },
          { month: 'Apr', count: 200 },
        ]}
      />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the empty state for an empty series without crashing', () => {
    renderWithProviders(<RegistrationsChart series={[]} />);
    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });
});
