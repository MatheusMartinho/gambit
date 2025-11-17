import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center text-white"
          style={{ backgroundColor: "#0A0F1F" }}
        >
          <div className="max-w-2xl p-8 rounded-2xl border border-rose-500/20 bg-rose-500/10">
            <h1 className="text-2xl font-bold text-rose-400 mb-4">
              Algo deu errado
            </h1>
            <details className="text-sm text-white/70">
              <summary className="cursor-pointer mb-2">Ver detalhes do erro</summary>
              <pre className="mt-2 p-4 bg-black/30 rounded overflow-auto text-xs">
                {this.state.error && this.state.error.toString()}
                {"\n\n"}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-white"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
