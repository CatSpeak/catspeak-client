import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Globe } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import FluentCard from "@/shared/components/ui/FluentCard"

const ResourceCard = ({ item, resolvePath }) => {
  const { t } = useLanguage()
  const [imgError, setImgError] = useState(false)
  const [rippleOrigin, setRippleOrigin] = useState({ x: "50%", y: "50%" })
  const [isHovered, setIsHovered] = useState(false)

  const IconComponent = item.icon || Globe
  const brandColor = item.color || "#e11d48"

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRippleOrigin({ x: `${x}px`, y: `${y}px` })
    setIsHovered(true)
  }

  const handleMouseLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRippleOrigin({ x: `${x}px`, y: `${y}px` })
    setIsHovered(false)
  }

  return (
    <Link
      to={resolvePath(item.path)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group block focus:outline-none focus:ring-2 focus:ring-rose-500/30 rounded-xl h-full"
    >
      <FluentCard
        className="relative h-full flex flex-col overflow-hidden border border-border bg-white group-hover:border-[var(--brand-color)] shadow-none transition-colors duration-300 !p-0 !min-h-0"
        style={{ "--brand-color": brandColor }}
      >
        {/* Radial Ripple Fill Overlay originating from hover cursor position */}
        <div
          className="absolute inset-0 pointer-events-none transition-[clip-path] duration-500 ease-out z-0"
          style={{
            backgroundColor: brandColor,
            clipPath: isHovered
              ? `circle(160% at ${rippleOrigin.x} ${rippleOrigin.y})`
              : `circle(0% at ${rippleOrigin.x} ${rippleOrigin.y})`,
          }}
        />

        {/* Ambient Soft White Glow at cursor origin */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0"
          style={{
            opacity: isHovered ? 0.25 : 0,
            background: `radial-gradient(circle 200px at ${rippleOrigin.x} ${rippleOrigin.y}, #ffffff 0%, transparent 100%)`,
          }}
        />

        {/* Top Hero Panel: Centered Brand Logo */}
        <div
          className="w-full h-36 shrink-0 relative flex items-center justify-center p-4 transition-colors duration-300 z-10 border-b border-slate-100/80 group-hover:border-white/20"
          style={{
            background: isHovered
              ? "transparent"
              : `linear-gradient(135deg, ${brandColor}18 0%, ${brandColor}05 100%)`,
          }}
        >
          {/* Centered White Logo Box */}
          <div
            className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-border/60 group-hover:border-white/50 flex items-center justify-center p-3 transition-all duration-300 shrink-0"
            style={{
              boxShadow: `0 4px 16px 0 ${brandColor}18`,
            }}
          >
            {item.img && !imgError ? (
              <img
                src={item.img}
                alt={item.label}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <IconComponent size={32} style={{ color: brandColor }} />
            )}
          </div>
        </div>

        {/* Bottom Content Panel: Title & Description */}
        <div className="p-4 flex-1 flex flex-col justify-start relative space-y-1 z-10">
          <h3 className="text-base font-bold text-black group-hover:text-white transition-colors line-clamp-1">
            {item.label}
          </h3>

          <p className="text-sm text-[#606060] group-hover:text-white/85 transition-colors line-clamp-2">
            {item.description ||
              t.websites?.card?.defaultDescription ||
              "Interactive resource for language learners to practice skills."}
          </p>
        </div>
      </FluentCard>
    </Link>
  )
}

export default ResourceCard
