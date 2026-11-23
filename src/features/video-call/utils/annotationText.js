/**
 * Text-note editor helpers. Pure so the commit/escape rules stay testable
 * without a DOM; the canvas component owns the textarea and focus.
 */

export const ANNOTATION_TEXT_MAX_LENGTH = 2000

/** Reference font size (px at 720p); the renderer scales it with the canvas. */
export const ANNOTATION_TEXT_FONT_SIZE = 24

export const normalizeAnnotationText = (text) =>
  String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, ANNOTATION_TEXT_MAX_LENGTH)

export const shouldCommitAnnotationText = (text) =>
  normalizeAnnotationText(text).length > 0

/**
 * Keyboard contract: Enter commits, Shift+Enter inserts a newline, Escape
 * cancels. Returns null when the browser should handle the key normally.
 */
export const resolveAnnotationTextKey = (event) => {
  if (!event) return null
  // Enter also confirms an IME composition; it must not commit the note then.
  if (event.isComposing || event.nativeEvent?.isComposing) return null
  if (event.key === "Escape") return "cancel"
  if (event.key === "Enter" && !event.shiftKey) return "commit"
  return null
}
