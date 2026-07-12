import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--color-base)" }}>
          <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
            <p style={{ color: "var(--color-accent)", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "1rem" }}>
              Error
            </p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--color-fg)", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
              Algo salió mal
            </h2>
            <p style={{ color: "var(--color-dim)", fontSize: "0.85rem", marginBottom: "2rem" }}>
              {this.props.fallbackMessage || "Ocurrió un error inesperado. Por favor, recarga la página."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
