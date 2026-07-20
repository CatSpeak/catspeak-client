import React from "react"

const CourseThumbnail = ({
  item,
  title,
  className = "",
  iconSize = 24,
  imageClassName = "w-full h-full object-cover",
  children,
}) => {
  const Icon = item?.icon
  const hasThumbnail = Boolean(item?.thumbnailUrl)
  const gradient = item?.gradient || "from-gray-100 to-gray-200 text-gray-400"

  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${hasThumbnail ? "" : `bg-gradient-to-br ${gradient}`} ${className}`}>
      {hasThumbnail ? (
        <img src={item.thumbnailUrl} alt={title || item.title} className={imageClassName} loading="lazy" decoding="async" />
      ) : (
        Icon && <Icon size={iconSize} className="stroke-[1.5]" />
      )}
      {children}
    </div>
  )
}

export default CourseThumbnail
