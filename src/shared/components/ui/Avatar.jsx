import React, { useState, useEffect } from "react"
import { useGetUserProfileQuery } from "@/store/api/userApi"

/**
 * Reusable Avatar component — displays a user image or initial fallback.
 *
 * Consistent look across the app. Only `size` and data props should vary.
 *
 * @param {number}  [size=24]    - Width & height in pixels (like lucide-react icons)
 * @param {string}  [src]        - Image URL (shows image when provided)
 * @param {string}  [alt]        - Alt text for the image
 * @param {string}  [name]       - Used to derive the fallback initial
 * @param {string}  [fallback]   - Explicit fallback character (overrides name)
 * @param {boolean} [speaking]   - Show green speaking-indicator border
 * @param {string}  [className]  - Extra classes merged onto the outer wrapper
 * @param {boolean} [isCurrentUser] - If true, fetches and uses the avatar from the API
 */
const Avatar = ({
  size = 24,
  src,
  alt = "User",
  name,
  fallback,
  speaking = false,
  className = "",
  isCurrentUser = false,
}) => {
  const [imgError, setImgError] = useState(false)

  // Use API if it's the current user
  const { data: profileData } = useGetUserProfileQuery(undefined, {
    skip: !isCurrentUser,
  })
  
  const apiSrc = isCurrentUser 
    ? (profileData?.data?.meetingAvatarUrl || profileData?.data?.avatarImageUrl)
    : null;

  const finalSrc = apiSrc || src

  // Reset imgError if src changes
  useEffect(() => {
    setImgError(false)
  }, [finalSrc])

  const initial = fallback || (name ? name.charAt(0).toUpperCase() : "U")

  // Scale font size relative to the avatar size
  const fontSize = Math.max(10, Math.round(size * 0.4))

  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderWidth: "1px",
    borderColor: speaking ? "#16a34a" : "#C6C6C6",
    borderStyle: "solid",
    fontSize: `${fontSize}px`,
  }

  const speakingClass = speaking
    ? "shadow-[0_0_15px_rgba(46,125,50,0.4)]"
    : ""

  if (finalSrc && !imgError) {
    return (
      <div
        className={`overflow-hidden rounded-full ${speakingClass} ${className}`}
        style={baseStyle}
      >
        <img
          src={finalSrc}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold bg-cath-red-700 text-white ${speakingClass} ${className}`}
      style={baseStyle}
    >
      {initial}
    </div>
  )
}

export default Avatar
