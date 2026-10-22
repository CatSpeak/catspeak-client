import React from "react"
import { motion as Motion } from "framer-motion"

export const TourGuideOverlay = ({ targetRect, padding = 8, onBackdropClick }) => {
  if (!targetRect) {
    return (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onBackdropClick}
        className="fixed inset-0 z-[9990] bg-slate-900/65 backdrop-blur-[2px]"
      />
    )
  }

  const spotlightX = targetRect.left - padding
  const spotlightY = targetRect.top - padding
  const spotlightW = targetRect.width + padding * 2
  const spotlightH = targetRect.height + padding * 2

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none">
      <svg className="w-full h-full block pointer-events-auto" onClick={onBackdropClick}>
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White area = visible backdrop */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cut-out = clear spotlight hole */}
            <Motion.rect
              initial={false}
              animate={{
                x: spotlightX,
                y: spotlightY,
                width: spotlightW,
                height: spotlightH,
                rx: 16,
                ry: 16,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              fill="black"
            />
          </mask>
        </defs>

        {/* The dimming overlay with cutout mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#tour-spotlight-mask)"
          className="cursor-default"
        />
      </svg>

      {/* Brand accent pulse glow ring around spotlighted element */}
      <Motion.div
        initial={false}
        animate={{
          x: spotlightX,
          y: spotlightY,
          width: spotlightW,
          height: spotlightH,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="absolute top-0 left-0 rounded-2xl border-2 border-[#980019]/70 ring-4 ring-[#980019]/20 shadow-[0_0_25px_rgba(152,0,25,0.4)] pointer-events-none"
      />
    </div>
  )
}

export default TourGuideOverlay
