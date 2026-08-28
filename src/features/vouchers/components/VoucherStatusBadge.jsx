import React from "react"
import { VOUCHER_STATUS_CONFIG } from "../constants/voucherConstants"
import { useLanguage } from "@/shared/context/LanguageContext"

const VoucherStatusBadge = ({ status, className = "" }) => {
  const { t } = useLanguage()
  const vt = t.vouchers || {}

  const config = VOUCHER_STATUS_CONFIG[status] || {
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    dotClass: "bg-gray-400",
    defaultLabel: status || "Unknown",
  }

  const label = (vt.status && vt.status[status]) || config.defaultLabel

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {label}
    </span>
  )
}

export default VoucherStatusBadge
