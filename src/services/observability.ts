/**
 * Provider-agnostic error reporting sink.
 *
 * This is the single place the app forwards unexpected errors. It currently
 * logs to the console; swap the body for a real provider (e.g. Sentry) here
 * without touching any call site.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  // TODO(observability): forward to the chosen monitoring provider.
  if (context) {
    console.error('[reportError]', error, context);
  } else {
    console.error('[reportError]', error);
  }
}
