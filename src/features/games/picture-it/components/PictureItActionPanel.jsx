import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flag, Loader2, Mic, Star } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';

const PictureItActionPanel = ({
  isSpectator,
  isDescriber,
  isDescribing,
  isRatingPhase,
  isWaitingForRatings,
  hasDescribeStarted,
  myFlagged,
  ratingCountdownSec,
  selectedRating,
  setSelectedRating,
  hoveredRating,
  setHoveredRating,
  myRatingSubmitted,
  handleDescribeStart,
  handleDescribeEnd,
  handleFlag,
  handleSubmitRating,
  interactionsDisabled
}) => {
  return (
    <div className="shrink-0 border-t border-t-[#E5E5E5] px-5 py-3 flex items-center justify-center min-h-[64px] bg-white">
      {/* Spectator — no actions */}
      {isSpectator && (
        <span className="text-sm text-secondary italic">You are watching as a spectator.</span>
      )}

      {/* Describer — Describing phase */}
      {!isSpectator && isDescriber && isDescribing && !hasDescribeStarted && (
        <div className="flex items-center gap-4">
          <PillButton
            className="h-10 w-48 bg-cath-red-700 text-white"
            startIcon={<Mic size={16} />}
            onClick={handleDescribeStart}
          >
            Start describing
          </PillButton>
        </div>
      )}

      {!isSpectator && isDescriber && isDescribing && hasDescribeStarted && (
        <div className="flex items-center gap-4">
          <PillButton
            className="h-10 w-48 border-cath-red-700 text-cath-red-700 hover:bg-cath-red-700 hover:text-white transition-colors"
            startIcon={<CheckCircle2 size={16} />}
            onClick={handleDescribeEnd}
          >
            Finish describing
          </PillButton>
        </div>
      )}

      {/* Describer — waiting for ratings */}
      {!isSpectator && isWaitingForRatings && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#f3f3f3] border border-[#E5E5E5]">
            <Loader2 size={16} className="animate-spin text-cath-red-700" />
            <span className="text-md font-medium text-secondary">
              Raters are scoring... ({ratingCountdownSec}s)
            </span>
          </div>
        </motion.div>
      )}

      {/* Rater — Describing phase: Flag button */}
      {!isSpectator && !isDescriber && isDescribing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <PillButton
            className={`h-10 w-40 ${
              myFlagged || !hasDescribeStarted ? 'opacity-50 cursor-not-allowed' : ''
            } border-orange-500 text-orange-600 hover:bg-orange-50`}
            startIcon={<Flag size={16} />}
            disabled={myFlagged || !hasDescribeStarted || interactionsDisabled}
            onClick={handleFlag}
          >
            {myFlagged ? 'Flagged' : 'Flag Language'}
          </PillButton>
          <span className="text-xs text-secondary">Flag if they use forbidden words</span>
        </motion.div>
      )}

      {/* Rater — Rating phase */}
      {!isSpectator && !isDescriber && isRatingPhase && !myRatingSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-headingColor">Your rating:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const filled = i < (hoveredRating || selectedRating);
                return (
                  <Star
                    key={i}
                    size={28}
                    className={`cursor-pointer transition-colors ${
                      filled ? 'text-cath-orange-400' : 'text-[#E5E5E5]'
                    }`}
                    fill={filled ? '#f08d1d' : 'none'}
                    onMouseEnter={() => setHoveredRating(i + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setSelectedRating(i + 1)}
                  />
                );
              })}
            </div>
            <span className="text-sm text-secondary ml-2">({ratingCountdownSec}s left)</span>
          </div>
          <PillButton
            className="h-10 w-36 bg-cath-red-700 text-white"
            disabled={selectedRating === 0 || interactionsDisabled}
            onClick={handleSubmitRating}
          >
            Submit rating
          </PillButton>

          {/* Allow Flagging during rating as well */}
          <div className="h-6 w-px bg-[#e5e5e5] mx-2"></div>
          <PillButton
            className={`h-10 px-4 ${
              myFlagged ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' : 'border-orange-500 text-orange-600 hover:bg-orange-50'
            }`}
            startIcon={<Flag size={16} />}
            disabled={myFlagged || interactionsDisabled}
            onClick={handleFlag}
            title="Flag if they used forbidden words"
          >
            {myFlagged ? 'Flagged' : 'Flag'}
          </PillButton>
        </motion.div>
      )}

      {/* Rater — Rating submitted */}
      {!isSpectator && !isDescriber && isRatingPhase && myRatingSubmitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-green-600"
        >
          <CheckCircle2 size={18} />
          <span className="font-medium">Rating submitted! Waiting for others...</span>
        </motion.div>
      )}

      {/* Generic waiting state */}
      {!isSpectator && !isDescriber && !isDescribing && !isRatingPhase && (
        <div className="flex items-center justify-center">
          <span className="text-sm text-secondary">Waiting...</span>
        </div>
      )}
    </div>
  );
};

export default PictureItActionPanel;
