import React from "react"

/**
 * InteractiveGridPattern
 * Soft CatSpeak gradient background matching QueuePage:
 * Smooth vertical fade from white to #FFBBC3 (soft blush pink).
 *
 * @param {Object} props
 * @param {string} [props.className=""] - Additional CSS classes.
 * @param {React.ReactNode} [props.children] - Child elements placed on top.
 */
const InteractiveGridPattern = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`bg-gradient-to-b from-white to-[#FFBBC3] text-textColor ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default InteractiveGridPattern
