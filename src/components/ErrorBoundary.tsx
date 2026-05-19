import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/"
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          background: "var(--navy-950, #04071a)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(255,77,106,0.1)",
            border: "1px solid rgba(255,77,106,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          ⚠️
        </div>

        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h1
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1.5rem",
              fontWeight: 700,
              fontFamily: "'Clash Display', sans-serif",
              color: "var(--foreground, #f0f4ff)",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: "0 0 0.25rem",
              fontSize: "0.875rem",
              color: "var(--foreground-muted, rgba(240,244,255,0.6))",
            }}
          >
            An unexpected error occurred. You can try returning to the home page.
          </p>

          {/* error details — only in development */}
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: 10,
                background: "rgba(255,77,106,0.06)",
                border: "1px solid rgba(255,77,106,0.2)",
                fontSize: "0.7rem",
                textAlign: "left",
                color: "rgba(255,77,106,0.9)",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>

        <button
          onClick={this.handleReset}
          style={{
            padding: "0.625rem 1.5rem",
            borderRadius: 12,
            border: "none",
            background: "var(--cyan-500, #00d4ff)",
            color: "var(--navy-950, #04071a)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Go to Home
        </button>
      </div>
    )
  }
}
