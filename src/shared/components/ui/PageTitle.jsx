import React from "react"

const PageTitle = ({ children, className = "" }) => {
  return (
    <h2
      className={`text-[28px] leading-[36px] font-bold text-cath-red-700 mb-6 ${className}`}
    >
      {children}
    </h2>
  )
}

export default PageTitle
