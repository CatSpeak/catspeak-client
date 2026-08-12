import React, { useState, useEffect } from "react"
import { ChevronDown, Globe } from "lucide-react"

const DesktopNavDropdown = ({
  icon: Icon,
  label,
  isOpen,
  onToggle,
  children,
  isDocked = false,
  color,
  img,
}) => {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [img])

  const IconComponent = Icon || Globe

  return (
    <div className="flex flex-col gap-1 shrink-0 relative group/dropdown w-full">
      <button
        onClick={() => {
          if (!isDocked) {
            onToggle()
          }
        }}
        className={`relative flex items-center shrink-0 h-11 rounded-xl transition-all duration-300 group overflow-hidden w-full ${
          isDocked ? "justify-center" : "px-3 gap-3"
        } hover:bg-primaryBg`}
        title={label}
      >
        {img && !imgError ? (
          <img
            src={img}
            alt=""
            onError={() => setImgError(true)}
            className="w-5 h-5 object-contain shrink-0 rounded-sm"
          />
        ) : (
          <IconComponent
            size={20}
            className="shrink-0"
            style={color ? { color } : undefined}
          />
        )}

        <span
          className={`text-sm font-medium text-left whitespace-nowrap transition-all duration-300 truncate ${
            isDocked
              ? "opacity-0 w-0 pointer-events-none hidden"
              : "opacity-100 min-w-0 flex-1"
          }`}
          style={color ? { color } : undefined}
        >
          {label}
        </span>

        {!isDocked && (
          <ChevronDown
            size={18}
            className={`shrink-0 transition-all duration-300 opacity-100 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Expanded Inline Menu (Not Docked) */}
      {!isDocked && isOpen && (
        <div className="flex flex-col gap-1 w-full h-full overflow-hidden relative">
          {children}
        </div>
      )}

      {/* Floating Flyout Menu (Docked) */}
      {isDocked && (
        <div className="absolute left-full ml-2 top-0 bg-white border border-border rounded-lg shadow-lg w-56 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-[100] flex flex-col p-2 pointer-events-auto text-gray-900">
          <div
            className="px-3 pb-2 mb-2 border-b border-border text-sm font-medium text-gray-900 truncate"
            style={color ? { color } : undefined}
            title={label}
          >
            {label}
          </div>
          {/* Subitems container */}
          <div className="flex flex-col gap-1">{children}</div>
        </div>
      )}
    </div>
  )
}

export default DesktopNavDropdown
