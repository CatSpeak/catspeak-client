import React, { memo, useEffect, useRef } from "react"

/**
 * Reusable Tabs component supporting optional icons and horizontal drag/wheel scroll.
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
    activeClassName = "text-neutral-900 dark:text-white",
    inactiveClassName = "text-neutral-500 group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-100",
    fullWidth = true,
    height = "h-12",
  }) => {
    const widthClass =
      fullWidth === true
        ? "flex-1"
        : fullWidth === "responsive"
          ? "flex-1 sm:flex-none"
          : "flex-none"

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
        className={`w-full min-w-0 flex items-end overflow-x-auto select-none touch-pan-x overscroll-x-contain border-b border-border scrollbar-none ${className}`}
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
              className={`${height} ${widthClass} -mb-px min-w-fit shrink-0 group relative flex items-center justify-center px-4 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/50 dark:focus-visible:ring-cath-red-1000/50 rounded-t-lg rounded-b-none transition-colors duration-100 ease-out hover:bg-neutral-500/10 dark:hover:bg-white/5 active:bg-neutral-500/20 dark:active:bg-white/10`}
            >
              <div
                className={`relative z-10 h-full flex items-center gap-2 sm:gap-2.5 text-sm sm:text-[15px] font-medium transition-colors whitespace-nowrap ${
                  isActive ? activeClassName : inactiveClassName
                }`}
              >
                {Icon && (
                  <Icon size={18} className="hidden sm:block shrink-0" />
                )}

                <span className="whitespace-nowrap">{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`min-w-4 h-4 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? "bg-cath-red-700 dark:bg-cath-red-1000 text-white"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Underline Indicator - anchored to the bottom edge, resting directly on the container's border line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full transition-all duration-200 pointer-events-none ${
                    isActive
                      ? "bg-cath-red-700 dark:bg-cath-red-1000 scale-x-100"
                      : "bg-cath-red-700/30 dark:bg-cath-red-1000/30 scale-x-0 group-hover:scale-x-100 origin-center"
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
