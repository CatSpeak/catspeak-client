/**
 * Correlates LiveKit speaking packets. Assist packets include both `seq` and
 * `generation`; turn_index alone is not unique because a script turn can have
 * multiple questions and the greeting uses a different turn index per topic.
 */

export const TOPICS = {
  subtitle: "speaking-subtitle",
  assist: "speaking-assist",
  state: "speaking-state",
  control: "speaking-control",
}

export const initialAssistState = {
  ai: null,
  learner: null,
  hintMode: "none",
  hints: [],
  correction: null,
  phase: null,
  warn: null,
  scriptTurns: null,
  turnIndex: null,
  pending: {},
}

const applyAssist = (state, assist) => ({
  ...state,
  ai: state.ai
    ? {
        ...state.ai,
        generation: assist.generation ?? state.ai.generation,
        pinyin: assist.pinyin ?? state.ai.pinyin,
        meaningVi: assist.meaning_vi ?? state.ai.meaningVi,
      }
    : state.ai,
  hintMode: assist.hint_mode || state.hintMode,
  hints: Array.isArray(assist.hints) ? assist.hints : [],
  correction: assist.correction || null,
})

export const assistReducer = (state, { topic, data }) => {
  if (!data || typeof data !== "object") return state

  if (topic === TOPICS.subtitle) {
    if (data.role === "learner") {
      if (state.learner && Number(data.seq ?? 0) < state.learner.seq) return state
      return { ...state, learner: { seq: Number(data.seq ?? 0), text: data.text || "" } }
    }

    const seq = Number(data.seq ?? 0)
    if (state.ai && seq < state.ai.seq) return state
    // Replays may resend the current subtitle; keep its already joined assist.
    if (state.ai && seq === state.ai.seq) {
      return { ...state, ai: { ...state.ai, text: data.text || state.ai.text } }
    }

    const next = {
      ...state,
      ai: {
        seq,
        turnIndex: data.turn_index ?? null,
        generation: -1,
        text: data.text || "",
        pinyin: null,
        meaningVi: null,
      },
      hintMode: "none",
      hints: [],
      correction: null,
    }
    const early = state.pending[seq]
    if (!early) return next
    const { [seq]: _used, ...pending } = state.pending
    return applyAssist({ ...next, pending }, early)
  }

  if (topic === TOPICS.assist) {
    const seq = Number(data.seq ?? 0)
    if (state.ai && seq === state.ai.seq) {
      if (Number(data.generation ?? 0) < state.ai.generation) return state
      return applyAssist(state, data)
    }
    if (state.ai && seq < state.ai.seq) return state
    const previous = state.pending[seq]
    if (previous && Number(previous.generation ?? 0) > Number(data.generation ?? 0)) return state
    return { ...state, pending: { ...state.pending, [seq]: data } }
  }

  if (topic === TOPICS.state) {
    return {
      ...state,
      phase: data.phase ?? state.phase,
      warn: data.warn ?? null,
      scriptTurns: data.script_turns ?? state.scriptTurns,
      turnIndex: data.turn_index ?? state.turnIndex,
    }
  }
  return state
}

export const decodePacket = (payload) => {
  try {
    return JSON.parse(new TextDecoder().decode(payload))
  } catch {
    return null
  }
}

export const encodeControl = (action, extra = {}) =>
  new TextEncoder().encode(JSON.stringify({ action, ...extra }))
