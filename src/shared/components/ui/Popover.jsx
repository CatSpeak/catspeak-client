import React, { useState, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import useClickOutside from "@/shared/hooks/useClickOutside"

const Popover = ({ trigger, content, placement = "bottom-right", className = "", triggerClassName = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [actualPlacement, setActualPlacement] = useState(placement)
  const containerRef = useRef(null)

  useClickOutside(containerRef, () => setIsOpen(false))

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const popoverEstimatedWidth = 220
      if (placement === "bottom-right" && rect.right < popoverEstimatedWidth) {
        setActualPlacement("bottom-left")
      } else if (placement === "bottom-left" && window.innerWidth - rect.left < popoverEstimatedWidth) {
        setActualPlacement("bottom-right")
      } else {
        setActualPlacement(placement)
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} ref={containerRef}>
      <div 
        onClick={handleToggle} 
        className={`cursor-pointer ${triggerClassName || "inline-flex items-center justify-center"}`}
      >
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <FluentAnimation
            direction="down"
            distance={10}
            exit={true}
            className={`absolute z-50 mt-2 ${
              actualPlacement === "bottom-right" ? "right-0 top-full" : "left-0 top-full"
            }`}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {typeof content === 'function' ? content(() => setIsOpen(false)) : content}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Popover
