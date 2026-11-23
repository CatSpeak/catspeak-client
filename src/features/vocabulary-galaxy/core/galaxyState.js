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
