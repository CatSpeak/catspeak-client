import React, { useState } from "react";
import {
  ReactionBadge,
  REACTION_CONFIG,
} from "./FacebookReactionBadge";
import ReactionsListModal from "./ReactionsListModal";
import {
  normalizeReactions,
  getTotalReactionsCount,
} from "../utils/reactionUtils";
import { useGetPostReactionsQuery } from "@/store/api/social/postsApi";

const ReactionStackedBadges = ({
  postId,
  reactions: propReactions,
  totalReactions = 0,
  className = "",
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: fetchedReactions } = useGetPostReactionsQuery(postId, {
    skip: !postId || Boolean(propReactions),
  });

  const rawReactions = propReactions || fetchedReactions;
  const normalized = normalizeReactions(rawReactions);
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

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  return (
    <>
      <div className={`relative flex items-center ${className}`}>
        <div
          className="relative inline-flex items-center cursor-pointer touch-manipulation before:absolute before:top-1/2 before:-translate-y-1/2 before:left-1/2 before:-translate-x-1/2 before:min-w-[48px] before:min-h-[48px] before:w-full before:h-full before:content-['']"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              handleOpenModal();
            }
          }}
          aria-label="View reactions"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal();
          }}
        >
          {activeKeys.map((key) => {
            const BadgeComp = REACTION_CONFIG[key]?.badge;
            if (!BadgeComp) return null;

            return (
              <div key={key} className="shrink-0">
                <BadgeComp size={20} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Facebook-style Reactions Modal */}
      <ReactionsListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab="all"
        normalizedReactions={normalized}
        totalReactions={total}
      />
    </>
  );
};

export default ReactionStackedBadges;
