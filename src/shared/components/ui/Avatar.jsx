import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getProfilePath } from "@/shared/utils/navigation"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"

/**
 * Reusable Avatar component — displays a user image or initial fallback.
 * Clicking on an Avatar with an `accountId` automatically navigates to that user's profile.
 *
 * @param {number}  [size=24]        - Width & height in pixels
 * @param {string}  [src]            - Image URL
 * @param {string}  [alt]            - Alt text for the image
 * @param {string}  [name]           - Used to derive the fallback initial
 * @param {string}  [fallback]       - Explicit fallback character (overrides name)
 * @param {boolean} [speaking]       - Show green speaking-indicator border
 * @param {number|string} [accountId]- If provided, clicking navigates to /profile/:accountId
 * @param {function} [onClick]       - Custom click handler
 * @param {boolean} [clickable=true] - Enable click-to-profile behavior when accountId or onClick is provided
 * @param {string}  [className]      - Extra classes merged onto outer wrapper
 * @param {object}  [style]          - Custom inline styles
 */
const Avatar = ({
  size = 24,
  src,
  alt = "User",
  name,
  fallback,
  speaking = false,
  accountId,
  onClick,
  clickable = true,
  className = "",
  style = {},
}) => {
  const numericSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 32
      : size === "md"
      ? 40
      : size === "lg"
      ? 48
      : parseInt(size, 10) || 24
  const [imgError, setImgError] = useState(false)
  let navigate
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate()
  } catch {
    navigate = getNavigate()
  }
  const { currentLang } = useLanguage()

  useEffect(() => {
    setImgError(false)
  }, [src])

  const initial = fallback || (name ? name.charAt(0).toUpperCase() : "U")
  const fontSize = Math.max(10, Math.round(numericSize * 0.4))

  const isClickable = clickable && (Boolean(accountId) || Boolean(onClick))

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    }
    if (accountId && !e.defaultPrevented) {
      e.stopPropagation()
      navigate(getProfilePath(accountId))
    }
  }

  const baseStyle = {
    width: `${numericSize}px`,
    height: `${numericSize}px`,
    minWidth: `${numericSize}px`,
    minHeight: `${numericSize}px`,
    fontSize: `${fontSize}px`,
    boxShadow: speaking
      ? "0 0 0 2px #3D9E60, 0 0 10px rgba(61, 158, 96, 0.5)"
      : "0 0 0 2px transparent",
    transition: "box-shadow 0.2s ease",
    ...style,
  }

  const speakingClass = ""

  const cursorClass = isClickable
    ? "cursor-pointer hover:opacity-85 hover:scale-[1.03] transition-all"
    : ""

  if (src && !imgError) {
    return (
      <div
        className={`overflow-hidden rounded-full shrink-0 ${speakingClass} ${cursorClass} ${className}`}
        style={baseStyle}
        onClick={isClickable ? handleClick : onClick}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold bg-cath-red-700 text-white shrink-0 ${speakingClass} ${cursorClass} ${className}`}
      style={baseStyle}
      onClick={isClickable ? handleClick : onClick}
    >
      {initial}
    </div>
  )
}

export default Avatar
