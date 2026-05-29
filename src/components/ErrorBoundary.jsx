import { Component } from "react";

/**
 * ErrorBoundary - catches JavaScript errors in child components.
 * Prevents white-screen crashes by showing a fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to error reporting service in production
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="card bg-base-200 max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="opacity-70 mb-6">
              An unexpected error occurred. Don't worry, your data is safe.
            </p>

            {this.state.error && (
              <details className="text-left bg-base-300 rounded-lg p-3 mb-4 text-xs">
                <summary className="cursor-pointer font-medium">
                  Error details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-error overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn btn-primary btn-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="btn btn-ghost btn-sm"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
