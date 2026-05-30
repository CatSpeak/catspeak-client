import React from "react"
import { useAuth } from "@/features/auth"
import useGlobalSignalR from "../hooks/useGlobalSignalR"

class GlobalSignalRErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, background: "red", color: "white", padding: "10px" }}>
          <p>GlobalSignalR Error:</p>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Invisible component that mounts the global SignalR event handler.
 * Only activates when the user is authenticated.
 */
const GlobalSignalRHandler = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <GlobalSignalRErrorBoundary>
      <GlobalSignalRHandlerInner />
    </GlobalSignalRErrorBoundary>
  )
}

const GlobalSignalRHandlerInner = () => {
  useGlobalSignalR()
  return null
}

export default GlobalSignalRHandler
