import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { ErrorFallback } from './ErrorFallback';

import { reportError } from '@/services/observability';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level boundary for render errors thrown outside the router (e.g. the
 * Provider tree). Route-scoped errors are handled by RouteErrorBoundary.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack });
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
