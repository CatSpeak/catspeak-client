import React from "react";
import { Calendar, Trophy, ChevronDown, ChevronUp, Star } from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import { useLanguage } from "@/shared/context/LanguageContext";

const HistoryMatchItem = ({ match, isExpanded, onToggle }) => {
  const { t } = useLanguage();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const hasWinners = match.winners && match.winners.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => onToggle(match.id)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(match.startedAt)}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">
              {match.gameType === "crack_it" ? "Crack It" : match.gameType}
            </span>
            <span>•</span>
            <span className="uppercase font-medium">
              {match.language === "vi"
                ? t.rooms?.language?.vi || "Tiếng Việt"
                : match.language === "en"
                  ? t.rooms?.language?.en || "English"
                  : match.language === "zh"
                    ? t.rooms?.language?.zh || "中文"
                    : match.language}
            </span>
            <span>•</span>
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

        <div className="flex items-center gap-4">
          {match.leaderboard &&
            match.leaderboard.length > 0 &&
            match.leaderboard[0].totalScore > 0 && (
              <div className="flex -space-x-2 hidden sm:flex">
                <Avatar
                  src={match.leaderboard[0].player.avatarUrl}
                  alt={match.leaderboard[0].player.username}
                  name={match.leaderboard[0].player.username}
                  size={32}
                  className="border-2 border-white"
                />
              </div>
            )}
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Expanded Leaderboard */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-white p-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            {t.rooms?.game?.crackIt?.leaderboard || "Bảng xếp hạng"}
          </h4>
          {match.leaderboard && match.leaderboard.length > 0 ? (
            <div className="flex flex-col gap-2">
              {match.leaderboard.map((item, idx) => {
                const isWinner = idx === 0 && item.totalScore > 0;

                return (
                  <div
                    key={item.player.userId}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      idx === 0
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/50"
                        : "bg-white border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-bold text-slate-400">
                        #{idx + 1}
                      </div>
                      <Avatar
                        src={item.player.avatarUrl}
                        alt={item.player.username}
                        name={item.player.username}
                        size={36}
                      />
                      <div className="font-semibold text-slate-800">
                        {item.player.username}
                        {isWinner && (
                          <div
                            className="ml-2 inline-flex items-center justify-center w-6 h-6 sm:w-auto sm:h-auto sm:px-2 sm:py-0.5 bg-yellow-100 text-yellow-600 rounded-full shrink-0"
                            title={t.rooms?.game?.crackIt?.winner || "Winner"}
                          >
                            <Trophy size={14} className="sm:mr-1" />
                            <span className="hidden sm:inline text-xs font-bold">
                              {t.rooms?.game?.crackIt?.winner || "Winner"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`font-black text-cath-red-500 text-lg ${match.gameType === "crack_it"? "" :  "flex items-center"} gap-1`}>
                      {item.totalScore}{" "}
                      <span className="text-xs font-medium text-slate-400 ml-1">
                        {match.gameType === "crack_it" ? (
                          t.rooms?.game?.crackIt?.score
                        ) : (
                          <Star
                            size={20}
                            className={"text-cath-orange-400"}
                            fill="#f08d1d"
                          />
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-sm text-slate-500 py-4">
              No players scored in this match.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryMatchItem;
