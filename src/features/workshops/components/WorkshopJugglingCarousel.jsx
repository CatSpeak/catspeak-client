import { useCallback, useEffect, useState } from "react"

import { useLanguage } from "@/shared/context/LanguageContext"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useParams } from "react-router-dom"

import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import { getWorkshopSlides } from "../data/workshopSlides"
import ChinaWorkshopModal from "./modals/ChinaWorkshopModal"
import EnglishWorkshopModal from "./modals/EnglishWorkshopModal"
import HskWorkshopModal from "./modals/HskWorkshopModal"
import ScholarshipWorkshopModal from "./modals/ScholarshipWorkshopModal"
import WorkshopCard from "./WorkshopCard"
import { IconButton } from "@/shared/components/ui/buttons"

/**
 * Saved legacy juggling/coverflow carousel animation.
 * Preserved for reuse or reverting if desired.
 */
const WorkshopJugglingCarousel = ({ slides: propSlides = [] }) => {
  const { lang } = useParams()
  const { t } = useLanguage()

  const slides = getWorkshopSlides(t, lang, propSlides)

  const [page, setPage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [modalType, setModalType] = useState(null)

  const total = slides.length
  const safeIndex = total > 0 ? ((page % total) + total) % total : 0

  const goPrev = useCallback(() => {
    setPage((prev) => prev - 1)
  }, [])

  const goNext = useCallback(() => {
    setPage((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (isHovered || total <= 1) return

    const timer = setInterval(() => {
      goNext()
    }, 5000)

    return () => clearInterval(timer)
  }, [isHovered, total, goNext])

  if (!slides.length) return null

  const getShortestOffset = (idx) => {
    let diff = idx - safeIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

  const getStyleForOffset = (diff) => {
    if (diff === 0) {
      return { x: "-50%", scale: 1.05, opacity: 1, zIndex: 20 }
    }
    if (diff === -1) {
      return { x: "-146%", scale: 0.79, opacity: 0.7, zIndex: 10 }
    }
    if (diff === 1) {
      return { x: "46%", scale: 0.79, opacity: 0.7, zIndex: 10 }
    }
    if (diff < -1) {
      // các thẻ ở xa bên trái, để ngoài màn hình, chờ trượt vào
      return { x: "-260%", scale: 0.7, opacity: 0, zIndex: 0 }
    }
    // diff > 1: các thẻ ở xa bên phải
    return { x: "160%", scale: 0.7, opacity: 0, zIndex: 0 }
  }

  return (
    <>
      <div
        className="relative w-full select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-[290px] sm:h-[290px] md:h-[300px] lg:h-[350px] xl:h-[450px] 2xl:h-[550px] overflow-hidden">
          {slides.map((slide, idx) => {
            const diff = getShortestOffset(idx)
            const style = getStyleForOffset(diff)
            const isInteractive = diff === -1 || diff === 1

            return (
              <motion.div
                key={slide.id ?? idx}
                className="absolute top-1/2 w-[82%] sm:w-[65%] md:w-[52%] lg:w-[42%] xl:w-[38%] max-w-full"
                style={{
                  left: "50%",
                  top: "50%",
                  pointerEvents: Math.abs(diff) > 1 ? "none" : "auto",
                  cursor: isInteractive ? "pointer" : "default",
                }}
                animate={{
                  x: style.x,
                  y: "-50%",
                  scale: style.scale,
                  opacity: style.opacity,
                  zIndex: style.zIndex,
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.32, 0.72, 0, 1],
                }}
                onClick={() => {
                  if (diff === -1) {
                    goPrev()
                  } else if (diff === 1) {
                    goNext()
                  }
                }}
              >
                <WorkshopCard
                  slide={slide}
                  onCtaClick={(type) => setModalType(type)}
                />
              </motion.div>
            )
          })}

          <IconButton
            onClick={goPrev}
            title="Previous workshop"
            variant="secondary"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40"
          >
            <ChevronLeft />
          </IconButton>

          <IconButton
            onClick={goNext}
            title="Next workshop"
            variant="secondary"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40"
          >
            <ChevronRight />
          </IconButton>
        </div>
      </div>

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
    </>
  )
}

export default WorkshopJugglingCarousel

