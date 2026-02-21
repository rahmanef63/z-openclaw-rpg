'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName, onError } = this.props;

    // Log to console
    console.group(`🔴 Error in ${componentName || 'Unknown Component'}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.groupEnd();

    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center p-6 rounded-lg"
          style={{
            backgroundColor: '#1e1b4b',
            border: '1px solid #ef4444',
            minHeight: '200px',
          }}
        >
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#ef4444' }}>
            Something went wrong
          </h2>
          {componentName && (
            <p className="text-sm mb-2" style={{ color: '#94a3b8' }}>
              Component: {componentName}
            </p>
          )}
          <p className="text-sm mb-4 text-center max-w-md" style={{ color: '#f8fafc' }}>
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded text-sm font-mono"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}
