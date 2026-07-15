import { Loader2 } from "lucide-react"
import React from "react"

const LoadingSpinner = ({
  className = "flex flex-col items-center justify-center",
  text,
}) => {
  return (
    <div className={className}>
      <Loader2 className="h-8 w-8 animate-spin text-cath-red-700" />
      {text && <span className="mt-2 text-sm">{text}</span>}
    </div>
  )
}

export default LoadingSpinner
