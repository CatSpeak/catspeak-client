/**
 * Color Palette Configuration
 * Bảng màu đỏ gradient cho dự án CathSpeak
 * Sử dụng prefix "cath" cho CSS variables
 */

// ─── Light Mode Core Tokens ─────────────────────────────
export const lightColors = {
  // ── Brand & Core Palette ──
  redPrimary: "#990011",
  primaryRed: "#990011", // Cat Speak (WCAG AAA >= 7:1 on #FFFFFF)
  redAccessible: "#990011", // Accessible brand red for light mode
  redBrand: "#990011",

  // ── Backgrounds & Surfaces ──
  bg: "#F5F5F7", // Main page background (primary2)
  surface: "#FFFFFF",
  surfaceCard: "#FFFFFF",
  surfaceNested: "#F9FAFB",
  surfaceHover: "#F2F2F2",
  surfaceActive: "#E6E6E6",

  // ── Text & Typography ──
  textPrimary: "#111827",
  textColor: "#515151",
  headingColor: "#2e2e2e",
  secondaryGray: "#606060", // Secondary text / subtext
  textSecondary: "#606060",
  textMuted: "#9CA3AF",
  placeholder: "#9CA3AF",

  // ── Borders ──
  border: "#E5E5E5",
  borderColor: "#E5E5E5", // Fluent UI
  borderSubtle: "#F0F0F0",
  youtubeBorderColor: "#C6C6C6", // Youtube border color

  // ── Interactive Item Tokens ──
  itemHover: "#F2F2F2", // hover & active background
  itemActive: "#F2F2F2",
  itemActiveHover: "#E6E6E6", // hover background when item is already active

  // ── Semantic Status Colors ──
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#2563EB",
}

const coreColors = lightColors

// ─── Dark Mode Core Tokens ──────────────────────────────
export const darkColors = {
  // ── Brand & Core Palette ──
  redPrimary: "#990011", // Brand red fill (for buttons with white text)
  primaryRed: "#990011",
  // Accessible red tokens for dark mode surfaces (WCAG AA: >= 4.5:1 on #1A1A1A / #0F0F0F)
  redAccessible: "#f87171", // Accessible text & border red (Tailwind red-400, contrast > 6:1)
  redHighContrast: "#e7001a", // High contrast accent red (cath-red-1000)
  redBrand: "#990011",

  // ── Backgrounds & Surfaces ──
  bg: "#0F0F0F", // Dark page background
  surface: "#1A1A1A", // Elevated container / card surface
  surfaceCard: "#1A1A1A",
  surfaceNested: "#242424", // Sub-cards, nested controls, input fields
  surfaceSubtle: "#141414",
  surfaceElevated: "#272727",
  surfaceHover: "#272727",
  surfaceActive: "#3D3D3D",

  // ── Text & Typography ──
  textPrimary: "#FFFFFF",
  textColor: "#E5E5E5",
  headingColor: "#FFFFFF",
  textSecondary: "#AAAAAA", // Secondary text / subtext (contrast 9.3:1 on #0F0F0F)
  secondaryGray: "#AAAAAA", // Alias for consistent naming with light mode
  textMuted: "#888888",
  placeholder: "#888888",

  // ── Borders ──
  border: "#3F3F3F", // Dark border (WCAG contrast-safe)
  borderColor: "#3F3F3F", // Alias for consistent naming with light mode
  borderSubtle: "#2A2A2A",
  borderFocus: "#f87171",

  // ── Interactive Item Tokens ──
  itemHover: "#272727", // hover background
  itemActive: "#272727", // active background
  itemActiveHover: "#3D3D3D", // hover background when item is already active

  // ── Semantic Status Colors ──
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#60A5FA",
}

export const darkCoreColors = darkColors

/**
 * Returns the theme token palette for either light or dark mode.
 * @param {boolean} isDark
 */
export const getThemeColors = (isDark = false) => (isDark ? darkColors : lightColors)

export const colors = {
  // --- Core Theme Colors ---
  ...coreColors,

  // --- Dark Mode Colors ---
  dark: darkColors,
  // -------------------------

  // Red gradient palette (từ đậm đến sáng)
  red: {
    50: "#100002", // Đậm nhất
    100: "#230004",
    200: "#370006",
    300: "#4b0008",
    400: "#5e000a",
    500: "#72000d", // Màu chính
    600: "#85000f",
    700: coreColors.primaryRed,
    800: "#ad0013",
    900: "#c00015",
    950: "#d40018",
    1000: "#e7001a",
    1050: "#fb001c", // Sáng nhất
  },

  // Primary color (sử dụng màu đỏ chính)
  primary: "#72000d",

  // Semantic colors
  danger: "#fb001c",
  warning: "#e7001a",
  success: "#4b0008",

  // Neutral colors
  dusk: "#1a1a2e",

  // ── Gray & Neutral Background Options ─────────────────
  // Main page background color (used for core page/layout content panels)
  primary2: "#F5F5F7",

  // Custom colors
  headingColor: "#2e2e2e",
  textColor: "#515151",
  subtext: coreColors.secondaryGray,
  placeholder: "#9CA3AF",
  darkOverlay: "rgba(0,0,0,0.2)",
  lightOverlay: "rgba(255,255,255,0.4)",
  lighttextGray: "#9ca0ab",
  card: "rgba(256,256,256,0.8)",
  cartBg: "#282a2c",
  cartItem: "#2e3033",
  cartTotal: "#343739",
  primaryDark: "#131417",
  secondary: "#606060",
  primaryText: "#868CA0",
  text555: "#555",
  textGray: coreColors.secondaryGray,

  // Border colors
  border: coreColors.borderColor,
}

// CSS Variables với prefix "cath"
export const cssVariables = {
  "--cath-red-50": colors.red[50],
  "--cath-red-100": colors.red[100],
  "--cath-red-200": colors.red[200],
  "--cath-red-300": colors.red[300],
  "--cath-red-400": colors.red[400],
  "--cath-red-500": colors.red[500],
  "--cath-red-600": colors.red[600],
  "--cath-red-700": colors.red[700],
  "--cath-red-800": colors.red[800],
  "--cath-red-900": colors.red[900],
  "--cath-red-950": colors.red[950],
  "--cath-red-1000": colors.red[1000],
  "--cath-red-1050": colors.red[1050],
  "--cath-primary": colors.primary,
  "--cath-danger": colors.danger,
  "--cath-warning": colors.warning,
  "--cath-success": colors.success,
  "--cath-dusk": colors.dusk,
  "--cath-text-primary": lightColors.textPrimary,
  "--cath-text-secondary": lightColors.textSecondary,
  "--cath-secondary-gray": lightColors.secondaryGray,
  "--cath-text-muted": lightColors.textMuted,
  "--cath-red-accessible": lightColors.redAccessible,
  "--cath-bg": lightColors.bg,
  "--cath-surface": lightColors.surface,
  "--cath-card": lightColors.surfaceCard,
  "--cath-border": lightColors.border,
}

export const darkCssVariables = {
  "--cath-primary": darkColors.redPrimary,
  "--cath-red-700": darkColors.primaryRed,
  "--cath-red-accessible": darkColors.redAccessible,
  "--cath-red-high-contrast": darkColors.redHighContrast,
  "--cath-text-primary": darkColors.textPrimary,
  "--cath-text-secondary": darkColors.textSecondary,
  "--cath-secondary-gray": darkColors.secondaryGray,
  "--cath-text-muted": darkColors.textMuted,
  "--cath-bg": darkColors.bg,
  "--cath-surface": darkColors.surface,
  "--cath-card": darkColors.surfaceCard,
  "--cath-border": darkColors.border,
  "--cath-item-hover": darkColors.itemHover,
  "--cath-item-active": darkColors.itemActive,
  "--cath-success": darkColors.success,
  "--cath-warning": darkColors.warning,
  "--cath-danger": darkColors.danger,
  "--cath-info": darkColors.info,
}

// Export cho việc sử dụng trong JavaScript
export default colors
