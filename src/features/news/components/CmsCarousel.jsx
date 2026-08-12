import { useState, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CmsCarousel({ images }) {
  const [current, setCurrent] = useState(0)
  const viewportRef = useRef(null)
  const total = images.length

  const goTo = useCallback(
    (idx) => {
      const next = Math.max(0, Math.min(idx, total - 1))
      setCurrent(next)
      const viewport = viewportRef.current
      if (viewport) {
        const child = viewport.children[next]
        if (child) {
          viewport.scrollTo({
            left: child.offsetLeft - viewport.offsetLeft,
            behavior: "smooth",
          })
        }
      }
    },
    [total],
  )

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const center = viewport.scrollLeft + viewport.clientWidth / 2
    let closest = 0
    let minDist = Infinity
    Array.from(viewport.children).forEach((child, i) => {
      const el = child
      const mid = el.offsetLeft - viewport.offsetLeft + el.offsetWidth / 2
      const dist = Math.abs(center - mid)
      if (dist < minDist) {
        minDist = dist
        closest = i
      }
    })
    setCurrent(closest)
  }, [])

  if (total === 0) return null
  if (total === 1) {
    return (
      <div className="my-6 rounded-xl overflow-hidden bg-gray-50 border border-border">
        <img
          src={images[0].src}
          alt={images[0].alt}
          className="!inline-block w-full max-h-[480px] object-contain !rounded-none !p-0 !m-0"
        />
      </div>
    )
  }

  return (
    <div
      className="relative my-6 rounded-xl overflow-hidden bg-gray-50 border border-border focus:outline-none"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goTo(current - 1)
        if (e.key === "ArrowRight") goTo(current + 1)
      }}
    >
      {/* Viewport */}
      <div
        ref={viewportRef}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
        }}
        onScroll={handleScroll}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            className="!inline-block snap-center shrink-0 w-full max-h-[480px] object-contain !rounded-none !p-0 !m-0"
          />
        ))}
      </div>

      {/* Prev button */}
      {current > 0 && (
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all z-10"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Next button */}
      {current < total - 1 && (
        <button
          onClick={() => goTo(current + 1)}
          aria-label="Next image"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all z-10"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Counter */}
      <span className="absolute top-2.5 right-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
        {current + 1} / {total}
      </span>

      {/* Dots */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 py-2.5 bg-gradient-to-t from-black/20 to-transparent">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to image ${i + 1}`}
            className={`w-2 h-2 rounded-full border-none transition-all ${
              i === current
                ? "bg-white scale-125 shadow-sm"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
