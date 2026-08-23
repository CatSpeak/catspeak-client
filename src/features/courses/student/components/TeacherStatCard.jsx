import React from "react"

const TeacherStatCard = ({
  color = "#990011",
  title,
  value,
  icon: IconOrElement,
  className = "",
}) => {
  const isHex = typeof color === "string" && color.startsWith("#")
  const isRgb = typeof color === "string" && color.startsWith("rgb")
  const isTailwindText = typeof color === "string" && color.startsWith("text-")

  let iconColor = color
  let circleBg = "rgba(153, 0, 17, 0.15)"

  if (isHex) {
    iconColor = color
    circleBg = `${color}26`
  } else if (isRgb) {
    iconColor = color
    circleBg = color.replace(")", ", 0.15)").replace("rgb", "rgba")
  }

  const renderIcon = () => {
    if (!IconOrElement) return null
    if (React.isValidElement(IconOrElement)) {
      return React.cloneElement(IconOrElement, {
        className:
          `${IconOrElement.props.className || ""} w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6`.trim(),
      })
    }
    if (
      typeof IconOrElement === "function" ||
      typeof IconOrElement === "object"
    ) {
      const IconComponent = IconOrElement
      return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
    }
    return null
  }

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100/80 flex flex-col items-center justify-center text-center ${className}`}
      title={title}
    >
      {/* Dòng 1: icon, bao bọc bằng parent hình tròn có màu color/50, màu icon = màu color */}
      <div
        style={{
          backgroundColor: isHex ? `${color}26` : circleBg,
          color: isTailwindText ? undefined : iconColor,
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mb-1.5 ${
          isTailwindText ? `${color} bg-gray-100` : ""
        }`}
      >
        {renderIcon()}
      </div>

      {/* Dòng 2: Value, chữ lớn, không in đậm, màu đen */}
      <div className="text-base sm:text-lg font-normal text-black leading-tight">
        {value ?? "—"}
      </div>

      {/* Dòng 3: title */}
      <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium mt-0.5 truncate max-w-full">
        {title}
      </span>
    </div>
  )
}

export default TeacherStatCard
