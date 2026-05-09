import React from "react"

const FluentCard = ({ children, className = "" }) => {
  return (
    <div
      className={`flex flex-col justify-center rounded-[5px] border border-[#E5E5E5] bg-white px-[16px] py-[20px] min-h-[69px] ${className}`}
    >
      {children}
    </div>
  )
}

export default FluentCard
