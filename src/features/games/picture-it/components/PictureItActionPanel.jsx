import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flag, Loader2, Mic, Star } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';
import { useLanguage } from '@/shared/context/LanguageContext';

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
  const { t } = useLanguage();
  const ap = t.rooms?.game?.pictureIt?.actionPanel || {};

  return (
    <div className="shrink-0 border-t border-t-[#E5E5E5] px-5 py-3 flex items-center justify-center min-h-[64px] bg-white">
      {/* Spectator — no actions */}
      {isSpectator && (
        <span className="text-sm text-secondary italic">{ap.watchingAsSpectator || 'You are watching as a spectator.'}</span>
      )}

      {/* Describer — Describing phase */}
      {!isSpectator && isDescriber && isDescribing && (
        <div className="flex items-center gap-4 animate-fade-in">
          {!hasDescribeStarted ? (
            <PillButton
              className="h-11 px-6 bg-[#F7F7F7] hover:bg-[#EDEDED] border border-[#E5E5E5] font-bold transition-all shadow-sm"
              textColor={"black"}
              startIcon={<Mic size={18} className="text-black" />}
              onClick={handleDescribeStart}
            >
              {ap.turnOnMic || 'Turn on Mic (Start)'}
            </PillButton>
          ) : (
            <PillButton
              className="h-11 px-6 bg-cath-red-600 hover:bg-cath-red-700 text-white font-bold transition-all shadow-md shadow-red-600/20 border border-red-500 relative flex items-center gap-2"
              onClick={handleDescribeEnd}
            >
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              {ap.turnOffMic || 'Turn off Mic (Finish)'}
            </PillButton>
          )}
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
              {(ap.ratersAreScoring || 'Raters are scoring... ({0}s)').replace('{0}', ratingCountdownSec)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Rater — Rating phase */}
      {!isSpectator && !isDescriber && isRatingPhase && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-6"
        >
          {!myRatingSubmitted ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-headingColor">{ap.yourRating || 'Your rating:'}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const filled = i < (hoveredRating || selectedRating);
                    return (
                      <Star
                        key={i}
                        size={28}
                        className={`cursor-pointer transition-colors ${filled ? 'text-cath-orange-400' : 'text-[#E5E5E5]'
                          }`}
                        fill={filled ? '#f08d1d' : 'none'}
                        onMouseEnter={() => setHoveredRating(i + 1)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setSelectedRating(i + 1)}
                      />
                    );
                  })}
                </div>
                <span className="text-sm text-secondary ml-2">{(ap.timeLeft || '({0}s left)').replace('{0}', ratingCountdownSec)}</span>
              </div>
              <PillButton
                className="h-10 w-36 bg-cath-red-700 text-white"
                disabled={selectedRating === 0 || interactionsDisabled}
                onClick={handleSubmitRating}
              >
                {ap.submitRating || 'Submit rating'}
              </PillButton>
            </>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={18} />
              <span className="font-medium">{ap.ratingSubmitted || 'Rating submitted! Waiting for others...'}</span>
            </div>
          )}

          <div className="h-6 w-px bg-[#e5e5e5] mx-2"></div>
          {/* <PillButton
            className={`h-10 px-4 ${myFlagged || selectedRating > 0 || myRatingSubmitted ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' : 'border-orange-500 text-orange-600 hover:bg-orange-50'
              }`}
            startIcon={<Flag size={16} />}
            disabled={myFlagged || selectedRating > 0 || myRatingSubmitted || interactionsDisabled}
            onClick={handleFlag}
            title={selectedRating > 0 || myRatingSubmitted ? "Cannot flag after rating" : "Flag if they used forbidden words"}
          >
            {myFlagged ? 'Flagged' : 'Flag'}
          </PillButton> */}
        </motion.div>
      )}

      {/* Generic waiting state */}
      {!isSpectator && !isDescriber && !isDescribing && !isRatingPhase && (
        <div className="flex items-center justify-center">
          <span className="text-sm text-secondary">{ap.waiting || 'Waiting...'}</span>
        </div>
      )}
    </div>
  );
};

export default PictureItActionPanel;
