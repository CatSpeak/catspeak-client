import React from "react"
import RoundImageCard from "./RoundImageCard"
import RoundScoreCard from "./RoundScoreCard"
import LeaderboardCard from "./LeaderboardCard"
import RoundResultOverlay from "@/features/games/components/shared/RoundResultOverlay"
import { useLanguage } from "@/shared/context/LanguageContext"

const RoundResultModal = ({ open, onClose, result }) => {
  const { t } = useLanguage();
  if (!result) return null

  return (
    <RoundResultOverlay
      gameState={open ? "result" : "idle"}
      title={t.rooms?.game?.pictureIt?.roundResultTitle || "Kết quả vòng"}
      maxWidthClass="max-w-[95vw] lg:max-w-[1080px]"
      currentRound={{ round: result.roundNumber, total: result.totalRounds }}
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-center lg:items-stretch min-h-0 mt-4 w-full lg:h-[280px]">
        <div className="hidden md:block flex-1 w-full max-w-[380px] h-full">
          <RoundImageCard image={result.image} />
        </div>

        <div className="flex-1 w-full max-w-[300px] h-full">
          <RoundScoreCard
            describer={result.describer}
            roundScore={result.roundScore}
            averageRating={result.averageRating}
          />
        </div>

        <div className="hidden md:block flex-1 w-full max-w-[320px] h-full">
          <LeaderboardCard
            leaderboard={result.leaderboard}
          />
        </div>
      </div>
    </RoundResultOverlay>
  )
}

export default RoundResultModal
