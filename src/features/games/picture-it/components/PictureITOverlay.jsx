import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Flag, Gamepad2, ImageOff, Loader2, Mic, Star } from 'lucide-react';

import { FluentAnimation } from '@/shared/components/ui/animations';
import { PillButton } from '@/shared/components/ui/buttons';
import { CategoryBadge, LeaderboardCard, RoundResultModal, GameOverModal } from './round-result';
import { useGlobalVideoCall } from '@/features/video-call/context/GlobalVideoCallProvider';

import {
  setGameState,
  setGameSession,
  setRound,
  resetGame,
} from '../store/pictureItSlice';
import { usePictureItSync } from '../hooks/usePictureItSync';
import {
  useStartGameMutation,
  useStartRoundMutation,
  useEndRoundMutation,
  useSubmitRatingMutation,
  useEndGameMutation,
  useLazyGetGameResultQuery,
} from '@/store/api/pictureItApi';

import { mockForbiddenWords } from '../mock/roundResultMock';

const MOCK_IMAGES = [
  { url: 'https://picsum.photos/seed/cat1/800/600', category: 'Animals' },
  { url: 'https://picsum.photos/seed/city2/800/600', category: 'Architecture' },
];

const RATING_COUNTDOWN_SEC = 15;

const PictureITOverlay = ({ open, gameConfig, onClose }) => {
  const dispatch = useDispatch();
  const pictureIt = useSelector((state) => state.pictureIt);
  const { currentUserId, sessionId } = useGlobalVideoCall();

  const { broadcastState, broadcastAction } = usePictureItSync();

  const [startGameApi] = useStartGameMutation();
  const [startRoundApi] = useStartRoundMutation();
  const [endRoundApi] = useEndRoundMutation();
  const [submitRatingApi] = useSubmitRatingMutation();
  const [endGameApi] = useEndGameMutation();
  const [getGameResult] = useLazyGetGameResultQuery();

  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [ratingCountdown, setRatingCountdown] = useState(RATING_COUNTDOWN_SEC);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  // Derive state mappings
  const isHost = pictureIt.isHost;
  const isDescriber = pictureIt.currentRound.describerId === currentUserId;
  const isDescribing = pictureIt.gameState === 'Describing';
  const isRatingPhase = pictureIt.gameState === 'Rating';
  const showResultModal = pictureIt.gameState === 'Result';
  const showGameOver = pictureIt.gameState === 'GameOver';
  const isWaitingForRatings = isDescriber && isRatingPhase;

  const totalRounds = pictureIt.config.totalRounds || MOCK_IMAGES.length;
  const roundNumber = pictureIt.currentRound.roundNumber;
  const currentImage = MOCK_IMAGES[(roundNumber - 1) % MOCK_IMAGES.length] || MOCK_IMAGES[0];
  const forbiddenWords = pictureIt.currentRound.category ? mockForbiddenWords[pictureIt.currentRound.category] : (mockForbiddenWords[currentImage.category] ?? []);

  // Initialize Game (Host only)
  useEffect(() => {
    if (open && pictureIt.gameState === 'Idle') {
      const initGame = async () => {
        try {
          const res = await startGameApi({
            roomId: String(sessionId),
            language: gameConfig?.language || 'English',
            level: gameConfig?.difficulty || 'Medium'
          }).unwrap();

          dispatch(setGameSession({
            gameId: res.id,
            sessionId: sessionId,
            config: {
              language: gameConfig?.language || 'English',
              difficulty: gameConfig?.difficulty || 'Medium',
              totalRounds: MOCK_IMAGES.length
            },
            isHost: true // Whoever opens it first becomes host
          }));

          dispatch(setGameState('Preparing'));
        } catch (err) {
          console.error("Failed to start game", err);
        }
      };
      initGame();
    }
  }, [open, pictureIt.gameState, sessionId, gameConfig, startGameApi, dispatch]);

  // Sync state whenever it changes and we are host
  useEffect(() => {
    if (isHost && open) {
      broadcastState();
    }
  }, [pictureIt, isHost, open, broadcastState]);

  // Host coordinates flow: Preparing -> Describing
  useEffect(() => {
    if (isHost && pictureIt.gameState === 'Preparing' && pictureIt.gameId) {
      const runRound = async () => {
        try {
          // In a real game, describerId would rotate. For now, host is describer for round 1, someone else for 2?
          // We'll just make the host the describer for simplicity unless we have participants list.
          const res = await startRoundApi({
            sessionId: pictureIt.gameId,
            roundNumber: pictureIt.currentRound.roundNumber,
            imageId: "00000000-0000-0000-0000-000000000000" // using a dummy guid for mock images
          }).unwrap();

          dispatch(setRound({
            roundId: res.id,
            describerId: currentUserId, // Simple mock: host is describer
            imageUrl: currentImage.url,
            category: currentImage.category
          }));
          dispatch(setGameState('Describing'));
        } catch (err) {
          console.error("Failed to start round", err);
        }
      };
      runRound();
    }
  }, [pictureIt.gameState, isHost, pictureIt.gameId, pictureIt.currentRound.roundNumber, startRoundApi, currentImage, currentUserId, dispatch]);


  const handleFinishDescribing = async () => {
    if (isDescriber) {
      dispatch(setGameState('Rating'));
      if (isHost) broadcastState();
      else broadcastAction('FINISH_DESCRIBING');
    }
  };

  const handleSubmitRating = async () => {
    try {
      await submitRatingApi({
        roundId: pictureIt.currentRound.roundId,
        score: selectedRating
      }).unwrap();

      // Let host know rating is submitted? The host might check backend, or just wait for timer.
      // For now, move locally to Result state if host broadcasts it. Or wait.
      // If we are not host, we wait for host to change state to Result.
      setSelectedRating(0);

      if (isHost) {
        // Just end round immediately for testing
        await endRoundApi(pictureIt.currentRound.roundId).unwrap();
        const result = await getGameResult(pictureIt.gameId).unwrap();
        // Update leaderboard
        dispatch(setGameState('Result'));
      } else {
        broadcastAction('SUBMIT_RATING', { score: selectedRating });
      }
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  };

  const handleResultClose = async () => {
    if (!isHost) return; // Only host dictates next phase

    const nextIndex = roundNumber + 1;
    const isLastRound = nextIndex > totalRounds;

    if (isLastRound) {
      await endGameApi(pictureIt.gameId).unwrap();
      dispatch(setGameState('GameOver'));
    } else {
      dispatch(setRound({ roundNumber: nextIndex }));
      dispatch(setGameState('Preparing'));
    }
  };

  const handleGameOverClose = () => {
    dispatch(resetGame());
    if (isHost) broadcastState();
    onClose?.();
  };

  return (
    <>
      <AnimatePresence>
        {open && pictureIt.gameState !== 'Idle' && !showResultModal && !showGameOver && (
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
                  Round: <p className="font-semibold">{roundNumber}/{totalRounds}</p>
                </div>
              </div>

              <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl">
                Language: <p className="font-semibold">{pictureIt.config.language}</p>
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
              </div>
            </div>

            <div className="flex gap-4 flex-1 h-full">
              <div className="flex flex-col flex-1 gap-4 h-full">
                {/* Content */}
                <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-4 flex flex-col gap-3">
                  <div className=" text-base font-bold">Describe this image</div>

                  <div className="relative h-[60vh] w-full rounded-[20px] overflow-hidden bg-[#f3f3f3] flex items-center justify-center">
                    {isLoading && !imgError && (
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
                    {!imgError && pictureIt.currentRound.imageUrl && (
                      <img
                        src={pictureIt.currentRound.imageUrl || "https://picsum.photos/1440/1024"}
                        alt="Picture IT"
                        className={`h-full w-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                          setIsLoading(false);
                          setImgError(true);
                        }}
                      />
                    )}
                    {pictureIt.currentRound.category && <CategoryBadge category={pictureIt.currentRound.category} className="absolute bottom-4 left-4 z-10" />}
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
                  {isWaitingForRatings && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#f3f3f3] border border-[#E5E5E5]">
                        <Loader2 size={16} className="animate-spin text-cath-red-700" />
                        <span className="text-md font-medium text-secondary">
                          Raters are scoring your description...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {isDescribing && (
                    <div className="flex items-center justify-center gap-4">
                      <PillButton className="h-10 w-48" startIcon={<CheckCircle2 size={16} />} onClick={handleFinishDescribing}>
                        Finish describing
                      </PillButton>
                    </div>
                  )}

                  {!isDescriber && isRatingPhase && (
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
                                className={`cursor-pointer transition-colors ${filled ? "text-cath-orange-400" : "text-[#E5E5E5]"}`}
                                fill={filled ? "#f08d1d" : "none"}
                                onMouseEnter={() => setHoveredRating(i + 1)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setSelectedRating(i + 1)}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PillButton className="h-10 w-36" disabled={selectedRating === 0} onClick={handleSubmitRating}>
                          Submit rating
                        </PillButton>
                      </div>
                    </motion.div>
                  )}

                  {!isDescriber && !isRatingPhase && (
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-secondary">Waiting...</span>
                    </div>
                  )}
                </div>
              </div>

              <LeaderboardCard leaderboard={pictureIt.leaderboard} className="w-1/3 h-auto" />
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>

      <RoundResultModal
        open={showResultModal}
        onClose={handleResultClose}
        result={{
          leaderboard: pictureIt.leaderboard,
          roundNumber,
          totalRounds,
          language: pictureIt.config.language,
          difficulty: pictureIt.config.difficulty,
          image: currentImage,
        }}
      />

      <GameOverModal
        open={showGameOver}
        onClose={handleGameOverClose}
        onPlayAgain={() => {
          // Implement play again if needed
          handleGameOverClose();
        }}
        result={{
          leaderboard: pictureIt.leaderboard,
          totalRounds,
          language: pictureIt.config.language,
          difficulty: pictureIt.config.difficulty,
        }}
        countdown={10}
      />
    </>
  );
};

export default PictureITOverlay;
