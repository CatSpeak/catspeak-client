/**
 * Gọi động cơ chấm điểm thật (catspeak-ai), thay cho mockAdapter.
 *
 * VÌ SAO CÓ FILE NÀY
 * ------------------
 * Bản đầu của tính năng chấm điểm ngay trong tab: `engine/scoring.js` tính cấp
 * HSK, điểm từng kỹ năng và danh sách điểm yếu bằng JavaScript. Chạy được, nhưng
 * ba chuyện không sửa trong tab được:
 *
 *   1. Điểm sửa được bằng devtools. `localStorage.setItem("catspeak_pt_result",
 *      JSON.stringify({band: 6}))` là xong. Bài thi này quyết định học viên vào
 *      lớp nào, nên đó không phải chuyện nhỏ.
 *   2. Ngữ pháp đang làm TRẦN thay vì SÀN — xem TICH-HOP-ENGINE.md mục 1. Học
 *      viên nói tốt mà không khớp regex nào thì bị kẹp xuống HSK 1.
 *   3. Điểm "phát âm" không đo phát âm. Nó là hàm của số câu đã trả lời và độ
 *      khó câu hỏi. Web Speech API không trả dữ liệu phát âm nào cả.
 *
 * Động cơ phía máy chủ tách từ bằng jieba, tra bảng HSK 4.995 từ, có sàn ngữ pháp
 * theo BR-PT-003 và trần bằng chứng theo BR-PT-004, và trả điểm yếu ở mức mã cụ
 * thể (`ba_construction`) thay vì mức kỹ năng — thứ mà Learning Path Engine ở
 * tuần 2 cần để sinh bài tập.
 *
 * CÁI CHƯA GIẢI QUYẾT ĐƯỢC
 * ------------------------
 * Transcript vẫn do trình duyệt gửi lên, nên vẫn giả được. Chỉ hết giả được khi
 * STT chạy phía máy chủ. Vì thế máy chủ KHÔNG ghi kết quả của đường này xuống
 * database (`persisted: false` trong response) — kết quả chỉ nằm ở localStorage
 * như trước. Khi `PlacementController` của placement-agent có thật thì đổi sang
 * đường đó và bật persist.
 *
 * PHẠM VI
 * -------
 * Chỉ hai lời gọi đi máy chủ: `submitTurn` và `scoreSession`. Bốn cái còn lại
 * (`createSession`, `getActiveSession`, `resumeSession`, `getRetakeStatus`,
 * `adjustLevel`) vẫn dùng mock/localStorage vì chúng cần bảng vòng đời phía máy
 * chủ, mà `PlacementController` chưa tồn tại.
 *
 * Ngân hàng câu hỏi vẫn ở `constants/hskBank.js`. Máy chủ chỉ trả về CẤP nên hỏi
 * tiếp (`next_probe_hsk_level`), việc chọn câu nào ở cấp đó vẫn là của client.
 */
import { SESSION_STATUS } from "../constants/session"
import { TOTAL_TURNS, selectNextQuestion } from "../engine"
import { normalizeServerResult } from "../utils/result"
import {
  readActiveSession,
  saveActiveSession,
  saveResult,
} from "../utils/sessionStorage"
import { upsertTurn } from "../utils/turns"

/** Bật/tắt đường máy chủ. Đặt "0" trong .env để quay lại mock hoàn toàn. */
export const USE_REAL_ENGINE =
  import.meta.env.VITE_PLACEMENT_USE_REAL_ENGINE !== "0"

const SCORE_TURN_URL = "/placement/score-turn"
const FINALIZE_URL = "/placement/finalize"

const notFound = () => ({
  error: { status: 404, data: { message: "placement_session_not_found" } },
})

/**
 * Bọc lỗi của máy chủ về đúng hình dạng mà PlacementScoringPage đang bắt.
 *
 * Trang đó phân biệt hai ca: 503 thì hiện nút thử lại, còn lại thì về trang đầu.
 * Máy chủ trả 500 khi chấm hỏng, nên đổi sang 503 để người dùng còn thử lại được
 * — chấm hỏng thường là do LLM quá hạn, và lần hai hay chạy được.
 */
const normalizeError = (error) => {
  const status = Number(error?.status)
  if (status === 401 || status === 403) return { error }
  return {
    error: {
      status: status === 500 ? 503 : status || 503,
      data: { message: "placement_scoring_failed", detail: error?.data },
    },
  }
}

/** Một lượt: gửi transcript lên, nhận cấp nên hỏi tiếp. */
export const submitTurnReal = async (
  { sessionId, order, questionId, level, transcript, durationMs, retryCount } = {},
  { baseQuery, api, extraOptions, read = readActiveSession, persist = saveActiveSession } = {},
) => {
  const session = read()
  if (!session || (sessionId && session.id !== sessionId)) return notFound()

  const turnOrder = Number(order) || (session.turns?.length || 0) + 1
  const body = {
    session_id: session.id,
    turn_index: turnOrder,
    probing_hsk_level: Number(level) || 1,
    question: {
      text: String(questionId || ""),
      hsk_level: Number(level) || 1,
      source: "bank",
      bank_id: questionId || null,
    },
    transcript: typeof transcript === "string" ? transcript : "",
    speech_duration_ms: Math.max(0, Number(durationMs) || 0),
    retry_count: Number(retryCount) || 0,
    skipped: !String(transcript || "").trim(),
    is_final: turnOrder >= TOTAL_TURNS,
    // asr_confidence và pronunciation để trống: Web Speech API không trả hai thứ
    // đó. Động cơ chịu được — hệ số tin cậy về 1.0 và điểm phát âm về null.
  }

  const response = await baseQuery(
    { url: SCORE_TURN_URL, method: "POST", body },
    api,
    extraOptions,
  )
  if (response.error) return normalizeError(response.error)

  const scored = response.data || {}
  const timestamp = Date.now()
  const turn = {
    order: turnOrder,
    questionId: questionId || null,
    level: Number(level) || 1,
    transcript: typeof transcript === "string" ? transcript : "",
    durationMs: Number(durationMs) || 0,
    retryCount: Number(retryCount) || 0,
    // `passed` giờ do máy chủ quyết, gián tiếp: cấp nó đề nghị hỏi tiếp cao hơn
    // cấp vừa hỏi nghĩa là lượt này đủ để đi lên.
    passed: Number(scored.next_probe_hsk_level) >= Number(level || 1),
    submittedAt: timestamp,
  }

  const turns = upsertTurn(session.turns, turn)
  const updated = {
    ...session,
    turns,
    currentOrder: Math.max(session.currentOrder || 0, turn.order),
    runningFloor: scored.running_floor ?? null,
    runningCeiling: scored.running_ceiling ?? null,
    updatedAt: timestamp,
  }
  persist(updated)

  // Máy chủ chỉ nói CẤP nên hỏi tiếp. Chọn câu nào ở cấp đó vẫn là việc của
  // client, vì ngân hàng câu hỏi nằm ở đây.
  const nextQuestion =
    turn.order >= TOTAL_TURNS
      ? null
      : selectNextQuestion({
          targetBand: updated.targetBand,
          turns,
          order: turn.order + 1,
          level: Number(scored.next_probe_hsk_level) || undefined,
        }) || null

  return {
    data: {
      accepted: Boolean(scored.turn_scored),
      turn,
      session: updated,
      nextQuestion,
      status: SESSION_STATUS.IN_PROGRESS,
      scoringMs: scored.scoring_ms ?? null,
    },
  }
}

/** Sau câu 5: tổng hợp cả bài thi. */
export const scoreSessionReal = async (
  { sessionId } = {},
  {
    baseQuery,
    api,
    extraOptions,
    read = readActiveSession,
    persist = saveActiveSession,
    persistResult = saveResult,
  } = {},
) => {
  const session = read()
  if (!session || (sessionId && session.id !== sessionId)) return notFound()

  const response = await baseQuery(
    { url: FINALIZE_URL, method: "POST", body: { session_id: session.id } },
    api,
    extraOptions,
  )
  if (response.error) return normalizeError(response.error)

  const result = normalizeServerResult(response.data, { session })
  persistResult(result)

  const completed = {
    ...session,
    status: SESSION_STATUS.COMPLETED,
    finalBand: result.band,
    updatedAt: Date.now(),
  }
  persist(completed)

  return { data: { result, session: completed } }
}
