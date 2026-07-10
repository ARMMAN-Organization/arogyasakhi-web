import { builtinEnvironments } from 'vitest/environments';
import type { Environment } from 'vitest/environments';

// Capture Node's native, undici-compatible fetch primitives at module load —
// before jsdom's environment replaces the globals with its own AbortController/
// AbortSignal (which Node's `Request` rejects). We re-assert these onto the
// jsdom global after jsdom sets up, so React Router's data-router navigation
// (which builds a `Request` with an AbortController signal) works under jsdom.
const NativeAbortController = globalThis.AbortController;
const NativeAbortSignal = globalThis.AbortSignal;

/**
 * jsdom, but with Node's native AbortController/AbortSignal restored so undici's
 * `Request` accepts signals created in tests. Everything else defers to jsdom.
 */
const environment: Environment = {
  name: 'jsdom-undici',
  transformMode: 'web',
  async setup(global, options) {
    const jsdom = await builtinEnvironments.jsdom.setup(global, options);
    const target = global as unknown as Record<string, unknown>;
    target.AbortController = NativeAbortController;
    target.AbortSignal = NativeAbortSignal;
    return {
      teardown(g) {
        return jsdom.teardown(g);
      },
    };
  },
};

export default environment;
