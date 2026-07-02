import { afterEach, describe, expect, it, vi } from 'vitest';

import { reportError } from './observability';

describe('reportError', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs the error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('nope');
    reportError(err);
    expect(spy).toHaveBeenCalledWith('[reportError]', err);
  });

  it('includes context when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('nope');
    reportError(err, { source: 'router' });
    expect(spy).toHaveBeenCalledWith('[reportError]', err, { source: 'router' });
  });
});
