import { useEffect, useState } from "react"

const LOCATION_CHANGE_EVENT = "catspeak:locationchange"
let historyPatchCount = 0
let origPushState = null
let origReplaceState = null

function installHistoryListeners() {
  if (typeof window === "undefined") return
  if (historyPatchCount === 0) {
    origPushState = window.history.pushState
    origReplaceState = window.history.replaceState

    window.history.pushState = function patchedPushState(...args) {
      const result = origPushState.apply(this, args)
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
      return result
    }

    window.history.replaceState = function patchedReplaceState(...args) {
      const result = origReplaceState.apply(this, args)
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
      return result
    }
  }
  historyPatchCount += 1
}

function uninstallHistoryListeners() {
  if (typeof window === "undefined") return
  historyPatchCount = Math.max(0, historyPatchCount - 1)
  if (historyPatchCount === 0 && origPushState && origReplaceState) {
    window.history.pushState = origPushState
    window.history.replaceState = origReplaceState
    origPushState = null
    origReplaceState = null
  }
}

/**
 * Tracks window.location.pathname outside Router context using History API hooks
 * and popstate events instead of interval polling.
 */
export function usePathname() {
  const [pathname, setPathname] = useState(
    typeof window !== "undefined" ? window.location.pathname : "",
  )

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const update = () => setPathname(window.location.pathname)
    installHistoryListeners()
    window.addEventListener("popstate", update)
    window.addEventListener(LOCATION_CHANGE_EVENT, update)
    update()

    return () => {
      window.removeEventListener("popstate", update)
      window.removeEventListener(LOCATION_CHANGE_EVENT, update)
      uninstallHistoryListeners()
    }
  }, [])

  return pathname
}
