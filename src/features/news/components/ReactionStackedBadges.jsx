import React, { useState } from "react";
import {
  ReactionBadge,
  REACTION_CONFIG,
} from "./ReactionBadge";
import ReactionTooltip from "./ReactionTooltip";
import ReactionsListModal from "./ReactionsListModal";
import {
  normalizeReactions,
  getTotalReactionsCount,
} from "../utils/reactionUtils";

const ReactionStackedBadges = ({
  reactions,
  totalReactions = 0,
  className = "",
}) => {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  const normalized = normalizeReactions(reactions);
  const total = getTotalReactionsCount(normalized, totalReactions);

  // Determine which reaction badges to display
  let activeKeys = ["like", "love", "haha"].filter(
    (key) => normalized[key] && normalized[key].length > 0,
  );

  // If backend provided totalReactions > 0 but reaction list was not populated
  if (activeKeys.length === 0 && total > 0) {
    activeKeys = ["like"];
  }

  // If no reactions at all, don't display badges
  if (activeKeys.length === 0) {
    return null;
  }

  const handleOpenModal = (tab = "all") => {
    setSelectedTab(tab);
    setModalOpen(true);
  };

  return (
    <>
      <div
        className={`relative flex items-center ${
          hoveredKey ? "z-50" : ""
        } ${className}`}
      >
        <div
          className="flex items-center -space-x-1.5 cursor-pointer py-1"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal("all");
          }}
        >
          {activeKeys.map((key, index) => {
            const BadgeComp = REACTION_CONFIG[key]?.badge;
            if (!BadgeComp) return null;

            const zIndexClass =
              index === 0
                ? "z-10"
                : index === 1
                  ? "z-20"
                  : index === 2
                    ? "z-30"
                    : "z-40";

            return (
              <div
                key={key}
                className={`relative ${zIndexClass} rounded-full ring-2 ring-white hover:scale-125 hover:z-50 transition-transform duration-150`}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(key);
                }}
              >
                <BadgeComp size={20} />

                {/* Hover Tooltip for this reaction */}
                {hoveredKey === key && (
                  <ReactionTooltip
                    type={key}
                    users={normalized[key] || []}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Facebook-style Reactions Modal */}
      <ReactionsListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={selectedTab}
        normalizedReactions={normalized}
        totalReactions={total}
      />
    </>
  );
};

export default ReactionStackedBadges;
