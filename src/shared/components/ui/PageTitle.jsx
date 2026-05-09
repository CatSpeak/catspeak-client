import React from "react"

const PageTitle = ({ children, className = "" }) => {
  return (
    <h2
      className={`text-[28px] leading-[36px] font-bold text-[#990011] mb-5 ${className}`}
    >
      {children}
    </h2>
  )
}

export default PageTitle
