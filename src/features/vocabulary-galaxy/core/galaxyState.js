// Bốn mức hiển thị trạng thái học — dùng chung cho shader, tooltip và legend.
// Khớp bảng mapping trong Task_galaxy.md §1.4.

export const GALAXY_STATE = {
  UNLEARNED: 0,
  LEARNING: 1,
  MASTERED: 2,
  LONG_TERM: 3,
}

/** Nhãn tiếng Việt (fallback khi thiếu i18n). */
export const GALAXY_STATE_LABELS = {
  0: "Chưa học",
  1: "Đang học",
  2: "Đã thuộc",
  3: "Nhớ lâu dài",
}

/** Màu đại diện từng mức (dùng cho legend, khớp màu trong shader). */
export const GALAXY_STATE_COLORS = {
  0: "#8fa3c8",
  1: "#ffd98a",
  2: "#f7f2e6",
  3: "#ffbd57",
}

/** Ổn định >= 21 ngày ở trạng thái Review = nhớ lâu dài (cùng ngưỡng word-atlas srs.ts). */
export const LONG_TERM_STABILITY = 21

const FSRS_STATE = { NEW: 0, LEARNING: 1, REVIEW: 2, RELEARNING: 3 }

/**
 * Thẻ từ API -> mức sáng của sao (0..3). Chấp nhận cả trường cũ (Leitner) lẫn trường FSRS:
 *   galaxy_state                 BE-05 đã tính sẵn -> dùng luôn
 *   is_long_term                 hoặc FSRS Review + stability >= 21 ngày  -> LONG_TERM
 *   is_known                     hoặc FSRS Review                        -> MASTERED
 *   đã ôn ít nhất 1 lần          (reps/review_count/last_reviewed_at, FSRS Learning/Relearning) -> LEARNING
 *   còn lại                                                               -> UNLEARNED
 */
export function toGalaxyState(card) {
  if (!card) return GALAXY_STATE.UNLEARNED
  const preset = card.galaxy_state
  if (Number.isInteger(preset) && preset >= 0 && preset <= 3) return preset

  const fsrs = card.fsrs_state
  const stability = Number(card.stability) || 0
  if (card.is_long_term || (fsrs === FSRS_STATE.REVIEW && stability >= LONG_TERM_STABILITY)) {
    return GALAXY_STATE.LONG_TERM
  }
  if (card.is_known || fsrs === FSRS_STATE.REVIEW) return GALAXY_STATE.MASTERED
  const reviewed =
    (Number(card.reps) || Number(card.review_count) || 0) > 0 ||
    Boolean(card.last_reviewed_at) ||
    fsrs === FSRS_STATE.LEARNING ||
    fsrs === FSRS_STATE.RELEARNING
  return reviewed ? GALAXY_STATE.LEARNING : GALAXY_STATE.UNLEARNED
}
