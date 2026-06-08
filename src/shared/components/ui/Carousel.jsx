import React, { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * A custom-built carousel component with smooth transitions and premium feel.
 * @param {Object} props
 * @param {Array<{url: string, alt?: string}>} props.images - Array of image objects
 * @param {string} props.className - Additional class names for the container
 * @param {boolean} props.autoPlay - Whether to automatically rotate images
 * @param {number} props.interval - Duration in ms for auto-rotation
 */
const Carousel = ({
  images = [],
  className = "",
  autoPlay = true,
  interval = 5000,
  objectFit = "cover",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    )
  }, [images.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    )
  }, [images.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (autoPlay && !isHovered && images.length > 1) {
      const timer = setInterval(nextSlide, interval)
      return () => clearInterval(timer)
    }
  }, [autoPlay, isHovered, images.length, nextSlide, interval])

  if (!images || images.length === 0) return null

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden group select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides (Sliding Effect) */}
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <img
              src={image.url}
              alt={image.alt || `Slide ${index}`}
              className={`w-full h-full ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
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
