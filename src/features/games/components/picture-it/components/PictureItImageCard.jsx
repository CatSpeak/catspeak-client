import React from 'react'
import { motion } from 'framer-motion'
import { Flag, ImageOff, Loader2, Mic } from 'lucide-react'
import { CategoryBadge } from './round-result'
import { useLanguage } from '@/shared/context/LanguageContext'

const PictureItImageCard = ({
  isDescriber,
  imgLoading,
  imgError,
  setImgLoading,
  setImgError,
  displayImageUrl,
  imageBlurred,
  hasDescribeStarted,
  category,
  forbiddenWords = [],
  flagCount,
  raterCount
}) => {
  const { t } = useLanguage()
  const ic = t.rooms?.game?.pictureIt?.imageCard || {}

  return (
    <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-3 md:p-4 flex flex-col gap-2 md:gap-3 flex-1 min-h-0">
      <div className="text-sm md:text-base font-bold shrink-0">
        {isDescriber ? (ic.describeToTeam || 'Describe this image to your team') : (ic.listenAndRate || 'Listen and prepare to rate')}
      </div>

      <div className="relative flex-1 min-h-[30vh] md:min-h-[40vh] lg:min-h-0 w-full rounded-[20px] overflow-hidden bg-[#f3f3f3] flex items-center justify-center">
        {imgLoading && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3] z-10">
            <Loader2 className="h-8 w-8 animate-spin text-cath-red-700" />
            <span className="text-lg text-secondary font-semibold">{ic.loadingImage || 'Loading image...'}</span>
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3] text-secondary z-10">
            <ImageOff size={40} strokeWidth={1.5} className="text-[#C6C6C6]" />
            <span className="text-lg font-medium">{ic.imageUnavailable || 'Image unavailable'}</span>
          </div>
        )}
        {!imgError && displayImageUrl && (
          <img
            src={displayImageUrl}
            alt="Picture IT"
            className={`h-full w-full object-cover transition-all duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'
              } ${!isDescriber && imageBlurred ? 'blur-xl scale-110' : 'blur-0 scale-100'
              }`}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgLoading(false)
              setImgError(true)
            }}
          />
        )}

        {/* Blur overlay label / Audio Wave */}
        {!isDescriber && imageBlurred && !imgLoading && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-sm z-10">
            {hasDescribeStarted ? (
              <>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['10px', '40px', '10px'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.15,
                        ease: 'easeInOut'
                      }}
                      className="w-2 bg-cath-red-700 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-white font-semibold text-lg drop-shadow-md">
                  {ic.describerSpeaking || 'Describer is speaking...'}
                </span>
              </>
            ) : (
              <>
                <Mic size={32} className="text-white/70 animate-pulse" />
                <span className="text-white font-semibold text-lg drop-shadow-md">
                  {ic.preparing || 'Preparing...'}
                </span>
              </>
            )}
          </div>
        )}

        {category && (
          <CategoryBadge category={category} className="absolute bottom-4 left-4 z-10" />
        )}
      </div>

      {/* Forbidden words */}
      {forbiddenWords.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-1 shrink-0">
          <div className="shrink-0">
            <div className="text-sm font-semibold text-headingColor">{ic.forbiddenWordsTitle || 'Forbidden words'}</div>
            <p className="text-xs text-secondary">{ic.forbiddenWordsDesc || 'Do NOT use these words'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {forbiddenWords?.map((word) => (
              <span
                key={word}
                className="text-xs font-medium px-3 py-1 rounded-full border border-cath-red-700/30 bg-cath-red-700/5 text-cath-red-700"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Flag counter */}
      {flagCount > 0 && (
        <div className="flex items-center gap-2 px-1 text-orange-600 text-sm font-medium">
          <Flag size={14} />
          <span>
            {(ic.flaggedCount || '{0} / {1} flagged').replace('{0}', flagCount).replace('{1}', raterCount)}
          </span>
        </div>
      )}
    </div>
  )
}

export default PictureItImageCard
