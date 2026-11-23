import { useCallback, useEffect, useRef, useState } from "react"
import { RoomEvent } from "livekit-client"

import {
  CO_HOST_PERMISSIONS,
  hasCoHostPermission,
} from "@/features/co-host/constants"
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList"
import {
  ANNOTATION_TOPIC,
  MAX_ANNOTATION_ITEMS,
  SHAPE_TOOLS,
  SYNC_REQUEST_FALLBACK_MS,
  appendAnnotationItem,
  buildClearPacket,
  buildErasePacket,
  buildLaserMovePacket,
  buildPresenterLockPacket,
  buildRedoPacket,
  buildShapeCommitPacket,
  buildStrokeEndPacket,
  buildStrokePointPacket,
  buildStrokeStartPacket,
  buildSyncRequestPacket,
  buildSyncSnapshotChunks,
  buildTextCommitPacket,
  buildUndoPacket,
  canApplyClearScope,
  clearAnnotationItems,
  createAnnotationSyncBuffers,
  createSnapshotId,
  decodeAnnotationPacket,
  encodeAnnotationPacket,
  mergeSnapshotItems,
  prepareStrokePoints,
  reassembleSyncChunk,
  removeAnnotationItems,
  validateAnnotationPacket,
} from "@/features/video-call/utils/annotationProtocol"
import {
  clamp01,
  hitTestAnnotations,
} from "@/features/video-call/utils/annotationGeometry"
import {
  ANNOTATION_TEXT_FONT_SIZE,
  normalizeAnnotationText,
  shouldCommitAnnotationText,
} from "@/features/video-call/utils/annotationText"
import { LASER_TTL_MS } from "@/features/video-call/utils/annotationRenderer"

/** At most one stroke-point packet every 33 ms (~30 fps). */
export const ANNOTATION_POINT_BATCH_MS = 33

/** Normalized hit radius of the eraser around the pointer. */
export const ERASER_TOLERANCE = 0.02

/** Shapes smaller than this (in either axis) are treated as stray clicks. */
export const MIN_SHAPE_SIZE = 0.003

/** Keep the laser tail short; older points fade out after 2.5 s anyway. */
export const MAX_LASER_TRAIL_POINTS = 48

export const shouldFlushPointBatch = (
  lastFlushAt,
  now,
  interval = ANNOTATION_POINT_BATCH_MS,
) => now - lastFlushAt >= interval

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
  presenterLocked = false,
} = {}) => {
  const isCoHostModerator = hasCoHostPermission(
    coHost,
    accountId,
    CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
  )
  const canModerateAnnotation = Boolean(
    enabled && (isHost || isPresenter || isCoHostModerator),
  )
  // The presenter lock only applies to members; moderators keep drawing.
  const memberDrawAllowed = Boolean(
    enabled && allowAnnotation === true && presenterLocked !== true,
  )
  const canAnnotate = Boolean(canModerateAnnotation || memberDrawAllowed)
  return {
    canAnnotate,
    canModerateAnnotation,
    isCoHostModerator,
    memberDrawAllowed,
  }
}

export const createAnnotationState = (trackSid = null) => ({
  trackSid: trackSid ?? null,
  items: [],
  liveStrokes: {},
  draftShape: null,
  lasers: {},
  presenterLocked: false,
})

/** Local undo/redo stacks for the current user and track. */
export const createAnnotationHistory = () => ({
  undoStack: [],
  redoStack: [],
})

/** A committed item becomes undoable and invalidates the redo branch. */
export const recordAnnotationHistoryCommit = (history, item) => {
  const source = history ?? createAnnotationHistory()
  if (!item?.id) return source
  return {
    undoStack: [...source.undoStack, { id: item.id, item }],
    redoStack: [],
  }
}

/** Pop the newest own item that still exists in the store. */
export const takeUndoEntry = (history, items, authorId) => {
  const source = history ?? createAnnotationHistory()
  const undoStack = [...source.undoStack]
  let item = null

  while (undoStack.length > 0) {
    const entry = undoStack.pop()
    const current = (items ?? []).find(
      (candidate) => candidate?.id === entry.id,
    )
    if (current && String(current.authorId) === String(authorId)) {
      item = current
      break
    }
  }

  if (!item) {
    return {
      history: { undoStack, redoStack: [...source.redoStack] },
      item: null,
    }
  }
  return {
    history: { undoStack, redoStack: [...source.redoStack, item] },
    item,
  }
}

/** Pop the newest redo entry unless the item is already back in the store. */
export const takeRedoEntry = (history, items) => {
  const source = history ?? createAnnotationHistory()
  const redoStack = [...source.redoStack]
  const item = redoStack.pop() ?? null
  const exists =
    item != null && (items ?? []).some((candidate) => candidate?.id === item.id)

  if (!item || exists) {
    return {
      history: { undoStack: [...source.undoStack], redoStack },
      item: null,
    }
  }
  return {
    history: {
      undoStack: [...source.undoStack, { id: item.id, item }],
      redoStack,
    },
    item,
  }
}

export const isLaserTrailExpired = (laser, now, ttl = LASER_TTL_MS) => {
  const trail = laser?.trail ?? []
  const latest = trail[trail.length - 1]
  if (!latest) return true
  return now - (latest.ts ?? 0) > ttl
}

export const pruneAnnotationLasers = (lasers, now, ttl = LASER_TTL_MS) => {
  const next = {}
  for (const [key, laser] of Object.entries(lasers ?? {})) {
    if (!isLaserTrailExpired(laser, now, ttl)) next[key] = laser
  }
  return next
}

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

const canEraseItem = (item, senderAuthorId, canModerate) => {
  if (canModerate) return true
  if (senderAuthorId == null || item?.authorId == null) return true
  return String(item.authorId) === String(senderAuthorId)
}

const canUndoItem = (item, senderAuthorId) => {
  if (!item) return false
  if (senderAuthorId == null || item.authorId == null) return true
  return String(item.authorId) === String(senderAuthorId)
}

/**
 * Packets that add pixels to the shared screen. While the policy is off or
 * the presenter locked the share, only moderators may send them; everyone
 * still renders items committed before the lock.
 */
const MEMBER_DRAW_PACKET_TYPES = new Set([
  "stroke-start",
  "stroke-point",
  "stroke-end",
  "shape-commit",
  "text-commit",
  "laser-move",
])

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
    senderCanModerate = null,
    memberDrawAllowed = true,
  } = {},
) => {
  const packet = validateAnnotationPacket(rawPacket)
  if (!packet || state?.trackSid !== packet.trackSid) return state

  // Receiver-side check: the sender must be allowed to moderate. When the
  // caller cannot resolve the sender's role, keep the ticket-02 fallback.
  const senderModerates = senderCanModerate ?? canModerate

  if (
    memberDrawAllowed === false &&
    !senderModerates &&
    MEMBER_DRAW_PACKET_TYPES.has(packet.t)
  ) {
    return state
  }

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
    case "shape-commit":
    case "text-commit": {
      const item = { ...packet.item, createdAt: now }
      return {
        ...state,
        items: appendAnnotationItem(state.items, item),
      }
    }
    case "laser-move": {
      const key =
        senderAuthorId != null ? String(senderAuthorId) : packet.authorName
      const current = state.lasers?.[key]
      const trail = [
        ...(current?.trail ?? []),
        { x: packet.x, y: packet.y, ts: now },
      ].slice(-MAX_LASER_TRAIL_POINTS)
      return {
        ...state,
        lasers: {
          ...pruneAnnotationLasers(state.lasers, now),
          [key]: {
            authorName: packet.authorName,
            color: packet.color,
            trail,
          },
        },
      }
    }
    case "erase": {
      const remove = new Set()
      for (const id of packet.ids) {
        const item =
          state.items.find((candidate) => candidate?.id === id) ??
          state.liveStrokes[id]
        if (!item) continue
        if (!canEraseItem(item, senderAuthorId, senderModerates)) continue
        remove.add(id)
      }
      if (remove.size === 0) return state
      return {
        ...state,
        items: state.items.filter((item) => !remove.has(item?.id)),
        liveStrokes: Object.fromEntries(
          Object.entries(state.liveStrokes).filter(([id]) => !remove.has(id)),
        ),
      }
    }
    case "undo": {
      const item = state.items.find((candidate) => candidate?.id === packet.id)
      if (!item || !canUndoItem(item, senderAuthorId)) return state
      return {
        ...state,
        items: removeAnnotationItems(state.items, [packet.id]),
      }
    }
    case "redo": {
      if (state.items.some((candidate) => candidate?.id === packet.item.id)) {
        return state
      }
      if (!canUndoItem(packet.item, senderAuthorId)) return state
      return {
        ...state,
        items: appendAnnotationItem(state.items, {
          ...packet.item,
          createdAt: now,
        }),
      }
    }
    case "clear": {
      // A `mine` clear may only target the sender's own annotations; preventing
      // a spoofed authorId keeps it from being used as a blanket erase.
      if (
        packet.scope === "mine" &&
        senderAuthorId != null &&
        packet.authorId != null &&
        String(packet.authorId) !== String(senderAuthorId)
      ) {
        return state
      }
      const authorId = packet.authorId ?? senderAuthorId
      if (
        !canApplyClearScope({
          scope: packet.scope,
          canModerate: senderModerates,
        })
      ) {
        return state
      }
      return {
        ...state,
        items: clearAnnotationItems(state.items, {
          scope: packet.scope,
          authorId,
          canModerate: senderModerates,
        }),
        liveStrokes: clearLiveStrokes(state.liveStrokes, {
          scope: packet.scope,
          authorId,
          canModerate: senderModerates,
        }),
      }
    }
    case "presenter-lock":
      // Control packets are moderator-only: a regular participant must never
      // be able to lock/unlock everyone else's toolbar.
      return senderModerates ? { ...state, presenterLocked: packet.locked } : state
    default:
      // sync-req/sync-snap are consumed by their own handlers.
      return state
  }
}

const participantAuthorId = (participant) => {
  if (!participant) return null
  const meta = parseMetadata(participant.metadata)
  if (meta?.accountId != null) return String(meta.accountId)
  return participant.identity ?? null
}

/**
 * Host, presenter and co-hosts with `manage_student_share` arrive in
 * `moderatorAccountIds`; everything else is a regular participant.
 */
export const isAnnotationModerator = (
  senderAuthorId,
  moderatorAccountIds = [],
) =>
  senderAuthorId != null &&
  (moderatorAccountIds ?? []).some(
    (id) => id != null && String(id) === String(senderAuthorId),
  )

export const resolveAnnotationSenderAuthority = (
  participant,
  moderatorAccountIds = [],
) => {
  const senderAuthorId = participantAuthorId(participant)
  return {
    senderAuthorId,
    senderCanModerate: isAnnotationModerator(
      senderAuthorId,
      moderatorAccountIds,
    ),
  }
}

/**
 * `sync-snap` carries authoritative late-joiner state, so only a resolved
 * moderator may apply it. Returns null when the sender is untrusted.
 */
export const handleAnnotationSyncSnapshot = (
  buffers,
  packet,
  senderCanModerate = false,
) => {
  if (senderCanModerate !== true) return null
  const result = reassembleSyncChunk(buffers, packet)
  return { buffers: result.buffers, result }
}

/**
 * Only the interactive/spotlight copy of the tile answers `sync-req`; grid,
 * sidebar and PiP duplicates would otherwise broadcast N identical snapshots.
 */
export const resolveSyncRequestResponse = ({
  isPrimary = false,
  isPresenter = false,
  isHost = false,
} = {}) => {
  if (!isPrimary) return "ignore"
  if (isPresenter) return "snapshot"
  if (isHost) return "fallback"
  return "ignore"
}

const pointCoordinates = (point) =>
  Array.isArray(point) ? [point[0], point[1]] : [point?.x, point?.y]

const roundLocalPoint = (point) => {
  const [x, y] = pointCoordinates(point)
  return [
    Number(clamp01(Number.isFinite(x) ? x : 0).toFixed(4)),
    Number(clamp01(Number.isFinite(y) ? y : 0).toFixed(4)),
  ]
}

let localItemSequence = 0
const createLocalItemId = (prefix) => {
  localItemSequence += 1
  return `${prefix}-${Date.now().toString(36)}-${localItemSequence.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`
}

const createStrokeId = () => createLocalItemId("stroke")

const resolveAuthorId = (current) =>
  current?.accountId != null ? String(current.accountId) : "anonymous"

const resolveAuthorName = (current) => current?.authorName || "Guest"

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
  moderatorAccountIds = [],
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
  const shapeRef = useRef(null)
  const historyRef = useRef(createAnnotationHistory())
  const laserRef = useRef({
    lastSentAt: 0,
    pending: null,
    timer: null,
    trackSid: null,
  })
  const sendSnapshotRef = useRef(() => {})

  const permissions = computeAnnotationPermissions({
    enabled,
    isHost,
    isPresenter,
    coHost,
    accountId,
    allowAnnotation,
    presenterLocked: state.presenterLocked,
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
      moderatorAccountIds,
      canAnnotate: permissions.canAnnotate,
      canModerateAnnotation: permissions.canModerateAnnotation,
      memberDrawAllowed: permissions.memberDrawAllowed,
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
    if (laserRef.current.timer) clearTimeout(laserRef.current.timer)
    laserRef.current = {
      lastSentAt: 0,
      pending: null,
      timer: null,
      trackSid: null,
    }
    shapeRef.current = null
    historyRef.current = createAnnotationHistory()
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
      if (
        latestRef.current.trackSid !== stroke.trackSid ||
        !latestRef.current.canAnnotate
      ) {
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

      // Resolve the sender before interpreting any control packet: late-joiner
      // snapshots and presenter locks are moderator-only.
      const { senderAuthorId, senderCanModerate } =
        resolveAnnotationSenderAuthority(
          participant,
          latestRef.current.moderatorAccountIds,
        )

      if (packet.t === "sync-req") {
        const requestedAt = Date.now()
        const response = resolveSyncRequestResponse(latestRef.current)
        if (response === "snapshot") {
          sendSnapshotRef.current()
          return
        }
        if (response !== "fallback") return
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = setTimeout(() => {
          fallbackTimerRef.current = null
          if (lastSyncSnapAtRef.current >= requestedAt) return
          sendSnapshotRef.current()
        }, SYNC_REQUEST_FALLBACK_MS)
        return
      }

      if (packet.t === "sync-snap") {
        const handled = handleAnnotationSyncSnapshot(
          syncBuffersRef.current,
          packet,
          senderCanModerate,
        )
        if (!handled) return

        lastSyncSnapAtRef.current = Date.now()
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }
        syncBuffersRef.current = handled.buffers
        if (handled.result.complete) {
          setState((prev) => applySyncSnapshotToState(prev, handled.result))
        }
        return
      }

      setState((prev) =>
        applyAnnotationPacketToState(prev, packet, {
          now: Date.now(),
          senderAuthorId,
          senderCanModerate,
          memberDrawAllowed: latestRef.current.memberDrawAllowed,
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

  // Laser trails are ephemeral UI state; drop them just after the fade TTL.
  useEffect(() => {
    if (Object.keys(state.lasers ?? {}).length === 0) return undefined
    const timer = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        lasers: pruneAnnotationLasers(prev.lasers, Date.now()),
      }))
    }, LASER_TTL_MS + 50)
    return () => clearTimeout(timer)
  }, [state.lasers])

  const beginStroke = useCallback(
    ({ tool = "pen", color = "#ef4444", width = 4, pt } = {}) => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate || !pt) return null
      if (tool !== "pen" && tool !== "highlighter") return null

      if (strokeRef.current?.timer) clearTimeout(strokeRef.current.timer)
      strokeRef.current = null

      const point = roundLocalPoint(pt)
      const id = createStrokeId()
      const authorId = resolveAuthorId(current)
      const strokeAuthorName = resolveAuthorName(current)
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
      return id
    },
    [publishPacket, setState],
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
      if (!latestRef.current.canAnnotate) {
        if (stroke.timer) clearTimeout(stroke.timer)
        strokeRef.current = null
        setState((prev) => ({
          ...prev,
          liveStrokes: omitKey(prev.liveStrokes, stroke.id),
        }))
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
    },
    [flushStrokePending, setState],
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

    // The policy/lock flipped while the pointer was down: discard the stroke
    // instead of publishing a packet after annotation was revoked.
    if (!latestRef.current.canAnnotate) {
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
    historyRef.current = recordAnnotationHistoryCommit(historyRef.current, item)

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
    return item
  }, [flushStrokePending, publishPacket, setState])

  const flushLaserPending = useCallback(
    (laser) => {
      if (!laser?.pending) return
      if (
        latestRef.current.trackSid !== laser.trackSid ||
        !latestRef.current.canAnnotate
      ) {
        laser.pending = null
        return
      }
      const point = laser.pending
      laser.pending = null
      laser.lastSentAt = Date.now()
      publishPacket(
        buildLaserMovePacket({
          trackSid: latestRef.current.trackSid,
          authorName: laser.authorName,
          color: laser.color,
          x: point[0],
          y: point[1],
          ts: laser.lastSentAt,
        }),
        false,
      )
    },
    [publishPacket],
  )

  const sendLaserMove = useCallback(
    (pt, color = "#ef4444") => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate || !pt) return
      const now = Date.now()
      const point = roundLocalPoint(pt)
      const key = resolveAuthorId(current)
      const authorName = resolveAuthorName(current)

      setState((prev) => {
        const trail = [
          ...(prev.lasers?.[key]?.trail ?? []),
          { x: point[0], y: point[1], ts: now },
        ].slice(-MAX_LASER_TRAIL_POINTS)
        return {
          ...prev,
          lasers: {
            ...pruneAnnotationLasers(prev.lasers, now),
            [key]: { authorName, color, trail },
          },
        }
      })

      const laser = laserRef.current
      laser.trackSid = current.trackSid
      laser.authorName = authorName
      laser.color = color

      if (shouldFlushPointBatch(laser.lastSentAt, now)) {
        laser.lastSentAt = now
        publishPacket(
          buildLaserMovePacket({
            trackSid: current.trackSid,
            authorName,
            color,
            x: point[0],
            y: point[1],
            ts: now,
          }),
          false,
        )
      } else {
        laser.pending = point
        if (!laser.timer) {
          const delay = Math.max(
            0,
            ANNOTATION_POINT_BATCH_MS - (now - laser.lastSentAt),
          )
          laser.timer = setTimeout(() => {
            laser.timer = null
            flushLaserPending(laser)
          }, delay)
        }
      }
    },
    [flushLaserPending, publishPacket, setState],
  )

  const beginShape = useCallback(
    ({ tool = "line", color = "#ef4444", width = 4, pt } = {}) => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate || !pt) return null
      if (!SHAPE_TOOLS.has(tool)) return null

      const point = roundLocalPoint(pt)
      const draft = {
        id: createLocalItemId("shape"),
        kind: "shape",
        tool,
        color,
        width,
        authorId: resolveAuthorId(current),
        authorName: resolveAuthorName(current),
        x1: point[0],
        y1: point[1],
        x2: point[0],
        y2: point[1],
      }
      shapeRef.current = { ...draft, trackSid: current.trackSid }
      setState((prev) => ({ ...prev, draftShape: draft }))
      return draft.id
    },
    [setState],
  )

  const extendShape = useCallback(
    (pt) => {
      const shape = shapeRef.current
      if (!shape || !pt) return
      if (latestRef.current.trackSid !== shape.trackSid) {
        shapeRef.current = null
        setState((prev) => ({ ...prev, draftShape: null }))
        return
      }
      if (!latestRef.current.canAnnotate) {
        shapeRef.current = null
        setState((prev) => ({ ...prev, draftShape: null }))
        return
      }

      const point = roundLocalPoint(pt)
      shape.x2 = point[0]
      shape.y2 = point[1]
      const { trackSid: _trackSid, ...draft } = shape
      setState((prev) => ({ ...prev, draftShape: draft }))
    },
    [setState],
  )

  const endShape = useCallback(() => {
    const shape = shapeRef.current
    if (!shape) return null
    shapeRef.current = null

    if (latestRef.current.trackSid !== shape.trackSid) {
      setState((prev) => ({ ...prev, draftShape: null }))
      return null
    }
    if (!latestRef.current.canAnnotate) {
      setState((prev) => ({ ...prev, draftShape: null }))
      return null
    }

    const { trackSid: _trackSid, ...item } = shape
    const size = Math.max(
      Math.abs(item.x2 - item.x1),
      Math.abs(item.y2 - item.y1),
    )
    if (size < MIN_SHAPE_SIZE) {
      setState((prev) => ({ ...prev, draftShape: null }))
      return null
    }

    historyRef.current = recordAnnotationHistoryCommit(historyRef.current, item)
    setState((prev) => ({
      ...prev,
      draftShape: null,
      items: appendAnnotationItem(prev.items, {
        ...item,
        createdAt: Date.now(),
      }),
    }))
    publishPacket(
      buildShapeCommitPacket({
        trackSid: latestRef.current.trackSid,
        item,
      }),
      true,
    )
    return item
  }, [publishPacket, setState])

  const commitText = useCallback(
    ({
      x,
      y,
      text,
      color = "#ef4444",
      fontSize = ANNOTATION_TEXT_FONT_SIZE,
    } = {}) => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate) return null

      const normalized = normalizeAnnotationText(text)
      if (!shouldCommitAnnotationText(normalized)) return null

      const item = {
        id: createLocalItemId("text"),
        kind: "text",
        color,
        fontSize,
        authorId: resolveAuthorId(current),
        authorName: resolveAuthorName(current),
        x: Number(clamp01(Number.isFinite(x) ? x : 0).toFixed(4)),
        y: Number(clamp01(Number.isFinite(y) ? y : 0).toFixed(4)),
        text: normalized,
      }
      historyRef.current = recordAnnotationHistoryCommit(
        historyRef.current,
        item,
      )
      setState((prev) => ({
        ...prev,
        items: appendAnnotationItem(prev.items, {
          ...item,
          createdAt: Date.now(),
        }),
      }))
      publishPacket(
        buildTextCommitPacket({
          trackSid: current.trackSid,
          item,
        }),
        true,
      )
      return item
    },
    [publishPacket, setState],
  )

  const eraseAt = useCallback(
    (pt) => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate || !pt) return []

      const point = Array.isArray(pt) ? pt : [pt.x, pt.y]
      if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) return []
      const target = { x: clamp01(point[0]), y: clamp01(point[1]) }
      const authorId = resolveAuthorId(current)
      const candidates = [
        ...stateRef.current.items,
        ...Object.values(stateRef.current.liveStrokes),
      ]
      const touched = hitTestAnnotations(candidates, target, {
        tolerance: ERASER_TOLERANCE,
      })
      const ids = [
        ...new Set(
          touched
            .filter((item) =>
              canEraseItem(item, authorId, current.canModerateAnnotation),
            )
            .map((item) => item.id),
        ),
      ]
      if (ids.length === 0) return []

      const remove = new Set(ids)
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => !remove.has(item?.id)),
        liveStrokes: Object.fromEntries(
          Object.entries(prev.liveStrokes).filter(([id]) => !remove.has(id)),
        ),
      }))
      publishPacket(
        buildErasePacket({ trackSid: current.trackSid, ids }),
        true,
      )
      return ids
    },
    [publishPacket, setState],
  )

  const undo = useCallback(() => {
    const current = latestRef.current
    if (!current.trackSid || !current.canAnnotate) return false

    const result = takeUndoEntry(
      historyRef.current,
      stateRef.current.items,
      resolveAuthorId(current),
    )
    historyRef.current = result.history
    if (!result.item) return false

    setState((prev) => ({
      ...prev,
      items: removeAnnotationItems(prev.items, [result.item.id]),
    }))
    publishPacket(
      buildUndoPacket({ trackSid: current.trackSid, id: result.item.id }),
      true,
    )
    return true
  }, [publishPacket, setState])

  const redo = useCallback(() => {
    const current = latestRef.current
    if (!current.trackSid || !current.canAnnotate) return false

    const result = takeRedoEntry(historyRef.current, stateRef.current.items)
    historyRef.current = result.history
    if (!result.item) return false

    setState((prev) => ({
      ...prev,
      items: appendAnnotationItem(prev.items, {
        ...result.item,
        createdAt: Date.now(),
      }),
    }))
    publishPacket(
      buildRedoPacket({ trackSid: current.trackSid, item: result.item }),
      true,
    )
    return true
  }, [publishPacket, setState])

  const setPresenterLock = useCallback(
    (locked) => {
      const current = latestRef.current
      if (!current.trackSid || !current.isPresenter) return false

      const next = Boolean(locked)
      setState((prev) => ({ ...prev, presenterLocked: next }))
      publishPacket(
        buildPresenterLockPacket({ trackSid: current.trackSid, locked: next }),
        true,
      )
      return true
    },
    [publishPacket, setState],
  )

  const clearScope = useCallback(
    (scope) => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate) return false
      if (
        !canApplyClearScope({
          scope,
          canModerate: current.canModerateAnnotation,
        })
      ) {
        return false
      }

      const authorId = resolveAuthorId(current)
      const packet = buildClearPacket({
        trackSid: current.trackSid,
        scope,
        authorId,
      })
      setState((prev) =>
        applyAnnotationPacketToState(prev, packet, {
          now: Date.now(),
          senderAuthorId: authorId,
          canModerate: current.canModerateAnnotation,
        }),
      )
      publishPacket(packet, true)
      return true
    },
    [publishPacket, setState],
  )

  const clearMine = useCallback(() => clearScope("mine"), [clearScope])

  /**
   * Ticket 09: apply a packet produced by the local OS overlay. It goes
   * through the same reducer and DataChannel publisher as an in-app gesture,
   * so the presenter's own screen and every viewer stay in lockstep.
   */
  const applyLocalPacket = useCallback(
    (packet) => {
      const current = latestRef.current
      if (!current.trackSid || !current.canAnnotate) return false
      if (!packet || packet.trackSid !== current.trackSid) return false

      const validated = validateAnnotationPacket(packet)
      if (!validated) return false

      setState((prev) =>
        applyAnnotationPacketToState(prev, validated, {
          now: Date.now(),
          senderAuthorId: resolveAuthorId(current),
          senderCanModerate: current.canModerateAnnotation,
          memberDrawAllowed: current.memberDrawAllowed,
        }),
      )

      if (
        validated.t === "stroke-end" ||
        validated.t === "shape-commit" ||
        validated.t === "text-commit"
      ) {
        historyRef.current = recordAnnotationHistoryCommit(
          historyRef.current,
          validated.item,
        )
      }

      const lossy =
        validated.t === "stroke-start" ||
        validated.t === "stroke-point" ||
        validated.t === "laser-move"
      publishPacket(validated, !lossy)
      return true
    },
    [publishPacket, setState],
  )

  return {
    trackSid,
    items: state.items,
    liveStrokes: Object.values(state.liveStrokes),
    draftShape: state.draftShape,
    lasers: Object.values(state.lasers ?? {}),
    presenterLocked: state.presenterLocked,
    canAnnotate: permissions.canAnnotate,
    canModerateAnnotation: permissions.canModerateAnnotation,
    canTogglePresenterLock: Boolean(enabled && isPresenter),
    beginStroke,
    extendStroke,
    endStroke,
    beginShape,
    extendShape,
    endShape,
    commitText,
    sendLaserMove,
    eraseAt,
    undo,
    redo,
    setPresenterLock,
    clearScope,
    clearMine,
    applyLocalPacket,
    authorId: accountId === null || accountId === undefined ? "anonymous" : String(accountId),
    authorName: authorName || "Guest",
  }
}

export default useScreenAnnotation
