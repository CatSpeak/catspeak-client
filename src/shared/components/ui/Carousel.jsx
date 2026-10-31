import React, { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import useScrollLock from "@/shared/hooks/useScrollLock"

/**
 * A custom-built carousel component with smooth transitions and premium feel.
 * Adheres to Material 3 Shape tokens (rounded-3xl for hero carousel containers).
 *
 * @param {Object} props
 * @param {Array<Object>} [props.items] - Generic items array for custom slide rendering
 * @param {Array<{url: string, alt?: string}>} [props.images] - Array of image objects (backward compatibility)
 * @param {Function} [props.renderItem] - Render prop: (item, index, helpers) => React.ReactNode
 * @param {string} [props.className] - Additional class names for the image/slide container
 * @param {string} [props.containerClassName] - Class names for the outermost wrapper
 * @param {string} [props.indicatorClassName] - Additional class names for indicator container
 * @param {boolean} [props.autoPlay] - Whether to automatically rotate images (default true)
 * @param {number} [props.interval] - Duration in ms for auto-rotation (default 5000)
 * @param {number} [props.gap] - Gap in px between sliding items (default 16)
 * @param {string} [props.objectFit] - "cover" | "contain" (default "cover")
 * @param {boolean} [props.allowFullscreen] - Whether to allow clicking images for fullscreen view (default true)
 * @param {boolean} [props.showIndicators] - Whether to show pagination dots (default true)
 * @param {boolean} [props.lockToFirstImage] - Whether to lock aspect ratio to first image dimensions (default false)
 * @param {string} [props.rounded] - Default rounded class if not provided in className (default "rounded-3xl")
 */
const Carousel = ({
  items,
  images = [],
  renderItem,
  className = "",
  containerClassName = "",
  indicatorClassName = "",
  autoPlay = true,
  interval = 5000,
  gap = 16,
  objectFit = "cover",
  allowFullscreen = true,
  showIndicators = true,
  lockToFirstImage = false,
  rounded = "rounded-3xl",
}) => {
  const slides = items && items.length > 0 ? items : images
  const totalSlides = slides?.length || 0

  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [firstAspectRatio, setFirstAspectRatio] = useState(null)

  useScrollLock(isFullscreen)

  useEffect(() => {
    if (!lockToFirstImage || !slides[0]?.url) return
    let isMounted = true
    const img = new Image()
    img.src = slides[0].url
    img.onload = () => {
      if (isMounted && img.naturalWidth && img.naturalHeight) {
        // Clamp aspect ratio between 0.8 (4:5 vertical) and 2.2 (wide) to maintain clean card layout
        const rawRatio = img.naturalWidth / img.naturalHeight
        const clampedRatio = Math.max(0.8, Math.min(2.2, rawRatio))
        setFirstAspectRatio(clampedRatio)
      }
    }
    return () => {
      isMounted = false
    }
  }, [lockToFirstImage, slides])

  const currentIndex =
    totalSlides > 0 ? ((page % totalSlides) + totalSlides) % totalSlides : 0

  const nextSlide = useCallback(() => {
    setDirection(1)
    setPage((prev) => prev + 1)
  }, [])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setPage((prev) => prev - 1)
  }, [])

  const goToSlide = useCallback(
    (index) => {
      setDirection(index > currentIndex ? 1 : -1)
      setPage((prev) => prev - currentIndex + index)
    },
    [currentIndex],
  )

  useEffect(() => {
    if (autoPlay && !isHovered && !isFullscreen && totalSlides > 1) {
      const timer = setInterval(nextSlide, interval)
      return () => clearInterval(timer)
    }
  }, [autoPlay, isHovered, isFullscreen, totalSlides, nextSlide, interval])

  if (!slides || totalSlides === 0) return null

  const resolvedRoundedClass = className.includes("rounded") ? "" : rounded

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm select-none group flex flex-col overflow-hidden"
          : `relative w-full flex flex-col select-none group ${containerClassName}`
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Close Fullscreen Button */}
      {isFullscreen && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFullscreen(false)
          }}
          className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close fullscreen"
        >
          <X size={24} />
        </button>
      )}

      {/* Slide / Image Container */}
      <div
        className={`relative w-full overflow-hidden ${
          isFullscreen
            ? "h-full flex-1"
            : `${resolvedRoundedClass} ${className}`
        }`}
        style={
          !isFullscreen && firstAspectRatio
            ? { aspectRatio: `${firstAspectRatio}` }
            : undefined
        }
      >
        {/* Slides (Sliding Effect with Framer Motion) */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <Motion.div
            key={page}
            custom={direction}
            variants={{
              enter: (dir) => ({
                x: dir > 0 ? `calc(100% + ${gap}px)` : `calc(-100% - ${gap}px)`,
                opacity: 1,
              }),
              center: { x: 0, opacity: 1, zIndex: 1 },
              exit: (dir) => ({
                x: dir < 0 ? `calc(100% + ${gap}px)` : `calc(-100% - ${gap}px)`,
                opacity: 1,
                zIndex: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 w-full h-full flex-shrink-0 overflow-hidden"
          >
            {renderItem ? (
              renderItem(slides[currentIndex], currentIndex, {
                isFullscreen,
                goToSlide,
                nextSlide,
                prevSlide,
              })
            ) : (
              <>
                {/* Only contained images expose space that needs a background. */}
                {(isFullscreen || objectFit === "contain") &&
                  slides[currentIndex]?.url && (
                    <div
                      className="absolute inset-0 z-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
                      style={{
                        backgroundImage: `url(${slides[currentIndex].url})`,
                      }}
                    />
                  )}
                {/* Main Image */}
                {slides[currentIndex]?.url && (
                  <img
                    src={slides[currentIndex].url}
                    alt={slides[currentIndex].alt || `Slide ${currentIndex}`}
                    onClick={() =>
                      allowFullscreen && !isFullscreen && setIsFullscreen(true)
                    }
                    className={`relative z-10 w-full h-full transition-all duration-300 ${
                      isFullscreen
                        ? "object-contain cursor-default"
                        : `${allowFullscreen ? "cursor-pointer" : "cursor-default"} ${
                            objectFit === "contain"
                              ? "object-contain"
                              : "object-cover"
                          }`
                    }`}
                  />
                )}
                {/* Subtle overlay */}
                <div className="absolute inset-0 z-20 bg-black/5 pointer-events-none" />
              </>
            )}
          </Motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevSlide()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-md shadow-md text-cath-red-800 dark:text-cath-red-400 transition-all duration-300 hover:bg-white dark:hover:bg-neutral-800 hover:scale-105 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} strokeWidth={2.5} className="ml-[-2px]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextSlide()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-md shadow-md text-cath-red-800 dark:text-cath-red-400 transition-all duration-300 hover:bg-white dark:hover:bg-neutral-800 hover:scale-105 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight size={24} strokeWidth={2.5} className="mr-[-2px]" />
            </button>
          </>
        )}
      </div>

      {/* Desktop Indicators (Under the slide, centered) */}
      {showIndicators && !isFullscreen && totalSlides > 1 && (
        <div
          className={`hidden sm:flex items-center justify-center gap-2 mt-4 ${indicatorClassName}`}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? "w-8 h-2 bg-cath-red-700"
                  : "w-2 h-2 bg-gray-300 dark:bg-neutral-600 hover:bg-gray-400 dark:hover:bg-neutral-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
