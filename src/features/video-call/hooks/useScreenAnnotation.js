import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RoomEvent } from "livekit-client"

import {
  CO_HOST_PERMISSIONS,
  hasCoHostPermission,
} from "@/features/co-host/constants"
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList"
import {
  ANNOTATION_TOPIC,
  MAX_ANNOTATION_ITEMS,
  SYNC_REQUEST_FALLBACK_MS,
  appendAnnotationItem,
  buildClearPacket,
  buildStrokeEndPacket,
  buildStrokePointPacket,
  buildStrokeStartPacket,
  buildSyncRequestPacket,
  buildSyncSnapshotChunks,
  canApplyClearScope,
  clearAnnotationItems,
  createAnnotationSyncBuffers,
  createSnapshotId,
  decodeAnnotationPacket,
  encodeAnnotationPacket,
  mergeSnapshotItems,
  prepareStrokePoints,
  reassembleSyncChunk,
  validateAnnotationPacket,
} from "@/features/video-call/utils/annotationProtocol"
import { clamp01 } from "@/features/video-call/utils/annotationGeometry"

/** At most one stroke-point packet every 33 ms (~30 fps). */
export const ANNOTATION_POINT_BATCH_MS = 33

export const shouldFlushPointBatch = (
  lastFlushAt,
  now,
  interval = ANNOTATION_POINT_BATCH_MS,
) => now - lastFlushAt >= interval

export const DESKTOP_ANNOTATION_CHANNEL = "annotation:event"

/**
 * Bridge to the Electron OS overlay. The preload seam is optional; in a plain
 * browser every method is an inert no-op so ticket 07 can wire it later.
 */
export const createDesktopAnnotationBridge = (
  scope = typeof window !== "undefined" ? window : null,
) => {
  const ipc =
    scope?.catspeakDesktop?.annotation ??
    scope?.electronAPI?.annotation ??
    null
  const available = Boolean(ipc && typeof ipc.send === "function")

  return {
    available,
    channel: DESKTOP_ANNOTATION_CHANNEL,
    emit: (event) => {
      if (!available) return false
      try {
        ipc.send(event)
        return true
      } catch {
        return false
      }
    },
    subscribe: (handler) => {
      if (!available || typeof ipc.on !== "function") return () => {}
      const wrapped = (_event, payload) => {
        try {
          handler(payload)
        } catch {
          // The overlay must never break the in-app renderer.
        }
      }
      try {
        ipc.on(DESKTOP_ANNOTATION_CHANNEL, wrapped)
      } catch {
        return () => {}
      }
      return () => {
        try {
          ipc.off?.(DESKTOP_ANNOTATION_CHANNEL, wrapped)
        } catch {
          // ignore
        }
      }
    },
  }
}

/**
 * canAnnotate: host, presenter or a co-host holding `manage_student_share`
 * always can; everyone else follows the policy seam (default open, wired to
 * the room setting by ticket 04).
 */
export const computeAnnotationPermissions = ({
  enabled = true,
  isHost = false,
  isPresenter = false,
  coHost = null,
  accountId = null,
  allowAnnotation = true,
} = {}) => {
  const isCoHostModerator = hasCoHostPermission(
    coHost,
    accountId,
    CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
  )
  const canModerateAnnotation = Boolean(
    enabled && (isHost || isPresenter || isCoHostModerator),
  )
  const canAnnotate = Boolean(
    enabled && (canModerateAnnotation || allowAnnotation === true),
  )
  return { canAnnotate, canModerateAnnotation, isCoHostModerator }
}

export const createAnnotationState = (trackSid = null) => ({
  trackSid: trackSid ?? null,
  items: [],
  liveStrokes: {},
  presenterLocked: false,
})

export const resetAnnotationStateForTrack = (state, trackSid) => {
  const nextTrackSid = trackSid ?? null
  if (state?.trackSid === nextTrackSid) return state
  return createAnnotationState(nextTrackSid)
}

export const applySyncSnapshotToState = (
  state,
  { items, presenterLocked } = {},
) => ({
  ...state,
  items: mergeSnapshotItems(
    state.items,
    items ?? [],
    MAX_ANNOTATION_ITEMS,
  ),
  presenterLocked:
    presenterLocked === undefined
      ? state.presenterLocked
      : Boolean(presenterLocked),
})

const omitKey = (record, key) => {
  const next = { ...record }
  delete next[key]
  return next
}

const clearLiveStrokes = (liveStrokes, { scope, authorId, canModerate }) => {
  if (!canApplyClearScope({ scope, canModerate })) return liveStrokes
  if (scope === "all") return {}
  if (authorId == null) return liveStrokes

  const next = {}
  for (const [id, stroke] of Object.entries(liveStrokes ?? {})) {
    const isMine = String(stroke?.authorId) === String(authorId)
    if (scope === "mine" ? !isMine : isMine) next[id] = stroke
  }
  return next
}

/**
 * Pure reducer for one decoded packet. Used by the hook and directly by tests;
 * invalid packets and packets for another `trackSid` are safely ignored.
 */
export const applyAnnotationPacketToState = (
  state,
  rawPacket,
  {
    now = Date.now(),
    senderAuthorId = null,
    canModerate = false,
  } = {},
) => {
  const packet = validateAnnotationPacket(rawPacket)
  if (!packet || state?.trackSid !== packet.trackSid) return state

  switch (packet.t) {
    case "stroke-start": {
      const live = {
        id: packet.id,
        kind: "stroke",
        tool: packet.tool,
        color: packet.color,
        width: packet.width,
        authorId: packet.authorId ?? senderAuthorId ?? null,
        authorName: packet.authorName,
        pts: [packet.pt],
        createdAt: now,
      }
      return {
        ...state,
        liveStrokes: { ...state.liveStrokes, [packet.id]: live },
      }
    }
    case "stroke-point": {
      const live = state.liveStrokes[packet.id]
      if (!live) return state
      return {
        ...state,
        liveStrokes: {
          ...state.liveStrokes,
          [packet.id]: { ...live, pts: [...live.pts, ...packet.pts] },
        },
      }
    }
    case "stroke-end": {
      const item = { ...packet.item, createdAt: now }
      return {
        ...state,
        liveStrokes: omitKey(state.liveStrokes, packet.id ?? item.id),
        items: appendAnnotationItem(state.items, item),
      }
    }
    case "erase": {
      const remove = new Set(packet.ids)
      return {
        ...state,
        items: state.items.filter((item) => !remove.has(item?.id)),
        liveStrokes: Object.fromEntries(
          Object.entries(state.liveStrokes).filter(([id]) => !remove.has(id)),
        ),
      }
    }
    case "clear": {
      const authorId = packet.authorId ?? senderAuthorId
      if (!canApplyClearScope({ scope: packet.scope, canModerate })) {
        return state
      }
      return {
        ...state,
        items: clearAnnotationItems(state.items, {
          scope: packet.scope,
          authorId,
          canModerate,
        }),
        liveStrokes: clearLiveStrokes(state.liveStrokes, {
          scope: packet.scope,
          authorId,
          canModerate,
        }),
      }
    }
    case "presenter-lock":
      return { ...state, presenterLocked: packet.locked }
    default:
      // laser-move, sync-req/sync-snap and ticket-03 shape/text packets are
      // consumed by their own handlers or deliberately ignored for now.
      return state
  }
}

const participantAuthorId = (participant) => {
  if (!participant) return null
  const meta = parseMetadata(participant.metadata)
  if (meta?.accountId != null) return String(meta.accountId)
  return participant.identity ?? null
}

const roundLocalPoint = (point) => [
  Number(clamp01(point?.[0] ?? 0).toFixed(4)),
  Number(clamp01(point?.[1] ?? 0).toFixed(4)),
]

let localStrokeSequence = 0
const createStrokeId = () => {
  localStrokeSequence += 1
  return `stroke-${Date.now().toString(36)}-${localStrokeSequence.toString(36)}`
}

/**
 * Screen-annotation state and transport for one `screenTrackSid`.
 *
 * Every tile subscribes to the topic; interactive tiles set `isPrimary` for
 * future tooling, while read-only thumbnails/grid/PiP never draw.
 */
export const useScreenAnnotation = ({
  room = null,
  screenTrackSid = null,
  enabled = true,
  isPrimary = false,
  isHost = false,
  isPresenter = false,
  coHost = null,
  accountId = null,
  authorName = "",
  allowAnnotation = true,
} = {}) => {
  const trackSid = screenTrackSid ?? null
  const [state, setState] = useState(() => createAnnotationState(trackSid))

  // Stopping the share, or the presenter switching to another track, wipes
  // every stroke on every client. Old strokes never leak into a new share.
  // Adjusting state during render is React's sanctioned prop-change pattern.
  if (state.trackSid !== trackSid) {
    setState(createAnnotationState(trackSid))
  }

  const stateRef = useRef(state)
  const latestRef = useRef({})
  const syncBuffersRef = useRef(createAnnotationSyncBuffers())
  const lastSyncSnapAtRef = useRef(0)
  const fallbackTimerRef = useRef(null)
  const strokeRef = useRef(null)
  const sendSnapshotRef = useRef(() => {})

  const bridge = useMemo(() => createDesktopAnnotationBridge(), [])

  const permissions = computeAnnotationPermissions({
    enabled,
    isHost,
    isPresenter,
    coHost,
    accountId,
    allowAnnotation,
  })

  useEffect(() => {
    stateRef.current = state
    latestRef.current = {
      room,
      trackSid,
      isHost,
      isPresenter,
      isPrimary,
      accountId,
      authorName,
      canAnnotate: permissions.canAnnotate,
      canModerateAnnotation: permissions.canModerateAnnotation,
    }
  })

  // Stopping the share, or the presenter switching to another track, wipes
  // every stroke on every client. Old strokes never leak into a new share.
  useEffect(() => {
    syncBuffersRef.current = createAnnotationSyncBuffers()
    lastSyncSnapAtRef.current = 0
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    if (strokeRef.current?.timer) clearTimeout(strokeRef.current.timer)
    strokeRef.current = null
  }, [trackSid])

  const publishPacket = useCallback((packet, reliable) => {
    const current = latestRef.current
    const local = current.room?.localParticipant
    if (!local || !current.trackSid) return false

    try {
      const encoded = encodeAnnotationPacket({
        ...packet,
        v: 1,
        trackSid: current.trackSid,
      })
      const result = local.publishData(encoded, {
        topic: ANNOTATION_TOPIC,
        reliable,
      })
      if (result && typeof result.catch === "function") result.catch(() => {})
      return true
    } catch {
      return false
    }
  }, [])

  const flushStrokePending = useCallback(
    (stroke) => {
      if (!stroke || stroke.pending.length === 0) return
      if (latestRef.current.trackSid !== stroke.trackSid) {
        stroke.pending = []
        return
      }
      const pts = stroke.pending
      stroke.pending = []
      stroke.lastFlushAt = Date.now()
      publishPacket(
        buildStrokePointPacket({
          trackSid: latestRef.current.trackSid,
          id: stroke.id,
          pts,
        }),
        false,
      )
    },
    [publishPacket],
  )

  const sendSnapshot = useCallback(() => {
    const current = latestRef.current
    if (!current.trackSid) return
    const chunks = buildSyncSnapshotChunks({
      trackSid: current.trackSid,
      items: stateRef.current.items,
      snapId: createSnapshotId(),
      presenterLocked: stateRef.current.presenterLocked,
    })
    chunks.forEach((chunk) => publishPacket(chunk, true))
  }, [publishPacket])

  useEffect(() => {
    sendSnapshotRef.current = sendSnapshot
  }, [sendSnapshot])

  useEffect(() => {
    if (!enabled || !room || !trackSid) return

    const handleData = (payload, participant, _kind, topic) => {
      if (topic !== ANNOTATION_TOPIC) return
      const packet = decodeAnnotationPacket(payload)
      if (!packet || packet.trackSid !== trackSid) return

      if (packet.t === "sync-req") {
        const requestedAt = Date.now()
        if (latestRef.current.isPresenter) {
          sendSnapshotRef.current()
          return
        }
        if (!latestRef.current.isHost) return
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = setTimeout(() => {
          fallbackTimerRef.current = null
          if (lastSyncSnapAtRef.current >= requestedAt) return
          sendSnapshotRef.current()
        }, SYNC_REQUEST_FALLBACK_MS)
        return
      }

      if (packet.t === "sync-snap") {
        lastSyncSnapAtRef.current = Date.now()
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }
        const result = reassembleSyncChunk(syncBuffersRef.current, packet)
        syncBuffersRef.current = result.buffers
        if (result.complete) {
          setState((prev) => applySyncSnapshotToState(prev, result))
        }
        return
      }

      setState((prev) =>
        applyAnnotationPacketToState(prev, packet, {
          now: Date.now(),
          senderAuthorId: participantAuthorId(participant),
          canModerate: latestRef.current.canModerateAnnotation,
        }),
      )
    }

    room.on(RoomEvent.DataReceived, handleData)
    return () => {
      room.off(RoomEvent.DataReceived, handleData)
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
    }
  }, [room, enabled, trackSid])

  // Late joiner: every tile asks once (main + read-only copies each need the
  // existing store). The presenter answers first; the host falls back after
  // 400 ms when no snapshot arrives.
  useEffect(() => {
    if (!enabled || !room || !trackSid || isPresenter) return
    publishPacket(
      buildSyncRequestPacket({
        trackSid,
        requesterId:
          accountId != null ? String(accountId) : "anonymous-annotation",
      }),
      true,
    )
  }, [
    room,
    enabled,
    trackSid,
    isPresenter,
    accountId,
    publishPacket,
  ])

  const beginStroke = useCallback(
    ({ tool = "pen", color = "#ef4444", width = 4, pt } = {}) => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate || !pt) return null
      if (tool !== "pen" && tool !== "highlighter") return null

      if (strokeRef.current?.timer) clearTimeout(strokeRef.current.timer)
      strokeRef.current = null

      const point = roundLocalPoint(pt)
      const id = createStrokeId()
      const authorId =
        current.accountId != null ? String(current.accountId) : "anonymous"
      const strokeAuthorName = current.authorName || "Guest"
      const live = {
        id,
        kind: "stroke",
        tool,
        color,
        width,
        authorId,
        authorName: strokeAuthorName,
        pts: [point],
        createdAt: Date.now(),
      }

      setState((prev) => ({
        ...prev,
        liveStrokes: { ...prev.liveStrokes, [id]: live },
      }))

      strokeRef.current = {
        id,
        trackSid: current.trackSid,
        tool,
        color,
        width,
        authorId,
        authorName: strokeAuthorName,
        pts: [point],
        pending: [],
        lastFlushAt: 0,
        timer: null,
      }

      publishPacket(
        buildStrokeStartPacket({
          trackSid: current.trackSid,
          id,
          tool,
          color,
          width,
          authorId,
          authorName: strokeAuthorName,
          pt: point,
        }),
        false,
      )
      bridge.emit({ type: "stroke-start", id, trackSid: current.trackSid })
      return id
    },
    [bridge, publishPacket, setState],
  )

  const extendStroke = useCallback(
    (pt) => {
      const stroke = strokeRef.current
      if (!stroke || !pt) return
      if (latestRef.current.trackSid !== stroke.trackSid) {
        if (stroke.timer) clearTimeout(stroke.timer)
        strokeRef.current = null
        return
      }

      const point = roundLocalPoint(pt)
      stroke.pts.push(point)

      setState((prev) => {
        const live = prev.liveStrokes[stroke.id]
        if (!live) return prev
        return {
          ...prev,
          liveStrokes: {
            ...prev.liveStrokes,
            [stroke.id]: { ...live, pts: [...live.pts, point] },
          },
        }
      })

      stroke.pending.push(point)
      const now = Date.now()
      if (shouldFlushPointBatch(stroke.lastFlushAt, now)) {
        flushStrokePending(stroke)
      } else if (!stroke.timer) {
        const delay = Math.max(
          0,
          ANNOTATION_POINT_BATCH_MS - (now - stroke.lastFlushAt),
        )
        stroke.timer = setTimeout(() => {
          stroke.timer = null
          flushStrokePending(stroke)
        }, delay)
      }
      bridge.emit({ type: "stroke-point", id: stroke.id, pt: point })
    },
    [bridge, flushStrokePending, setState],
  )

  const endStroke = useCallback(() => {
    const stroke = strokeRef.current
    if (!stroke) return null

    if (stroke.timer) clearTimeout(stroke.timer)
    stroke.timer = null
    strokeRef.current = null

    // The share stopped/switched while the pointer was down: discard instead
    // of leaking the stroke into the new track.
    if (latestRef.current.trackSid !== stroke.trackSid) {
      setState((prev) => ({
        ...prev,
        liveStrokes: omitKey(prev.liveStrokes, stroke.id),
      }))
      return null
    }

    if (stroke.pending.length > 0) flushStrokePending(stroke)

    const pts = prepareStrokePoints(stroke.pts)

    if (pts.length === 0) {
      setState((prev) => ({
        ...prev,
        liveStrokes: omitKey(prev.liveStrokes, stroke.id),
      }))
      return null
    }

    const item = {
      id: stroke.id,
      kind: "stroke",
      tool: stroke.tool,
      color: stroke.color,
      width: stroke.width,
      authorId: stroke.authorId,
      authorName: stroke.authorName,
      pts,
    }

    setState((prev) => ({
      ...prev,
      liveStrokes: omitKey(prev.liveStrokes, stroke.id),
      items: appendAnnotationItem(prev.items, {
        ...item,
        createdAt: Date.now(),
      }),
    }))

    publishPacket(
      buildStrokeEndPacket({
        trackSid: latestRef.current.trackSid,
        item,
      }),
      true,
    )
    bridge.emit({ type: "stroke-end", item })
    return item
  }, [bridge, flushStrokePending, publishPacket, setState])

  const clearMine = useCallback(() => {
    const current = latestRef.current
    if (!current.trackSid || !current.canAnnotate) return
    const authorId =
      current.accountId != null ? String(current.accountId) : null

    const packet = buildClearPacket({
      trackSid: current.trackSid,
      scope: "mine",
      authorId,
    })
    setState((prev) =>
      applyAnnotationPacketToState(prev, packet, { now: Date.now() }),
    )
    publishPacket(packet, true)
  }, [publishPacket, setState])

  return {
    trackSid,
    items: state.items,
    liveStrokes: Object.values(state.liveStrokes),
    presenterLocked: state.presenterLocked,
    canAnnotate: permissions.canAnnotate,
    canModerateAnnotation: permissions.canModerateAnnotation,
    beginStroke,
    extendStroke,
    endStroke,
    clearMine,
    bridge,
  }
}

export default useScreenAnnotation
