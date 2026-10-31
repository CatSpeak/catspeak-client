import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"

const Popover = ({
  trigger,
  content,
  placement = "bottom-right",
  className = "",
  triggerClassName = "",
  animationDirection,
  onOpenChange,
  openOnHover = false,
  isOpen: controlledIsOpen,
  estimatedWidth,
  estimatedHeight,
  offset = 8,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const hoverTimeoutRef = useRef(null)

  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  const [actualPlacement, setActualPlacement] = useState(placement)
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  const containerRef = useRef(null)
  const popoverRef = useRef(null)
  const portalRef = useRef(null)

  const computeLayout = useCallback(() => {
    if (!containerRef.current) return null

    const triggerRect = containerRef.current.getBoundingClientRect()
    const popRect = popoverRef.current?.getBoundingClientRect()

    // Measure or estimate popover dimensions
    const popWidth = Math.round(
      (popRect && popRect.width > 0 ? popRect.width : null) ||
      estimatedWidth ||
      280,
    )
    const popHeight = Math.round(
      (popRect && popRect.height > 0 ? popRect.height : null) ||
      estimatedHeight ||
      200,
    )

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Available space
    const spaceBelow = viewportHeight - triggerRect.bottom - offset
    const spaceAbove = triggerRect.top - offset

    let verticalPlacement = placement.startsWith("top") ? "top" : "bottom"

    if (verticalPlacement === "bottom") {
      // If doesn't fit below, and there is more space above or fits above, flip to top
      if (
        spaceBelow < popHeight &&
        (spaceAbove >= popHeight || spaceAbove > spaceBelow)
      ) {
        verticalPlacement = "top"
      }
    } else {
      // If doesn't fit above, and there is more space below or fits below, flip to bottom
      if (
        spaceAbove < popHeight &&
        (spaceBelow >= popHeight || spaceBelow > spaceAbove)
      ) {
        verticalPlacement = "bottom"
      }
    }

    // Horizontal placement
    const preferredHorizontal = placement.endsWith("left") ? "left" : "right"
    let horizontalPlacement = preferredHorizontal

    if (preferredHorizontal === "right") {
      const idealLeft = triggerRect.right - popWidth
      // If it overflows left side of viewport, but fits when aligned to left edge of trigger
      if (idealLeft < 8 && triggerRect.left + popWidth <= viewportWidth - 8) {
        horizontalPlacement = "left"
      }
    } else {
      const idealRight = triggerRect.left + popWidth
      // If it overflows right side of viewport, but fits when aligned to right edge of trigger
      if (
        idealRight > viewportWidth - 8 &&
        triggerRect.right - popWidth >= 8
      ) {
        horizontalPlacement = "right"
      }
    }

    const nextPlacement = `${verticalPlacement}-${horizontalPlacement}`

    // Calculate ideal viewport position
    let top =
      verticalPlacement === "top"
        ? triggerRect.top - popHeight - offset
        : triggerRect.bottom + offset

    let left =
      horizontalPlacement === "right"
        ? triggerRect.right - popWidth
        : triggerRect.left

    // Viewport boundary clamping (safety margin 8px)
    const minLeft = 8
    const maxLeft = Math.max(8, viewportWidth - popWidth - 8)
    left = Math.max(minLeft, Math.min(left, maxLeft))

    const minTop = 8
    const maxTop = Math.max(8, viewportHeight - popHeight - 8)
    top = Math.max(minTop, Math.min(top, maxTop))

    return {
      top: top + window.scrollY,
      left: left + window.scrollX,
      width: popWidth,
      height: popHeight,
      nextPlacement,
    }
  }, [placement, estimatedWidth, estimatedHeight, offset])

  const updateCoords = useCallback(() => {
    const layout = computeLayout()
    if (!layout) return

    setActualPlacement(layout.nextPlacement)
    setCoords({
      top: layout.top,
      left: layout.left,
      width: layout.width,
      height: layout.height,
    })
  }, [computeLayout])

  const repositionDirectly = useCallback(() => {
    const layout = computeLayout()
    if (!layout || !portalRef.current) return

    portalRef.current.style.top = `${layout.top}px`
    portalRef.current.style.left = `${layout.left}px`
  }, [computeLayout])

  const setIsOpen = useCallback(
    (val) => {
      if (!isControlled) {
        setInternalIsOpen(val)
      }
      onOpenChange?.(val)
    },
    [isControlled, onOpenChange],
  )

  // Reposition synchronously via direct DOM mutation before paint when opened
  useLayoutEffect(() => {
    if (isOpen) {
      repositionDirectly()
    }
  }, [isOpen, repositionDirectly])

  // Dynamically update coordinates if popover content resizes (e.g. lazy-loaded emoji picker)
  useEffect(() => {
    if (!isOpen || !popoverRef.current) return
    if (typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(() => {
      repositionDirectly()
    })

    observer.observe(popoverRef.current)
    return () => observer.disconnect()
  }, [isOpen, repositionDirectly])

  // Click outside and scroll/resize handling
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleScrollOrResize = (e) => {
      // Ignore scroll events from within the popover itself so internal scrolling works
      if (popoverRef.current && popoverRef.current.contains(e.target)) return
      if (isOpen) {
        if (e.type === "resize") {
          updateCoords()
        } else {
          setIsOpen(false)
        }
      }
    }

    let scrollTimeout
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("resize", handleScrollOrResize)
      // Delay attaching scroll to avoid immediate closing from layout shifts
      scrollTimeout = setTimeout(() => {
        window.addEventListener("scroll", handleScrollOrResize, true)
      }, 50)
    }

    return () => {
      clearTimeout(scrollTimeout)
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", handleScrollOrResize)
      window.removeEventListener("scroll", handleScrollOrResize, true)
    }
  }, [isOpen, setIsOpen, updateCoords])

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!isOpen) {
      updateCoords()
    }
    setIsOpen(!isOpen)
  }

  const handleMouseEnter = () => {
    if (!openOnHover) return
    clearTimeout(hoverTimeoutRef.current)
    updateCoords()
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (!openOnHover) return
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  const animDirection =
    animationDirection || (actualPlacement.startsWith("top") ? "up" : "down")

  const portalContent = (
    <div
      ref={portalRef}
      data-popover-portal
      className={`absolute z-[9999] ${!isOpen ? "pointer-events-none" : ""}`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      onMouseEnter={() => {
        if (openOnHover) clearTimeout(hoverTimeoutRef.current)
      }}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence>
        {isOpen && (
          <FluentAnimation
            direction={animDirection}
            distance={8}
            exit={true}
          >
            <div ref={popoverRef} onClick={(e) => e.stopPropagation()}>
              {typeof content === "function"
                ? content(() => setIsOpen(false))
                : content}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={handleToggle}
        className={`cursor-pointer ${triggerClassName || "inline-flex items-center justify-center"}`}
      >
        {trigger}
      </div>
      {typeof document !== "undefined"
        ? createPortal(portalContent, document.body)
        : null}
    </div>
  )
}

export default Popover
