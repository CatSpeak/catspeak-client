import React from "react"

const FluentCard = ({
  children,
  className = "",
  padding = "p-4",
  rounded = "rounded-xl",
  variant = "default",
  ...props
}) => {
  const baseClasses = `flex flex-col justify-center ${rounded} ${padding} min-h-[69px]`

  const variantClasses = {
    default:
      "border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white",
    glass:
      "border border-border dark:border-[#3F3F3F] bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-xl text-foreground dark:text-white",
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
