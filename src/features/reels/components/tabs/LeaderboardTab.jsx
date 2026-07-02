import React from "react"
import SharedChallengeLayout from "../layouts/SharedChallengeLayout"
import ChallengeLeaderboardView from "../detail/ChallengeLeaderboardView"
import PastLeaderboardLayout from "../layouts/PastLeaderboardLayout"
import PastChallengeLeaderboardView from "../detail/PastChallengeLeaderboardView"

export default function LeaderboardTab({ 
  challengeStatus, 
  setChallengeStatus, 
  challengeId, 
  onSelectChallenge,
  onReelClick,
  showMobileDetail,
  onMobileDetailChange,
  onParticipate
}) {
  if (challengeStatus === "past") {
    return (
      <PastLeaderboardLayout
        challengeStatus={challengeStatus}
        setChallengeStatus={setChallengeStatus}
        challengeId={challengeId}
        onSelectChallenge={onSelectChallenge}
        showMobileDetail={showMobileDetail}
        onMobileDetailChange={onMobileDetailChange}
        renderContent={({ challengeId, selectedChallenge, challengeStatus }) => (
          <PastChallengeLeaderboardView
            challengeId={challengeId}
            selectedChallenge={selectedChallenge}
            challengeStatus={challengeStatus}
            onReelClick={onReelClick}
          />
        )}
      />
    )
  }

  return (
    <SharedChallengeLayout
      challengeStatus={challengeStatus}
      setChallengeStatus={setChallengeStatus}
      challengeId={challengeId}
      onSelectChallenge={onSelectChallenge}
      onParticipate={onParticipate}
      renderContent={({ challengeId, selectedChallenge, challengeStatus }) => (
        <ChallengeLeaderboardView
          challengeId={challengeId}
          selectedChallenge={selectedChallenge}
          challengeStatus={challengeStatus}
          onReelClick={onReelClick}
        />
      )}
    />
  )
}
