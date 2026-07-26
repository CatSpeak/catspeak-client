import React, { useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { ImageOff, Loader2, Mic } from 'lucide-react'
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
}) => {
  const { t } = useLanguage()
  const ic = t.rooms?.game?.pictureIt?.imageCard || {}

  useEffect(() => {
    if (!displayImageUrl) {
      setImgLoading(true)
      return
    }
    setImgLoading(true)
    setImgError(false)
    const img = new Image()
    img.src = displayImageUrl
    if (img.complete) {
      setImgLoading(false)
      setImgError(false)
    } else {
      img.onload = () => { setImgLoading(false); setImgError(false); }
      img.onerror = () => { setImgLoading(false); setImgError(true); }
    }
  }, [displayImageUrl, setImgLoading, setImgError])

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
            className={`max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'
              } ${!isDescriber && imageBlurred ? 'blur-xl' : 'blur-0'
              }`}
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

      </div>

      {/* Forbidden words + flag UI đã bỏ — game dùng cơ chế 30s tự động end describe. */}
    </div>
  )
}

export default PictureItImageCard
