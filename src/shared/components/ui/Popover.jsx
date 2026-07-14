import React, { useState, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import useClickOutside from "@/shared/hooks/useClickOutside"

const Popover = ({
  trigger,
  content,
  placement = "bottom-right",
  className = "",
  triggerClassName = "",
  animationDirection,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [actualPlacement, setActualPlacement] = useState(placement)
  const containerRef = useRef(null)

  useClickOutside(containerRef, () => setIsOpen(false))

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const popoverEstimatedWidth = 220
      const isTop = placement.startsWith("top")
      const baseVertical = isTop ? "top" : "bottom"

      if (placement.endsWith("right") && rect.right < popoverEstimatedWidth) {
        setActualPlacement(`${baseVertical}-left`)
      } else if (
        placement.endsWith("left") &&
        window.innerWidth - rect.left < popoverEstimatedWidth
      ) {
        setActualPlacement(`${baseVertical}-right`)
      } else {
        setActualPlacement(placement)
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={containerRef}
    >
      <div
        onClick={handleToggle}
        className={`cursor-pointer ${triggerClassName || "inline-flex items-center justify-center"}`}
      >
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <FluentAnimation
            direction={animationDirection || (actualPlacement.startsWith("top") ? "up" : "down")}
            distance={10}
            exit={true}
            className={`absolute z-50 ${
              actualPlacement.startsWith("top")
                ? "mb-2 bottom-full"
                : "mt-2 top-full"
            } ${actualPlacement.endsWith("right") ? "right-0" : "left-0"}`}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {typeof content === "function"
                ? content(() => setIsOpen(false))
                : content}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Popover
