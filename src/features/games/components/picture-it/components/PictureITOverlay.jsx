import React, { useEffect, useState, useCallback } from 'react'
import { useParticipants } from '@livekit/components-react'

import { PillButton } from '@/shared/components/ui/buttons'
import { RoundResultModal, GameOverModal } from './round-result'
import { useGame } from '@/features/games/context/GameContext'
import { useLanguage } from '@/shared/context/LanguageContext'
import BaseGameOverlay from '@/features/games/components/shared/BaseGameOverlay'
import PictureItImageCard from './PictureItImageCard'
import PictureItActionPanel from './PictureItActionPanel'

const PictureITOverlay = () => {
  const {
    gameState,
    gameType,
    gameLanguage,
    currentRound,
    pictureIt,
    currentUserId,
    isSpectator,
    startPictureItDescribe,
    endPictureItDescribe,
    submitPictureItFlag,
    submitPictureItRating,
    exitGame
  } = useGame()

  const { t } = useLanguage()
  const participants = useParticipants()

  const [imgLoading, setImgLoading] = useState(true)
  const [imgError, setImgError] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [myFlagged, setMyFlagged] = useState(false)

  const isPictureIt = gameType === 'picture_it' || gameType === 'picture-it'
  const open = isPictureIt && !['idle'].includes(gameState)

  const isDescriber = pictureIt?.describerId === currentUserId
  const isDescribing = gameState === 'playing' && !pictureIt?.ratingOpen
  const isRatingPhase = gameState === 'playing' && pictureIt?.ratingOpen
  const showResultModal = gameState === 'result'
  const showGameOver = gameState === 'game_over'
  const showForceStopped = gameState === 'force_stopped'
  const isWaitingForRatings = isDescriber && isRatingPhase
  const hasDescribeStarted = pictureIt?.describeStarted

  const totalRounds = currentRound?.total || 0
  const roundNumber = currentRound?.round || 0
  const forbiddenWords = pictureIt?.forbiddenWords || []
  const imageBlurred = pictureIt?.imageBlurred

  const displayImageUrl = pictureIt?.imageUrlFull || pictureIt?.imageUrl

  useEffect(() => {
    setImgLoading(true)
    setImgError(false)
  }, [displayImageUrl])

  useEffect(() => {
    setSelectedRating(0)
    setHoveredRating(0)
    setMyFlagged(false)
  }, [roundNumber])

  const handleDescribeStart = useCallback(() => {
    if (!isDescriber) return
    startPictureItDescribe()
  }, [isDescriber, startPictureItDescribe])

  const handleDescribeEnd = useCallback(() => {
    if (!isDescriber) return
    endPictureItDescribe()
  }, [isDescriber, endPictureItDescribe])

  const handleFlag = useCallback(() => {
    if (isDescriber || isSpectator || myFlagged || selectedRating > 0 || pictureIt?.myRatingSubmitted) return
    setMyFlagged(true)
    submitPictureItFlag()
  }, [isDescriber, isSpectator, myFlagged, selectedRating, pictureIt?.myRatingSubmitted, submitPictureItFlag])

  const handleSubmitRating = useCallback(() => {
    if (selectedRating === 0 || isDescriber || isSpectator) return
    submitPictureItRating(selectedRating)
    setSelectedRating(0)
  }, [selectedRating, isDescriber, isSpectator, submitPictureItRating])

  const handleGameOverClose = () => {
    exitGame()
  }

  // Get describer user object for RoundScoreCard
  const describerUser = (() => {
    const descId = pictureIt?.roundDescriberId || pictureIt?.describerId
    if (!descId) return null
    const p = participants?.find(part => Number(part.identity) === descId)
    let name = p?.name || p?.identity || `Player ${descId}`
    let avatar = null
    if (p?.metadata) {
      try {
        const meta = JSON.parse(p.metadata)
        avatar = meta.avatarUrl
        if (meta.username) name = meta.username
      } catch (e) { }
    }
    return { id: descId, name, avatar }
  })()

  if (!open) return null

  const interactionsDisabled = isSpectator

  return (
    <BaseGameOverlay
      expectedGameType={['picture_it', 'picture-it']}
      title="Picture IT"
      waitingText={t.rooms?.game?.pictureIt?.modals?.waitingStart || "Đang chuẩn bị ván đấu..."}
      useFluentAnimation={true}
      animationKey="picture-it-overlay"
      gameContent={
        <div className="flex flex-col flex-1 gap-3 md:gap-4 h-full min-h-0 overflow-y-auto pr-1">
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
      }
      overlays={
        <>
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
                <p className="text-2xl font-bold text-cath-red-700">{t.rooms?.game?.pictureIt?.modals?.gameEnded || 'Game Ended'}</p>
                <p className="text-secondary">{t.rooms?.game?.pictureIt?.modals?.notEnoughPlayers || 'Không đủ người chơi tiếp tục.'}</p>
                <PillButton onClick={handleGameOverClose}>{t.rooms?.game?.pictureIt?.modals?.close || 'Close'}</PillButton>
              </div>
            </div>
          )}
        </>
      }
    />
  )
}

export default PictureITOverlay
