import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcfcfb] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border border-[rgba(0,0,0,0.1)] p-12 text-center">
            <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.95)] mb-4">
              Something went wrong.
            </h1>
            <p className="text-warm-500 text-sm mb-8 leading-relaxed">
              We've encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-[#0075de] text-white rounded-xl font-bold hover:bg-[#005bab] transition-all"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-[10px] text-warm-300 cursor-pointer hover:text-warm-500 uppercase tracking-widest font-bold">
                  Error Details
                </summary>
                <pre className="mt-4 p-4 bg-warm-50 rounded-lg text-[10px] font-mono overflow-auto max-h-40 text-warm-600 border border-[rgba(0,0,0,0.05)]">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
