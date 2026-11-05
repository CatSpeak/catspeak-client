/* eslint-disable react-refresh/only-export-components */
import React, { useRef, useState, useLayoutEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ThumbsUp, Heart, Smile } from "lucide-react";
import IconButton from "@/shared/components/ui/buttons/IconButton";
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation";

export const DEFAULT_REACTIONS = [
  {
    type: "Like",
    value: "Like",
    label: "Like",
    icon: ThumbsUp,
    colorClass: "text-blue-700 fill-blue-400",
    hoverBgClass: "group-hover/icon:bg-blue-50 dark:group-hover/icon:bg-blue-950/40",
  },
  {
    type: "Love",
    value: "Love",
    label: "Love",
    icon: Heart,
    colorClass: "text-red-700 fill-red-400",
    hoverBgClass: "group-hover/icon:bg-red-50 dark:group-hover/icon:bg-red-950/40",
  },
  {
    type: "Haha",
    value: "Haha",
    label: "Haha",
    icon: Smile,
    colorClass: "text-yellow-700 fill-yellow-400",
    hoverBgClass: "group-hover/icon:bg-yellow-50 dark:group-hover/icon:bg-yellow-950/40",
  },
];

export const COMMENT_REACTIONS = [
  {
    type: 1,
    value: 1,
    label: "Like",
    icon: ThumbsUp,
    colorClass: "text-blue-600 fill-blue-400",
    hoverBgClass: "group-hover/icon:bg-blue-50 dark:group-hover/icon:bg-blue-950/40",
  },
  {
    type: 2,
    value: 2,
    label: "Love",
    icon: Heart,
    colorClass: "text-red-600 fill-red-400",
    hoverBgClass: "group-hover/icon:bg-red-50 dark:group-hover/icon:bg-red-950/40",
  },
  {
    type: 3,
    value: 3,
    label: "Haha",
    icon: Smile,
    colorClass: "text-yellow-600 fill-yellow-400",
    hoverBgClass: "group-hover/icon:bg-yellow-50 dark:group-hover/icon:bg-yellow-950/40",
  },
];

const ReactionsPopover = ({
  show = false,
  onSelect,
  onClose,
  reactions = DEFAULT_REACTIONS,
  className = "",
  size = "sm",
  placement = "center",
  iconSize,
}) => {
  const popoverRef = useRef(null);
  const [shiftX, setShiftX] = useState(0);

  // Smart viewport edge detection & auto-clamping
  useLayoutEffect(() => {
    if (!show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShiftX(0);
      return;
    }

    const updatePosition = () => {
      const el = popoverRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const margin = 8;

      let minLeft = margin;
      // Account for desktop sidebar boundary if present
      const desktopSidebar = document.querySelector("aside.sticky");
      if (desktopSidebar && window.innerWidth >= 1024) {
        const sidebarRect = desktopSidebar.getBoundingClientRect();
        if (sidebarRect.right > 0 && sidebarRect.width > 0) {
          minLeft = sidebarRect.right + margin;
        }
      }

      let offset = 0;
      if (rect.left < minLeft) {
        offset = minLeft - rect.left;
      } else if (rect.right > viewportWidth - margin) {
        offset = viewportWidth - margin - rect.right;
      }

      setShiftX(offset);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [show]);

  const getPlacementClass = () => {
    if (placement === "left") return "left-0 origin-bottom-left";
    if (placement === "right") return "right-0 origin-bottom-right";
    return "left-1/2 -translate-x-1/2 origin-bottom";
  };

  const dynamicTransform =
    placement === "center" && shiftX
      ? `translateX(calc(-50% + ${shiftX}px))`
      : undefined;

  return (
    <AnimatePresence>
      {show && (
        <div
          ref={popoverRef}
          className={`absolute bottom-full pb-2 z-50 group-hover/reactions:block ${getPlacementClass()} ${className}`}
          style={dynamicTransform ? { transform: dynamicTransform } : undefined}
        >
          {/* Invisible hover bridge to eliminate dead gap between trigger and popover */}
          <div
            className="absolute inset-x-0 -bottom-2.5 h-4 pointer-events-auto"
            aria-hidden="true"
          />
          <FluentAnimation direction="up" distance={10} duration={0.2} exit>
            <div className="bg-white dark:bg-[#272727] rounded-full shadow-lg dark:shadow-2xl border border-border dark:border-[#3F3F3F] p-1 flex items-center gap-2">
              {reactions.map((item) => {
                const IconComp = item.icon;
                const itemHoverClass =
                  item.hoverBgClass && !item.hoverBgClass.includes("scale")
                    ? item.hoverBgClass
                    : "group-hover/icon:bg-[#F2F2F2] dark:group-hover/icon:bg-[#3D3D3D] transition-colors";

                return (
                  <IconButton
                    key={item.type ?? item.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClose) onClose();
                      if (onSelect) onSelect(e, item.value ?? item.type);
                    }}
                    size={size}
                    variant="transparent"
                    title={item.label}
                    className="group/icon"
                    innerClassName={itemHoverClass}
                  >
                    <IconComp size={iconSize} className={item.colorClass} />
                  </IconButton>
                );
              })}
            </div>
          </FluentAnimation>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ReactionIcon = ({
  reaction,
  size = 16,
  strokeWidth = 1.5,
  className = "",
  color,
}) => {
  if (reaction === "Love" || reaction === 2) {
    return (
      <Heart
        size={size}
        strokeWidth={strokeWidth}
        className={`text-red-700 fill-red-400 ${className}`}
      />
    );
  }
  if (reaction === "Haha" || reaction === 3) {
    return (
      <Smile
        size={size}
        strokeWidth={strokeWidth}
        className={`text-yellow-700 fill-yellow-400 ${className}`}
      />
    );
  }
  if (reaction === "Like" || reaction === 1) {
    return (
      <ThumbsUp
        size={size}
        strokeWidth={strokeWidth}
        className={`text-blue-700 fill-blue-400 ${className}`}
      />
    );
  }

  const getColorClass = (c) => {
    if (!c) return "text-[#7b7979]";
    if (c.startsWith("text-")) return c;
    const cleaned = c.replace(/^cath-/, "");
    return `text-${cleaned}`;
  };

  return (
    <ThumbsUp
      size={size}
      strokeWidth={strokeWidth}
      className={`${getColorClass(color)} ${className}`}
    />
  );
};

export default ReactionsPopover;
