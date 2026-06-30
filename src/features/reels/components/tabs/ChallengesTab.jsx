import React from "react"
import SharedChallengeLayout from "../layouts/SharedChallengeLayout"
import ChallengeReelsView from "../detail/ChallengeReelsView"

export default function ChallengesTab({ 
  challengeStatus, 
  setChallengeStatus, 
  challengeId, 
  onSelectChallenge,
  onReelClick 
}) {
  return (
    <SharedChallengeLayout
      challengeStatus={challengeStatus}
      setChallengeStatus={setChallengeStatus}
      challengeId={challengeId}
      onSelectChallenge={onSelectChallenge}
      renderContent={({ challengeId, selectedChallenge, challengeStatus }) => (
        <ChallengeReelsView
          challengeId={challengeId}
          selectedChallenge={selectedChallenge}
          challengeStatus={challengeStatus}
          onReelClick={onReelClick}
        />
      )}
    />
  )
}
