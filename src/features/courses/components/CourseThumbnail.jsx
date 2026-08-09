import React from "react"
import { getSafeMediaUrl, defaultCourseThumbnail } from "../utils/courseUtils"

const CourseThumbnail = ({
  item,
  title,
  className = "",
  imageClassName = "w-full h-full object-cover",
  children,
}) => {
  const thumbnailUrl = getSafeMediaUrl(item?.thumbnailUrl) || defaultCourseThumbnail

  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      <img src={thumbnailUrl} alt={title || item?.title || ""} className={imageClassName} loading="lazy" decoding="async" />
      {children}
    </div>
  )
}

export default CourseThumbnail
