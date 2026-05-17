import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import ChinaWorkshopModal from "./modals/ChinaWorkshopModal"
import HskWorkshopModal from "./modals/HskWorkshopModal"
import { getWorkshopSlides } from "../data/workshopSlides"
import WorkshopCard from "./WorkshopCard"
import colors from "@/shared/utils/colors"

const WorkshopCarousel = ({ slides: propSlides = [], hideTitle = false }) => {
  const { lang } = useParams()
  const { t } = useLanguage()
  const [modalType, setModalType] = useState(null) // 'china' or 'development'
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get slides from data utility
  const slides = getWorkshopSlides(t, lang, propSlides)

  if (slides.length === 0) return null

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < slides.length - 1

  const goPrev = () => {
    if (canGoPrev) setCurrentIndex((i) => i - 1)
  }

  const goNext = () => {
    if (canGoNext) setCurrentIndex((i) => i + 1)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="relative z-10 flex w-full items-center justify-between mb-2">
        {!hideTitle && (
          <h2
            className="text-xl font-bold"
            style={{ color: colors?.headingColor || "#111827" }}
          >
            {t?.workshops?.title || "Workshops"}
          </h2>
        )}
        {hideTitle && <div />}
      </div>

      {/* Single full-width carousel slide */}
      <div className="overflow-hidden py-10 -my-10 px-4 -mx-4">
        <AnimatePresence mode="wait">
          <FluentAnimation
            key={currentIndex}
            animationKey={currentIndex}
            direction="none"
            duration={0.15}
            exit={true}
            className="w-full"
          >
            <WorkshopCard
              slide={slides[currentIndex]}
              onCtaClick={setModalType}
            />
          </FluentAnimation>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 h-2 bg-[#990011]"
                  : "w-2 h-2 bg-[#C6C6C6] hover:bg-[#999]"
              }`}
            />
          ))}
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

      <InDevelopmentModal
        open={modalType === "development"}
        onCancel={() => setModalType(null)}
      />
    </div>
  )
}

export default WorkshopCarousel
