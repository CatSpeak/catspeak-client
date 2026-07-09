import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Flag, Gamepad2, ImageOff, Loader2, Mic, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import { FluentAnimation } from '@/shared/components/ui/animations';
import { PillButton } from '@/shared/components/ui/buttons';
import { CategoryBadge, LeaderboardCard, RoundResultModal, GameOverModal } from './round-result';
import { useGame } from '@/features/video-call/context/GameContext';

const PictureITOverlay = () => {
  const {
    gameState,
    gameType,
    gameLanguage,
    currentRound,
    pictureIt,
    currentUserId,
    startPictureItDescribe,
    endPictureItDescribe,
    submitPictureItFlag,
    submitPictureItRating,
    exitGame
  } = useGame();

  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [myFlagged, setMyFlagged] = useState(false);


  const isPictureIt = gameType === 'picture_it' || gameType === 'picture-it';

  const open = isPictureIt && !['idle'].includes(gameState);
  const isSpectator = pictureIt?.isSpectator;
  const isDescriber = pictureIt?.describerId === currentUserId;
  const isDescribing = gameState === 'playing' && !pictureIt?.ratingOpen;
  const isRatingPhase = gameState === 'playing' && pictureIt?.ratingOpen;
  const showResultModal = gameState === 'result';
  const showGameOver = gameState === 'game_over';
  const showForceStopped = gameState === 'force_stopped';
  const isWaitingForRatings = isDescriber && isRatingPhase;
  const hasDescribeStarted = pictureIt?.describeStarted;

  const totalRounds = currentRound?.total || 0;
  const roundNumber = currentRound?.round || 0;
  const forbiddenWords = pictureIt?.forbiddenWords || [];
  const imageBlurred = pictureIt?.imageBlurred;

  // Image: use revealed full url after DESCRIBE_ENDED, or round url
  const displayImageUrl = pictureIt?.imageUrlFull || pictureIt?.imageUrl;

  // Reset image states whenever image changes
  useEffect(() => {
    setImgLoading(true);
    setImgError(false);
  }, [displayImageUrl]);

  // Reset local state between rounds
  useEffect(() => {
    setSelectedRating(0);
    setHoveredRating(0);
    setMyFlagged(false);
  }, [roundNumber]);


  const handleDescribeStart = useCallback(() => {
    if (!isDescriber) return;
    startPictureItDescribe();
  }, [isDescriber, startPictureItDescribe]);

  const handleDescribeEnd = useCallback(() => {
    if (!isDescriber) return;
    endPictureItDescribe();
  }, [isDescriber, endPictureItDescribe]);

  const handleFlag = useCallback(() => {
    if (isDescriber || isSpectator || myFlagged) return;
    setMyFlagged(true);
    submitPictureItFlag();
  }, [isDescriber, isSpectator, myFlagged, submitPictureItFlag]);

  const handleSubmitRating = useCallback(() => {
    if (selectedRating === 0 || isDescriber || isSpectator) return;
    submitPictureItRating(selectedRating);
    setSelectedRating(0);
  }, [selectedRating, isDescriber, isSpectator, submitPictureItRating]);

  const handleGameOverClose = () => {
    exitGame();
  };

  const interactionsDisabled = isSpectator;

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {!['idle', 'result', 'game_over', 'force_stopped'].includes(gameState) && (
          <FluentAnimation
            key="picture-it-overlay"
            direction="up"
            exit
            className="absolute inset-0 z-[60] w-full h-full bg-white px-6 py-4 space-y-4"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between border rounded-3xl px-4 py-2">
              <div className="flex gap-3 items-center">
                <Gamepad2 />
                <p className="text-cath-red-700 font-bold text-lg">Picture IT</p>
              </div>

              <div className="flex gap-4">
                <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl">
                  Round: <p className="font-semibold">{roundNumber}/{totalRounds || '?'}</p>
                </div>
              </div>

              <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl">
                Language: <p className="font-semibold">{gameLanguage}</p>
              </div>

              <div className="flex items-center gap-2">
                {isSpectator ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-400 text-gray-500 bg-gray-50">
                    Spectator
                  </span>
                ) : (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDescriber
                      ? 'border-cath-red-700 text-cath-red-700 bg-cath-red-700/5'
                      : 'border-[#f08d1d] text-[#f08d1d] bg-orange-50'
                      }`}
                  >
                    {isDescriber ? 'Describer' : 'Rater'}
                  </span>
                )}
              </div>
            </div>

            {/* Countdown overlay */}
            {gameState === 'setup' && pictureIt?.countdown > 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
                <motion.div
                  key={pictureIt.countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-8xl font-black text-cath-red-700"
                >
                  {pictureIt.countdown}
                </motion.div>
              </div>
            )}

            <div className="flex gap-4 flex-1 h-full">
              <div className="flex flex-col flex-1 gap-4 h-full">
                {/* Main image card */}
                <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-4 flex flex-col gap-3">
                  <div className="text-base font-bold">
                    {isDescriber ? 'Describe this image to your team' : 'Listen and prepare to rate'}
                  </div>

                  <div className="relative h-[60vh] w-full rounded-[20px] overflow-hidden bg-[#f3f3f3] flex items-center justify-center">
                    {imgLoading && !imgError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3]">
                        <Loader2 className="h-8 w-8 animate-spin text-cath-red-700" />
                        <span className="text-lg text-secondary font-semibold">Loading image...</span>
                      </div>
                    )}
                    {imgError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f3f3] text-secondary">
                        <ImageOff size={40} strokeWidth={1.5} className="text-[#C6C6C6]" />
                        <span className="text-lg font-medium">Image unavailable</span>
                      </div>
                    )}
                    {!imgError && displayImageUrl && (
                      <img
                        src={displayImageUrl}
                        alt="Picture IT"
                        className={`h-full w-full object-cover transition-all duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'
                          } ${
                          // Blur for Raters until DESCRIBE_ENDED
                          !isDescriber && imageBlurred ? 'blur-xl scale-110' : 'blur-0 scale-100'
                          }`}
                        onLoad={() => setImgLoading(false)}
                        onError={() => { setImgLoading(false); setImgError(true); }}
                      />
                    )}

                    {/* Blur overlay label / Audio Wave */}
                    {!isDescriber && imageBlurred && !imgLoading && !imgError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-sm">
                        {hasDescribeStarted ? (
                          <>
                            <div className="flex items-center gap-1">
                              {/* Simple CSS audio wave animation */}
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ height: ['10px', '40px', '10px'] }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 0.8,
                                    delay: i * 0.15,
                                    ease: "easeInOut"
                                  }}
                                  className="w-2 bg-cath-red-700 rounded-full"
                                />
                              ))}
                            </div>
                            <span className="text-white font-semibold text-lg drop-shadow-md">Describer is speaking...</span>
                          </>
                        ) : (
                          <>
                            <Mic size={32} className="text-white/70 animate-pulse" />
                            <span className="text-white font-semibold text-lg drop-shadow-md">Preparing...</span>
                          </>
                        )}
                      </div>
                    )}

                    {pictureIt?.category && (
                      <CategoryBadge category={pictureIt.category} className="absolute bottom-4 left-4 z-10" />
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

                  {/* Flag counter (visible to all when flags > 0) */}
                  {pictureIt?.flagCount > 0 && (
                    <div className="flex items-center gap-2 px-1 text-orange-600 text-sm font-medium">
                      <Flag size={14} />
                      <span>{pictureIt.flagCount} / {pictureIt.raterCount} flagged</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="shrink-0 border-t border-[#E5E5E5] px-5 py-3 flex items-center justify-center min-h-[64px]">

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
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#f3f3f3] border border-[#E5E5E5]">
                        <Loader2 size={16} className="animate-spin text-cath-red-700" />
                        <span className="text-md font-medium text-secondary">
                          Raters are scoring... ({pictureIt?.ratingCountdownSec}s)
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Rater — Describing phase: Flag button */}
                  {!isSpectator && !isDescriber && isDescribing && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                      <PillButton
                        className={`h-10 w-40 ${myFlagged || !hasDescribeStarted ? 'opacity-50 cursor-not-allowed' : ''} border-orange-500 text-orange-600 hover:bg-orange-50`}
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
                  {!isSpectator && !isDescriber && isRatingPhase && !pictureIt?.myRatingSubmitted && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-headingColor">Your rating:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => {
                            const filled = i < (hoveredRating || selectedRating);
                            return (
                              <Star
                                key={i}
                                size={28}
                                className={`cursor-pointer transition-colors ${filled ? 'text-cath-orange-400' : 'text-[#E5E5E5]'}`}
                                fill={filled ? '#f08d1d' : 'none'}
                                onMouseEnter={() => setHoveredRating(i + 1)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setSelectedRating(i + 1)}
                              />
                            );
                          })}
                        </div>
                        <span className="text-sm text-secondary ml-2">({pictureIt?.ratingCountdownSec}s left)</span>
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
                        className={`h-10 px-4 ${myFlagged ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' : 'border-orange-500 text-orange-600 hover:bg-orange-50'}`}
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
                  {!isSpectator && !isDescriber && isRatingPhase && pictureIt?.myRatingSubmitted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-600">
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
              </div>

              <LeaderboardCard
                leaderboard={pictureIt?.leaderboard || []}
                className="w-1/3 h-auto"
              />
            </div>

            {/* Force stopped overlay */}
            {showForceStopped && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95">
                <div className="text-center space-y-3">
                  <p className="text-2xl font-bold text-cath-red-700">Game Ended</p>
                  <p className="text-secondary">Không đủ người chơi tiếp tục.</p>
                  <PillButton onClick={handleGameOverClose}>Close</PillButton>
                </div>
              </div>
            )}
            {/* Setup screen overlay for Non-Hosts */}
            {gameState === 'setup' && !isHost && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 space-y-4">
                <Loader2 className="w-10 h-10 text-cath-red-700 animate-spin" />
                <h2 className="text-2xl font-bold text-headingColor">Host is setting up the game...</h2>
                <p className="text-secondary">Please wait while the game configuration is being finalized.</p>
              </div>
            )}
          </FluentAnimation>
        )}
      </AnimatePresence>

      {/* These modals are rendered conditionally outside the main animation so they can display even when gameState is Result/GameOver */}
      {showResultModal && (
        <RoundResultModal
          open={showResultModal}
          onClose={() => { }} // Server controls flow — no manual close
          result={{
            leaderboard: pictureIt?.leaderboard,
            roundNumber,
            totalRounds,
            language: gameLanguage,
            difficulty: "easy",
            image: { url: pictureIt?.imageUrlFull, category: pictureIt?.category },
          }}
        />
      )}

      {showGameOver && (
        <GameOverModal
          open={showGameOver}
          onClose={handleGameOverClose}
          onPlayAgain={handleGameOverClose}
          result={{
            leaderboard: pictureIt?.leaderboard,
            totalRounds,
            language: gameLanguage,
            difficulty: "easy",
            badges: pictureIt?.badges,
            winnerIds: pictureIt?.winnerIds,
          }}
          countdown={10}
        />
      )}
    </>
  );
};

export default PictureITOverlay;
