import React from "react"
import { ChevronRight } from "lucide-react"
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
      className={`group relative flex w-full cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-white shadow-sm dark:border-darkBorder dark:bg-[#1A1A1A] [isolation:isolate] transition-colors duration-200 ease-m3-expressive-default-effects hover:bg-[#F2F2F2] dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] ${
        isCarousel
          ? "relative flex-col sm:aspect-video sm:h-full"
          : isHorizontal
            ? "flex-col md:flex-row items-stretch"
            : "flex-col"
      } ${className}`}
      onClick={handleClick}
    >
      <div
        className={
          isCarousel
            ? "relative w-full aspect-video overflow-hidden shrink-0 sm:absolute sm:inset-0 sm:aspect-auto"
            : isHorizontal
              ? "relative w-full md:w-1/2 aspect-video md:aspect-auto overflow-hidden shrink-0"
              : "relative aspect-video overflow-hidden shrink-0"
        }
      >
        <img
          src={slide.image}
          alt={slide.title || "Workshop"}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover blur-sm"
        />
        {isCarousel && (
          <div className="hidden sm:block absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
            {/* Hover overlay: slightly darker and longer reach, smoothly fades in */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 via-55% to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-m3-expressive-default-spatial" />
          </div>
        )}
      </div>

      <div
        className={`flex flex-col ${
          isCarousel
            ? "relative z-10 p-4 items-start text-left sm:justify-center gap-2 sm:gap-4 bg-transparent sm:bg-transparent sm:dark:bg-transparent sm:h-full"
            : isHorizontal
              ? "flex-1 md:p-8 md:gap-4 justify-center"
              : "flex-1 p-4"
        }`}
      >
        <div
          className={`flex flex-col gap-2 w-full min-h-[58px] sm:min-h-0 items-start text-left ${
            isCarousel ? "sm:max-w-2xl" : ""
          }`}
        >
          <h3
            className={`font-bold line-clamp-1 sm:line-clamp-2 text-left ${
              isCarousel
                ? "text-base sm:text-xl md:text-2xl text-gray-900 dark:text-white sm:text-white"
                : isHorizontal
                  ? "text-base md:text-2xl text-gray-900 dark:text-white"
                  : "text-base text-gray-900 dark:text-white"
            }`}
          >
            {slide.title || t?.workshops?.heroCarousel?.comingSoonTitle}
          </h3>

          {slide.subtext && (
            <p
              className={`line-clamp-2 text-left ${
                isCarousel
                  ? "text-xs sm:text-sm md:text-base text-secondary dark:text-neutral-400 sm:text-white/90"
                  : "text-xs text-secondary dark:text-neutral-400"
              }`}
            >
              {slide.subtext}
            </p>
          )}
        </div>

        {slide.cta && (
          <div className={isCarousel ? "mt-1 sm:mt-0 self-start" : "mt-2"}>
            <PillButton
              bgColor="#FFD700"
              textColor="#990011"
              endIcon={<ChevronRight />}
              className="[&>div]:font-bold hover:brightness-105 active:brightness-95 transition-all duration-150"
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
