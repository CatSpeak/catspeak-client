import React, { memo, useRef, useEffect, useState } from "react"

/**
 * Reusable Tabs component that prevents layout shift on active bold states and supports optional icons.
 * Supports smooth keyboard/touch scrolling, mouse wheel scrolling, and mouse click-and-drag scrolling.
 *
 * @param {Array} tabs - Array of tab objects: { id: string, label: string, icon: ReactComponent }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onChange - Callback when a tab is clicked
 * @param {string} className - Optional extra class name for the tab container
 * @param {string} activeClassName - Optional custom active tab classes
 * @param {string} inactiveClassName - Optional custom inactive tab classes
 * @param {boolean} fullWidth - If true, tabs will divide space equally (flex-1)
 */
const Tabs = memo(
  ({
    tabs,
    activeTab,
    onChange,
    className = "",
    activeClassName = "text-[#990011]",
    inactiveClassName = "text-[#606060]",
    fullWidth = true,
  }) => {
    const isResponsive = fullWidth === "responsive"
    const isFull = fullWidth === true
    const containerRef = useRef(null)
    const isDraggingRef = useRef(false)
    const startXRef = useRef(0)
    const scrollLeftRef = useRef(0)
    const hasDraggedRef = useRef(false)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
      if (!containerRef.current || isDraggingRef.current) return
      const activeEl = containerRef.current.querySelector('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
      }
    }, [activeTab])

    const handleWheel = (e) => {
      const el = e.currentTarget
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += e.deltaY
      }
    }

    const handleMouseDown = (e) => {
      if (e.button !== 0 || !containerRef.current) return
      if (containerRef.current.scrollWidth <= containerRef.current.clientWidth) return

      isDraggingRef.current = true
      hasDraggedRef.current = false
      startXRef.current = e.pageX
      scrollLeftRef.current = containerRef.current.scrollLeft
    }

    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isDraggingRef.current || !containerRef.current) return
        const dx = e.pageX - startXRef.current
        if (Math.abs(dx) > 5) {
          if (!hasDraggedRef.current) {
            hasDraggedRef.current = true
            setIsDragging(true)
          }
          containerRef.current.scrollLeft = scrollLeftRef.current - dx
        }
      }

      const handleMouseUp = () => {
        if (!isDraggingRef.current) return
        isDraggingRef.current = false
        if (hasDraggedRef.current) {
          setTimeout(() => {
            hasDraggedRef.current = false
            setIsDragging(false)
          }, 50)
        } else {
          setIsDragging(false)
        }
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }, [])

    const handleClickCapture = (e) => {
      if (hasDraggedRef.current) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    return (
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
        className={`w-full max-w-full min-w-0 shrink-0 flex items-center overflow-x-auto scrollbar-hidden z-30 border-b border-border ${
          isDragging ? "cursor-grabbing select-none" : ""
        } ${!isFull && !isResponsive ? "gap-1 sm:gap-2" : ""} ${className}`}
      >
        {tabs.map((tab) => {
          const tabKey = tab.id ?? tab.value
          const Icon = tab.icon
          const isActive = activeTab === tabKey

          return (
            <button
              key={tabKey}
              type="button"
              data-active={isActive}
              onClick={() => {
                if (!hasDraggedRef.current) {
                  onChange(tabKey)
                }
              }}
              className={`h-10 min-w-fit sm:min-w-[120px] shrink-0 group relative flex items-center justify-center transition-colors flex-1 ${fullWidth ? "" : "sm:flex-none px-2 sm:px-4"
                }`}
            >
              <div
                className={`relative h-full flex items-center gap-2 text-sm transition-colors ${isActive ? activeClassName : inactiveClassName
                  }`}
              >
                {Icon && <Icon size={18} className="hidden sm:block" />}

                <span className="relative flex flex-col items-center justify-center">
                  {/* Invisible bold text to reserve space and prevent layout shift */}
                  <span className="invisible h-0 overflow-hidden font-bold">
                    {tab.label}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </span>

                {tab.badge && (
                  <span
                    className={`min-w-4 h-4 px-1 rounded-full text-xs flex items-center justify-center transition-colors ${isActive
                      ? "bg-[#990011] text-white"
                      : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Underline Indicator */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full transition-all duration-200 ${isActive
                    ? "bg-[#990011] scale-x-100"
                    : "bg-[#990011]/40 scale-x-0 group-hover:scale-x-100 origin-center"
                    }`}
                />
              </div>
            </button>
          )
        })}
      </div>
    )
  },
)

export default Tabs
