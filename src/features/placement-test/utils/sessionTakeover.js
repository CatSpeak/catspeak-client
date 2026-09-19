import { SESSION_BROADCAST_TYPES, TAKEOVER_SETTLE_MS } from "../constants/lifecycle"

export const TAKEOVER_PHASE = {
  DETECTING: "detecting",
  ACTIVE: "active",
  CONFLICT: "conflict",
  TAKEN_OVER: "taken_over",
}

export const TAKEOVER_LOCAL = {
  MOUNT: "mount",
  SETTLE: "settle",
  CONFIRM: "confirm",
}

export const TAKEOVER_EFFECT = {
  POST_PING: "post-ping",
  POST_PONG: "post-pong",
  POST_TAKEOVER: "post-takeover",
  OPEN_CONFLICT: "open-conflict",
  STOP_SESSION: "stop-session",
}

export const createTakeoverState = ({
  tabId = null,
  sessionId = null,
  phase = TAKEOVER_PHASE.DETECTING,
  startedAt = 0,
  settleAt = 0,
} = {}) => ({
  tabId,
  sessionId,
  phase,
  peerTabId: null,
  startedAt,
  settleAt,
})

const toMs = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const isPeerMessage = (state, payload) => {
  const fromTab = payload?.tabId || null
  const sameSession =
    Boolean(state.sessionId) && payload?.sessionId === state.sessionId
  const fromPeer = Boolean(fromTab) && fromTab !== state.tabId
  return sameSession && fromPeer
}

export const reduceTakeover = (state = createTakeoverState(), message = {}) => {
  const { type, payload = {} } = message
  const noChange = { state, effects: [] }

  if (type === TAKEOVER_LOCAL.MOUNT) {
    const now = toMs(payload.now)
    return {
      state: {
        ...state,
        phase: TAKEOVER_PHASE.DETECTING,
        startedAt: now,
        settleAt: now + TAKEOVER_SETTLE_MS,
      },
      effects: [TAKEOVER_EFFECT.POST_PING],
    }
  }

  if (type === TAKEOVER_LOCAL.SETTLE) {
    if (state.phase !== TAKEOVER_PHASE.DETECTING) return noChange
    const now = toMs(payload.now)
    if (state.settleAt && now < state.settleAt) {
      return { state, effects: [TAKEOVER_EFFECT.POST_PING] }
    }
    return {
      state: { ...state, phase: TAKEOVER_PHASE.ACTIVE },
      effects: [],
    }
  }

  if (type === TAKEOVER_LOCAL.CONFIRM) {
    if (state.phase !== TAKEOVER_PHASE.CONFLICT) return noChange
    return {
      state: { ...state, phase: TAKEOVER_PHASE.ACTIVE },
      effects: [TAKEOVER_EFFECT.POST_TAKEOVER],
    }
  }

  if (!isPeerMessage(state, payload)) return noChange

  if (type === SESSION_BROADCAST_TYPES.PING) {
    if (state.phase !== TAKEOVER_PHASE.ACTIVE) return noChange
    return { state, effects: [TAKEOVER_EFFECT.POST_PONG] }
  }

  if (type === SESSION_BROADCAST_TYPES.PONG) {
    if (
      state.phase === TAKEOVER_PHASE.CONFLICT ||
      state.phase === TAKEOVER_PHASE.TAKEN_OVER
    ) {
      return noChange
    }
    return {
      state: {
        ...state,
        phase: TAKEOVER_PHASE.CONFLICT,
        peerTabId: payload.tabId,
      },
      effects: [TAKEOVER_EFFECT.OPEN_CONFLICT],
    }
  }

  if (type === SESSION_BROADCAST_TYPES.TAKEOVER) {
    if (state.phase === TAKEOVER_PHASE.TAKEN_OVER) return noChange
    return {
      state: {
        ...state,
        phase: TAKEOVER_PHASE.TAKEN_OVER,
        peerTabId: payload.tabId,
      },
      effects: [TAKEOVER_EFFECT.STOP_SESSION],
    }
  }

  return noChange
}
