import { useState, useCallback, useEffect } from "react"

/**
 * Lightweight hook wrapping the Fullscreen API.
 * Handles vendor prefixes (Safari) and keeps `isFullscreen` in sync.
 *
 * @returns {{ isFullscreen: boolean, toggleFullscreen: (el: HTMLElement) => void }}
 */
const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback((el) => {
    if (!el) return

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      ;(document.exitFullscreen || document.webkitExitFullscreen)?.call(document)
    } else {
      ;(el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)
    }
  }, [])

  useEffect(() => {
    const onchange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement))
    }

    document.addEventListener("fullscreenchange", onchange)
    document.addEventListener("webkitfullscreenchange", onchange)
    return () => {
      document.removeEventListener("fullscreenchange", onchange)
      document.removeEventListener("webkitfullscreenchange", onchange)
    }
  }, [])

  return { isFullscreen, toggleFullscreen }
}

export default useFullscreen
