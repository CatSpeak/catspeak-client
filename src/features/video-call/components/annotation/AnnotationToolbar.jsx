import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  Circle,
  Eraser,
  Highlighter,
  Lock,
  LockOpen,
  Minus,
  MousePointer2,
  Pen,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
  X,
  Zap,
} from "lucide-react"

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
const disabledButton = "cursor-not-allowed opacity-40"

const ToolButton = ({ active, disabled, label, onClick, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
    className={`${baseButton} ${active ? activeButton : idleButton} ${
      disabled ? disabledButton : ""
    }`}
  >
    {children}
  </button>
)

const isTypingTarget = (target) =>
  Boolean(
    target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable),
  )

/**
 * Zoom-style annotation toolbar: mouse, pen, highlighter, text, shapes,
 * laser, eraser, 8 colours, 3 widths, undo/redo, clear scopes and exit.
 * Ticket 04 owns the presenter lock button and policy row.
 */
const AnnotationToolbar = ({
  tool = "mouse",
  color = ANNOTATION_COLORS[0],
  width = ANNOTATION_WIDTHS[1],
  canModerate = false,
  presenterLocked = false,
  canToggleLock = false,
  disabled = false,
  onToolChange,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  onClear,
  onTogglePresenterLock,
  onExit,
}) => {
  const { t } = useLanguage()
  const copy = t.rooms?.videoCall?.annotation ?? {}
  const [clearMenuOpen, setClearMenuOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setClearMenuOpen(false)
        onToolChange?.("mouse")
        return
      }

      const modifier = event.ctrlKey || event.metaKey
      if (!modifier || disabled || isTypingTarget(event.target)) return
      const key = event.key.toLowerCase()
      if (key === "z") {
        event.preventDefault()
        if (event.shiftKey) onRedo?.()
        else onUndo?.()
      } else if (key === "y") {
        event.preventDefault()
        onRedo?.()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, onRedo, onToolChange, onUndo])

  const stop = (event) => {
    event.stopPropagation()
  }

  const selectTool = (value) => () => onToolChange?.(value)

  const clear = (scope) => () => {
    onClear?.(scope)
    setClearMenuOpen(false)
  }

  return (
    <div
      role="toolbar"
      aria-label={copy.toolbar || "Annotation tools"}
      onPointerDown={stop}
      onClick={stop}
      className="absolute left-1/2 top-2 z-30 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 px-2 py-1.5 text-slate-700 shadow-xl backdrop-blur-sm dark:border-white/15 dark:bg-neutral-900/95 dark:text-neutral-100"
    >
      <div
        className={`flex min-w-0 items-center gap-1 overflow-x-auto ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <ToolButton
          active={tool === "mouse"}
          label={copy.mouse || "Mouse"}
          onClick={selectTool("mouse")}
        >
          <MousePointer2 size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "pen"}
          label={copy.pen || "Pen"}
          onClick={selectTool("pen")}
        >
          <Pen size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "highlighter"}
          label={copy.highlighter || "Highlighter"}
          onClick={selectTool("highlighter")}
        >
          <Highlighter size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "text"}
          label={copy.text || "Text"}
          onClick={selectTool("text")}
        >
          <Type size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "line"}
          label={copy.line || "Line"}
          onClick={selectTool("line")}
        >
          <Minus size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "arrow"}
          label={copy.arrow || "Arrow"}
          onClick={selectTool("arrow")}
        >
          <ArrowUpRight size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "rect"}
          label={copy.rect || "Rectangle"}
          onClick={selectTool("rect")}
        >
          <Square size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "ellipse"}
          label={copy.ellipse || "Ellipse"}
          onClick={selectTool("ellipse")}
        >
          <Circle size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "laser"}
          label={copy.laser || "Laser pointer"}
          onClick={selectTool("laser")}
        >
          <Zap size={16} />
        </ToolButton>
        <ToolButton
          active={tool === "eraser"}
          label={copy.eraser || "Eraser"}
          onClick={selectTool("eraser")}
        >
          <Eraser size={16} />
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
      </div>

      <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/15" />

      <div
        className={`flex shrink-0 items-center gap-1 ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <ToolButton label={copy.undo || "Undo"} onClick={() => onUndo?.()}>
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton label={copy.redo || "Redo"} onClick={() => onRedo?.()}>
          <Redo2 size={16} />
        </ToolButton>
      </div>

      <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/15" />

      {(canToggleLock || disabled) && (
        <>
          {canToggleLock ? (
            <ToolButton
              active={presenterLocked}
              label={
                presenterLocked
                  ? copy.presenterUnlock || "Mở khóa vẽ chú thích"
                  : copy.presenterLock || "Khóa vẽ chú thích"
              }
              onClick={() => onTogglePresenterLock?.()}
            >
              {presenterLocked ? <Lock size={16} /> : <LockOpen size={16} />}
            </ToolButton>
          ) : (
            <span
              title={
                presenterLocked
                  ? copy.lockedByPresenter || "Presenter đã khóa vẽ chú thích."
                  : copy.policyDisabled || "Host đã tắt quyền vẽ chú thích."
              }
              className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            >
              <Lock size={14} />
              <span className="hidden sm:inline">
                {presenterLocked
                  ? copy.lockedByPresenter || "Presenter đã khóa vẽ"
                  : copy.policyDisabled || "Đã tắt vẽ chú thích"}
              </span>
            </span>
          )}
          <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/15" />
        </>
      )}

      <div
        className={`relative flex shrink-0 items-center gap-1 ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <ToolButton
          active={clearMenuOpen}
          label={copy.clear || "Clear annotations"}
          onClick={() => setClearMenuOpen((open) => !open)}
        >
          <Trash2 size={16} />
        </ToolButton>
        {clearMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-xs font-medium text-slate-700 shadow-xl dark:border-white/15 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <button
              type="button"
              role="menuitem"
              onClick={clear("mine")}
              className="block w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10"
            >
              {copy.clearMine || "Clear mine"}
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={!canModerate}
              onClick={clear("others")}
              className={`block w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10 ${
                canModerate ? "" : disabledButton
              }`}
            >
              {copy.clearOthers || "Clear others"}
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={!canModerate}
              onClick={clear("all")}
              className={`block w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10 ${
                canModerate ? "" : disabledButton
              }`}
            >
              {copy.clearAll || "Clear all"}
            </button>
          </div>
        )}
        <ToolButton
          label={copy.exit || "Exit annotation"}
          onClick={() => onExit?.()}
        >
          <X size={16} />
        </ToolButton>
      </div>
    </div>
  )
}

export default AnnotationToolbar
