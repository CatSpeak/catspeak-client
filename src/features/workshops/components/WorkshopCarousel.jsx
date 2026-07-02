import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation";
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal";
import ChinaWorkshopModal from "./modals/ChinaWorkshopModal";
import HskWorkshopModal from "./modals/HskWorkshopModal";
import EnglishWorkshopModal from "./modals/EnglishWorkshopModal";
import ScholarshipWorkshopModal from "./modals/ScholarshipWorkshopModal";
import { getWorkshopSlides } from "../data/workshopSlides";
import WorkshopCard from "./WorkshopCard";
import colors from "@/shared/utils/colors";

const WorkshopCarousel = ({
  slides: propSlides = [],
  hideTitle = false,
  leftContent,
}) => {
  const { lang } = useParams();
  const { t } = useLanguage();
  const [modalType, setModalType] = useState(null); // 'china' or 'development'
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);

  // Get slides from data utility
  const slides = getWorkshopSlides(t, lang, propSlides);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
    setDirection(0);
  }, [lang]);

  const safeIndex = ((page % slides.length) + slides.length) % slides.length;

  const [isHovered, setIsHovered] = useState(false);
  const autoPlay = true;
  const interval = 5000;

  const goPrev = useCallback(() => {
    setDirection(-1);
    setPage((prev) => prev - 1);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setPage((prev) => prev + 1);
  }, []);

  const goToSlide = (index) => {
    setDirection(index > safeIndex ? 1 : -1);
    setPage((prev) => prev - safeIndex + index);
  };

  useEffect(() => {
    if (autoPlay && !isHovered && slides.length > 1) {
      const timer = setInterval(goNext, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, isHovered, slides.length, goNext, interval]);

  if (slides.length === 0) return null;

  const carouselContent = (
    <div
      className="relative w-full flex flex-col select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md aspect-auto min-h-[200px] flex-1">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={{
              enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0.9 }),
              center: { x: 0, opacity: 1, zIndex: 1 },
              exit: (dir) => ({
                x: dir < 0 ? "100%" : "-100%",
                opacity: 0.9,
                zIndex: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 w-full h-full flex-shrink-0 relative overflow-hidden"
          >
            <WorkshopCard slide={slides[safeIndex]} onCtaClick={setModalType} />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md text-[#990011] transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} strokeWidth={2.5} className="ml-[-2px]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md text-[#990011] transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight size={24} strokeWidth={2.5} className="mr-[-2px]" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="hidden sm:flex items-center justify-center gap-2 mt-6 mb-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === safeIndex
                  ? "w-8 h-2.5 bg-[#990011]"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={
        leftContent
          ? "pl-4 w-full relative overflow-visible pb-6 min-h-[320px] flex flex-col shadow-sm"
          : "w-full"
      }
    >
      {/* Header */}
      {!leftContent && (
        <div className="relative z-10 flex w-full items-center justify-between mb-2">
          {!hideTitle && (
            <h2
              className="text-xl font-bold"
              style={{ color: colors?.headingColor || "#111827" }}
            >
              {t?.workshops?.title || "Workshops"}
            </h2>
          )}
        </div>
      )}

      {leftContent ? (
        <div className="grid grid-cols-12 flex-1 min-h-[280px]">
          {leftContent}
          <div className="col-span-12 md:col-span-6 flex items-center justify-start p-6 md:p-8 md:pl-0 relative overflow-hidden group">
            {carouselContent}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden py-10 -my-10 px-4 -mx-4">
          <div className="w-full relative rounded-2xl overflow-hidden shadow-lg border border-[#e5e5e5]">
            {carouselContent}
          </div>
        </div>
      )}

      <ChinaWorkshopModal
        open={modalType === "china"}
        onClose={() => setModalType(null)}
        t={t}
      />

      <HskWorkshopModal
        open={modalType === "hsk"}
        onClose={() => setModalType(null)}
        t={t}
      />

      <EnglishWorkshopModal
        open={modalType === "english"}
        onClose={() => setModalType(null)}
        t={t}
      />

      <ScholarshipWorkshopModal
        open={modalType === "scholarship"}
        onClose={() => setModalType(null)}
        t={t}
      />

      <InDevelopmentModal
        open={modalType === "development"}
        onCancel={() => setModalType(null)}
      />
    </div>
  );
};

export default WorkshopCarousel;
