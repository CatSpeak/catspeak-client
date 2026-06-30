import React, { useState } from "react"

/**
 * A reusable Pushable 3D animated card component.
 * Replaces the previous mouse-tracking tilt effect with a layered CSS pushable effect.
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
      {/* Shadow */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-2xl bg-black/10 will-change-transform translate-y-[0px] opacity-0 transition-all duration-[600ms] ease-[cubic-bezier(.3,.7,.4,1)] group-hover/card:translate-y-[6px] group-hover/card:opacity-100 group-hover/card:duration-[250ms] group-hover/card:ease-[cubic-bezier(.3,.7,.4,1.5)]"
        style={
          isPressed
            ? { transform: "translateY(1px)", transitionDuration: "34ms" }
            : undefined
        }
      ></div>

      {/* Edge */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-2xl opacity-0 transition-opacity duration-[600ms] group-hover/card:opacity-100 group-hover/card:duration-[250ms]"
        style={{
          background:
            "linear-gradient(to left, #e5e5e5 0%, #f5f5f5 8%, #f5f5f5 92%, #e5e5e5 100%)",
        }}
      ></div>

      {/* Front */}
      <div
        className={`relative rounded-2xl bg-white flex flex-col overflow-hidden border border-[#e5e5e5] shadow-sm group-hover/card:shadow-none will-change-transform translate-y-[0px] transition-all duration-[600ms] ease-[cubic-bezier(.3,.7,.4,1)] group-hover/card:-translate-y-[6px] group-hover/card:duration-[250ms] group-hover/card:ease-[cubic-bezier(.3,.7,.4,1.5)] ${className}`}
        style={
          isPressed
            ? { transform: "translateY(-2px)", transitionDuration: "34ms" }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

export default Animated3DCard
