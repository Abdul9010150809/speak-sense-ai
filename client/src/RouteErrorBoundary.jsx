import React from "react";

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "", retryKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected page error",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[RouteErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    this.setState((prev) => ({
      hasError: false,
      message: "",
      retryKey: prev.retryKey + 1,
    }));
  };

  handleBackToDashboard = () => {
    this.setState({ hasError: false, message: "" }, () => {
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  };

  render() {
    if (!this.state.hasError) {
      return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
    }

    return (
      <div
        style={{
          minHeight: "55vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          color: "#e5e7eb",
          background: "radial-gradient(circle at 12% 18%, #0b1d36 0%, #090d16 100%)",
        }}
      >
        <div
          style={{
            width: "min(560px, 95vw)",
            border: "1px solid rgba(147, 197, 253, 0.35)",
            borderRadius: 14,
            background: "rgba(3, 6, 20, 0.78)",
            padding: "1.1rem 1rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Interview page hit an error</h2>
          <p style={{ margin: "0.6rem 0 0", color: "#cbd5e1", fontSize: "0.92rem" }}>
            {this.state.message}
          </p>
          <div style={{ display: "flex", gap: "0.55rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                border: "1px solid rgba(96, 165, 250, 0.45)",
                borderRadius: 10,
                background: "rgba(30, 64, 175, 0.35)",
                color: "#dbeafe",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
            <button
              type="button"
              onClick={this.handleBackToDashboard}
              style={{
                border: "1px solid rgba(94, 234, 212, 0.45)",
                borderRadius: 10,
                background: "rgba(13, 148, 136, 0.28)",
                color: "#ccfbf1",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;
