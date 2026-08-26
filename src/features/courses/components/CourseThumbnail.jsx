import React from "react"
import { getSafeMediaUrl, defaultCourseThumbnail } from "../utils/courseUtils"

const CourseThumbnail = ({
  item,
  title,
  className = "",
  imageClassName = "w-full h-full object-cover",
  children,
}) => {
  const initialUrl = getSafeMediaUrl(item?.thumbnailUrl) || defaultCourseThumbnail
  const [imgSrc, setImgSrc] = React.useState(initialUrl)

  React.useEffect(() => {
    setImgSrc(getSafeMediaUrl(item?.thumbnailUrl) || defaultCourseThumbnail)
  }, [item?.thumbnailUrl])

  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={title || item?.title || ""}
        onError={() => setImgSrc(defaultCourseThumbnail)}
        className={imageClassName}
        loading="lazy"
        decoding="async"
      />
      {children}
    </div>
  )
}

export default CourseThumbnail
