import React from "react"

const FluentCard = ({ children, className = "", variant = "default" }) => {
  const baseClasses = "flex flex-col justify-center rounded-2xl p-6 min-h-[69px]"
  
  const variantClasses = {
    default: "border border-[#E5E5E5] bg-white",
    glass: "border border-[#E5E5E5] bg-white/40 backdrop-blur-xl shadow-sm",
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </div>
  )
}

export default FluentCard
