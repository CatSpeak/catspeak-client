import React from "react"
import SharedChallengeLayout from "../layouts/SharedChallengeLayout"
import ChallengeReelsView from "../detail/ChallengeReelsView"

export default function ChallengesTab({ 
  challengeStatus, 
  setChallengeStatus, 
  challengeId, 
  onSelectChallenge,
  onReelClick,
  onParticipate
}) {
  return (
    <SharedChallengeLayout
      challengeStatus={challengeStatus}
      setChallengeStatus={setChallengeStatus}
      challengeId={challengeId}
      onSelectChallenge={onSelectChallenge}
      onParticipate={onParticipate}
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
