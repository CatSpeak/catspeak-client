import React from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import PillButton from "@/shared/components/ui/buttons/PillButton";

const WorkshopCard = ({ slide, onCtaClick }) => {
  const { t } = useLanguage();

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden rounded-xl bg-black/5 group aspect-video cursor-pointer"
      onClick={() => onCtaClick(slide.modal || "development")}
      style={{ containerType: "inline-size" }}
    >
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt={slide.title || "Workshop Image"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Subtle bottom shadow for text readability without darkening the whole image */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Content Section overlaying the image */}
      <div className="absolute inset-x-0 bottom-[10%] h-[50%] md:h-[58%] max-sm:bottom-auto max-sm:top-[58%] max-sm:-translate-y-1/2 max-sm:h-auto flex flex-col justify-center px-[15%] sm:px-[3%] text-white max-sm:text-center text-left w-full">
        <div className="flex flex-col gap-1 sm:gap-[1.5cqw]">
          <h3 className="text-[clamp(15px,4.5cqw,42px)] leading-tight font-bold drop-shadow-lg line-clamp-2">
            {slide.title || t?.workshops?.heroCarousel?.comingSoonTitle}
          </h3>
          {slide.subtext && (
            <p className="max-sm:hidden text-[clamp(10px,2cqw,22px)] text-gray-100 drop-shadow-md line-clamp-2 font-medium">
              {slide.subtext}
            </p>
          )}

          <div className="hidden sm:block mt-[1.5cqw]">
            <PillButton
              onClick={(e) => {
                e.stopPropagation();
                onCtaClick(slide.modal || "development");
              }}
              className="!bg-white !text-[#990011] !border-2 !border-transparent transition-transform duration-300 ease-out h-[clamp(36px,5cqw,56px)] px-[clamp(20px,4cqw,40px)] text-xs sm:text-[clamp(14px,2cqw,22px)] font-bold shadow-lg hover:scale-105 active:scale-95"
            >
              {slide.cta}
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;
