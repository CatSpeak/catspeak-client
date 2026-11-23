import { useEffect } from "react"
import { Highlighter, MousePointer2, Pen, Trash2, X } from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import {
  ANNOTATION_COLORS,
  ANNOTATION_WIDTHS,
} from "@/features/video-call/utils/annotationProtocol"

const baseButton =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700 dark:focus-visible:ring-red-400"
const idleButton =
  "text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/10"
const activeButton =
  "bg-cath-red-700 text-white shadow-sm dark:bg-red-500 dark:text-white"

const ToolButton = ({ active, label, onClick, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    onClick={onClick}
    className={`${baseButton} ${active ? activeButton : idleButton}`}
  >
    {children}
  </button>
)

/**
 * Zoom-style annotation toolbar. Ticket 02 exposes mouse/pen/highlighter,
 * 8 colours, 3 widths, clear-mine and exit; shapes/text/laser/eraser/undo are
 * added by ticket 03 in the same extension points.
 */
const AnnotationToolbar = ({
  tool = "mouse",
  color = ANNOTATION_COLORS[0],
  width = ANNOTATION_WIDTHS[1],
  onToolChange,
  onColorChange,
  onWidthChange,
  onClearMine,
  onExit,
  readOnly = false,
}) => {
  const { t } = useLanguage()
  const copy = t.rooms?.videoCall?.annotation ?? {}

  useEffect(() => {
    if (readOnly) return undefined
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return
      onToolChange?.("mouse")
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onToolChange, readOnly])

  if (readOnly) return null

  const stop = (event) => {
    event.stopPropagation()
  }

  return (
    <div
      role="toolbar"
      aria-label={copy.toolbar || "Annotation tools"}
      onPointerDown={stop}
      onClick={stop}
      className="absolute left-1/2 top-2 z-30 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 px-2 py-1.5 text-slate-700 shadow-xl backdrop-blur-sm dark:border-white/15 dark:bg-neutral-900/95 dark:text-neutral-100"
    >
      <ToolButton
        active={tool === "mouse"}
        label={copy.mouse || "Mouse"}
        onClick={() => onToolChange?.("mouse")}
      >
        <MousePointer2 size={16} />
      </ToolButton>
      <ToolButton
        active={tool === "pen"}
        label={copy.pen || "Pen"}
        onClick={() => onToolChange?.("pen")}
      >
        <Pen size={16} />
      </ToolButton>
      <ToolButton
        active={tool === "highlighter"}
        label={copy.highlighter || "Highlighter"}
        onClick={() => onToolChange?.("highlighter")}
      >
        <Highlighter size={16} />
      </ToolButton>

      <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/15" />

      <div
        className="flex shrink-0 items-center gap-1"
        role="group"
        aria-label={copy.color || "Color"}
      >
        {ANNOTATION_COLORS.map((swatch) => {
          const active = swatch === color
          return (
            <button
              key={swatch}
              type="button"
              title={swatch}
              aria-label={`${copy.color || "Color"} ${swatch}`}
              aria-pressed={active}
              onClick={() => onColorChange?.(swatch)}
              className={`h-6 w-6 shrink-0 rounded-full border transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700 dark:focus-visible:ring-red-400 ${
                active
                  ? "scale-110 border-white ring-2 ring-slate-500 dark:ring-white"
                  : "border-black/10 hover:scale-105 dark:border-white/25"
              }`}
              style={{ backgroundColor: swatch }}
            />
          )
        })}
      </div>

      <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/15" />

      <div
        className="flex shrink-0 items-center gap-1"
        role="group"
        aria-label={copy.width || "Stroke width"}
      >
        {ANNOTATION_WIDTHS.map((value) => {
          const active = value === width
          return (
            <button
              key={value}
              type="button"
              title={`${copy.width || "Stroke width"} ${value}`}
              aria-label={`${copy.width || "Stroke width"} ${value}`}
              aria-pressed={active}
              onClick={() => onWidthChange?.(value)}
              className={`${baseButton} ${active ? activeButton : idleButton}`}
            >
              <span
                className="block rounded-full bg-current"
                style={{ width: 14, height: Math.max(2, value / 2) }}
              />
            </button>
          )
        })}
      </div>

      <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/15" />

      <button
        type="button"
        title={copy.clearMine || "Clear mine"}
        aria-label={copy.clearMine || "Clear mine"}
        onClick={() => onClearMine?.()}
        className={`${baseButton} ${idleButton}`}
      >
        <Trash2 size={16} />
      </button>
      <button
        type="button"
        title={copy.exit || "Exit annotation"}
        aria-label={copy.exit || "Exit annotation"}
        onClick={() => onExit?.()}
        className={`${baseButton} ${idleButton}`}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default AnnotationToolbar
