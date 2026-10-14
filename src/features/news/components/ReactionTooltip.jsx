import React from "react";
import { useLanguage } from "@/shared/context/LanguageContext";

const ReactionTooltip = ({ type = "like", users = [], maxDisplay = 15 }) => {
  const { t } = useLanguage();

  const getTitle = () => {
    const norm = String(type).toLowerCase();
    if (norm === "love") return t.news?.newsDetail?.love || "Love";
    if (norm === "haha") return t.news?.newsDetail?.haha || "Haha";
    return t.news?.newsDetail?.like || "Like";
  };

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - displayUsers.length;

  return (
    <div
      className="absolute top-full mt-2 right-0 z-50 min-w-[160px] max-w-[240px] bg-[#242526] text-white rounded-xl p-2 shadow-2xl border border-white/10 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={{ filter: "drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))" }}
    >
      <div className="font-bold text-[14px] text-white mb-1.5 pb-0.5 border-b border-white/10">
        {getTitle()}
      </div>

      {users.length === 0 ? (
        <div className="text-[13px] text-gray-400 italic py-0.5">
          {t.news?.newsDetail?.noReactions || "Chưa có lượt tương tác"}
        </div>
      ) : (
        <div className="flex flex-col space-y-0.5">
          {displayUsers.map((u, i) => (
            <span
              key={u.accountId || `${u.username}-${i}`}
              className="text-white/90 text-[13px] leading-snug truncate"
            >
              {u.username}
            </span>
          ))}

          {remainingCount > 0 && (
            <span className="text-gray-400 text-[12px] pt-1 italic">
              {t.news?.newsDetail?.andMore
                ? t.news.newsDetail.andMore.replace("{{count}}", remainingCount)
                : `and ${remainingCount} more...`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReactionTooltip;
