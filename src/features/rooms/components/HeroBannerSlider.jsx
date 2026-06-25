import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import banner1 from "@/shared/assets/images/communities/banner_1.png"

const slides = [
  {
    id: 1,
    image: banner1,
  },
  {
    id: 2,
    image: banner1,
  },
  {
    id: 3,
    image: banner1,
  },
]

const HeroBannerSlider = ({ children }) => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [current])

  return (
    <>
      {/* Content area */}
      <div className="grid grid-cols-12 flex-1 min-h-[280px]">
        {/* Left: Text content (passed as children) */}
        {children}

        {/* Right: Banner image */}
        <div className="col-span-12 md:col-span-6 flex items-center justify-start p-6 md:p-8 md:pl-0 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              src={slides[current].image}
              alt={`Community banner ${current + 1}`}
              className="w-full h-auto object-contain rounded-2xl shadow-md"
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`rounded-full transition-all duration-200 ${
              idx === current
                ? "w-5 h-2 bg-[#A30014]"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </>
  )
}

export default HeroBannerSlider
