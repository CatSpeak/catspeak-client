import React from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const WorkshopCard = ({ slide, onCtaClick }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      className="relative flex w-full flex-col overflow-hidden rounded-xl bg-black/5 max-[425px]:bg-white max-[425px]:border max-[425px]:border-[#e5e5e5] max-[425px]:shadow-sm group aspect-video max-[425px]:aspect-auto cursor-pointer"
      onClick={() => onCtaClick(slide.modal || "development")}
    >
      <div className="absolute inset-0 max-[425px]:relative max-[425px]:aspect-video max-[425px]:w-full">
        <img
          src={slide.image}
          alt={slide.title || "Workshop Image"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Vertical gradient overlay (darker at bottom) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none max-[425px]:hidden" />

        {/* Horizontal subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none max-[425px]:hidden" />
      </div>

      {/* Content Section overlaying the image */}
      <div className="absolute inset-0 max-[425px]:relative flex flex-col justify-center p-4 sm:p-6 text-white max-[425px]:text-gray-900 text-left">
        <div className="flex flex-col gap-6 max-[425px]:gap-3">
          <h3 className="text-[32px] max-[425px]:text-base leading-tight font-bold drop-shadow-lg max-[425px]:drop-shadow-none line-clamp-1 max-[425px]:line-clamp-2">
            {slide.title || t?.workshops?.heroCarousel?.comingSoonTitle}
          </h3>
          {slide.subtext && (
            <p className="text-[16px] max-[425px]:text-sm text-gray-200 max-[425px]:text-gray-600 drop-shadow-md max-[425px]:drop-shadow-none line-clamp-2">
              {slide.subtext}
            </p>
          )}

          <div>
            <PillButton
              onClick={(e) => {
                e.stopPropagation()
                onCtaClick(slide.modal || "development")
              }}
              bgColor="#f5c518"
              textColor="#990011"
              className="h-10 px-6"
            >
              {slide.cta}
            </PillButton>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkshopCard
