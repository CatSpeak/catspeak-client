import React from "react";
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
    hoverBgClass: "group-hover/icon:bg-blue-50",
  },
  {
    type: "Love",
    value: "Love",
    label: "Love",
    icon: Heart,
    colorClass: "text-red-700 fill-red-400",
    hoverBgClass: "group-hover/icon:bg-red-50",
  },
  {
    type: "Haha",
    value: "Haha",
    label: "Haha",
    icon: Smile,
    colorClass: "text-yellow-700 fill-yellow-400",
    hoverBgClass: "group-hover/icon:bg-yellow-50",
  },
];

export const COMMENT_REACTIONS = [
  {
    type: 1,
    value: 1,
    label: "Like",
    icon: ThumbsUp,
    colorClass: "text-blue-600 fill-blue-400",
    hoverBgClass: "group-hover/icon:bg-blue-50",
  },
  {
    type: 2,
    value: 2,
    label: "Love",
    icon: Heart,
    colorClass: "text-red-600 fill-red-400",
    hoverBgClass: "group-hover/icon:bg-red-50",
  },
  {
    type: 3,
    value: 3,
    label: "Haha",
    icon: Smile,
    colorClass: "text-yellow-600 fill-yellow-400",
    hoverBgClass: "group-hover/icon:bg-yellow-50",
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
  color,
}) => {
  const placementClass =
    placement === "left"
      ? "left-0 origin-bottom-left"
      : placement === "right"
        ? "right-0 origin-bottom-right"
        : "left-1/2 -translate-x-1/2 origin-bottom";

  return (
    <AnimatePresence>
      {show && (
        <div
          className={`absolute bottom-full mb-1 z-20 group-hover/reactions:block ${placementClass} ${className}`}
        >
          <FluentAnimation direction="up" distance={10} duration={0.2} exit>
            <div className="bg-white rounded-full shadow-lg border border-border p-1 flex items-center">
              {reactions.map((item) => {
                const IconComp = item.icon;
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
                    className="hover:-translate-y-1 transition-transform"
                    innerClassName={item.hoverBgClass || ""}
                  >
                    <IconComp className={item.colorClass} />
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
