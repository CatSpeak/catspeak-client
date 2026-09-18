import React, { useState } from "react"

/**
 * A reusable animated card component.
 * Hover: smooth lift + soft glow shadow.
 * Press: slight push-down for tactile feedback.
 */
const Animated3DCard = ({
  children,
  className = "",
  containerClassName = "",
  onClick,
  style,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div
      onClick={onClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      className={`relative group/card outline-offset-4 touch-manipulation block ${
        onClick ? "cursor-pointer" : ""
      } ${containerClassName}`}
      style={style}
      {...props}
    >
      {/* Card front — lift on hover, push on press */}
      <div
        className={`relative rounded-2xl bg-white flex flex-col overflow-hidden border border-border will-change-transform transition-[transform,box-shadow] duration-[280ms] ease-[cubic-bezier(.25,.8,.25,1)] shadow-sm sm:group-hover/card:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.14),0_2px_8px_-2px_rgba(0,0,0,0.08)] sm:group-hover/card:-translate-y-[5px] ${className}`}
        style={
          isPressed
            ? {
                transform: "translateY(1px) scale(0.99)",
                boxShadow: "0 2px 8px -2px rgba(0,0,0,0.10)",
                transitionDuration: "60ms",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

export default Animated3DCard
