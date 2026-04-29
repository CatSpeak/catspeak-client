import { useAuth } from "@/features/auth"
import useGlobalSignalR from "../hooks/useGlobalSignalR"

/**
 * Invisible component that mounts the global SignalR event handler.
 * Only activates when the user is authenticated.
 */
const GlobalSignalRHandler = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return <GlobalSignalRHandlerInner />
}

const GlobalSignalRHandlerInner = () => {
  useGlobalSignalR()
  return null
}

export default GlobalSignalRHandler
