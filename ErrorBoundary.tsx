import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-center">
            <div className="max-w-md">
                <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Oops! Something Went Wrong
                </h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                    An unexpected error occurred. Please try reloading the page.
                </p>
                <button
                    onClick={this.handleReload}
                    className="mt-8 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Reload Application
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
