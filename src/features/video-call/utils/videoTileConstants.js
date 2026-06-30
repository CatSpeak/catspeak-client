/**
 * Maps user theme gradient color to Figma-style pastel background colors for tile bg.
 * Key = primary hex from participantTheme gradient, Value = pastel bg hex.
 */
export const THEME_BG_MAP = {
  "#DC2626": "#FFFBFC", // Red → light pink-white
  "#EA580C": "#FFF2EA", // Orange → light orange
  "#D97706": "#FFFBEA", // Yellow → light yellow
  "#16A34A": "#F1FFF8", // Green → light green
  "#2563EB": "#E8F2FF", // Blue → light blue
  "#4F46E5": "#EDE9FE", // Indigo → light indigo
  "#9333EA": "#F3E8FF", // Purple → light purple
  "#DB2777": "#FDF3FF", // Pink → light pink
  "#0D9488": "#F0FDFA", // Teal → light teal
  "#0284C7": "#E0F2FE", // Sky → light sky
  "#0891B2": "#ECFEFF", // Cyan → light cyan
  "#65A30D": "#F7FEE7", // Lime → light lime
  "#059669": "#ECFDF5", // Emerald → light emerald
  "#C026D3": "#FDF4FF", // Fuchsia → light fuchsia
  "#E11D48": "#FFF1F2", // Rose → light rose
  "#7C3AED": "#F5F3FF", // Violet → light violet
}

/**
 * Maps user theme gradient color to info pill border/bg colors.
 * Key = primary hex from participantTheme gradient, Value = { bg, border }.
 */
export const THEME_PILL_MAP = {
  "#DC2626": { bg: "rgba(123,121,121,0.2)", border: "#7b7979" },
  "#EA580C": { bg: "rgba(255,175,122,0.2)", border: "#ffaf7a" },
  "#D97706": { bg: "rgba(194,158,19,0.2)", border: "#c29e13" },
  "#16A34A": { bg: "rgba(75,208,138,0.2)", border: "#4bd08a" },
  "#2563EB": { bg: "rgba(69,150,255,0.2)", border: "#4596ff" },
  "#4F46E5": { bg: "rgba(99,102,241,0.2)", border: "#6366f1" },
  "#9333EA": { bg: "rgba(168,85,247,0.2)", border: "#a855f7" },
  "#DB2777": { bg: "rgba(230,130,243,0.2)", border: "#e682f3" },
  "#0D9488": { bg: "rgba(20,184,166,0.2)", border: "#14b8a6" },
  "#0284C7": { bg: "rgba(56,189,248,0.2)", border: "#38bdf8" },
  "#0891B2": { bg: "rgba(6,182,212,0.2)", border: "#06b6d4" },
  "#65A30D": { bg: "rgba(132,204,22,0.2)", border: "#84cc16" },
  "#059669": { bg: "rgba(16,185,129,0.2)", border: "#10b981" },
  "#C026D3": { bg: "rgba(192,38,211,0.2)", border: "#c026d3" },
  "#E11D48": { bg: "rgba(255,161,171,0.2)", border: "#ffa1ab" },
  "#7C3AED": { bg: "rgba(124,58,237,0.2)", border: "#7c3aed" },
}

/** Default pill style when theme color is not found in the map. */
export const DEFAULT_PILL = { bg: "rgba(123,121,121,0.2)", border: "#7b7979" }
