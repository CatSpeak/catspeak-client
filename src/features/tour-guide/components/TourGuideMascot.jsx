import React from "react"
import { motion } from "framer-motion"

export const TourGuideMascot = ({ src, alt, className = "" }) => {
  if (!src) return null

  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className={`flex items-center justify-center shrink-0 select-none pointer-events-none ${className}`}
    >
      <img
        src={src}
        alt={alt || "CatSpeak Mascot"}
        className="w-full h-auto object-contain max-h-[200px] md:max-h-[240px] drop-shadow-[0_8px_16px_rgba(152,0,25,0.12)]"
        loading="eager"
      />
    </motion.div>
  )
}

export default TourGuideMascot
