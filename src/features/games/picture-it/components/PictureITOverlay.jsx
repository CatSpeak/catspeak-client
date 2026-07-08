import ChipFilter from "@/shared/components/ChipFilter";
import { FluentAnimation } from "@/shared/components/ui/animations";
import { PillButton } from "@/shared/components/ui/buttons";
import { AnimatePresence } from "framer-motion";
import { Flag, Gamepad2, ImageOff, Loader2, Star } from 'lucide-react'
import React, { useState } from 'react'
import { RoundResultModal } from "./round-result";
import { mockRoundResult } from "../mock/roundResultMock";

const TAGS = [
  { value: "all", label: "Tất cả" },
  { value: "music", label: "Âm nhạc" },
  { value: "gaming", label: "Trò chơi" },
  { value: "live", label: "Trực tiếp" },
  { value: "tech", label: "Công nghệ" },
  { value: "cooking", label: "Nấu ăn" },
];

const PictureITOverlay = ({ open, onClose }) => {
  const [isDescribing, setIsDescribing] = useState(false)
  const [isDescriber, setIsDescriber] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  return (
    <>
      {/* Game overlay */}
      <AnimatePresence>
        {open && (
          <FluentAnimation
            key="picture-it-overlay"
            direction="up"
            exit
            className="fixed inset-0 z-[60] w-full h-full bg-white p-6 space-y-4"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between border rounded-3xl px-4 py-2">
              <div className="flex gap-3 items-center">
                <Gamepad2 />
                <p className="text-cath-red-700 font-bold text-lg">Picture IT</p>
              </div>

              <div className="flex gap-4">
                <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-2.5 rounded-3xl">
                  Round: <p className="font-semibold">3/4</p>
                </div>
                <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-2.5 rounded-3xl">
                  Describer: <p className="font-semibold">Cương</p>
                </div>
              </div>

              <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-2.5 rounded-3xl">
                Language: <p className="font-semibold">English</p>
              </div>
            </div>

            {/* Content */}
            <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-4 flex flex-col gap-3">
              <div className=" text-base font-bold">Describe this image</div>

              {/* Image — fixed height container preserves layout in all states */}
              <div className="relative h-[60vh] w-full rounded-[20px] overflow-hidden bg-[#f3f3f3] flex items-center justify-center">

                {/* Loading skeleton */}
                {isLoading && !imgError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3]">
                    <Loader2 className="h-8 w-8 animate-spin text-cath-red-700" />
                    <span className="text-lg text-secondary font-semibold">Loading image...</span>
                  </div>
                )}

                {/* Error / no-src fallback */}
                {imgError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3] text-secondary">
                    <ImageOff size={40} strokeWidth={1.5} className="text-[#C6C6C6]" />
                    <span className="text-lg font-medium">Image unavailable</span>
                    <span className="text-base text-lighttextGray font-semibold">Could not load the round image</span>
                  </div>
                )}

                {!imgError && (
                  <img
                    src="https://picsum.photos/1440/1024"
                    alt="Picture IT"
                    className={`h-full w-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false)
                      setImgError(true)
                    }}
                  />
                )}
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <div className="text-lg font-semibold">Forbidden words:</div>
                  <p className="text-xs">Do NOT use these words while describing</p>
                </div>
                <ChipFilter options={TAGS} />
              </div>
            </div>

            {/* Bottom */}
            {isDescriber ? (
              <div className=" flex items-center justify-center flex-col gap-3">
                <PillButton
                  className="w-full max-w-52"
                  onClick={() => setIsDescribing(!isDescribing)}
                >
                  {isDescribing ? "Describe" : "Describing"}
                </PillButton>
              </div>
            ) : (
              <div className="flex items-center justify-around gap-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">Rating:</div>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="cursor-pointer" />
                    ))}
                  </div>
                  <div className="flex gap-4 flex-1 w-full items-center justify-center">
                    <PillButton
                      className="max-w-52 w-52 text-red-700"
                      variant="outline"
                      startIcon={<Flag />}
                    >
                      Flag
                    </PillButton>
                    <PillButton
                      className="max-w-52 w-52"
                      onClick={() => setShowResultModal(true)}
                    >
                      Submit
                    </PillButton>
                  </div>
                </div>

                <div className="flex items-center justify-center border-2 rounded-3xl border-red-700 w-40 h-10  gap-2">
                  <p className="font-semibold">Time to rate:</p>
                  <p>15s</p>
                </div>
              </div>
            )}
          </FluentAnimation>
        )}
      </AnimatePresence>

      {/* Round result */}
      <RoundResultModal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={mockRoundResult}
      />
    </>
  );
}

export default PictureITOverlay;
