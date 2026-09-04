import { useState, useMemo } from "react"
import { UserRound, BadgeCheck } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getImageUrl } from "@/shared/utils/imageUtils"
import {
  getFallbackAvatarByGender,
  parseLanguages,
  getInstructorRole,
  getExperienceBadgeList,
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
  const experienceBadges = useMemo(
    () => getExperienceBadgeList(languages, t, language),
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
      className="w-full flex flex-col group/card cursor-pointer"
    >
      <div className="relative w-full h-[280px] sm:h-[300px] lg:h-[320px] rounded-xl overflow-hidden bg-stone-100">
        {experienceBadges.length > 0 && (
          <div className="absolute top-3 left-3 z-30 flex flex-col items-start gap-1">
            {experienceBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex max-w-[calc(100%-0rem)] items-center gap-1 bg-white/95 text-[#910B09] text-[11px] font-bold px-2.5 py-1 rounded-full shadow"
              >
                <BadgeCheck size={13} strokeWidth={2.5} className="shrink-0" />
                <span className="truncate">{badge}</span>
              </span>
            ))}
          </div>
        )}
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

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end px-4 pt-5 pb-4 text-white transition-all duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)] h-[30%] group-hover/card:h-[70%]"
          style={{
            background: "linear-gradient(to top, rgba(145,11,9,0.95) 0%, rgba(145,11,9,0.6) 60%, rgba(145,11,9,0.0) 100%)",
          }}
        >
          <span className="text-[11px] font-semibold tracking-wide uppercase text-[#FFE4B5] leading-none">
            {roleText}
          </span>
          <span className="mt-0.5 text-sm sm:text-base font-bold leading-tight text-white">
            {displayName}
          </span>
          <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)] group-hover/card:max-h-20 group-hover/card:opacity-100 group-hover/card:mt-2">
            <p className="text-xs leading-relaxed text-white/80">
              {description}
            </p>
          </div>
          <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)] group-hover/card:max-h-12 group-hover/card:opacity-100 group-hover/card:mt-3">
            <span className="inline-flex items-center bg-white text-[#910B09] text-xs font-semibold px-3.5 py-2 rounded-lg">
              {t?.landing?.leadingTeam?.viewInstructor || "Xem giảng viên"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorCard
