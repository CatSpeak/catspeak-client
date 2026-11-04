import React from "react"
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"

/**
 * CatSpeakToast — Pixel-Perfect Custom Toast Primitive
 *
 * TWEAK THIS FILE TO CUSTOMIZE ALL TOAST PIXELS, SIZES, AND STYLES:
 * ------------------------------------------------------------------
 * - Width & Max-width: `w-[356px] max-w-[calc(100vw-2rem)]`
 * - Card Background: Solid dark `#18181b` in dark mode, `#ffffff` in light mode
 * - Border & Border-radius: Uniform `rounded-xl border border-neutral-200 dark:border-white/10`
 * - Icons: Strictly 20x20 (`w-5 h-5`)
 * - Typography: `text-sm`, max 2 lines (`line-clamp-2`)
 * - Action buttons: Uses CatSpeak's `PillButton` (`variant="snackbar"` or custom)
 * - Close button: Reuses CatSpeak's `IconButton` with `variant="ghost"`
 */

const STATUS_CONFIG = {
  success: {
    iconColor: "text-emerald-500",
    defaultIcon: CheckCircle2,
  },
  error: {
    iconColor: "text-red-500",
    defaultIcon: AlertCircle,
  },
  warning: {
    iconColor: "text-amber-500",
    defaultIcon: AlertTriangle,
  },
  warn: {
    iconColor: "text-amber-500",
    defaultIcon: AlertTriangle,
  },
  info: {
    iconColor: "text-blue-500",
    defaultIcon: Info,
  },
  loading: {
    iconColor: "text-cath-red-600",
    defaultIcon: Loader2,
  },
  default: {
    iconColor: "text-neutral-400 dark:text-neutral-500",
    defaultIcon: null,
  },
}

export const CatSpeakToast = ({
  id,
  type = "default",
  title,
  message,
  icon,
  action,
  cancel,
  children,
  onDismiss,
  showCloseButton = true,
  className = "",
}) => {
  const config = STATUS_CONFIG[type] || STATUS_CONFIG.default
  const IconComponent = config.defaultIcon
  const displayText = title || message

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        pointer-events-auto relative flex w-[356px] max-w-[calc(100vw-2rem)] items-center gap-2
        rounded-xl border border-neutral-200 bg-white pl-4 pr-1
        text-neutral-900 shadow-xl transition-all
        dark:border-white/10 dark:bg-[#18181b] dark:text-white
        ${className}
      `.trim()}
    >
      {/* Status Icon / Custom Icon — strictly 20x20 */}
      {icon !== null && (icon || IconComponent) && (
        <div className="shrink-0 flex items-center justify-center w-5 h-5">
          {typeof icon === "string" ? (
            <span className="text-[20px] leading-none select-none">{icon}</span>
          ) : icon ? (
            <div className="w-5 h-5 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5">
              {icon}
            </div>
          ) : IconComponent ? (
            <IconComponent
              className={`h-5 w-5 ${config.iconColor} ${
                type === "loading" ? "animate-spin" : ""
              }`}
            />
          ) : null}
        </div>
      )}

      {/* Main Toast Content — always text-sm and max 2 lines */}
      <div className="flex flex-1 flex-col justify-center min-w-0 pr-1">
        {displayText && (
          <div className="line-clamp-2 text-sm text-neutral-900 dark:text-white break-words">
            {displayText}
          </div>
        )}

        {/* Custom JSX passed by caller */}
        {children}

        {/* Action Button(s) using PillButton */}
        {(action || cancel) && (
          <div className="mt-2 flex items-center gap-3">
            {action && (
              <PillButton
                variant={action.variant || "snackbar"}
                onClick={(e) => {
                  action.onClick?.(e)
                  if (onDismiss) onDismiss()
                }}
              >
                {action.label}
              </PillButton>
            )}
            {cancel && (
              <PillButton
                variant="secondary-no-outline"
                onClick={(e) => {
                  cancel.onClick?.(e)
                  if (onDismiss) onDismiss()
                }}
              >
                {cancel.label}
              </PillButton>
            )}
          </div>
        )}
      </div>

      {/* Close 'X' Button — reusing IconButton with variant="ghost" */}
      {showCloseButton && (
        <div className="shrink-0 -mr-1">
          <IconButton
            variant="ghost"
            onClick={onDismiss}
            aria-label="Close notification"
            title="Close"
          >
            <X />
          </IconButton>
        </div>
      )}
    </div>
  )
}

export default CatSpeakToast
