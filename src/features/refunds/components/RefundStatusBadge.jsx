import React from "react"
import { REFUND_STATUS_CONFIG } from "../constants/refundConstants"
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

const STATUS_ICONS = {
  0: Clock,
  1: CheckCircle2,
  2: XCircle,
  3: AlertTriangle,
}

export default function RefundStatusBadge({ status, t }) {
  const numStatus = Number(status)
  const config = REFUND_STATUS_CONFIG[numStatus] || {
    labelKey: "statusPending",
    defaultLabel: "Unknown",
    badgeStyle: "bg-gray-100 text-gray-700 border border-gray-200",
  }

  const IconComponent = STATUS_ICONS[numStatus] || Clock
  const label = t?.refunds?.[config.labelKey] || config.defaultLabel

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.badgeStyle}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  )
}
