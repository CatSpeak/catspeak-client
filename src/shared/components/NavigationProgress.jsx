import { useEffect, useRef } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { useSelector } from "react-redux"

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: "ease",
  speed: 400,
})

/**
 * Global navigation progress bar component.
 * Listens to all RTK Query API requests and shows/hides
 * the NProgress bar based on active query count.
 *
 * Place this component once inside the Redux Provider.
 */
const NavigationProgress = () => {
  const apiState = useSelector((state) => state.api)
  const activeCountRef = useRef(0)

  useEffect(() => {
    if (!apiState?.queries) return

    // Count how many queries are currently in a "pending" state
    const pendingCount = Object.values(apiState.queries).filter((query) => {
      if (query?.status !== "pending") return false
      // Ignore pagination requests for getRooms so they don't trigger global nprogress
      if (query?.endpointName === "getRooms" && query?.originalArgs?.page > 1) {
        return false
      }
      
      // Ignore real-time background syncing for messages so it doesn't interrupt UX
      if (
        query?.endpointName === "getConversations" ||
        query?.endpointName === "getConversationMessages"
      ) {
        return false
      }

      // Ignore getEventsByDate so clicking a date in the calendar doesn't trigger global nprogress
      if (query?.endpointName === "getEventsByDate") {
        return false
      }

      return true
    }).length

    const wasFetching = activeCountRef.current > 0
    const isFetching = pendingCount > 0

    activeCountRef.current = pendingCount

    if (isFetching && !wasFetching) {
      NProgress.start()
    } else if (!isFetching && wasFetching) {
      NProgress.done()
    }
  }, [apiState])

  return null
}

export default NavigationProgress
