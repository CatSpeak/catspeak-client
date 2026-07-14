import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"

const Popover = ({ trigger, content, placement = "bottom-right", className = "", triggerClassName = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [actualPlacement, setActualPlacement] = useState(placement)
  const [coords, setCoords] = useState({ topEdge: 0, bottomEdge: 0, left: 0, rightEdge: 0 })
  const containerRef = useRef(null)
  const popoverRef = useRef(null)

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
      // Ignore scroll events from the popover itself so scrolling inside it doesn't close it
      if (popoverRef.current && popoverRef.current.contains(e.target)) return
      if (isOpen) setIsOpen(false)
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
  }, [isOpen])

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const popoverEstimatedWidth = 220
      const popoverEstimatedHeight = 120 // Estimated height of content
      
      let nextPlacement = placement
      if (placement.endsWith("right") && rect.right < popoverEstimatedWidth) {
        nextPlacement = placement.replace("right", "left")
      } else if (placement.endsWith("left") && window.innerWidth - rect.left < popoverEstimatedWidth) {
        nextPlacement = placement.replace("left", "right")
      }
      
      if (window.innerHeight - rect.bottom < popoverEstimatedHeight && rect.top > popoverEstimatedHeight) {
        nextPlacement = nextPlacement.replace("bottom", "top")
      }
      
      setActualPlacement(nextPlacement)
      setCoords({
        topEdge: rect.top + window.scrollY,
        bottomEdge: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        rightEdge: rect.right + window.scrollX
      })
    }
    setIsOpen(!isOpen)
  }

  const xTrans = actualPlacement.endsWith("right") ? "-100%" : "0"
  const yTrans = actualPlacement.startsWith("top") ? "-100%" : "0"
  const transform = (xTrans !== "0" || yTrans !== "0") ? `translate(${xTrans}, ${yTrans})` : undefined

  const portalContent = (
    <div 
      className="absolute z-[9999]"
      style={{
        top: actualPlacement.startsWith("top") ? `${coords.topEdge - 8}px` : `${coords.bottomEdge + 8}px`,
        left: actualPlacement.endsWith("right") ? `${coords.rightEdge}px` : `${coords.left}px`,
        transform
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <FluentAnimation
            direction={actualPlacement.startsWith("top") ? "up" : "down"}
            distance={10}
            exit={true}
          >
            <div ref={popoverRef} onClick={(e) => e.stopPropagation()}>
              {typeof content === 'function' ? content(() => setIsOpen(false)) : content}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className={`relative flex items-center justify-center ${className}`} ref={containerRef}>
      <div 
        onClick={handleToggle} 
        className={`cursor-pointer ${triggerClassName || "inline-flex items-center justify-center"}`}
      >
        {trigger}
      </div>
      {typeof document !== 'undefined' ? createPortal(portalContent, document.body) : null}
    </div>
  )
}

export default Popover
