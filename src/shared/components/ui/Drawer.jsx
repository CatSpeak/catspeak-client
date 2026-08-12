import React from "react"

const Drawer = ({
  children,
  className = "",
  padding = "p-4 sm:p-6",
  variant = "default",
  ...props
}) => {
  const baseClasses = `flex flex-col justify-center ${padding}`

  const variantClasses = {
    default: "border border-border bg-white",
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

export default Drawer
