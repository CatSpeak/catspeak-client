import React, { useState, useMemo } from "react"
import { UserRound } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getImageUrl } from "@/shared/utils/imageUtils"
import {
  getFallbackAvatarByGender,
  parseLanguages,
  getInstructorRole,
} from "../utils/instructorUtils"

const InstructorCard = ({ teacher, onExplore }) => {
  const { t, language } = useLanguage()
  const [imgError, setImgError] = useState(false)

  const languages = useMemo(
    () => parseLanguages(teacher.languagesTeach),
    [teacher.languagesTeach],
  )
  const roleText = useMemo(
    () => getInstructorRole(languages, t, language),
    [languages, t, language],
  )

  const rawAvatar = teacher.avatarImageUrl
  const avatarSrc = rawAvatar && !imgError ? getImageUrl(rawAvatar) : null

  const fallbackAvatar = getFallbackAvatarByGender(teacher.gender)

  const displayName =
    teacher.username ||
    teacher.nickname ||
    t?.landing?.leadingTeam?.defaultInstructor ||
    "Giảng viên"

  const viewText =
    t?.landing?.leadingTeam?.viewInstructor || "Xem giảng viên"

  return (
    <div
      onClick={onExplore}
      className="flex-shrink-0 w-[210px] sm:w-[230px] lg:w-[245px] flex flex-col items-center group/card cursor-pointer"
    >
      {/* Top Image / Avatar Showcase Frame with rounded-xl */}
      <div className="relative w-full h-[280px] sm:h-[300px] lg:h-[320px] rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
        {/* If real photo exists, cover the whole frame */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : fallbackAvatar ? (
          /* Fallback illustration with clean neutral background */
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60">
            <img
              src={fallbackAvatar}
              alt={displayName}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          /* When gender and avatar are null: same neutral background as fallback gender images with user icon */
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60">
            <div className="w-20 h-20 rounded-full bg-white/90 border border-border flex items-center justify-center text-gray-400 group-hover/card:text-[#910B09] transition-colors">
              <UserRound size={36} strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Hover Pill Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
          <span className="bg-black/60 text-white text-xs font-medium px-6 py-2 rounded-full border border-white/20 pointer-events-none">
            {viewText}
          </span>
        </div>
      </div>

      {/* Info Section beneath the image */}
      <div className="mt-4 text-center w-full px-2">
        <h3 className="text-base font-bold">{displayName}</h3>
        <p className="text-sm text-secondary">{roleText}</p>
      </div>
    </div>
  )
}

export default InstructorCard
