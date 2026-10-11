import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: "ease",
  speed: 300,
})

/**
 * NavigationProgress — Route-driven top navigation loading bar.
 * Listens strictly to React Router pathname transitions.
 *
 * Guarantees:
 * - Starting a call, prev/next pagination, chat micro-interactions,
 *   and background polling NEVER trigger NProgress because they do
 *   not change the page route.
 * - Only genuine top-level route/page transitions trigger the bar.
 */
const NavigationProgress = () => {
  const location = useLocation()
  const prevPathnameRef = useRef(location.pathname)

  useEffect(() => {
    // Only trigger when the route pathname actually changes (ignore query params or internal state)
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname

      NProgress.start()

      const timer = setTimeout(() => {
        NProgress.done()
      }, 300)

      return () => {
        clearTimeout(timer)
        NProgress.done()
      }
    }
  }, [location.pathname])

  return null
}

export default NavigationProgress
