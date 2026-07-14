import React from "react"

/**
 * CategoryBadge
 *
 * Pill badge displayed over the round image to indicate the image category.
 *
 * @param {string} category - The category label to display
 * @param {string} [className] - Extra classes
 */
const CategoryBadge = ({ category, className = "" }) => {
  if (!category) return null

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-cath-red-700 shadow-sm backdrop-blur-sm select-none ${className}`}
    >
      {category}
    </span>
  )
}

export default CategoryBadge
