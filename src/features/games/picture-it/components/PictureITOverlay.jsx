import ChipFilter from "@/shared/components/ChipFilter";
import { FluentAnimation } from "@/shared/components/ui/animations";
import { PillButton } from "@/shared/components/ui/buttons";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flag, Gamepad2, ImageOff, Loader2, Mic, MicOff, Star } from 'lucide-react'
import React, { useState } from 'react'
import { CategoryBadge, LeaderboardCard, RoundResultModal } from "./round-result";
import { mockRoundResult, mockForbiddenWords } from "../mock/roundResultMock";

const TAGS = [
  { value: "all", label: "Tất cả" },
  { value: "music", label: "Âm nhạc" },
  { value: "gaming", label: "Trò chơi" },
  { value: "live", label: "Trực tiếp" },
  { value: "tech", label: "Công nghệ" },
  { value: "cooking", label: "Nấu ăn" },
];

const MOCK_IMAGES = [
  { url: "https://picsum.photos/seed/cat1/800/600", category: "Animals" },
  { url: "https://picsum.photos/seed/city2/800/600", category: "Architecture" },
  { url: "https://picsum.photos/seed/food3/800/600", category: "Food" },
  { url: "https://picsum.photos/seed/nature4/800/600", category: "Nature" },
];

const RATING_COUNTDOWN_SEC = 15;

const PictureITOverlay = ({ open, gameConfig, onClose }) => {
  const [isDescribing, setIsDescribing] = useState(false)
  const [isDescriber, setIsDescriber] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imgError, setImgError] = useState(false)
  const [isRatingPhase, setIsRatingPhase] = useState(false);
  const [isWaitingForRatings, setIsWaitingForRatings] = useState(false);
  const [ratingCountdown, setRatingCountdown] = useState(RATING_COUNTDOWN_SEC);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  const currentImage = MOCK_IMAGES[currentRoundIndex % MOCK_IMAGES.length];
  const forbiddenWords = mockForbiddenWords[currentImage.category] ?? [];

  const handleFinishDescribing = () => {
    setIsDescribing(false);
    setIsWaitingForRatings(true); // Describer sees waiting screen
    setIsRatingPhase(true);       // Rater sees rating UI
  };

  const handleSubmitRating = () => {
    setIsRatingPhase(false);
    setIsWaitingForRatings(false);
    setShowResultModal(true);
  };

  const handleResultClose = () => {
    setShowResultModal(false);
    setSelectedRating(0);
    setIsWaitingForRatings(false);
    setIsRatingPhase(false);
    setCurrentRoundIndex((i) => i + 1);
  };

  const language = gameConfig?.language ?? "English";
  const difficulty = gameConfig?.difficulty ?? "Medium";
  const totalRounds = MOCK_IMAGES.length;
  const roundNumber = currentRoundIndex + 1;

  return (
    <>
      {/* Game overlay */}
      <AnimatePresence>
        {open && (
          <FluentAnimation
            key="picture-it-overlay"
            direction="up"
            exit
            className="fixed inset-0 z-[60] w-full h-full bg-white px-6 py-4 space-y-4"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between border rounded-3xl px-4 py-2">
              <div className="flex gap-3 items-center">
                <Gamepad2 />
                <p className="text-cath-red-700 font-bold text-lg">Picture IT</p>
              </div>

              <div className="flex gap-4">
                <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl">
                  Round: <p className="font-semibold">3/4</p>
                </div>
                <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl">
                  Describer: <p className="font-semibold">Cương</p>
                </div>
              </div>

              <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl">
                Language: <p className="font-semibold">English</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDescriber
                    ? "border-cath-red-700 text-cath-red-700 bg-cath-red-700/5"
                    : "border-[#f08d1d] text-[#f08d1d] bg-orange-50"
                    }`}
                >
                  {isDescriber ? "Describer" : "Rater"}
                </span>
                <button
                  onClick={() => setIsDescriber((v) => !v)}
                  className="text-[10px] text-lighttextGray border border-[#E5E5E5] px-2 py-0.5 rounded-full hover:bg-[#f3f3f3] transition-colors"
                >
                  Switch role
                </button>
              </div>
            </div>

            <div className="flex gap-4 flex-1 h-full">
              <div className="flex flex-col flex-1 gap-4 h-full">
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

                    <CategoryBadge category={currentImage.category} className="absolute bottom-4 left-4 z-10" />
                  </div>

                  {forbiddenWords.length > 0 && (
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

                </div>

                {/* Bottom */}
                <div className="shrink-0 border-t border-[#E5E5E5] px-5 py-3 flex items-center justify-center">
                  {/* DESCRIBER: waiting for ratings */}
                  {isDescriber && isWaitingForRatings && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-3"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#f3f3f3] border border-[#E5E5E5]">
                        <Loader2 size={16} className="animate-spin text-cath-red-700" />
                        <span className="text-md font-medium text-secondary">
                          Raters are scoring your description...
                        </span>
                        <span className="text-md font-bold text-cath-red-700 tabular-nums ml-1">
                          {ratingCountdown}s
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* DESCRIBER: active describing phase */}
                  {isDescriber && !isWaitingForRatings && (
                    <div className="flex items-center justify-center gap-4">
                      {isDescribing ? (
                        <>
                          <PillButton
                            className="h-10 w-48"
                            startIcon={<CheckCircle2 size={16} />}
                            onClick={handleFinishDescribing}
                          >
                            Finish describing
                          </PillButton>
                        </>
                      ) : (
                        <PillButton
                          className="h-10 w-48"
                          startIcon={<Mic size={16} />}
                          onClick={() => setIsDescribing(true)}
                        >
                          Start describing
                        </PillButton>
                      )}
                    </div>
                  )}

                  {/* RATER: rating phase */}
                  {!isDescriber && isRatingPhase && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-6"
                    >
                      {/* Star rating */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-headingColor">Your rating:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => {
                            const filled = i < (hoveredRating || selectedRating);
                            return (
                              <Star
                                key={i}
                                size={28}
                                className={`cursor-pointer transition-colors ${filled ? "text-cath-orange-400" : "text-[#E5E5E5]"
                                  }`}
                                fill={filled ? "#f08d1d" : "none"}
                                onMouseEnter={() => setHoveredRating(i + 1)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setSelectedRating(i + 1)}
                              />
                            );
                          })}
                        </div>
                        {selectedRating > 0 && (
                          <span className="text-sm font-bold text-cath-red-700 ml-1">
                            {selectedRating}/5
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <PillButton
                          variant="outline"
                          className="h-10 w-32"
                          startIcon={<Flag size={15} />}
                        >
                          Flag
                        </PillButton>
                        <PillButton
                          className="h-10 w-36"
                          disabled={selectedRating === 0}
                          onClick={handleSubmitRating}
                        >
                          Submit rating
                        </PillButton>
                      </div>
                    </motion.div>
                  )}

                  {/* RATER: waiting for Describer to start */}
                  {!isDescriber && !isRatingPhase && (
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-secondary">
                        Waiting for the Describer to start...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <LeaderboardCard leaderboard={mockRoundResult.leaderboard} className="w-1/3 h-auto" />
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>

      {/* Round result */}
      <RoundResultModal
        open={showResultModal}
        onClose={handleResultClose}
        result={{
          ...mockRoundResult,
          roundNumber,
          totalRounds,
          language,
          difficulty,
          image: currentImage,
          countdown: 5,
        }}
      />
    </>
  );
}

export default PictureITOverlay;
