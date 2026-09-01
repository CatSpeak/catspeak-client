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
      className="flex-shrink-0 w-[210px] sm:w-[230px] lg:w-[245px] flex flex-col group/card cursor-pointer snap-start"
    >
      <div className="relative w-full h-[280px] sm:h-[300px] lg:h-[320px] rounded-xl overflow-hidden bg-stone-100">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
            onError={() => setImgError(true)}
          />
        ) : fallbackAvatar ? (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60 transition-transform duration-500 ease-out group-hover/card:scale-105">
            <img
              src={fallbackAvatar}
              alt={displayName}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60 transition-transform duration-500 ease-out group-hover/card:scale-105">
            <div className="w-20 h-20 rounded-full bg-white/90 border border-border flex items-center justify-center text-gray-400 group-hover/card:text-[#910B09] transition-colors">
              <UserRound size={36} strokeWidth={1.5} />
            </div>
          </div>
        )}

        <div className="absolute left-0 right-0 bottom-0 h-[20%] group-hover/card:h-[55%] flex flex-col justify-end px-4 pb-0 pt-2 text-white z-20 transition-all duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)]"
          style={{
            background: "linear-gradient(to top, rgba(145,11,9,0.95) 0%, rgba(145,11,9,0.6) 60%, rgba(145,11,9,0.0) 100%)",
          }}
        >
          <span className="text-[11px] font-semibold tracking-wide uppercase text-[#FFE4B5] mb-0.5">
            {roleText}
          </span>
          <span className="text-sm sm:text-base font-bold leading-tight text-white mb-0 group-hover/card:mb-1">
            {displayName}
          </span>
          <p className="text-xs leading-relaxed text-white/80 max-h-0 opacity-0 overflow-hidden transition-all duration-200 ease-out mb-0 group-hover/card:max-h-[72px] group-hover/card:opacity-100 group-hover/card:mb-2">
            {description}
          </p>
          <span className="inline-flex items-center self-start bg-white text-[#910B09] text-xs font-semibold px-3.5 py-2 rounded-lg opacity-0 translate-y-2 transition-all duration-200 ease-out group-hover/card:opacity-100 group-hover/card:translate-y-0">
            {t?.landing?.leadingTeam?.viewInstructor || "Xem giảng viên"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default InstructorCard
