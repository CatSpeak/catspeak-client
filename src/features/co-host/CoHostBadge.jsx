import React from "react"

/**
 * Badge "Co-host" hiển thị cạnh tên người được phân công.
 */
const CoHostBadge = ({ className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 ${className}`}
  >
    Co-host
  </span>
)

export default CoHostBadge
