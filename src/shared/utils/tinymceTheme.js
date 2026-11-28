/**
 * ISS-59 / ISS-64: single source of truth for TinyMCE light/dark initialization.
 *
 * Both skins (`oxide`, `oxide-dark`) and content CSS (`default`, `dark`) are
 * self-hosted under `/tinymce/` by `selfHostTinyMcePlugin` (vite.config.js), so
 * switching on `isDark` never needs an external CDN.
 */
export function getTinyMceThemeInit(isDark, options = {}) {
  const {
    background = isDark ? "#1A1A1A" : "#FFFFFF",
    placeholderColor = "#9CA3AF",
    fontFamily = "Inter, sans-serif",
    fontSize = "14px",
    extraContentStyle = "",
  } = options

  const color = isDark ? "#f3f4f6" : "#1f2937"
  const baseStyle = `body { font-family: ${fontFamily}; font-size: ${fontSize}; color: ${color}; background-color: ${background}; } .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { color: ${placeholderColor}; }`

  return {
    skin: isDark ? "oxide-dark" : "oxide",
    content_css: isDark ? "dark" : "default",
    content_style: extraContentStyle
      ? `${baseStyle} ${extraContentStyle}`
      : baseStyle,
  }
}

export default getTinyMceThemeInit
