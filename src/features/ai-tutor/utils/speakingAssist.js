/**
 * Ghép data packet trong phòng nói thành thứ ss05 hiển thị (contract mục 5.5).
 *
 *   speaking-subtitle  agent → FE  {seq, turn_index, role: "ai", text}, ngay khi AI nói
 *   speaking-assist    agent → FE  nguyên văn response của turn-assist, tới sau
 *                                  khoảng một giây: pinyin, nghĩa, hint_mode, hints,
 *                                  correction
 *   speaking-control   FE → agent  {action: play_hint | replay_question | finish_early, hint_id?}
 *
 * Hai gói của cùng một câu tới không theo thứ tự cố định: turn-assist có thể xong
 * trước khi FE nhận phụ đề (mạng chậm). Gói tới sớm được giữ theo turn_index rồi
 * ghép khi phụ đề tới. Hàm thuần để test; SpeakingPage gọi reducer này ngay trong
 * listener DataReceived của phòng.
 */

export const TOPICS = {
  subtitle: "speaking-subtitle",
  assist: "speaking-assist",
  state: "speaking-state",
  control: "speaking-control",
}

export const initialAssistState = {
  ai: null, // {seq, turnIndex, text, pinyin, meaningVi}
  learner: null, // {seq, text}
  hintMode: "none",
  hints: [],
  correction: null,
  phase: null,
  warn: null,
  scriptTurns: null,
  pending: {},
}

const applyAssist = (state, a) => ({
  ...state,
  ai: state.ai
    ? { ...state.ai, pinyin: a.pinyin ?? state.ai.pinyin, meaningVi: a.meaning_vi ?? state.ai.meaningVi }
    : state.ai,
  hintMode: a.hint_mode || state.hintMode,
  hints: Array.isArray(a.hints) ? a.hints : [],
  correction: a.correction || null,
})

export const assistReducer = (state, { topic, data }) => {
  if (!data || typeof data !== "object") return state

  if (topic === TOPICS.subtitle) {
    if (data.role === "learner") {
      return { ...state, learner: { seq: data.seq, text: data.text || "" } }
    }
    const turnIndex = data.turn_index ?? null
    const next = {
      ...state,
      ai: { seq: data.seq, turnIndex, text: data.text || "", pinyin: null, meaningVi: null },
      hints: [],
    }
    const early = state.pending[turnIndex]
    if (early) {
      const { [turnIndex]: _used, ...rest } = state.pending
      return applyAssist({ ...next, pending: rest }, early)
    }
    return next
  }

  if (topic === TOPICS.assist) {
    const turnIndex = data.turn_index ?? null
    if (state.ai && state.ai.turnIndex === turnIndex) return applyAssist(state, data)
    return { ...state, pending: { ...state.pending, [turnIndex]: data } }
  }

  if (topic === TOPICS.state) {
    return {
      ...state,
      phase: data.phase ?? state.phase,
      warn: data.warn ?? null,
      scriptTurns: data.script_turns ?? state.scriptTurns,
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
