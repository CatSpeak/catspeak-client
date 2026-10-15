import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Badge "Co-host" hiển thị cạnh tên người được phân công.
 */
const CoHostBadge = ({ className = "", pending = false }) => {
  const { t } = useLanguage()
  return (
  <span
    className={`inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 ${className}`}
  >
    {pending ? (t.courses?.createClass?.coHostPendingStatus || "Pending enrollment") : "Co-host"}
  </span>
  )
}

export default CoHostBadge
