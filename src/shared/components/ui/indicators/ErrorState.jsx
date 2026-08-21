import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"

/**
 * ErrorState — Shared component for error state feedback across pages and components.
 * Mirrored after EmptyState for consistent API design.
 *
 * @param {string} message - Primary title / error message text
 * @param {string} title - Alias for message
 * @param {string|ReactNode} description - Secondary description text / error detail
 * @param {string|ReactNode} subtext - Alias for description
 * @param {string|number} statusCode - Optional HTTP status code (e.g. 500, 404, 422)
 * @param {React.ComponentType} icon - Optional Lucide or custom icon component (defaults to AlertCircle)
 * @param {string} iconClassName - Optional custom styling for the icon
 * @param {ReactNode} action - Custom action element (e.g. custom button)
 * @param {Function} onRetry - Function to trigger on retry button click
 * @param {string} retryText - Label text for retry button (defaults to "Thử lại")
 * @param {boolean} fullPage - Occupies full height (min-h-[50vh])
 * @param {string} className - Extra container CSS classes
 * @param {ReactNode} children - Extra elements / action buttons
 * @param {string} variant - Layout variant ("simple" | "component" | "page" | "detailed")
 */
const ErrorState = ({
  message = "Không thể tải dữ liệu",
  title,
  description = null,
  subtext,
  statusCode,
  icon: Icon = AlertCircle,
  iconClassName,
  action,
  onRetry,
  retryText = "Thử lại",
  fullPage = false,
  className = "",
  children,
  variant = "simple", // "simple" | "component" | "page" | "detailed"
}) => {
  const displayTitle = title || message
  const displaySubtext = subtext || description

  const renderDescription = () => {
    if (!displaySubtext && !statusCode) return null

    return (
      <div className="flex flex-col items-center gap-1 mt-1 text-center max-w-md">
        {displaySubtext && (
          <p className="text-sm text-neutral-600">
            {typeof displaySubtext === "string" ? displaySubtext : displaySubtext}
          </p>
        )}
        {statusCode && (
          <span className="text-xs font-mono text-neutral-400">
            HTTP Status: {statusCode}
          </span>
        )}
      </div>
    )
  }

  const renderAction = () => {
    if (action) return action
    if (onRetry) {
      return (
        <PillButton
          variant="primary"
          onClick={onRetry}
          startIcon={<RefreshCw className="w-4 h-4" />}
          className="mt-4"
        >
          {retryText}
        </PillButton>
      )
    }
    return null
  }

  if (variant === "component") {
    return (
      <div
        className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}
      >
        {Icon && (
          <Icon
            className={iconClassName || "w-8 h-8 mb-2 text-red-500 stroke-[1.5]"}
          />
        )}
        <div className="text-sm font-semibold text-neutral-800">{displayTitle}</div>
        {renderDescription()}
        {renderAction()}
        {children}
      </div>
    )
  }

  if (variant === "page") {
    return (
      <div
        className={`flex-1 w-full flex flex-col items-center justify-center ${
          fullPage ? "min-h-[50vh] py-12" : "py-12"
        } px-4 text-center ${className}`}
      >
        {Icon && (
          <Icon
            className={iconClassName || "w-16 h-16 mb-3 text-red-500 stroke-[1.5]"}
          />
        )}
        <div className="font-semibold text-lg text-neutral-900">{displayTitle}</div>
        {renderDescription()}
        {renderAction()}
        {children}
      </div>
    )
  }

  if (variant === "detailed" || Icon) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${
          fullPage ? "min-h-[50vh] py-12" : "py-12"
        } px-4 text-center ${className}`}
      >
        {Icon && (
          <Icon
            className={iconClassName || "w-12 h-12 mb-3 text-red-500 stroke-[1.5]"}
          />
        )}
        <div className="font-semibold text-base text-neutral-900">{displayTitle}</div>
        {renderDescription()}
        {renderAction()}
        {children}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className || "p-10"}`}>
      <div className="text-sm text-red-600 font-medium text-center">
        {displayTitle}
      </div>
      {renderDescription()}
      {renderAction()}
      {children}
    </div>
  )
}

export default ErrorState
