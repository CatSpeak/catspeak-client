import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import { IconButton } from "@/shared/components/ui/buttons"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import { getWorkshopSlides } from "../data/workshopSlides"
import ChinaWorkshopModal from "./modals/ChinaWorkshopModal"
import EnglishWorkshopModal from "./modals/EnglishWorkshopModal"
import HskWorkshopModal from "./modals/HskWorkshopModal"
import ScholarshipWorkshopModal from "./modals/ScholarshipWorkshopModal"
import WorkshopCard from "./WorkshopCard"

/**
 * WorkshopCoverflowCarousel
 *
 * Edge-to-edge responsive carousel for workshops:
 * - Clean 1:1 slides without fake clones or duplication.
 * - Same-size cards naturally scaled by items shown at once (3 on desktop, 2 on tablet, 1 on mobile).
 * - Intrinsic height: The carousel card determines the height naturally without height limits.
 * - Accurate indicators: Dots strictly correspond to real scroll positions.
 * - Smart visibility: Arrows and pagination hide automatically when all cards fit on screen.
 * - Next/Prev buttons visible only on hover on desktop (hidden on touch).
 * - Touch drag / swipe with Framer Motion.
 */
const WorkshopCoverflowCarousel = ({ slides: propSlides = [] }) => {
  const { lang } = useParams()
  const { t } = useLanguage()

  const slides = getWorkshopSlides(t, lang, propSlides)
  const rawTotal = slides.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [modalType, setModalType] = useState(null)

  // Track container width to size cards by items shown at once
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth
    return 1200
  })

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    if (el.clientWidth) {
      setContainerWidth(el.clientWidth)
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setContainerWidth(Math.round(entry.contentRect.width))
        }
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Preload all workshop slide images upfront
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image()
        img.src = slide.image
      }
    })
  }, [slides])

  // Responsive items per view based on container width and total slides
  const isMobile = containerWidth < 768

  const itemsPerView = useMemo(() => {
    if (isMobile) return 1
    if (containerWidth < 1024) return Math.min(rawTotal, 2)
    // Desktop: 2 items if rawTotal === 2, otherwise 3
    if (rawTotal === 2) return 2
    return 3
  }, [isMobile, containerWidth, rawTotal])

  // Maximum scrollable index so cards do not scroll into empty whitespace
  const maxIndex = useMemo(() => {
    return Math.max(0, rawTotal - itemsPerView)
  }, [rawTotal, itemsPerView])

  // Reset index when language or slide count changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [rawTotal, lang])

  // Clamp index if viewport resize decreases maxIndex
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex))
  }, [maxIndex])

  // Padding & gap in px:
  // Mobile: 0px padding and 0px gap for full-bleed edge-to-edge
  // Desktop/Tablet: 16px lateral padding (px-4) & 8px gap (gap-2)
  const edgePadding = isMobile ? 0 : 16
  const gap = isMobile ? 0 : 8

  // Exact same-size card width:
  // Visible window width minus left/right edge padding and gaps between visible items
  const cardWidth = useMemo(() => {
    if (!containerWidth) return 0
    const totalGaps = (itemsPerView - 1) * gap
    const totalPadding = edgePadding * 2
    return Math.max(
      0,
      (containerWidth - totalPadding - totalGaps) / itemsPerView,
    )
  }, [containerWidth, itemsPerView, gap, edgePadding])

  const stepWidth = cardWidth + gap
  const canScroll = maxIndex > 0

  const goPrev = useCallback(() => {
    if (!canScroll) return
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [canScroll, maxIndex])

  const goNext = useCallback(() => {
    if (!canScroll) return
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [canScroll, maxIndex])

  const goToSlide = useCallback(
    (index) => {
      setCurrentIndex(Math.min(index, maxIndex))
    },
    [maxIndex],
  )

  // Auto-play timer (active only when there are more items to scroll through)
  useEffect(() => {
    if (isHovered || !canScroll) return

    const timer = setInterval(() => {
      goNext()
    }, 5000)

    return () => clearInterval(timer)
  }, [isHovered, canScroll, goNext])

  if (!slides.length) return null

  const xOffset = -currentIndex * stepWidth

  return (
    <>
      {/* ─── CASE 1: Single Workshop Spotlight (rawTotal === 1) ─── */}
      {rawTotal === 1 ? (
        <div className="relative w-full select-none px-0 md:px-4">
          <div className="w-full max-w-5xl mx-auto">
            <WorkshopCard
              slide={slides[0]}
              variant="horizontal"
              className="rounded-none md:rounded-xl"
              onCtaClick={(type) => setModalType(type)}
            />
          </div>
        </div>
      ) : (
        /* ─── CASE 2: Edge-to-Edge Responsive Carousel / Grid ─── */
        <div
          className="relative w-full select-none group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Carousel Track Container (no fixed height limit; height decided naturally by cards) */}
          <div ref={containerRef} className="relative w-full overflow-hidden">
            <motion.div
              className={`flex items-stretch ${
                isMobile ? "gap-0 px-0" : "gap-2 px-4"
              }`}
              drag={canScroll ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                const threshold = 40
                if (info.offset.x < -threshold) {
                  goNext()
                } else if (info.offset.x > threshold) {
                  goPrev()
                }
              }}
              animate={{ x: xOffset }}
              transition={{
                duration: 0.5,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              {slides.map((slide, idx) => (
                <div
                  key={slide.id ? `${slide.id}-${idx}` : idx}
                  style={{ width: cardWidth ? `${cardWidth}px` : "100%" }}
                  className="shrink-0 flex flex-col"
                >
                  <WorkshopCard
                    slide={slide}
                    className="h-full rounded-none md:rounded-xl"
                    onCtaClick={(type) => setModalType(type)}
                  />
                </div>
              ))}
            </motion.div>

            {/* Navigation Arrows: visible on hover on desktop only when scrollable */}
            {canScroll && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  title="Previous workshop"
                  variant="secondary"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 shadow-md backdrop-blur-md hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  title="Next workshop"
                  variant="secondary"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 shadow-md backdrop-blur-md hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}
          </div>

          {/* Pagination Indicators (only displayed when there are pages to scroll through) */}
          {canScroll && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToSlide(index)
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === index
                      ? "w-8 h-2 bg-cath-red-700 dark:bg-red-400"
                      : "w-2 h-2 bg-gray-300 dark:bg-neutral-600 hover:bg-gray-400 dark:hover:bg-neutral-500"
                  }`}
                  aria-label={`Go to workshop slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Shared Modals ─── */}
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

export default WorkshopCoverflowCarousel
