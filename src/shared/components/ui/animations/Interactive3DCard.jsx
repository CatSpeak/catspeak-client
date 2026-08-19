import { useState, useRef } from "react";

/**
 * Interactive3DCard
 * A 3D tilt card component with layered depth (preserve-3d), dynamic mouse tracking,
 * glassmorphism effects, and popping Z-axis layers.
 */
const Interactive3DCard = ({
  children,
  className = "",
  containerClassName = "",
  maxTilt = 20,
  scaleOnHover = 1.04,
  glare = true,
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransformStyle({
      rotateX,
      rotateY,
      scale: scaleOnHover,
      glareX,
      glareY,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  };

  return (
    <div
      className={`relative [perspective:1000px] ${containerClassName}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      <div
        ref={cardRef}
        className={`relative [transform-style:preserve-3d] ${className}`}
        style={{
          transform: `rotateX(${transformStyle.rotateX}deg) rotateY(${transformStyle.rotateY}deg) scale(${transformStyle.scale})`,
          transition: transformStyle.isHovered
            ? "transform 0.1s cubic-bezier(0.03, 0.98, 0.52, 0.99)"
            : "transform 0.5s ease-out",
        }}
      >
        {/* Glare Overlay */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 z-30 overflow-hidden"
            style={{
              opacity: transformStyle.isHovered ? 0.4 : 0,
              background: `radial-gradient(circle at ${transformStyle.glareX}% ${transformStyle.glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 65%)`,
            }}
          />
        )}

        {children}
      </div>
    </div>
  );
};

export default Interactive3DCard;
