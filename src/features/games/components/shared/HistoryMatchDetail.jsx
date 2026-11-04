import React from "react"
import { Trophy, Star } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import Label from "@/shared/components/ui/Label"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getProfilePath } from "@/shared/utils/navigation"

const HistoryMatchDetail = ({ match }) => {
  const { t } = useLanguage()
  const { formatDateTime } = useTimezone()

  if (!match) return null

  const handleOpenProfile = (accountId) => {
    if (accountId) {
      window.open(getProfilePath(accountId), "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
      {/* Scrollable detail content */}
      <div
        className="flex-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-[#3A3A3A] hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-[#555]"
        style={{ overflowY: "overlay" }}
      >
        {/* Match Meta */}
        <div className="px-4 flex flex-col mb-4">
          <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {match.gameType === "crack_it" ? "Crack It" : match.gameType}
          </span>

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            <span>{formatDateTime(match.startedAt)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
            <span>
              {match.language === "vi"
                ? t.rooms?.language?.vi || "Tiếng Việt"
                : match.language === "en"
                  ? t.rooms?.language?.en || "English"
                  : match.language === "zh"
                    ? t.rooms?.language?.zh || "China"
                    : match.language}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
            <span className="capitalize">
              {match.level === "easy"
                ? t.rooms?.game?.setup?.levelEasy || "Dễ"
                : match.level === "medium"
                  ? t.rooms?.game?.setup?.levelMedium || "Trung bình"
                  : match.level === "hard"
                    ? t.rooms?.game?.setup?.levelHard || "Khó"
                    : match.level}
            </span>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div>
          <Label as="h4" className="mb-1 px-4 block">
            {t.rooms?.game?.crackIt?.leaderboard || "Bảng xếp hạng"}
          </Label>

          {match.leaderboard && match.leaderboard.length > 0 ? (
            <div>
              {match.leaderboard.map((item, idx) => {
                const isWinner = idx === 0 && item.totalScore > 0
                const accountId = item.player.accountId || item.player.userId

                return (
                  <div
                    key={item.player.userId}
                    onClick={() => handleOpenProfile(accountId)}
                    className="flex items-center justify-between px-4 h-14 hover:bg-slate-100/90 dark:hover:bg-[#2B2B2B] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 text-sm shrink-0">
                        {isWinner ? (
                          <Trophy
                            size={18}
                            className="text-amber-500 shrink-0"
                          />
                        ) : (
                          `#${idx + 1}`
                        )}
                      </div>

                      <div className="flex items-center gap-4 min-w-0">
                        <Avatar
                          src={item.player.avatarUrl}
                          alt={item.player.username}
                          name={item.player.username}
                          size={40}
                          clickable={false}
                        />

                        <span className="truncate max-w-[180px] sm:max-w-[240px] text-slate-800 dark:text-slate-100 transition-colors">
                          {item.player.username}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center text-cath-red-700 dark:text-cath-red-1000 text-base shrink-0 ${match.gameType === "crack_it" ? "" : "flex items-center"} gap-1`}
                    >
                      {item.totalScore}{" "}
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {match.gameType === "crack_it" ? (
                          t.rooms?.game?.crackIt?.score || "pts"
                        ) : (
                          <Star
                            size={18}
                            className="text-cath-orange-400"
                            fill="#f08d1d"
                          />
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              message={
                t.rooms?.game?.crackIt?.noScores ||
                "Chưa có người chơi ghi điểm trong trận này."
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryMatchDetail
