import React from "react"
import { useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { translations } from "@/shared/i18n"
import { useGetProfileQuery } from "@/features/auth"
import CommunityPresence from "./CommunityPresence"

const WelcomeSection = () => {
  const { t } = useLanguage()
  const { welcome } = t.rooms

  // Determine language ONLY for the dynamic "Fun Fact" section
  // Force Vietnamese for the Fun Fact section
  const dynamicT = translations.vi

  const { data: userData } = useGetProfileQuery()
  const user = userData?.data

  return (
    <div className="relative pl-4 sm:pl-6 min-h-[180px] sm:min-h-[220px]">
      {/* Decorative connecting lines with rounded corners - Responsive */}
      <div className="absolute left-1 sm:left-2 top-3 sm:top-4 h-0.5 w-12 sm:w-20 bg-cath-red-700 rounded-r-full" />
      <div className="absolute left-1 sm:left-2 top-3 sm:top-4 h-[180px] sm:h-[220px] w-0.5 bg-cath-red-700 rounded-b-full" />

      <h2 className="font-bold mb-4 ml-12 sm:ml-20 text-[1.25rem] sm:text-[1.5rem] md:text-[2rem]">
        {welcome.greeting.replace("{{name}}", user?.username || welcome.friend)}
      </h2>

      {/* dynamic content starts here */}
      <h2 className="font-bold text-[#990011] text-[1.5rem] sm:text-[1.875rem] md:text-[2.25rem]">
        {dynamicT?.welcomeSection?.funFact?.title}
      </h2>
      <p className="mt-2 text-base text-black leading-[1.6]">
        {dynamicT?.welcomeSection?.funFact?.description?.part1}
        <span className="text-[#990011]">
          {dynamicT?.welcomeSection?.funFact?.description?.highlight1}
        </span>
        {dynamicT?.welcomeSection?.funFact?.description?.part2}
        <span className="text-[#990011]">
          {dynamicT?.welcomeSection?.funFact?.description?.highlight2}
        </span>
        {dynamicT?.welcomeSection?.funFact?.description?.part3}
      </p>
      <p className="mt-1.5 text-sm italic text-[#7A7574]">
        {dynamicT?.welcomeSection?.funFact?.footer}
      </p>
      {/* dynamic content ends here */}
      
      <CommunityPresence />
    </div>
  )
}

export default WelcomeSection
