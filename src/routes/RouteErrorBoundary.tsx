import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { NotFound } from './NotFound';

import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { reportError } from '@/services/observability';

/** errorElement for the router: distinguishes 404 responses from real failures. */
export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  reportError(error, { source: 'router' });
  return <ErrorFallback />;
}
