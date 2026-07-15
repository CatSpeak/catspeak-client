import React from "react"

const FluentCard = ({
  children,
  className = "",
  padding = "p-4 sm:p-6",
  variant = "default",
  ...props
}) => {
  const baseClasses =
    `flex flex-col justify-center rounded-xl ${padding} min-h-[69px]`

  const variantClasses = {
    default: "border border-[#E5E5E5] bg-white",
    glass: "border border-[#E5E5E5] bg-white/40 backdrop-blur-xl shadow-sm",
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default FluentCard
