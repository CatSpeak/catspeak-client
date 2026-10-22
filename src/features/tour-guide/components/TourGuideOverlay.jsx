import React from "react"
import { motion as Motion } from "framer-motion"

export const TourGuideOverlay = ({
  targetRect,
  padding = 10,
  onBackdropClick,
  onTargetClick,
  isRippling = false,
}) => {
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
      {/* Dimming overlay with cutout mask */}
      <svg
        className="w-full h-full block pointer-events-auto"
        onClick={onBackdropClick}
      >
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
        className="absolute top-0 left-0 rounded-2xl border-2 border-[#980019] ring-4 ring-[#980019]/25 shadow-[0_0_30px_rgba(152,0,25,0.45)] pointer-events-none"
      />

      {/* Interactive clickable hotspot over the highlighted zone */}
      <div
        onClick={onTargetClick}
        className="absolute rounded-2xl cursor-pointer pointer-events-auto group transition-transform active:scale-[0.98]"
        style={{
          left: `${spotlightX}px`,
          top: `${spotlightY}px`,
          width: `${spotlightW}px`,
          height: `${spotlightH}px`,
        }}
        title="Bấm vào đây để tiếp tục khám phá"
      >
        {/* Ripple shockwave effect on click */}
        {isRippling && (
          <Motion.div
            initial={{ scale: 0.9, opacity: 1 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl border-4 border-[#980019] shadow-[0_0_35px_rgba(152,0,25,0.8)] pointer-events-none"
          />
        )}

        {/* Floating helper pill inviting the user to interact */}
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-xl border border-rose-400/40 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all pointer-events-none select-none">
          <span className="w-2 h-2 rounded-full bg-[#980019] animate-ping" />
          <span>Bấm vào vùng này hoặc &quot;Tiếp theo&quot;</span>
        </div>
      </div>
    </div>
  )
}

export default TourGuideOverlay
