import React, { memo, useEffect, useRef, useId } from "react"
import { motion, LayoutGroup } from "framer-motion"
import Badge from "@/shared/components/ui/indicators/Badge"

/**
 * Reusable Tabs component aligned with Material Design 3 (M3) baseline specifications.
 * Supports optional icons, horizontal drag/wheel scroll, inline/stacked layouts, and theme tokens.
 *
 * Baseline Measurements:
 * - Container height (label text only): 48dp (h-12)
 * - Container height (icon and label text): 64dp (h-16)
 * - Icon size: 24dp
 * - Divider height: 1dp (border-b)
 * - Primary active indicator height: 3dp (h-[3px])
 * - Secondary active indicator height: 2dp (h-[2px])
 * - Active indicator shape: 3, 3, 0, 0 (rounded-t-[3px] rounded-b-none)
 * - Active indicator inset: 2dp on each side (left-[2px] right-[2px])
 * - Active indicator minimum length: 24dp (min-w-[24px])
 * - Padding between inline icon and text: 8dp (gap-2)
 * - Padding between inline text and badge: 4dp (gap-1)
 * - Overlap of badge on stacked icon: 6dp (-top-[6px] -right-[6px])
 *
 * @param {Array} tabs - Array of tab objects: { id: string, label: string, icon: ReactComponent, badge?: any, stacked?: boolean }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onChange - Callback when a tab is clicked
 * @param {string} className - Optional extra class name for the tab container
 * @param {string} activeClassName - Optional custom active tab classes
 * @param {string} inactiveClassName - Optional custom inactive tab classes
 * @param {boolean|'responsive'} fullWidth - If true, tabs divide space equally (flex-1). If false, tabs retain content width.
 * @param {string} height - Optional custom container height class (defaults: 48dp / h-12 for text-only, 64dp / h-16 for icon+text)
 * @param {'primary'|'secondary'} variant - Tab indicator variant (default: "primary")
 * @param {boolean} stacked - Whether to stack icon above label text (default: false)
 * @param {number} iconSize - Icon size in dp/px (default: 24)
 * @param {string} [id] - Optional unique identifier to scope Framer Motion layout animations (defaults to useId)
 * @param {boolean} [elastic=true] - Whether to enable tactile squash-and-stretch elasticity (aligned with useElasticStretch)
 * @param {number} [stretchFactor=1.35] - Peak horizontal stretch ratio (scaleX) during transit
 * @param {number} [squashFactor=0.88] - Peak vertical compression ratio (scaleY) during transit
 * @param {number} [stiffness=360] - Spring stiffness for indicator movement
 * @param {number} [damping=25] - Spring damping for indicator movement
 * @param {number} [duration=0.28] - Keyframe duration for squash/stretch
 * @param {object} [indicatorTransition] - Optional custom Framer Motion spring transition config
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
    height,
    variant = "primary",
    stacked = false,
    iconSize = 24,
    id,
    elastic = true,
    stretchFactor = 1.35,
    squashFactor = 0.88,
    stiffness = 360,
    damping = 25,
    duration = 0.28,
    indicatorTransition,
  }) => {
    const generatedId = useId()
    const layoutGroupId = id || `tabs-${generatedId.replace(/:/g, "")}`
    const springTransition = indicatorTransition || {
      type: "spring",
      stiffness,
      damping,
    }

    const isFirstMountRef = useRef(true)
    const prevActiveTabRef = useRef(activeTab)
    const isTabChanged =
      !isFirstMountRef.current && prevActiveTabRef.current !== activeTab

    useEffect(() => {
      isFirstMountRef.current = false
      prevActiveTabRef.current = activeTab
    }, [activeTab])
    // Baseline heights: 48dp (h-12) for text-only, 64dp (h-16) for icon + text
    const hasIcons = tabs.some((tab) => Boolean(tab.icon))
    const containerHeight = height || (hasIcons ? "h-16" : "h-12")

    const isPrimary = variant === "primary"
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
      <LayoutGroup id={layoutGroupId}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className={`w-full min-w-0 flex items-end overflow-x-auto select-none touch-pan-x overscroll-x-contain border-b border-border dark:border-[#3F3F3F] scrollbar-none ${className}`}
        >
          {tabs.map((tab) => {
            const tabKey = tab.id ?? tab.value
            const Icon = tab.icon
            const isActive = activeTab === tabKey
            const isTabStacked = tab.stacked ?? stacked

            return (
              <button
                key={tabKey}
                ref={isActive ? activeTabRef : null}
                type="button"
                onClick={() => handleTabClick(tabKey)}
                className={`${containerHeight} ${widthClass} -mb-px min-w-fit shrink-0 group relative flex items-center justify-center px-4 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/50 dark:focus-visible:ring-cath-red-1000/50 transition-colors duration-100 ease-out hover:bg-neutral-500/10 dark:hover:bg-white/5 active:bg-neutral-500/20 dark:active:bg-white/10 ${
                  isActive ? "z-10" : "z-0"
                }`}
              >
                <div
                  className={`relative z-10 h-full flex ${
                    isTabStacked
                      ? "flex-col justify-center items-center gap-1 py-1"
                      : "flex-row items-center gap-2"
                  } text-sm transition-colors whitespace-nowrap min-w-[24px] ${
                    isActive ? activeClassName : inactiveClassName
                  }`}
                >
                  {/* Icon (24dp default) with optional stacked badge (6dp overlap) */}
                  {Icon && (
                    <div className="relative shrink-0 flex items-center justify-center">
                      <Icon
                        size={tab.iconSize || iconSize}
                        className="shrink-0"
                      />
                      {isTabStacked &&
                        tab.badge &&
                        (React.isValidElement(tab.badge) ? (
                          <div className="absolute -top-[6px] -right-[6px] shrink-0">
                            {tab.badge}
                          </div>
                        ) : (
                          <Badge
                            color={
                              tab.badgeColor || (isActive ? "cath-red" : "gray")
                            }
                            size="sm"
                            className="absolute -top-[6px] -right-[6px] min-w-[16px] h-4 px-1"
                          >
                            {tab.badge}
                          </Badge>
                        ))}
                    </div>
                  )}

                  {/* Inline text & badge container with 4dp gap (8dp for non-badge elements) */}
                  <div
                    className={`flex items-center ${
                      tab.badgeGap ||
                      (React.isValidElement(tab.badge) ? "gap-2" : "gap-1")
                    }`}
                  >
                    <span className="whitespace-nowrap">{tab.label}</span>

                    {/* Inline badge (padding between inline text and badge: 4dp) */}
                    {!isTabStacked &&
                      tab.badge &&
                      (React.isValidElement(tab.badge) ? (
                        tab.badge
                      ) : (
                        <Badge
                          color={
                            tab.badgeColor || (isActive ? "cath-red" : "gray")
                          }
                          className="min-w-[16px] h-4 px-1"
                        >
                          {tab.badge}
                        </Badge>
                      ))}
                  </div>

                  {/* Active Indicator:
                      Primary: height 3dp, shape 3, 3, 0, 0, inset 2dp on each side, min-w 24dp
                      Secondary: height 2dp, shape 2, 2, 0, 0
                      Animated smoothly with Framer Motion layoutId and elastic squash-and-stretch
                  */}
                  {isActive ? (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={`absolute bottom-0 ${
                        isPrimary
                          ? "left-[2px] right-[2px] min-w-[24px] h-[3px] rounded-t-[3px]"
                          : "left-0 right-0 h-[2px] rounded-t-[2px]"
                      } rounded-b-none pointer-events-none z-10`}
                      transition={springTransition}
                    >
                      <motion.div
                        key={activeTab}
                        className={`w-full h-full ${
                          isPrimary ? "rounded-t-[3px]" : "rounded-t-[2px]"
                        } rounded-b-none bg-cath-red-700 dark:bg-cath-red-1000 origin-center`}
                        initial={false}
                        animate={
                          elastic && isTabChanged
                            ? {
                                scaleX: [1, stretchFactor, 1],
                                scaleY: [1, squashFactor, 1],
                              }
                            : { scaleX: 1, scaleY: 1 }
                        }
                        transition={{
                          duration,
                          times: [0, 0.45, 1],
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  ) : (
                    <div
                      className={`absolute bottom-0 ${
                        isPrimary
                          ? "left-[2px] right-[2px] min-w-[24px] h-[3px] rounded-t-[3px]"
                          : "left-0 right-0 h-[2px] rounded-t-[2px]"
                      } rounded-b-none bg-cath-red-700/30 dark:bg-cath-red-1000/30 scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-200 pointer-events-none`}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    )
  },
)

export default Tabs
