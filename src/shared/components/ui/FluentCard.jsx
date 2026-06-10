import React from "react"

const FluentCard = ({ children, className = "" }) => {
  return (
    <div
      className={`flex flex-col justify-center rounded-2xl border border-[#E5E5E5] bg-white p-6 min-h-[69px] ${className}`}
    >
      {children}
    </div>
  )
}

export default FluentCard
