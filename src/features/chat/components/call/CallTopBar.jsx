import { Maximize, Minimize, Maximize2, Minimize2 } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * CallTopBar — Top header containing call title, live duration timer,
 * and window management controls (fullscreen toggle, minimize/PiP toggle).
 */
const CallTopBar = ({
  chatTitle,
  callDuration = 0,
  isFullscreen = false,
  isMinimized = false,
  onToggleFullscreen,
  onToggleMinimize,
}) => {
  const { t } = useLanguage()

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="flex items-center justify-between p-4 bg-neutral-900/90 backdrop-blur-md border-b border-white/10 shrink-0 z-20">
      <div className="flex flex-col min-w-0">
        <h4 className="text-white truncate max-w-[200px] sm:max-w-xs font-medium">
          {chatTitle}
        </h4>
        <div className="text-sm text-emerald-400 font-mono">
          {formatDuration(callDuration)}
        </div>
      </div>

      {/* Window action controls */}
      <div className="flex items-center gap-1 shrink-0">
        {!isMinimized && (
          <IconButton
            onClick={onToggleFullscreen}
            size="sm"
            variant="darkGhost"
            aria-label={
              isFullscreen
                ? t?.chat?.call?.exitFullscreen || "Exit fullscreen"
                : t?.chat?.call?.fullscreen || "Fullscreen"
            }
            title={
              isFullscreen
                ? t?.chat?.call?.exitFullscreen || "Exit fullscreen"
                : t?.chat?.call?.fullscreen || "Fullscreen"
            }
          >
            {isFullscreen ? <Minimize /> : <Maximize />}
          </IconButton>
        )}

        <IconButton
          onClick={onToggleMinimize}
          size="sm"
          variant="darkGhost"
          aria-label={
            isMinimized
              ? t?.chat?.call?.maximize || "Maximize"
              : t?.chat?.call?.minimize || "Minimize"
          }
          title={
            isMinimized
              ? t?.chat?.call?.maximize || "Maximize"
              : t?.chat?.call?.minimize || "Minimize"
          }
        >
          {isMinimized ? <Maximize2 /> : <Minimize2 />}
        </IconButton>
      </div>
    </div>
  )
}

export default CallTopBar
