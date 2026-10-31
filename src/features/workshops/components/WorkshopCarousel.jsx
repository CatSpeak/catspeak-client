import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import Carousel from "@/shared/components/ui/Carousel"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import ChinaWorkshopModal from "./modals/ChinaWorkshopModal"
import HskWorkshopModal from "./modals/HskWorkshopModal"
import EnglishWorkshopModal from "./modals/EnglishWorkshopModal"
import ScholarshipWorkshopModal from "./modals/ScholarshipWorkshopModal"
import { getWorkshopSlides } from "../data/workshopSlides"
import WorkshopCard from "./WorkshopCard"

const WorkshopCarousel = ({ slides: propSlides = [], hideTitle = false }) => {
  const { lang } = useParams()
  const { t } = useLanguage()
  const [modalType, setModalType] = useState(null) // 'china' | 'hsk' | 'english' | 'scholarship' | 'development'

  // Get slides from data utility
  const slides = getWorkshopSlides(t, lang, propSlides)

  if (!slides || slides.length === 0) return null

  return (
    <div className="w-full">
      {/* Header */}
      {!hideTitle && (
        <div className="relative z-10 flex w-full items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t?.workshops?.title || "Workshops"}
          </h2>
        </div>
      )}

      {/* Hero Carousel */}
      <Carousel
        key={lang}
        items={slides}
        className="aspect-video rounded-2xl min-h-[200px]"
        indicatorClassName="mb-2"
        autoPlay
        interval={5000}
        gap={8}
        allowFullscreen={false}
        renderItem={(slide) => (
          <WorkshopCard slide={slide} onCtaClick={setModalType} />
        )}
      />

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
  )
}

export default WorkshopCarousel
