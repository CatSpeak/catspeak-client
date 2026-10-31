/**
 * Color Palette Configuration
 * Bảng màu đỏ gradient cho dự án CathSpeak
 * Sử dụng prefix "cath" cho CSS variables
 */

// ─── Light Mode Core Tokens ─────────────────────────────
export const lightColors = {
  // ── Brand & Core Palette ──
  redPrimary: "#990011",
  primaryRed: "#990011", // Cat Speak

  // ── Backgrounds ──
  bg: "#F5F5F7", // Main page background (primary2)

  // ── Text & Typography ──
  secondaryGray: "#606060", // Secondary text / subtext
  textSecondary: "#606060",

  // ── Borders ──
  border: "#E5E5E5",
  borderColor: "#E5E5E5", // Fluent UI
  youtubeBorderColor: "#C6C6C6", // Youtube border color

  // ── Interactive Item Tokens ──
  itemHover: "#F2F2F2", // hover & active background
  itemActive: "#F2F2F2",
  itemActiveHover: "#E6E6E6", // hover background when item is already active
}

const coreColors = lightColors

// ─── Dark Mode Core Tokens ──────────────────────────────
export const darkColors = {
  // ── Brand & Core Palette ──
  redPrimary: "#990011",
  primaryRed: "#990011",

  // ── Backgrounds ──
  bg: "#0F0F0F", // Dark page background

  // ── Text & Typography ──
  textSecondary: "#AAAAAA", // Secondary text / subtext
  secondaryGray: "#AAAAAA", // Alias for consistent naming with light mode

  // ── Borders ──
  border: "#3F3F3F", // Dark border
  borderColor: "#3F3F3F", // Alias for consistent naming with light mode

  // ── Interactive Item Tokens ──
  itemHover: "#272727", // hover background
  itemActive: "#272727", // active background
  itemActiveHover: "#3D3D3D", // hover background when item is already active
}

export const darkCoreColors = darkColors

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
}

// Export cho việc sử dụng trong JavaScript
export default colors
