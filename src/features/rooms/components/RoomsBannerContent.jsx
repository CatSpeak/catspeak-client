import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import doodles from "@/shared/assets/images/communities/doodles.png"
import SessionActionButtons from "./SessionActionButtons"

const RoomsBannerContent = ({ sessionProps }) => {
  const { t } = useLanguage()

  const renderTitle = () => {
    const titleStr = t.rooms?.welcome?.title || "Happy Halloween"
    const firstSpaceIndex = titleStr.indexOf(" ")
    
    if (firstSpaceIndex !== -1) {
      const firstPart = titleStr.slice(0, firstSpaceIndex)
      const secondPart = titleStr.slice(firstSpaceIndex + 1)
      return (
        <span className="flex flex-col gap-2 md:gap-4">
          <span>{firstPart}</span>
          <span className="text-cath-red-700">{secondPart}</span>
        </span>
      )
    }
    return titleStr
  }

  return (
    <div className="col-span-12 md:col-span-6 flex flex-col justify-between px-4 sm:px-8 pt-6 pb-6 md:pr-4 relative z-10">
      {/* Doodle logo */}
      <img src={doodles} alt="Cat Speak doodles" className="relative top-[-20px] md:top-[-30px] w-40 md:w-52 mb-2 md:mb-4 object-contain object-left" />
      
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 font-nunito leading-tight md:leading-relaxed w-full">
            {renderTitle()}
          </h1>
          <p className="text-gray-600 text-base md:text-lg mt-3 md:mt-4 leading-relaxed max-w-full font-nunito">
            {t.rooms?.welcome?.description?.part1 || "Halloween is nominally a "}
            <strong className="text-cath-red-500 font-semibold">{t.rooms?.welcome?.description?.highlight1 || "Christian holiday"}</strong>
            {t.rooms?.welcome?.description?.part2 || " honoring the souls of saints and other souls who have been blessed. It descends from an "}
            <strong className="text-cath-red-500 font-semibold">{t.rooms?.welcome?.description?.highlight2 || "ancient Celtic festival"}</strong>
            {t.rooms?.welcome?.description?.part3 || " of the dead that marked the official end of the growing season."}
          </p>
          <p className="text-gray-500 text-xl md:text-2xl mt-2 font-bold italic font-nunito">{t.rooms?.welcome?.trickOrTreat || "Trick or Treat"}</p>
        </div>

        <div className="-mt-3">
          <SessionActionButtons {...sessionProps} />
        </div>
      </div>
    </div>
  )
}

export default RoomsBannerContent
