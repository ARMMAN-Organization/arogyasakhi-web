import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/router';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
