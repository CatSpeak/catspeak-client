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
      className={`group flex w-full cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-white shadow-sm dark:border-[#3F3F3F] dark:bg-[#1A1A1A] [isolation:isolate] transition-colors duration-200 ease-out hover:bg-[#F2F2F2] dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] ${
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
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none">
          <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/15 transition-colors duration-200 ease-out" />
        </div>
      )}

      <div
        className={`flex flex-col ${
          isCarousel
            ? "relative z-10 p-4 items-start text-left sm:justify-center gap-3 sm:gap-4 bg-transparent sm:bg-transparent sm:dark:bg-transparent sm:h-full"
            : isHorizontal
              ? "flex-1 md:p-8 md:gap-4 justify-center"
              : "flex-1 p-4"
        }`}
      >
        <div
          className={`flex flex-col gap-1 w-full min-h-[58px] sm:min-h-0 items-start text-left ${
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
              className={`line-clamp-2 sm:line-clamp-3 text-left ${
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
