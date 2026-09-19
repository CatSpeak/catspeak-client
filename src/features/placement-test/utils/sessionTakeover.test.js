import { describe, expect, it } from "vitest"
import { SESSION_BROADCAST_TYPES } from "../constants/lifecycle"
import {
  TAKEOVER_EFFECT,
  TAKEOVER_LOCAL,
  TAKEOVER_PHASE,
  createTakeoverState,
  reduceTakeover,
} from "./sessionTakeover"

const TAB = "tab-a"
const PEER = "tab-b"
const SESSION = "pt-1"

const state = (phase = TAKEOVER_PHASE.DETECTING) =>
  createTakeoverState({ tabId: TAB, sessionId: SESSION, phase })

const peerMessage = (type) => ({
  type,
  payload: { tabId: PEER, sessionId: SESSION },
})

describe("createTakeoverState", () => {
  it("starts in the detecting phase", () => {
    expect(createTakeoverState({ tabId: TAB, sessionId: SESSION })).toEqual({
      tabId: TAB,
      sessionId: SESSION,
      phase: TAKEOVER_PHASE.DETECTING,
      peerTabId: null,
    })
  })
})

describe("reduceTakeover local actions", () => {
  it("posts a ping when the tab mounts", () => {
    const result = reduceTakeover(state(), { type: TAKEOVER_LOCAL.MOUNT })
    expect(result.effects).toEqual([TAKEOVER_EFFECT.POST_PING])
    expect(result.state.phase).toBe(TAKEOVER_PHASE.DETECTING)
  })

  it("becomes the active holder after the settle delay", () => {
    const result = reduceTakeover(state(), { type: TAKEOVER_LOCAL.SETTLE })
    expect(result.state.phase).toBe(TAKEOVER_PHASE.ACTIVE)
    expect(result.effects).toEqual([])
  })

  it("ignores settle once a conflict was detected", () => {
    const result = reduceTakeover(state(TAKEOVER_PHASE.CONFLICT), {
      type: TAKEOVER_LOCAL.SETTLE,
    })
    expect(result.state.phase).toBe(TAKEOVER_PHASE.CONFLICT)
    expect(result.effects).toEqual([])
  })

  it("confirms the takeover by broadcasting and activating", () => {
    const result = reduceTakeover(state(TAKEOVER_PHASE.CONFLICT), {
      type: TAKEOVER_LOCAL.CONFIRM,
      payload: { tabId: TAB, sessionId: SESSION },
    })
    expect(result.state.phase).toBe(TAKEOVER_PHASE.ACTIVE)
    expect(result.effects).toEqual([TAKEOVER_EFFECT.POST_TAKEOVER])
  })

  it("does not confirm without a detected conflict", () => {
    const result = reduceTakeover(state(), {
      type: TAKEOVER_LOCAL.CONFIRM,
      payload: { tabId: TAB, sessionId: SESSION },
    })
    expect(result.state.phase).toBe(TAKEOVER_PHASE.DETECTING)
    expect(result.effects).toEqual([])
  })
})

describe("reduceTakeover peer messages", () => {
  it("answers a ping with a pong while it holds the session", () => {
    const result = reduceTakeover(state(TAKEOVER_PHASE.ACTIVE), peerMessage(SESSION_BROADCAST_TYPES.PING))
    expect(result.effects).toEqual([TAKEOVER_EFFECT.POST_PONG])
  })

  it("stays silent to a ping while still detecting", () => {
    const result = reduceTakeover(state(), peerMessage(SESSION_BROADCAST_TYPES.PING))
    expect(result.effects).toEqual([])
  })

  it("raises a conflict on a peer pong", () => {
    const result = reduceTakeover(state(), peerMessage(SESSION_BROADCAST_TYPES.PONG))
    expect(result.state.phase).toBe(TAKEOVER_PHASE.CONFLICT)
    expect(result.state.peerTabId).toBe(PEER)
    expect(result.effects).toEqual([TAKEOVER_EFFECT.OPEN_CONFLICT])
  })

  it("ignores a pong from itself", () => {
    const result = reduceTakeover(state(), {
      type: SESSION_BROADCAST_TYPES.PONG,
      payload: { tabId: TAB, sessionId: SESSION },
    })
    expect(result.state.phase).toBe(TAKEOVER_PHASE.DETECTING)
    expect(result.effects).toEqual([])
  })

  it("ignores messages for a different session", () => {
    const result = reduceTakeover(state(), {
      type: SESSION_BROADCAST_TYPES.PONG,
      payload: { tabId: PEER, sessionId: "other" },
    })
    expect(result.state.phase).toBe(TAKEOVER_PHASE.DETECTING)
    expect(result.effects).toEqual([])
  })

  it("stops the session when another tab takes over", () => {
    const result = reduceTakeover(state(TAKEOVER_PHASE.ACTIVE), peerMessage(SESSION_BROADCAST_TYPES.TAKEOVER))
    expect(result.state.phase).toBe(TAKEOVER_PHASE.TAKEN_OVER)
    expect(result.effects).toEqual([TAKEOVER_EFFECT.STOP_SESSION])
  })

  it("stays taken over on repeated broadcasts", () => {
    const result = reduceTakeover(state(TAKEOVER_PHASE.TAKEN_OVER), peerMessage(SESSION_BROADCAST_TYPES.TAKEOVER))
    expect(result.state.phase).toBe(TAKEOVER_PHASE.TAKEN_OVER)
    expect(result.effects).toEqual([])
  })
})
