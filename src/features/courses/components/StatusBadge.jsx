import React from "react"
import { CLASS_STATUS_CONFIG } from "../utils/courseUtils"

const StatusBadge = ({ status, label, className = "" }) => {
  const config = CLASS_STATUS_CONFIG[status] || {
    label: status,
    bgClass: "bg-gray-100",
    textClass: "text-gray-700",
    dotClass: null,
    hasPing: false
  }

  return (
    <span className={`inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded ${config.bgClass} ${config.textClass} ${className}`}>
      {config.hasPing && (
        <span className="relative flex h-1.5 w-1.5 mr-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass || "bg-red-400"}`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotClass || "bg-red-500"}`}></span>
        </span>
      )}
      {label || config.label}
    </span>
  )
}

export default StatusBadge
