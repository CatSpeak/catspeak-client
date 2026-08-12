import React from "react"

const FluentCard = ({
  children,
  className = "",
  padding = "p-4 sm:p-6",
  rounded = "rounded-xl",
  variant = "default",
  ...props
}) => {
  const baseClasses =
    `flex flex-col justify-center ${rounded} ${padding} min-h-[69px]`

  const variantClasses = {
    default: "border border-border bg-white shadow-sm",
    glass: "border border-border bg-white/40 backdrop-blur-xl shadow-sm",
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
