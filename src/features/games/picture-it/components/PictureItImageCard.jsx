import React from 'react';
import { motion } from 'framer-motion';
import { Flag, ImageOff, Loader2, Mic } from 'lucide-react';
import { CategoryBadge } from './round-result';

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
  return (
    <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-4 flex flex-col gap-3">
      <div className="text-base font-bold">
        {isDescriber ? 'Describe this image to your team' : 'Listen and prepare to rate'}
      </div>

      <div className="relative h-[60vh] w-full rounded-[20px] overflow-hidden bg-[#f3f3f3] flex items-center justify-center">
        {imgLoading && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3] z-10">
            <Loader2 className="h-8 w-8 animate-spin text-cath-red-700" />
            <span className="text-lg text-secondary font-semibold">Loading image...</span>
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3] text-secondary z-10">
            <ImageOff size={40} strokeWidth={1.5} className="text-[#C6C6C6]" />
            <span className="text-lg font-medium">Image unavailable</span>
          </div>
        )}
        {!imgError && displayImageUrl && (
          <img
            src={displayImageUrl}
            alt="Picture IT"
            className={`h-full w-full object-cover transition-all duration-500 ${
              imgLoading ? 'opacity-0' : 'opacity-100'
            } ${
              !isDescriber && imageBlurred ? 'blur-xl scale-110' : 'blur-0 scale-100'
            }`}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgLoading(false);
              setImgError(true);
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
                  Describer is speaking...
                </span>
              </>
            ) : (
              <>
                <Mic size={32} className="text-white/70 animate-pulse" />
                <span className="text-white font-semibold text-lg drop-shadow-md">
                  Preparing...
                </span>
              </>
            )}
          </div>
        )}

        {category && (
          <CategoryBadge category={category} className="absolute bottom-4 left-4 z-10" />
        )}
      </div>

      {/* Forbidden words (Describer only) */}
      {isDescriber && forbiddenWords.length > 0 && (
        <div className="flex items-center gap-4 px-1 shrink-0">
          <div className="shrink-0">
            <div className="text-sm font-semibold text-headingColor">Forbidden words</div>
            <p className="text-xs text-secondary">Do NOT use these words</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {forbiddenWords.map((word) => (
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
            {flagCount} / {raterCount} flagged
          </span>
        </div>
      )}
    </div>
  );
};

export default PictureItImageCard;
