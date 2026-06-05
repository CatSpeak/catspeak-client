import React, { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Three-filter tags bar supporting For You feed and active/past challenges dropdowns with full i18n support.
 * 
 * @param {{
 *   activeFilter: 'foryou' | 'active' | 'past',
 *   selectedChallenge: any,
 *   activeChallenges: any[],
 *   pastChallenges: any[],
 *   onSelectFilter: (filterType: 'foryou' | 'active' | 'past', challenge: any) => void
 * }} props
 */
const ReelTagBar = React.memo(function ReelTagBar({
  activeFilter,
  selectedChallenge,
  activeChallenges = [],
  pastChallenges = [],
  onSelectFilter,
}) {
  const { t } = useLanguage()
  const [openDropdown, setOpenDropdown] = useState(null) // 'active' | 'past' | null
  const containerRef = useRef(null)

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleFilterClick = (filterType) => {
    if (filterType === "foryou") {
      onSelectFilter("foryou", null)
      setOpenDropdown(null)
    } else if (filterType === "active") {
      setOpenDropdown((prev) => (prev === "active" ? null : "active"))
    } else if (filterType === "past") {
      setOpenDropdown((prev) => (prev === "past" ? null : "past"))
    }
  }

  const handleSelectChallenge = (filterType, challenge) => {
    onSelectFilter(filterType, challenge)
    setOpenDropdown(null)
  }

  // Get active text and icon for Active button
  const getActiveButtonState = () => {
    if (activeFilter === "active") {
      if (selectedChallenge === "all" || !selectedChallenge) {
        return { text: t.catSpeak.reels.allActiveChallenges, icon: "🌟" }
      }
      return {
        text: selectedChallenge.name || selectedChallenge.hashtag || t.catSpeak.reels.activeChallenge,
        icon: "🔥",
      }
    }
    return { text: t.catSpeak.reels.allActiveChallenges, icon: "🌟" }
  }

  // Get active text and icon for Past button
  const getPastButtonState = () => {
    if (activeFilter === "past") {
      if (selectedChallenge === "all_past" || !selectedChallenge) {
        return { text: t.catSpeak.reels.allPastChallenges, icon: "📚" }
      }
      return {
        text: selectedChallenge.name || selectedChallenge.hashtag || t.catSpeak.reels.pastChallenge,
        icon: "🎆",
      }
    }
    return { text: t.catSpeak.reels.allPastChallenges, icon: "📚" }
  }

  const activeBtn = getActiveButtonState()
  const pastBtn = getPastButtonState()

  return (
    <div
      ref={containerRef}
      className="mb-6 flex w-full gap-2 md:gap-3 items-center justify-start z-30"
    >
      {/* For You Tab */}
      <button
        onClick={() => handleFilterClick("foryou")}
        className={`flex-1 max-w-[200px] min-w-0 py-2.5 px-3 rounded-full font-semibold flex justify-center items-center space-x-1.5 transition cursor-pointer text-xs md:text-sm border ${activeFilter === "foryou"
          ? "bg-[#990011] text-white shadow-md hover:bg-[#80000e] border-[#990011]"
          : "bg-white text-gray-600 shadow border-gray-200 hover:bg-gray-50"
          }`}
      >
        <span className="shrink-0">✨</span>
        <span className="truncate">{t.catSpeak.reels.foryou}</span>
      </button>

      {/* Active Challenges Tab */}
      <div className="relative flex-1 max-w-[250px] min-w-0">
        <button
          onClick={() => handleFilterClick("active")}
          className={`w-full py-2.5 px-3 rounded-full font-semibold flex justify-center items-center space-x-1.5 transition cursor-pointer text-xs md:text-sm border ${activeFilter === "active"
            ? "bg-[#990011] text-white shadow-md hover:bg-[#80000e] border-[#990011]"
            : "bg-white text-gray-600 shadow border-gray-200 hover:bg-gray-50"
            }`}
        >
          <span className="shrink-0">{activeBtn.icon}</span>
          <span className="truncate">{activeBtn.text}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 ml-1 transition-transform duration-200 ${openDropdown === "active" ? "rotate-180" : ""
              } ${activeFilter === "active" ? "text-white" : "text-gray-400"}`}
          />
        </button>

        {openDropdown === "active" && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 w-64 max-w-[calc(100vw-32px)] bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden text-sm font-semibold text-gray-700 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div
              onClick={() => handleSelectChallenge("active", "all")}
              className="px-4 py-3 hover:bg-red-50 hover:text-[#990011] cursor-pointer border-b border-gray-50 flex items-center space-x-2"
            >
              <span>🌟</span>
              <span>{t.catSpeak.reels.allActiveChallenges}</span>
            </div>
            {activeChallenges.length > 0 ? (
              activeChallenges.map((challenge) => (
                <div
                  key={challenge.challengeId}
                  onClick={() => handleSelectChallenge("active", challenge)}
                  className="px-4 py-3 hover:bg-red-50 hover:text-[#990011] cursor-pointer border-b border-gray-50 flex items-center space-x-2"
                >
                  <span>🔥</span>
                  <span className="truncate">{challenge.name || challenge.hashtag}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-xs font-normal italic">
                {t.catSpeak.reels.noActiveChallenges}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Past Challenges Tab */}
      <div className="relative flex-1 max-w-[250px] min-w-0">
        <button
          onClick={() => handleFilterClick("past")}
          className={`w-full py-2.5 px-3 rounded-full font-semibold flex justify-center items-center space-x-1.5 transition cursor-pointer text-xs md:text-sm border ${activeFilter === "past"
            ? "bg-[#990011] text-white shadow-md hover:bg-[#80000e] border-[#990011]"
            : "bg-white text-gray-600 shadow border-gray-200 hover:bg-gray-50"
            }`}
        >
          <span className="shrink-0">{pastBtn.icon}</span>
          <span className="truncate">{pastBtn.text}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 ml-1 transition-transform duration-200 ${openDropdown === "past" ? "rotate-180" : ""
              } ${activeFilter === "past" ? "text-white" : "text-gray-400"}`}
          />
        </button>

        {openDropdown === "past" && (
          <div className="absolute top-full right-0 md:right-auto md:left-0 mt-2 w-64 max-w-[calc(100vw-32px)] bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden text-sm font-semibold text-gray-700 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div
              onClick={() => handleSelectChallenge("past", "all_past")}
              className="px-4 py-3 hover:bg-gray-50 hover:text-gray-900 cursor-pointer border-b border-gray-50 flex items-center space-x-2"
            >
              <span>📚</span>
              <span>{t.catSpeak.reels.allPastChallenges}</span>
            </div>
            {pastChallenges.length > 0 ? (
              pastChallenges.map((challenge) => (
                <div
                  key={challenge.challengeId}
                  onClick={() => handleSelectChallenge("past", challenge)}
                  className="px-4 py-3 hover:bg-gray-50 hover:text-gray-900 cursor-pointer border-b border-gray-50 flex items-center space-x-2"
                >
                  <span>🎆</span>
                  <span className="truncate">{challenge.name || challenge.hashtag}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-xs font-normal italic">
                {t.catSpeak.reels.noPastChallenges}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export default ReelTagBar
