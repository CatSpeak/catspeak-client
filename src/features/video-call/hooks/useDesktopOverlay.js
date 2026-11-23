import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  ANNOTATION_COLORS,
  ANNOTATION_WIDTHS,
} from "@/features/video-call/utils/annotationProtocol"
import {
  buildOverlayState,
  createDesktopOverlayBridge,
  evaluateOverlayLifecycle,
  overlayModeForTool,
  translateOverlayEvent,
} from "@/features/video-call/utils/desktopOverlay"

/** Coalesce state IPC to ~30 fps; the overlay does not need more. */
export const DESKTOP_OVERLAY_STATE_THROTTLE_MS = 33

/**
 * Owns the OS transparent overlay for the local presenter's full-display share.
 *
 * It is deliberately separate from `useScreenAnnotation`: the annotation hook
 * keeps receiving/publishing v1 packets, while this hook mirrors its store to
 * the overlay windows and translates overlay gestures back into packets.
 */
export const useDesktopOverlay = ({
  annotation,
  trackSid = null,
  isPresenter = false,
  isShareActive = false,
  selection = null,
  tool = "mouse",
  color = ANNOTATION_COLORS[0],
  width = ANNOTATION_WIDTHS[1],
  onToolChange,
  onColorChange,
  onWidthChange,
  scope = undefined,
} = {}) => {
  const bridge = useMemo(() => createDesktopOverlayBridge(scope), [scope])
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  const activeRef = useRef(false)
  const activeTrackRef = useRef(null)
  const suppressedTrackRef = useRef(null)
  const generationRef = useRef(0)
  const stateTimerRef = useRef(null)
  const bridgeRef = useRef(bridge)

  const items = annotation?.items
  const lasers = annotation?.lasers
  const canAnnotate = annotation?.canAnnotate === true
  const presenterLocked = annotation?.presenterLocked === true
  const applyLocalPacket = annotation?.applyLocalPacket
  const authorId = annotation?.authorId
  const authorName = annotation?.authorName
  const lasersKey = JSON.stringify(lasers ?? [])

  const latestRef = useRef({})
  useEffect(() => {
    latestRef.current = {
      trackSid,
      tool,
      color,
      width,
      canAnnotate,
      presenterLocked,
      items,
      lasers,
      authorId,
      authorName,
      applyLocalPacket,
      onToolChange,
      onColorChange,
      onWidthChange,
    }
  })
  useEffect(() => {
    bridgeRef.current = bridge
  }, [bridge])

  const stopOverlay = useCallback(() => {
    generationRef.current += 1
    activeTrackRef.current = null
    activeRef.current = false
    setActive(false)
    if (stateTimerRef.current) {
      clearTimeout(stateTimerRef.current)
      stateTimerRef.current = null
    }
    bridgeRef.current.stop()
  }, [])

  const flushState = useCallback(() => {
    if (!activeRef.current) return
    const current = latestRef.current
    const payload = buildOverlayState({
      items: current.items,
      lasers: current.lasers,
      tool: current.tool,
      color: current.color,
      width: current.width,
      canAnnotate: current.canAnnotate,
      presenterLocked: current.presenterLocked,
      authorId: current.authorId,
      authorName: current.authorName,
      mode: current.canAnnotate ? overlayModeForTool(current.tool) : "mouse",
    })

    bridgeRef.current
      .updateState(payload)
      .then((result) => {
        if (result && result.ok === false && result.error !== "UNAVAILABLE") {
          setError(result.error || "OVERLAY_STATE_FAILED")
          stopOverlay()
        }
      })
      .catch(() => {
        // The bridge already normalizes IPC failures; keep the web app alive.
      })
  }, [stopOverlay])

  const scheduleState = useCallback(() => {
    if (!activeRef.current || stateTimerRef.current) return
    stateTimerRef.current = setTimeout(() => {
      stateTimerRef.current = null
      flushState()
    }, DESKTOP_OVERLAY_STATE_THROTTLE_MS)
  }, [flushState])

  const handleOverlayEvent = useCallback(
    (event) => {
      if (!activeRef.current) return
      const current = latestRef.current
      const translated = translateOverlayEvent(event, {
        trackSid: current.trackSid,
        authorId: current.authorId,
        authorName: current.authorName,
      })
      if (!translated) return

      if (translated.packet) {
        current.applyLocalPacket?.(translated.packet)
        return
      }

      const control = translated.control
      if (control.type === "mode-change") {
        // Draw-mode changes always come with an explicit tool-change; only
        // returning to Mouse must also reset the web tool.
        if (control.mode === "mouse") {
          current.onToolChange?.("mouse")
        }
        return
      }
      if (control.type === "tool-change") {
        current.onToolChange?.(control.tool)
        return
      }
      if (control.type === "color-change") {
        current.onColorChange?.(control.color)
        return
      }
      if (control.type === "width-change") {
        current.onWidthChange?.(control.width)
        return
      }
      if (control.type === "exit") {
        suppressedTrackRef.current = current.trackSid
        setError(null)
        stopOverlay()
      }
    },
    [stopOverlay],
  )

  // Start/stop/restart the native windows. Eligibility is purely the ticket
  // contract: Electron bridge + local presenter + full-display share + a live
  // track. A browser or window share never reaches this branch.
  useEffect(() => {
    if (
      suppressedTrackRef.current &&
      suppressedTrackRef.current !== trackSid
    ) {
      suppressedTrackRef.current = null
    }

    const displayId = selection?.displayId ?? null
    const decision = evaluateOverlayLifecycle({
      bridgeAvailable: bridge.available,
      isPresenter,
      isFullDisplay: selection?.isFullDisplay === true,
      isShareActive,
      trackSid,
      displayId,
      overlayTrackSid: activeTrackRef.current,
      suppressedTrackSid: suppressedTrackRef.current,
    })

    if (decision === "idle" || decision === "keep") return
    if (decision === "stop") {
      // Defer the state update out of the effect body (React compiler rule).
      Promise.resolve().then(stopOverlay)
      return
    }

    const generation = generationRef.current + 1
    generationRef.current = generation
    activeTrackRef.current = trackSid

    const run = async () => {
      setError(null)
      if (activeRef.current || decision === "restart") {
        await bridgeRef.current.stop()
      }

      const result = await bridgeRef.current.start({ displayId })
      if (generation !== generationRef.current) {
        if (result && result.ok === true) {
          bridgeRef.current.stop()
        }
        return
      }

      if (!result || result.ok !== true) {
        activeTrackRef.current = null
        activeRef.current = false
        setActive(false)
        setError(result?.error || "OVERLAY_START_FAILED")
        return
      }

      activeRef.current = true
      setActive(true)
      bridgeRef.current.setMode(
        latestRef.current.canAnnotate
          ? overlayModeForTool(latestRef.current.tool)
          : "mouse",
      )
      flushState()
    }

    run().catch(() => {
      if (generation !== generationRef.current) return;
      activeTrackRef.current = null
      activeRef.current = false
      setActive(false)
      setError("OVERLAY_START_FAILED")
    })
  }, [
    bridge,
    bridge.available,
    flushState,
    isPresenter,
    isShareActive,
    selection?.displayId,
    selection?.isFullDisplay,
    stopOverlay,
    trackSid,
  ])

  // Mirror the annotation store/tool state to the overlay windows.
  useEffect(() => {
    if (!active) return
    scheduleState()
  }, [
    active,
    items,
    lasersKey,
    tool,
    color,
    width,
    canAnnotate,
    presenterLocked,
    scheduleState,
  ])

  // Mouse/draw follows the selected tool, and a revoked permission forces the
  // canvas back to mouse-through immediately.
  useEffect(() => {
    if (!active) return
    bridgeRef.current.setMode(canAnnotate ? overlayModeForTool(tool) : "mouse")
  }, [active, canAnnotate, tool])

  // Esc in the meeting window (when it still has focus) mirrors the overlay's
  // own Esc handling: return to Mouse and tell the native canvas.
  useEffect(() => {
    if (!active) return undefined
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return
      if (latestRef.current.tool === "mouse") return
      latestRef.current.onToolChange?.("mouse")
      bridgeRef.current.setMode("mouse")
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [active])

  useEffect(() => {
    if (!isPresenter) return undefined
    const unsubscribe = bridge.onEvent(handleOverlayEvent)
    return unsubscribe
  }, [bridge, handleOverlayEvent, isPresenter])

  useEffect(
    () => () => {
      generationRef.current += 1
      activeRef.current = false
      if (stateTimerRef.current) {
        clearTimeout(stateTimerRef.current)
        stateTimerRef.current = null
      }
      bridgeRef.current.stop()
    },
    [],
  )

  return {
    active,
    error,
    available: bridge.available,
    mode: canAnnotate ? overlayModeForTool(tool) : "mouse",
  }
}

export default useDesktopOverlay
