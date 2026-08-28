import React from "react"

const AnimatedNameFallback = ({
  name,
  color,
  displayName,
  backgroundColor,
}) => {
  const resolvedName = name || displayName || "User"
  const resolvedColor = color || backgroundColor || "#3B82F6"
  const letters = Array.from(resolvedName.trim())
  const initial = letters[0]?.toUpperCase() || "U"

  return (
    <div
      style={{ backgroundColor: resolvedColor }}
      className="relative w-full h-full flex items-center justify-center p-3 overflow-hidden select-none"
    >
      {/* Idle State: Large Center Initial */}
      <span className="absolute text-5xl font-extrabold text-white transition-all duration-200 ease-out group-hover/card:scale-75 group-hover/card:opacity-0 group-hover/card:-translate-y-2 pointer-events-none">
        {initial}
      </span>

      {/* Hover State: Staggered Letter by Letter Centered Wave */}
      <div className="flex flex-wrap items-center justify-center gap-x-[1px] gap-y-0.5 text-center font-bold text-white text-base sm:text-lg leading-tight pointer-events-none px-2">
        {letters.map((char, i) => (
          <span
            key={i}
            style={{
              "--stagger": `${i * 24}ms`,
            }}
            className="inline-block transform opacity-0 translate-y-2.5 scale-90 transition-all duration-150 ease-out delay-0 group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:scale-100 group-hover/card:duration-200 group-hover/card:[transition-delay:var(--stagger)]"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  )
}

export default AnimatedNameFallback
