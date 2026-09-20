import { clampHsk, clampScore } from "../engine"

export const DIMENSION_KEYS = ["pronunciation", "vocabulary", "grammar", "fluency"]

const TIER_BY_BAND = {
  1: "tierBeginner",
  2: "tierBeginner",
  3: "tierIntermediate",
  4: "tierIntermediate",
  5: "tierAdvanced",
  6: "tierAdvanced",
}

const CEFR_BY_BAND = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
}

const ADJUST_DELTAS = { down: -1, keep: 0, up: 1 }

export const ADJUST_OPTION_KEYS = ["down", "keep", "up"]

export const getTierKey = (band) => TIER_BY_BAND[clampHsk(band)]

export const getCefr = (band) => CEFR_BY_BAND[clampHsk(band)]

export const getBandDescriptor = (band) => ({
  band: clampHsk(band),
  tierKey: getTierKey(band),
  cefr: getCefr(band),
})

/**
 * Các kỹ năng CÓ SỐ ĐO. Kỹ năng chưa đo được thì không xuất hiện.
 *
 * `null` khác `0`. Chưa chấm phát âm (không bật Azure) là `null`; vẽ thanh 0/100
 * cho nó là nói với học viên rằng họ phát âm rất tệ, trong khi thật ra chưa ai
 * nghe. Lộ trình v1.1 (Q2) chốt đúng chuyện này: "pronunciation_score nullable +
 * ẩn thanh trên sc09".
 *
 * `clampScore(null)` trả 0, nên phải lọc TRƯỚC khi gọi nó.
 */
export const getDimensionScores = (result = {}) =>
  DIMENSION_KEYS.filter(
    (key) => result[key] !== null && result[key] !== undefined,
  ).map((key) => ({ key, score: clampScore(result[key]) }))

export const computeOverallScore = (result = {}) => {
  const scores = getDimensionScores(result)
  if (scores.length === 0) return 0
  const total = scores.reduce((sum, item) => sum + item.score, 0)
  return Math.round(total / scores.length)
}

export const getStrengthDimension = (result = {}) => {
  const scores = getDimensionScores(result)
  return scores.reduce(
    (best, item) => (item.score > best.score ? item : best),
    scores[0],
  )
}

export const getWeaknessDimension = (result = {}) => {
  const listed = Array.isArray(result.weaknesses)
    ? result.weaknesses.find((item) => DIMENSION_KEYS.includes(item?.dimension))
    : null
  if (listed) return { key: listed.dimension, score: clampScore(listed.score) }

  const scores = getDimensionScores(result)
  return scores.reduce(
    (worst, item) => (item.score < worst.score ? item : worst),
    scores[0],
  )
}

export const getTargetRoadmapBand = (band) => {
  const current = clampHsk(band)
  return current >= 6 ? 6 : current + 1
}

export const buildAdjustOptions = (band) => {
  const current = clampHsk(band)
  return ADJUST_OPTION_KEYS.map((key) => ({
    key,
    level: clampHsk(current + ADJUST_DELTAS[key]),
  }))
}

// ── Kết quả từ động cơ phía máy chủ ─────────────────────────────────────────

/** Ngưỡng coi một kỹ năng là điểm yếu, giữ nguyên từ engine/constants.js. */
const WEAKNESS_THRESHOLD = 60

const numberOrNull = (value) => {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Đổi kết quả của catspeak-ai sang hình dạng mà sc09 đang đọc.
 *
 * Máy chủ trả snake_case và tách điểm ra `scores`, còn giao diện đọc camelCase
 * phẳng. Hàm này là chỗ DUY NHẤT biết cả hai hình dạng — đổi contract thì sửa ở
 * đây, không rải ra các trang.
 *
 * Hai thứ được THÊM so với bản chấm trong tab, và cả hai đều là lý do chuyển
 * việc chấm về máy chủ:
 *
 *   `detailedWeaknesses` — điểm yếu ở mức mã cụ thể: `ba_construction`,
 *                          `HSK4:虽然`, `PHONEME:zh`. Learning Path Engine ở tuần
 *                          2 lọc theo mấy mã này để sinh bài tập. Bản cũ chỉ có
 *                          bốn ô kỹ năng, không sinh được gì từ đó.
 *   `levelExplanation`   — vì sao ra cấp này: cấp thô từ AHI, bị sàn ngữ pháp
 *                          đẩy lên hay bị trần bằng chứng kéo xuống. Cần khi học
 *                          viên khiếu nại.
 *
 * `weaknesses` (bốn ô kỹ năng) vẫn được sinh ra để ResultFeedbackCard chạy như
 * cũ — chuyển nó sang dùng `detailedWeaknesses` là việc của lần sau.
 */
export const normalizeServerResult = (payload = {}, { session = null } = {}) => {
  const scores = payload.scores || {}
  const trace = payload.clamp_trace || {}

  const pronunciation = numberOrNull(scores.pronunciation)
  const vocabulary = numberOrNull(scores.vocabulary)
  const grammar = numberOrNull(scores.grammar)
  const fluency = numberOrNull(scores.fluency)

  const dimensions = [
    { dimension: "pronunciation", score: pronunciation },
    { dimension: "vocabulary", score: vocabulary },
    { dimension: "grammar", score: grammar },
    { dimension: "fluency", score: fluency },
  ]

  return {
    band: clampHsk(payload.final_hsk_level),
    sessionId: payload.session_id || session?.id || null,
    code: session?.code || null,
    answeredCount: Number(payload.turn_count) || 0,
    scoredAt: Date.now(),
    selfAdjusted: false,

    pronunciation,
    vocabulary,
    grammar,
    fluency,

    // Chỉ xét kỹ năng đã đo được. Kỹ năng `null` không phải điểm yếu, nó là chưa biết.
    weaknesses: dimensions
      .filter((item) => item.score !== null && item.score < WEAKNESS_THRESHOLD)
      .sort((a, b) => a.score - b.score),

    detailedWeaknesses: Array.isArray(payload.weaknesses)
      ? payload.weaknesses.map((item) => ({
          skill: item.skill,
          kind: item.kind,
          refCode: item.ref_code,
          hskLevel: item.hsk_level ?? null,
          evidenceTurnIndex: item.evidence_turn_index ?? null,
          severity: Number(item.severity) || 1,
          note: item.note || "",
        }))
      : [],

    levelExplanation: {
      rawHskLevel: trace.raw_ahi_rounded ?? null,
      grammarFloor: trace.grammar_floor ?? null,
      evidenceStrength: trace.evidence_strength ?? null,
      evidenceCeiling: trace.evidence_ceiling ?? null,
      floorOverCeiling: Boolean(trace.floor_over_ceiling),
      ahiTotal: numberOrNull(scores.ahi_total),
    },

    engineVersion: payload.engine_version || null,
    // false nghĩa là máy chủ KHÔNG lưu kết quả này — bản duy nhất nằm ở
    // localStorage. Xoá dữ liệu trình duyệt là mất. Sẽ thành true khi bài thi đi
    // qua PlacementController thay vì gọi thẳng từ tab.
    persisted: Boolean(payload.persisted),
  }
}
