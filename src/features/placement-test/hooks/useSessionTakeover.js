import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import {
  SESSION_BROADCAST_TYPES,
  TAKEOVER_PING_INTERVAL_MS,
} from "../constants/lifecycle"
import { createSessionBroadcast } from "../services/sessionBroadcastChannel"
import {
  TAKEOVER_EFFECT,
  TAKEOVER_LOCAL,
  TAKEOVER_PHASE,
  createTakeoverState,
  reduceTakeover,
} from "../utils/sessionTakeover"

const createTabId = () =>
  `pt-tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const initMachine = ({ sessionId, tabId }) => ({
  state: createTakeoverState({
    tabId,
    sessionId: sessionId || null,
    phase: sessionId ? TAKEOVER_PHASE.DETECTING : TAKEOVER_PHASE.ACTIVE,
  }),
  effects: [],
})

const takeOverReducer = (machine, message) => {
  const { state, effects } = reduceTakeover(machine.state, message)
  return { state, effects }
}

const useSessionTakeover = ({ sessionId, onTakenOver } = {}) => {
  const [tabId] = useState(() => createTabId())
  const [transport] = useState(() => createSessionBroadcast())
  const [machine, dispatch] = useReducer(
    takeOverReducer,
    { sessionId, tabId },
    initMachine,
  )

  const onTakenOverRef = useRef(onTakenOver)
  useEffect(() => {
    onTakenOverRef.current = onTakenOver
  }, [onTakenOver])

  useEffect(() => {
    if (!machine.effects.length) return
    machine.effects.forEach((effect) => {
      const payload = { tabId, sessionId: sessionId || null }
      if (effect === TAKEOVER_EFFECT.POST_PING) {
        transport.post(SESSION_BROADCAST_TYPES.PING, payload)
      } else if (effect === TAKEOVER_EFFECT.POST_PONG) {
        transport.post(SESSION_BROADCAST_TYPES.PONG, payload)
      } else if (effect === TAKEOVER_EFFECT.POST_TAKEOVER) {
        transport.post(SESSION_BROADCAST_TYPES.TAKEOVER, payload)
      } else if (effect === TAKEOVER_EFFECT.STOP_SESSION) {
        onTakenOverRef.current?.()
      }
    })
  }, [machine.effects, transport, sessionId, tabId])

  useEffect(() => {
    if (!sessionId) return undefined
    const unsubscribe = transport.subscribe((message) => dispatch(message))
    dispatch({
      type: TAKEOVER_LOCAL.MOUNT,
      payload: { tabId, sessionId, now: Date.now() },
    })
    return unsubscribe
  }, [sessionId, tabId, transport])

  useEffect(() => {
    if (!sessionId || machine.state.phase !== TAKEOVER_PHASE.DETECTING) {
      return undefined
    }
    const id = window.setInterval(() => {
      dispatch({
        type: TAKEOVER_LOCAL.SETTLE,
        payload: { tabId, sessionId, now: Date.now() },
      })
    }, TAKEOVER_PING_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [sessionId, tabId, machine.state.phase])

  useEffect(() => () => transport.close(), [transport])

  const confirmTakeover = useCallback(() => {
    dispatch({
      type: TAKEOVER_LOCAL.CONFIRM,
      payload: { tabId, sessionId: sessionId || null },
    })
  }, [sessionId, tabId])

  const phase = machine.state.phase

  return {
    phase,
    peerTabId: machine.state.peerTabId,
    conflict: phase === TAKEOVER_PHASE.CONFLICT,
    takenOver: phase === TAKEOVER_PHASE.TAKEN_OVER,
    active: phase === TAKEOVER_PHASE.ACTIVE,
    confirmTakeover,
  }
}

export default useSessionTakeover
