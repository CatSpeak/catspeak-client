import React, { useState, useEffect } from "react"
import { getProfilePath } from "@/shared/utils/navigation"

export const TeacherHat = ({ size = 32, className = "" }) => (
  <svg
    viewBox="0 0 32 22"
    style={{ width: `${size}px`, height: `${Math.round(size * 0.68)}px` }}
    className={`pointer-events-none drop-shadow-xs ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Skull Cap Base */}
    <path
      d="M7 8.5C7 8.5 10 13 16 13C22 13 25 8.5 25 8.5V11.5C25 14.5 21 16 16 16C11 16 7 14.5 7 11.5V8.5Z"
      fill="#1E293B"
    />
    {/* Mortarboard Diamond Top */}
    <polygon
      points="16,1 31,7 16,13 1,7"
      fill="#0F172A"
      stroke="#334155"
      strokeWidth="0.75"
      strokeLinejoin="round"
    />
    {/* Center Button */}
    <circle cx="16" cy="7" r="1.2" fill="#F59E0B" />
    {/* Tassel String */}
    <path
      d="M16 7C22 7 26 10 26.5 13.5"
      stroke="#F59E0B"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Tassel Brush */}
    <path
      d="M26.5 13.5V18"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

/**
 * Reusable Avatar component — displays a user image or initial fallback.
 * Clicking on an Avatar with an `accountId` automatically navigates to that user's profile.
 *
 * @param {number|string} [size=24]  - Width & height in pixels (or "sm"|"md"|"lg")
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
 * @param {"default"|"teacher"} [variant="default"] - Variant style (e.g. teacher with scholar hat)
 * @param {boolean} [isTeacher=false]- Alias for variant="teacher"
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
  variant = "default",
  isTeacher = false,
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
      window.open(getProfilePath(accountId), "_blank", "noopener,noreferrer")
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

  const showTeacherHat = variant === "teacher" || isTeacher
  const hatSize = Math.round(numericSize * 0.72)
  const hatTop = -Math.round(numericSize * 0.05)

  const hasValidSrc = Boolean(
    src && typeof src === "string" && src.trim().length > 0 && !imgError,
  )

  const renderAvatarContent = () => {
    const positionClass =
      className && /\b(absolute|fixed)\b/.test(className) ? "" : "relative"

    if (hasValidSrc) {
      return (
        <div
          className={`overflow-hidden rounded-full shrink-0 select-none ${positionClass} ${speakingClass} ${cursorClass} ${className}`}
          style={baseStyle}
          onClick={isClickable ? handleClick : onClick}
        >
          <img
            src={src}
            alt={alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            className="!w-full !h-full !object-cover pointer-events-none"
            onError={() => setImgError(true)}
          />
        </div>
      )
    }

    const hasCustomBg = className && className.includes("bg-")
    const fallbackBgClass = hasCustomBg ? "" : "bg-cath-red-700 text-white"

    return (
      <div
        className={`flex items-center justify-center rounded-full font-semibold shrink-0 select-none ${fallbackBgClass} ${speakingClass} ${cursorClass} ${className}`}
        style={baseStyle}
        onClick={isClickable ? handleClick : onClick}
      >
        {initial}
      </div>
    )
  }

  if (showTeacherHat) {
    return (
      <div className="relative inline-flex shrink-0 items-center justify-center">
        <div
          className="absolute z-10 -rotate-6 pointer-events-none transition-transform duration-200 group-hover:-rotate-10 group-hover:scale-105"
          style={{
            top: `${hatTop}px`,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <TeacherHat size={hatSize} />
        </div>
        {renderAvatarContent()}
      </div>
    )
  }

  return renderAvatarContent()
}

export default Avatar
