import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const WorkshopCard = ({
  slide,
  onCtaClick,
  variant = "card",
  className = "",
}) => {
  const { t } = useLanguage()
  const isCarousel = variant === "carousel"
  const isHorizontal = variant === "horizontal"

  const handleClick = () => onCtaClick(slide.modal || "development")

  return (
    <div
      className={`group flex w-full cursor-pointer overflow-hidden border-y border-x-0 md:border border-border bg-white shadow-sm dark:border-[#3F3F3F] dark:bg-[#1A1A1A] ${
        isCarousel
          ? "relative aspect-video justify-center flex-col"
          : isHorizontal
            ? "flex-col md:flex-row items-stretch"
            : "flex-col"
      } ${className}`}
      onClick={handleClick}
    >
      <div
        className={
          isCarousel
            ? "absolute inset-0"
            : isHorizontal
              ? "w-full md:w-1/2 aspect-video md:aspect-auto overflow-hidden shrink-0"
              : "aspect-video overflow-hidden shrink-0"
        }
      >
        <img
          src={slide.image}
          alt={slide.title || "Workshop"}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      {isCarousel && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />
      )}

      <div
        className={`flex flex-col items-start gap-2 p-4 ${
          isCarousel
            ? "relative z-10 text-white"
            : isHorizontal
              ? "flex-1 md:p-8 md:gap-4 justify-center"
              : "flex-1"
        }`}
      >
        <h3
          className={`font-bold line-clamp-2 text-gray-900 dark:text-white ${
            isHorizontal ? "text-base md:text-2xl" : "text-base"
          }`}
        >
          {slide.title || t?.workshops?.heroCarousel?.comingSoonTitle}
        </h3>

        {slide.subtext && (
          <p
            className={`text-sm ${
              isHorizontal ? "line-clamp-2 md:line-clamp-3" : "line-clamp-2"
            } ${
              isCarousel
                ? "text-white/80"
                : "text-secondary dark:text-neutral-400"
            }`}
          >
            {slide.subtext}
          </p>
        )}

        {slide.cta && (
          <div className="mt-auto">
            <PillButton
              bgColor="#FFD700"
              textColor="#990011"
              className="[&>div]:font-bold"
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
            >
              {slide.cta}
            </PillButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkshopCard
