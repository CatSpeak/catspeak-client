import React from "react"
import { Link } from "react-router-dom"
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react"

const variantStyles = {
  danger: {
    container: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  error: {
    container: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  warning: {
    container: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertTriangle,
  },
  info: {
    container: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Info,
  },
  success: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
      className={`flex items-center gap-2 px-4 h-12 shrink-0 rounded-xl border text-sm transition-all ${currentVariant.container} ${className}`}
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
          <div className="font-semibold leading-none mb-1">{title}</div>
        )}
        <div className="leading-snug">{children}</div>
      </div>
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="shrink-0 inline-flex items-center h-12 px-2 -mr-2 font-semibold text-sm hover:underline transition-opacity whitespace-nowrap"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="shrink-0 inline-flex items-center h-12 px-2 -mr-2 font-semibold text-sm hover:underline transition-opacity whitespace-nowrap"
          >
            {action.label}
          </button>
        ))}
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 -mr-1 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default Banner
