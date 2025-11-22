import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-6" role="alert" aria-live="assertive">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="text-left p-4 bg-muted/30 rounded-lg text-sm">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <Button
              size="lg"
              onClick={this.handleReset}
              className="px-8"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
