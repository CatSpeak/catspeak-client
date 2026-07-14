import React from "react"

/**
 * RoleBadge
 *
 * @param {string} role      - Role label e.g. "Describer" | "Rater"
 * @param {string} [className]
 */
const RoleBadge = ({ role, className = "" }) => {
  if (!role) return null

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border select-none ${className}`}
      style={{
        color: "#f08d1d",
        borderColor: "#f08d1d",
        backgroundColor: "rgba(240, 141, 29, 0.08)",
      }}
    >
      {role}
    </span>
  )
}

export default RoleBadge
