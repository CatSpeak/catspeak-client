import React, { useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { ImageOff, Loader2, Mic } from 'lucide-react'
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
  describerName,
}) => {
  const { t } = useLanguage()
  const ic = t.rooms?.game?.pictureIt?.imageCard || {}
  const tb = t.rooms?.game?.pictureIt?.topBar || {}

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
      img.onload = () => { setImgLoading(false); setImgError(false) }
      img.onerror = () => { setImgLoading(false); setImgError(true) }
    }
  }, [displayImageUrl, setImgLoading, setImgError])

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">

      {/* Khung ảnh — chiếm toàn bộ không gian còn lại, object-cover để ảnh full không thừa khoảng trống */}
      <div className="relative flex-1 min-h-0 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
        {/* Overlay "Người mô tả" ở góc trên-trái ảnh — chỉ hiện khi có describer */}
        {describerName && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-30 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white px-2.5 py-1 rounded-full shadow-md max-w-[60%]">
            <Mic size={12} className="text-white/80 shrink-0 md:hidden" />
            <span className="text-[10px] md:text-xs font-semibold whitespace-nowrap truncate">
              <span className="opacity-70 font-medium">{tb.describer || 'Describer'}:</span>{" "}
              <span className="font-bold">{describerName}</span>
            </span>
          </div>
        )}
        {imgLoading && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 z-10">
            <Loader2 className="h-7 w-7 animate-spin text-cath-red-700" />
            <span className="text-sm text-secondary font-semibold">
              {ic.loadingImage || 'Loading image...'}
            </span>
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 text-secondary z-10">
            <ImageOff size={36} strokeWidth={1.5} className="text-slate-400" />
            <span className="text-base font-medium">{ic.imageUnavailable || 'Image unavailable'}</span>
          </div>
        )}
        {!imgError && displayImageUrl && (
          <img
            src={displayImageUrl}
            alt="Picture IT"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              imgLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Lớp blur overlay — KHÔNG dùng filter trên element con để tránh lòi ra ngoài.
            Dùng backdrop-filter (parent) + ảnh bình thường bên dưới. */}
        {!isDescriber && imageBlurred && !imgLoading && !imgError && displayImageUrl && (
          <div
            className="absolute inset-0 z-[5] pointer-events-none rounded-2xl"
            style={{
              backdropFilter: "blur(22px) saturate(120%) brightness(0.85)",
              WebkitBackdropFilter: "blur(22px) saturate(120%) brightness(0.85)",
              backgroundColor: "rgba(15, 23, 42, 0.25)",
            }}
          />
        )}

        {/* Blur overlay label / Audio Wave — chỉ hiện khi chưa phải describer và ảnh đang bị blur */}
        {!isDescriber && imageBlurred && !imgLoading && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
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
                      className="w-1.5 bg-white rounded-full"
                    />
                  ))}
                </div>
                <span className="text-white font-semibold text-base md:text-lg drop-shadow-md">
                  {ic.describerSpeaking || 'Describer is speaking...'}
                </span>
              </>
            ) : (
              <>
                <Mic size={28} className="text-white/70 animate-pulse" />
                <span className="text-white font-semibold text-base md:text-lg drop-shadow-md">
                  {ic.preparing || 'Preparing...'}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PictureItImageCard
