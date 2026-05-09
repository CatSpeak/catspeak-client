import React, { useState, useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"

const Popover = ({ trigger, content, placement = "bottom-right", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the entire container (which includes the trigger), close it
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative flex items-center justify-center ${className}`} ref={containerRef}>
      <div 
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }} 
        className="cursor-pointer inline-flex items-center justify-center"
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
              placement === "bottom-right" ? "right-0 top-full" : "left-0 top-full"
            }`}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {content}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Popover
