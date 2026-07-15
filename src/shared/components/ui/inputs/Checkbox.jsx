import React from "react"

const Checkbox = ({ checked, onChange, id, className = "" }) => {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 cursor-pointer rounded border-gray-300 text-cath-red-700 accent-cath-red-700 focus:ring-cath-red-700 ${className}`}
    />
  )
}

export default Checkbox
