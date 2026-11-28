import React from "react"
import { REFUND_STATUS_CONFIG } from "../constants/refundConstants"

export default function RefundStatusBadge({ status, t }) {
  const numStatus = Number(status)
  const config = REFUND_STATUS_CONFIG[numStatus] || {
    labelKey: "statusPending",
    defaultLabel: "Unknown",
    badgeStyle: "bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-[#3F3F3F]",
  }

  const label = t?.refunds?.[config.labelKey] || config.defaultLabel

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${config.badgeStyle}`}
    >
      {label}
    </span>
  )
}
