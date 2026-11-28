import React from "react"
import { Link } from "react-router-dom"
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react"

const variantStyles = {
  neutral: {
    container:
      "bg-[#F5F5F7] dark:bg-[#242424] text-secondary border-border dark:border-[#3F3F3F]",
    icon: Info,
  },
  danger: {
    container:
      "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60",
    icon: AlertCircle,
  },
  error: {
    container:
      "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60",
    icon: AlertCircle,
  },
  warning: {
    container:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
    icon: AlertTriangle,
  },
  info: {
    container:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
    icon: Info,
  },
  success: {
    container:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
    icon: CheckCircle,
  },
}

const Banner = ({
  variant = "danger",
  icon,
  title,
  children,
  action,
  className = "",
  onClose,
}) => {
  const currentVariant = variantStyles[variant] || variantStyles.danger
  const DefaultIcon = currentVariant.icon

  return (
    <div
      className={`flex items-center gap-2 p-3 min-h-12 shrink-0 rounded-md border text-sm transition-all ${currentVariant.container} ${className}`}
      role="alert"
    >
      {icon !== null && (
        <div className="shrink-0 flex items-center justify-center">
          {icon ? (
            React.isValidElement(icon) ? (
              icon
            ) : (
              React.createElement(icon, { size: 20, className: "shrink-0" })
            )
          ) : (
            <DefaultIcon size={20} className="shrink-0" />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {title && (
          <div className={`font-semibold ${children ? "mb-0.5" : ""}`}>
            {title}
          </div>
        )}
        {children ? <div>{children}</div> : null}
      </div>
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="shrink-0 inline-flex items-center px-2 -mr-1 font-semibold text-sm hover:underline transition-opacity whitespace-nowrap"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="shrink-0 inline-flex items-center px-2 -mr-1 font-semibold text-sm hover:underline transition-opacity whitespace-nowrap"
          >
            {action.label}
          </button>
        ))}
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 -mr-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default Banner
