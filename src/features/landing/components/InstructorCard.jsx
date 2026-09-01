import { useState, useMemo } from "react"
import { UserRound } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getImageUrl } from "@/shared/utils/imageUtils"
import {
  getFallbackAvatarByGender,
  parseLanguages,
  getInstructorRole,
} from "../utils/instructorUtils"

const InstructorCard = ({ teacher, onClick, onExplore }) => {
  const { t, language } = useLanguage()
  const [imgError, setImgError] = useState(false)

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else if (onExplore) {
      onExplore(e)
    }
  }

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

  const description = teacher.introduction || roleText

  return (
    <div
      onClick={handleClick}
      className="flex-shrink-0 w-[210px] sm:w-[230px] lg:w-[245px] flex flex-col items-center group/card cursor-pointer snap-start"
    >
      <div className="relative w-full h-[280px] sm:h-[300px] lg:h-[320px] rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-full h-full object-cover transition-opacity duration-300 group-hover/card:opacity-40"
            onError={() => setImgError(true)}
          />
        ) : fallbackAvatar ? (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60 transition-opacity duration-300 group-hover/card:opacity-40">
            <img
              src={fallbackAvatar}
              alt={displayName}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60 transition-opacity duration-300 group-hover/card:opacity-40">
            <div className="w-20 h-20 rounded-full bg-white/90 border border-border flex items-center justify-center text-gray-400 group-hover/card:text-[#910B09] transition-colors">
              <UserRound size={36} strokeWidth={1.5} />
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-end translate-y-full group-hover/card:translate-y-0 transition-transform duration-300 ease-out z-20">
          <div className="w-full bg-white/95 backdrop-blur-sm p-4 border-t border-gray-200/60">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center w-full px-4">
        <h3 className="text-base font-bold">{displayName}</h3>
        <p className="text-sm text-secondary">{roleText}</p>
      </div>
    </div>
  )
}

export default InstructorCard
