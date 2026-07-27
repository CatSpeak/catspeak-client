import React from 'react'
import { CheckCircle2, Loader2, Star } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from '@/shared/context/LanguageContext'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

const PictureItActionPanel = ({
  isDescriber,
  isSpectator,
  isMain = true,
  isDescribing,
  isRatingPhase,
  isWaitingForRatings,
  ratingCountdownSec,
  selectedRating,
  setSelectedRating,
  hoveredRating,
  setHoveredRating,
  myRatingSubmitted,
  handleSubmitRating,
}) => {
  const { t } = useLanguage()
  const ap = t.rooms?.game?.pictureIt?.actionPanel || {}

  // Khi đang ở giai đoạn mô tả (describing), đếm ngược 30s đã ở TopBar nên ẩn thanh ActionPanel phía dưới
  if (isMain && !isSpectator && isDescribing) {
    return null
  }

  return (
    <div className="shrink-0 border-t border-slate-100 px-2 md:px-3 py-2 flex items-center justify-center min-h-[52px] md:min-h-[60px] bg-white">
      {/* Tile thu nhỏ ở sidebar — không cho tương tác */}
      {!isMain && (
        <span className="text-xs md:text-sm text-slate-500 italic">
          {ap.clickToExpand || 'Click the tile to interact'}
        </span>
      )}

      {/* Spectator — chỉ xem */}
      {isMain && isSpectator && (
        <span className="text-xs md:text-sm text-secondary italic">
          {ap.watchingAsSpectator || 'You are watching as a spectator.'}
        </span>
      )}

      {/* Describer — waiting for ratings */}
      {
        isMain && isWaitingForRatings && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <Loader2 size={16} className="animate-spin text-cath-red-700" />
            <span className="text-sm md:text-base font-medium text-secondary">
              {(ap.ratersAreScoring || 'Raters are scoring... ({0}s)').replace('{0}', ratingCountdownSec)}
            </span>
          </motion.div>
        )
      }

      {/* Rater — Rating phase */}
      {
        isMain && !isSpectator && !isDescriber && isRatingPhase && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full"
          >
            {!myRatingSubmitted ? (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-sm md:text-base font-semibold text-headingColor">{ap.yourRating || 'Your rating:'}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => {
                      const filled = i < (hoveredRating || selectedRating)
                      return (
                        <Star
                          key={i}
                          size={22}
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
                  <span className="text-xs text-secondary sm:ml-1">{(ap.timeLeft || '({0}s left)').replace('{0}', ratingCountdownSec)}</span>
                </div>
                <PillButton
                  className="h-8 md:h-9 px-4 w-full sm:w-auto text-sm"
                  disabled={selectedRating === 0}
                  onClick={handleSubmitRating}
                >
                  {ap.submitRating || 'Submit rating'}
                </PillButton>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={16} />
                <span className="font-medium text-xs md:text-sm text-center">{ap.ratingSubmitted || 'Rating submitted! Waiting for others...'}</span>
              </div>
            )}
          </motion.div>
        )
      }

      {/* Generic waiting state */}
      {
        isMain && !isSpectator && !isDescriber && !isDescribing && !isRatingPhase && (
          <div className="flex items-center justify-center">
            <span className="text-xs md:text-sm text-secondary">{ap.waiting || 'Waiting...'}</span>
          </div>
        )
      }
    </div >
  )
}

export default PictureItActionPanel
