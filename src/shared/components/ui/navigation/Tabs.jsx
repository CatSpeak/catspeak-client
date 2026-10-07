import React, { memo, useEffect, useRef } from "react"

/**
 * Reusable Tabs component that prevents layout shift on active bold states and supports optional icons.
 * Hỗ trợ cuộn ngang không hiện scrollbar, kéo chuột (mouse drag-to-scroll) trên laptop,
 * cảm ứng vuốt mượt trên mobile, và tự động cuộn theo con lăn chuột.
 *
 * @param {Array} tabs - Array of tab objects: { id: string, label: string, icon: ReactComponent }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onChange - Callback when a tab is clicked
 * @param {string} className - Optional extra class name for the tab container
 * @param {string} activeClassName - Optional custom active tab classes
 * @param {string} inactiveClassName - Optional custom inactive tab classes
 * @param {boolean|'responsive'} fullWidth - If true, tabs will divide space equally (flex-1). If false, tabs retain content width and scroll horizontally.
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

    const scrollContainerRef = useRef(null)
    const activeTabRef = useRef(null)

    // Refs cho thao tác kéo chuột (Mouse Drag to scroll) trên Laptop/Desktop
    const isMouseDownRef = useRef(false)
    const startXRef = useRef(0)
    const scrollLeftStartRef = useRef(0)
    const hasDraggedRef = useRef(false)

    // Tự động cuộn tab đang chọn vào khung nhìn (khi deep link hoặc đổi tab)
    useEffect(() => {
      if (activeTabRef.current) {
        activeTabRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }, [activeTab])

    // ─── Xử lý kéo chuột (Drag to Scroll) trên Laptop/PC ───
    const handleMouseDown = (e) => {
      if (e.button !== 0) return // Chỉ nhận chuột trái
      const el = scrollContainerRef.current
      if (!el) return

      isMouseDownRef.current = true
      hasDraggedRef.current = false
      startXRef.current = e.pageX - el.offsetLeft
      scrollLeftStartRef.current = el.scrollLeft
    }

    const handleMouseMove = (e) => {
      if (!isMouseDownRef.current) return
      const el = scrollContainerRef.current
      if (!el) return

      const currentX = e.pageX - el.offsetLeft
      const distance = currentX - startXRef.current

      // Nếu di chuyển quá 5px thì tính là thao tác kéo
      if (Math.abs(distance) > 5) {
        hasDraggedRef.current = true
      }

      el.scrollLeft = scrollLeftStartRef.current - distance
    }

    const handleMouseUpOrLeave = () => {
      isMouseDownRef.current = false
    }

    // ─── Xử lý cuộn con lăn chuột (Mouse Wheel to Horizontal Scroll) trên Laptop ───
    const handleWheel = (e) => {
      const el = scrollContainerRef.current
      if (!el) return

      // Nếu nội dung dài hơn khung nhìn và người dùng lăn chuột dọc
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += e.deltaY
      }
    }

    const handleTabClick = (tabKey) => {
      // Nếu vừa thực hiện thao tác kéo chuột thì không kích hoạt đổi tab
      if (hasDraggedRef.current) {
        hasDraggedRef.current = false
        return
      }
      onChange(tabKey)
    }

    return (
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className={`w-full max-w-full min-w-0 flex items-center overflow-x-auto select-none touch-pan-x overscroll-x-contain cursor-grab active:cursor-grabbing border-b border-border scrollbar-none scrollbar-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          !isFull && !isResponsive
            ? "gap-1 sm:gap-2 px-1 sm:px-2 py-0.5"
            : "py-0.5"
        } ${className}`}
      >
        {tabs.map((tab) => {
          const tabKey = tab.id ?? tab.value
          const Icon = tab.icon
          const isActive = activeTab === tabKey

          return (
            <button
              key={tabKey}
              ref={isActive ? activeTabRef : null}
              type="button"
              onClick={() => handleTabClick(tabKey)}
              className={`h-11 sm:h-12 min-w-fit shrink-0 group relative flex items-center justify-center transition-all select-none ${
                isFull
                  ? "flex-1 px-3 sm:px-4"
                  : isResponsive
                    ? "flex-1 sm:flex-none px-3.5 sm:px-5"
                    : "flex-none px-3.5 sm:px-5"
              }`}
            >
              <div
                className={`relative h-full flex items-center gap-2 sm:gap-2.5 text-sm sm:text-[15px] font-medium transition-colors whitespace-nowrap ${
                  isActive ? activeClassName : inactiveClassName
                }`}
              >
                {Icon && <Icon size={18} className="hidden sm:block shrink-0" />}

                <span className="relative flex flex-col items-center justify-center whitespace-nowrap">
                  {/* Invisible bold text to reserve space and prevent layout shift */}
                  <span
                    className="invisible h-0 overflow-hidden font-bold whitespace-nowrap select-none"
                    aria-hidden="true"
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`whitespace-nowrap transition-all ${
                      isActive ? "font-bold text-[#990011]" : "font-medium"
                    }`}
                  >
                    {tab.label}
                  </span>
                </span>

                {tab.badge && (
                  <span
                    className={`min-w-4 h-4 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? "bg-[#990011] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Underline Indicator */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#990011] scale-x-100"
                      : "bg-[#990011]/30 scale-x-0 group-hover:scale-x-100 origin-center"
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
