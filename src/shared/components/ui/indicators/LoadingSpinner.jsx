import { Loader2 } from "lucide-react"
import React from "react"

const sizeClasses = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
}

const LoadingSpinner = ({
  className = "flex flex-col items-center justify-center",
  text,
  size = "md",
  iconClassName = "",
  textClassName = "mt-2 text-sm",
}) => {
  const resolvedSize = sizeClasses[size] || size

  return (
    <div className={className}>
      <Loader2
        className={`animate-spin text-cath-red-700 ${resolvedSize || "h-10 w-10"} ${iconClassName}`}
      />
      {text && <span className={textClassName}>{text}</span>}
    </div>
  )
}

export default LoadingSpinner
