import React, { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * A custom-built carousel component with smooth transitions and premium feel.
 * @param {Object} props
 * @param {Array<{url: string, alt?: string}>} props.images - Array of image objects
 * @param {string} props.className - Additional class names for the container
 * @param {boolean} props.autoPlay - Whether to automatically rotate images
 * @param {number} props.interval - Duration in ms for auto-rotation
 * @param {boolean} props.showIndicators - Whether to show pagination dots (default true)
 */
const Carousel = ({
  images = [],
  className = "",
  autoPlay = true,
  interval = 5000,
  objectFit = "cover",
  allowFullscreen = true,
  showIndicators = true,
}) => {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentIndex = ((page % images.length) + images.length) % images.length

  const nextSlide = useCallback(() => {
    setDirection(1)
    setPage((prev) => prev + 1)
  }, [])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setPage((prev) => prev - 1)
  }, [])

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setPage((prev) => prev - currentIndex + index)
  }

  useEffect(() => {
    if (autoPlay && !isHovered && !isFullscreen && images.length > 1) {
      const timer = setInterval(nextSlide, interval)
      return () => clearInterval(timer)
    }
  }, [autoPlay, isHovered, isFullscreen, images.length, nextSlide, interval])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFullscreen])

  if (!images || images.length === 0) return null

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm select-none group flex flex-col overflow-hidden"
          : "relative w-full flex flex-col select-none group"
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* Image Container */}
      <div className={`relative w-full overflow-hidden ${isFullscreen ? "h-full flex-1" : `rounded-2xl ${className}`}`}>
        {/* Slides (Sliding Effect with Framer Motion) */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={{
              enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0.9 }),
              center: { x: 0, opacity: 1, zIndex: 1 },
              exit: (dir) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0.9, zIndex: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 w-full h-full flex-shrink-0 relative overflow-hidden"
          >
            {/* Blurred Background Image */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
              style={{ backgroundImage: `url(${images[currentIndex].url})` }}
            />
            {/* Main Image */}
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || `Slide ${currentIndex}`}
              onClick={() => allowFullscreen && !isFullscreen && setIsFullscreen(true)}
              className={`relative z-10 w-full h-full transition-all duration-300 ${
                isFullscreen
                  ? "object-contain cursor-default"
                  : `${allowFullscreen ? "cursor-pointer" : "cursor-default"} ${objectFit === "contain" ? "object-contain" : "object-cover"}`
              }`}
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 z-20 bg-black/5 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevSlide()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/60 backdrop-blur-md shadow-md text-cath-red-800 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} strokeWidth={2.5} className="ml-[-2px]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextSlide()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/60 backdrop-blur-md shadow-md text-cath-red-800 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={24} strokeWidth={2.5} className="mr-[-2px]" />
          </button>
        </>
      )}
      </div>

      {/* Desktop Indicators (Under the slide, centered) */}
      {showIndicators && !isFullscreen && images.length > 1 && (
        <div className="hidden sm:flex items-center justify-center gap-2 mt-6">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? "w-8 h-2.5 bg-cath-red-700"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
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
