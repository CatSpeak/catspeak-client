import React from "react"

/**
 * Shared reusable Divider component.
 *
 * @param {"horizontal" | "vertical"} orientation - Divider orientation (default "horizontal").
 * @param {string} className - Optional styling overrides.
 */
const Divider = ({ orientation = "horizontal", className = "", ...props }) => {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-px bg-border self-stretch ${className}`}
        {...props}
      />
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`h-px w-full bg-border ${className}`}
      {...props}
    />
  )
}

export default Divider
