import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParticipants } from '@livekit/components-react';

import { FluentAnimation } from '@/shared/components/ui/animations';
import { PillButton } from '@/shared/components/ui/buttons';
import { LeaderboardCard, RoundResultModal, GameOverModal } from './round-result';
import { useGame } from '@/features/video-call/context/GameContext';

import PictureItTopBar from './PictureItTopBar';
import PictureItImageCard from './PictureItImageCard';
import PictureItActionPanel from './PictureItActionPanel';

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

  const participants = useParticipants();

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

  const displayImageUrl = pictureIt?.imageUrlFull || pictureIt?.imageUrl;

  useEffect(() => {
    setImgLoading(true);
    setImgError(false);
  }, [displayImageUrl]);

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
    if (isDescriber || isSpectator || myFlagged || selectedRating > 0 || pictureIt?.myRatingSubmitted) return;
    setMyFlagged(true);
    submitPictureItFlag();
  }, [isDescriber, isSpectator, myFlagged, selectedRating, pictureIt?.myRatingSubmitted, submitPictureItFlag]);

  const handleSubmitRating = useCallback(() => {
    if (selectedRating === 0 || isDescriber || isSpectator) return;
    submitPictureItRating(selectedRating);
    setSelectedRating(0);
  }, [selectedRating, isDescriber, isSpectator, submitPictureItRating]);

  const handleGameOverClose = () => {
    exitGame();
  };

  const handleLeaveGame = () => {
    exitGame();
  };

  // Get describer user object for RoundScoreCard
  const describerUser = (() => {
    const descId = pictureIt?.roundDescriberId || pictureIt?.describerId;
    if (!descId) return null;
    const p = participants?.find(part => Number(part.identity) === descId);
    let name = p?.name || p?.identity || `Player ${descId}`;
    let avatar = null;
    if (p?.metadata) {
      try {
        const meta = JSON.parse(p.metadata);
        avatar = meta.avatarUrl;
        if (meta.username) name = meta.username;
      } catch (e) { }
    }
    return { id: descId, name, avatar };
  })();

  if (!open) return null;

  const interactionsDisabled = isSpectator;

  return (
    <>
      <AnimatePresence>
        {!['idle', 'force_stopped'].includes(gameState) && (
          <FluentAnimation
            key="picture-it-overlay"
            direction="up"
            exit
            className="absolute inset-0 z-[60] w-full h-full bg-white px-6 py-4 flex flex-col gap-4"
          >
            <PictureItTopBar
              roundNumber={roundNumber}
              totalRounds={totalRounds}
              gameLanguage={gameLanguage}
              isSpectator={isSpectator}
              isDescriber={isDescriber}
              onLeaveGame={handleLeaveGame}
            />

            {gameState === 'setup' && pictureIt?.countdown > 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 animate-fade-in">
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

            <div className="flex gap-4 flex-1 min-h-0 h-full overflow-hidden">
              <div className="flex flex-col flex-1 gap-4 h-full min-h-0 overflow-y-auto pr-1">
                <PictureItImageCard
                  isDescriber={isDescriber}
                  imgLoading={imgLoading}
                  imgError={imgError}
                  setImgLoading={setImgLoading}
                  setImgError={setImgError}
                  displayImageUrl={displayImageUrl}
                  imageBlurred={imageBlurred}
                  hasDescribeStarted={hasDescribeStarted}
                  category={pictureIt?.category}
                  forbiddenWords={forbiddenWords}
                  flagCount={pictureIt?.flagCount || 0}
                  raterCount={pictureIt?.raterCount || 0}
                />

                <PictureItActionPanel
                  isSpectator={isSpectator}
                  isDescriber={isDescriber}
                  isDescribing={isDescribing}
                  isRatingPhase={isRatingPhase}
                  isWaitingForRatings={isWaitingForRatings}
                  hasDescribeStarted={hasDescribeStarted}
                  myFlagged={myFlagged}
                  ratingCountdownSec={pictureIt?.ratingCountdownSec || 0}
                  selectedRating={selectedRating}
                  setSelectedRating={setSelectedRating}
                  hoveredRating={hoveredRating}
                  setHoveredRating={setHoveredRating}
                  myRatingSubmitted={pictureIt?.myRatingSubmitted}
                  handleDescribeStart={handleDescribeStart}
                  handleDescribeEnd={handleDescribeEnd}
                  handleFlag={handleFlag}
                  handleSubmitRating={handleSubmitRating}
                  interactionsDisabled={interactionsDisabled}
                />
              </div>

              <LeaderboardCard
                leaderboard={pictureIt?.leaderboard || []}
                className="w-1/3 h-auto shrink-0"
              />
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>

      {showResultModal && (
        <RoundResultModal
          open={showResultModal}
          onClose={() => { }}
          result={{
            leaderboard: pictureIt?.leaderboard,
            roundNumber,
            totalRounds,
            language: gameLanguage,
            difficulty: "easy",
            image: { url: pictureIt?.imageUrlFull, category: pictureIt?.category },
            describer: describerUser,
            roundScore: pictureIt?.roundAverageRating || 0,
          }}
        />
      )}


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


      {showForceStopped && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-white/95">
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold text-cath-red-700">Game Ended</p>
            <p className="text-secondary">Không đủ người chơi tiếp tục.</p>
            <PillButton onClick={handleGameOverClose}>Close</PillButton>
          </div>
        </div>
      )}
    </>
  );
};

export default PictureITOverlay;
