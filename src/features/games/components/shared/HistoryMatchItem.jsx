import React from "react"
import { ChevronRight } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const HistoryMatchItem = ({ match, onSelect }) => {
  const { t } = useLanguage()
  const { formatDateTime } = useTimezone()

  const winner =
    match.leaderboard &&
    match.leaderboard.length > 0 &&
    match.leaderboard[0].totalScore > 0
      ? match.leaderboard[0]
      : null

  return (
    <div
      onClick={() => onSelect?.(match)}
      className="hover:bg-slate-100/90 dark:hover:bg-[#2B2B2B] px-4 h-[72px] transition-all duration-200 cursor-pointer flex items-center justify-between group"
    >
      <div className="flex flex-col min-w-0 flex-1 pr-2">
        <span className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
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

      <div className="flex items-center gap-2 shrink-0">
        {winner && (
          <div className="flex items-center gap-2">
            <Avatar
              src={winner.player.avatarUrl}
              alt={winner.player.username}
              name={winner.player.username}
              size={40}
              clickable={false}
            />

            <span className="text-xs font-semibold text-cath-red-700 dark:text-red-400">
              {winner.totalScore}{" "}
              {match.gameType === "crack_it"
                ? t.rooms?.game?.crackIt?.score || "pts"
                : "★"}
            </span>
          </div>
        )}

        <ChevronRight />
      </div>
    </div>
  )
}

export default HistoryMatchItem
