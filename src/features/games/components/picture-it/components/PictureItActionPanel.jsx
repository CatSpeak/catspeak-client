import React from 'react'
import { CheckCircle2, Loader2, Star } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from '@/shared/context/LanguageContext'
import { motion } from 'framer-motion'

const PictureItActionPanel = ({
  isDescriber,
  isSpectator,
  isMain = true,
  isDescribing,
  isRatingPhase,
  isWaitingForRatings,
  hasDescribeStarted,
  describeCountdownSec,
  ratingCountdownSec,
  selectedRating,
  setSelectedRating,
  hoveredRating,
  setHoveredRating,
  myRatingSubmitted,
  handleDescribeStart,
  handleDescribeEnd,
  handleSubmitRating,
  interactionsDisabled
}) => {
  const { t } = useLanguage()
  const ap = t.rooms?.game?.pictureIt?.actionPanel || {}

  // Khi đang ở giai đoạn mô tả (describing), đếm ngược 30s đã ở TopBar nên ẩn thanh ActionPanel phía dưới
  if (isMain && !isSpectator && isDescribing) {
    return null
  }

  return (
    <div className="shrink-0 border-t border-t-[#E5E5E5] px-5 py-3 flex items-center justify-center min-h-[64px] bg-white rounded-[24px]">
      {/* Tile thu nhỏ ở sidebar — không cho tương tác */}
      {!isMain && (
        <span className="text-sm text-slate-500 italic">
          {ap.clickToExpand || 'Click the tile to interact'}
        </span>
      )}

      {/* Spectator — chỉ xem */}
      {isMain && isSpectator && (
        <span className="text-sm text-secondary italic">
          {ap.watchingAsSpectator || 'You are watching as a spectator.'}
        </span>
      )}

      {/* Describer — waiting for ratings */}
      {
        isMain && isWaitingForRatings && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl">
              <Loader2 size={16} className="animate-spin text-cath-red-700" />
              <span className="text-md font-medium text-secondary">
                {(ap.ratersAreScoring || 'Raters are scoring... ({0}s)').replace('{0}', ratingCountdownSec)}
              </span>
            </div>
          </motion.div>
        )
      }

      {/* Rater — Rating phase */}
      {
        isMain && !isSpectator && !isDescriber && isRatingPhase && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
          >
            {!myRatingSubmitted ? (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-base sm:text-lg font-semibold text-headingColor">{ap.yourRating || 'Your rating:'}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => {
                      const filled = i < (hoveredRating || selectedRating)
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
                      )
                    })}
                  </div>
                  <span className="text-xs sm:text-sm text-secondary sm:ml-2">{(ap.timeLeft || '({0}s left)').replace('{0}', ratingCountdownSec)}</span>
                </div>
                <PillButton
                  className="h-9 sm:h-10 px-4 w-full sm:w-auto"
                  disabled={selectedRating === 0 || interactionsDisabled}
                  onClick={handleSubmitRating}
                >
                  {ap.submitRating || 'Submit rating'}
                </PillButton>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={18} />
                <span className="font-medium text-sm sm:text-base text-center">{ap.ratingSubmitted || 'Rating submitted! Waiting for others...'}</span>
              </div>
            )}

            {/* <div className="hidden sm:block h-6 w-px bg-[#e5e5e5] mx-2"></div> */}
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
        )
      }

      {/* Generic waiting state */}
      {
        isMain && !isSpectator && !isDescriber && !isDescribing && !isRatingPhase && (
          <div className="flex items-center justify-center">
            <span className="text-sm text-secondary">{ap.waiting || 'Waiting...'}</span>
          </div>
        )
      }
    </div >
  )
}

export default PictureItActionPanel
