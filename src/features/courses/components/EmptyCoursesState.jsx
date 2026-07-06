import React from "react"
import { BookOpen } from "lucide-react"

const EmptyCoursesState = ({
  icon = BookOpen,
  title,
  message,
  action,
  className = "min-h-[260px]",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-20 text-center text-gray-400 font-bold text-base gap-3 ${className}`}>
      {React.createElement(icon, { size: 54, className: "text-gray-300 stroke-[1.2]" })}
      {title && <h3 className="font-extrabold text-gray-800 text-lg">{title}</h3>}
      {title && message && <p className="text-sm font-semibold max-w-xs">{message}</p>}
      {!title && message && <span>{message}</span>}
      {action}
    </div>
  )
}

export default EmptyCoursesState
