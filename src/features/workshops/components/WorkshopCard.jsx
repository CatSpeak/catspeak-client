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
      <div className={`absolute inset-x-0 ${slide.isCompactHeight ? 'bottom-[4%] h-[55%] md:h-[65%]' : 'bottom-[10%] h-[50%] md:h-[58%]'} max-sm:bottom-auto max-sm:top-[58%] max-sm:-translate-y-1/2 max-sm:h-auto flex flex-col justify-center px-[15%] sm:px-[3%] text-white max-sm:text-center text-left w-full`}>
        <div className="flex flex-col gap-1 sm:gap-[1.5cqw]">
          <h3 className={`${slide.isCompactHeight ? 'text-[clamp(14px,4cqw,36px)]' : 'text-[clamp(15px,4.5cqw,42px)]'} leading-tight font-bold drop-shadow-lg line-clamp-2`}>
            {slide.title || t?.workshops?.heroCarousel?.comingSoonTitle}
          </h3>
          {slide.subtext && (
            <p className={`max-sm:hidden ${slide.isCompactHeight ? 'text-[clamp(10px,1.5cqw,18px)] line-clamp-3' : 'text-[clamp(10px,2cqw,22px)] line-clamp-2'} text-gray-100 drop-shadow-md font-medium`}>
              {slide.subtext}
            </p>
          )}

          <div className="hidden sm:block mt-[1.5cqw]">
            <PillButton
              bgColor="#FFD700"
              textColor="#990011"
              className="[&>div]:font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onCtaClick(slide.modal || "development");
              }}
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
