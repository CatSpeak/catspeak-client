import React, { useMemo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flame, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import ChallengeCard from "../cards/ChallengeCard";
import ChallengeStatusPills from "../navigation/ChallengeStatusPills";
import {
  useGetActiveChallengesQuery,
  useGetPastChallengesQuery,
} from "@/store/api/reelsApi";

export default function SharedChallengeLayout({
  challengeStatus,
  setChallengeStatus,
  challengeId,
  onSelectChallenge,
  onParticipate,
  renderContent,
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { lang } = useParams();

  // Responsive Pagination Logic
  const isUltraWide = useMediaQuery("(min-width: 1800px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const itemsPerPage = isUltraWide ? 5 : isLg ? 4 : isMd ? 3 : 2;

  const [page, setPage] = useState(0);

  // Fetch active/past challenges lists
  const { data: activeChallengesResponse } = useGetActiveChallengesQuery();
  const { data: pastChallengesResponse } = useGetPastChallengesQuery();

  const activeChallenges = useMemo(() => {
    if (!activeChallengesResponse) return [];
    return Array.isArray(activeChallengesResponse)
      ? activeChallengesResponse
      : activeChallengesResponse.data || [];
  }, [activeChallengesResponse]);

  const pastChallenges = useMemo(() => {
    if (!pastChallengesResponse) return [];
    return Array.isArray(pastChallengesResponse)
      ? pastChallengesResponse
      : pastChallengesResponse.data || [];
  }, [pastChallengesResponse]);

  const challengesList =
    challengeStatus === "active" ? activeChallenges : pastChallenges;

  const totalPages = Math.ceil(challengesList.length / itemsPerPage);
  const visibleChallenges = challengesList.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage,
  );

  const handlePrevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };

  // Reset page when switching tabs or resizing
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [challengeStatus, itemsPerPage]);

  const effectiveChallengeId = challengeId || (challengesList.length > 0 ? challengesList[0].challengeId : null);

  const selectedChallenge = useMemo(() => {
    if (!effectiveChallengeId) return null;
    return (
      challengesList.find(
        (c) => String(c.challengeId) === String(effectiveChallengeId),
      ) || null
    );
  }, [effectiveChallengeId, challengesList]);

  // Redirect to the correct language community based on the challenge's LanguageCommunity
  useEffect(() => {
    if (selectedChallenge) {
      const community = selectedChallenge.languageCommunity?.toLowerCase();
      let targetLang = lang;
      
      if (community === "english") targetLang = "en";
      else if (community === "chinese") targetLang = "zh";
      else if (community === "vietnamese") targetLang = "vi";

      if (targetLang && lang !== targetLang) {
        navigate(`/${targetLang}/cat-speak/reels?challenge=${selectedChallenge.challengeId}`, { replace: true });
      }
    }
  }, [selectedChallenge, lang, navigate]);

  // Auto-select first challenge if none is selected, or switch tab if challenge is in another list
  useEffect(() => {
    if (challengeId) {
      const inActive = activeChallenges.find((c) => String(c.challengeId) === String(challengeId));
      const inPast = pastChallenges.find((c) => String(c.challengeId) === String(challengeId));
      
      if (!inActive && inPast && challengeStatus !== "past") {
        setChallengeStatus("past");
      } else if (inActive && !inPast && challengeStatus !== "active") {
        setChallengeStatus("active");
      }
    } else if (!challengeId && challengesList.length > 0) {
      onSelectChallenge(challengesList[0].challengeId);
    }
  }, [challengeId, activeChallenges, pastChallenges, challengeStatus, setChallengeStatus, challengesList, onSelectChallenge]);

  return (
    <div className="flex flex-col w-full">
      {/* Secondary Navigation Pills */}
      <ChallengeStatusPills
        challengeStatus={challengeStatus}
        setChallengeStatus={setChallengeStatus}
        onSelectChallenge={onSelectChallenge}
      />

      {/* Horizontal List of Challenges */}
      <div className="mb-6 w-full">
        <div className="flex justify-between items-center mb-4 gap-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            {challengeStatus === "active"
              ? t.catSpeak.reels.activeEvent || "Thử thách đang diễn ra"
              : t.catSpeak.reels.pastEvents || "Thử thách đã diễn ra"}
          </h2>
          <div className="flex items-center text-[12px] sm:text-[13px] font-semibold text-gray-500 gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              aria-label="Previous challenges"
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {(
                t.catSpeak.reels.challengeCount || "{{count}} thử thách"
              ).replace("{{count}}", challengesList.length)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
              aria-label="Next challenges"
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {visibleChallenges.length > 0 ? (
          <div
            className="grid gap-3 sm:gap-5 pb-4 pt-2"
            style={{
              gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
            }}
          >
            {visibleChallenges.map((challenge, index) => (
              <div key={challenge.challengeId} className="flex h-full">
                <ChallengeCard
                  challenge={challenge}
                  isHot={
                    challengeStatus === "active" && page === 0 && index < 2
                  }
                  isSelected={
                    String(effectiveChallengeId) === String(challenge.challengeId)
                  }
                  isPast={challengeStatus === "past"}
                  onJoin={() => onSelectChallenge(challenge.challengeId)}
                  onParticipate={() =>
                    onParticipate && onParticipate(challenge)
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 my-4">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl block">🎈</span>
            </div>
            <p className="text-[15px] font-semibold text-gray-600 text-center">
              {t.catSpeak.reels.noActiveChallenges ||
                "Không tìm thấy thử thách nào."}
            </p>
            <p className="text-[13px] text-gray-400 text-center mt-1">
              {challengeStatus === "active"
                ? "Các thử thách mới đang được chuẩn bị. Hãy quay lại sau nhé!"
                : "Chưa có thử thách nào đã kết thúc."}
            </p>
          </div>
        )}
      </div>

      {/* Render Dynamic View */}
      {renderContent &&
        renderContent({ challengeId: effectiveChallengeId, selectedChallenge, challengeStatus })}
    </div>
  );
}
