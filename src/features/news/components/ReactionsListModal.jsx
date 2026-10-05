import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getImageUrl } from "@/shared/utils/imageUtils";
import { getProfilePath } from "@/shared/utils/navigation";
import {
  ReactionBadge,
  LikeBadge,
  LoveBadge,
  HahaBadge,
} from "./ReactionBadge";
import { getAllReactionsList } from "../utils/reactionUtils";

const ReactionsListModal = ({
  open = false,
  onClose,
  initialTab = "all",
  normalizedReactions = { like: [], love: [], haha: [] },
  totalReactions = 0,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab || "all");

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || "all");
    }
  }, [open, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const likeList = normalizedReactions?.like || [];
  const loveList = normalizedReactions?.love || [];
  const hahaList = normalizedReactions?.haha || [];
  const allList = getAllReactionsList(normalizedReactions);

  const totalCount = Math.max(totalReactions, allList.length);

  const getFilteredUsers = () => {
    switch (activeTab) {
      case "like":
        return likeList;
      case "love":
        return loveList;
      case "haha":
        return hahaList;
      case "all":
      default:
        return allList;
    }
  };

  const currentUsers = getFilteredUsers();

  const handleUserClick = (user) => {
    if (!user?.accountId) return;
    onClose();
    navigate(getProfilePath(user.accountId));
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[540px] bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-[66.67vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header: Reaction Tabs & Close Button ─────────── */}
        <div className="shrink-0 flex items-center justify-between border-b border-gray-200 px-3 pt-2 bg-white">
          {/* Tabs - Always show Tất cả, Like, Love, Haha */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* All Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold transition-colors border-b-[3px] -mb-[1px] shrink-0 cursor-pointer ${
                activeTab === "all"
                  ? "border-[#1877F2] text-[#1877F2]"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg"
              }`}
            >
              <span>{t.news?.newsDetail?.all || "Tất cả"}</span>
              <span className="text-xs font-normal">
                {totalCount}
              </span>
            </button>

            {/* Like Tab - Always visible */}
            <button
              type="button"
              onClick={() => setActiveTab("like")}
              className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold transition-colors border-b-[3px] -mb-[1px] shrink-0 cursor-pointer ${
                activeTab === "like"
                  ? "border-[#1877F2] text-[#1877F2]"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg"
              }`}
            >
              <LikeBadge size={20} />
              <span className="text-sm font-medium">
                {likeList.length}
              </span>
            </button>

            {/* Love Tab - Always visible */}
            <button
              type="button"
              onClick={() => setActiveTab("love")}
              className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold transition-colors border-b-[3px] -mb-[1px] shrink-0 cursor-pointer ${
                activeTab === "love"
                  ? "border-[#1877F2] text-[#1877F2]"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg"
              }`}
            >
              <LoveBadge size={20} />
              <span className="text-sm font-medium">
                {loveList.length}
              </span>
            </button>

            {/* Haha Tab - Always visible */}
            <button
              type="button"
              onClick={() => setActiveTab("haha")}
              className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold transition-colors border-b-[3px] -mb-[1px] shrink-0 cursor-pointer ${
                activeTab === "haha"
                  ? "border-[#1877F2] text-[#1877F2]"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg"
              }`}
            >
              <HahaBadge size={20} />
              <span className="text-sm font-medium">
                {hahaList.length}
              </span>
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 shrink-0 mb-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
            title={t.news?.newsDetail?.cancel || "Đóng"}
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* ── User List Body (Scrollable) ────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 divide-y divide-gray-50">
          {currentUsers.length === 0 ? (
            <div className="h-full min-h-[140px] flex items-center justify-center text-gray-400 text-sm">
              {t.news?.newsDetail?.noReactions || "Chưa có lượt tương tác nào"}
            </div>
          ) : (
            currentUsers.map((user, idx) => (
              <div
                key={user.accountId || `${user.username}-${idx}`}
                className="flex items-center justify-between py-2.5 px-2 hover:bg-gray-50/80 rounded-xl transition-colors group"
              >
                {/* Left: Avatar with Reaction Badge + Username */}
                <div
                  className="flex items-center gap-3.5 min-w-0 cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="relative shrink-0">
                    {user.avatarImageUrl ? (
                      <img
                        src={getImageUrl(user.avatarImageUrl)}
                        alt={user.username}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-11 h-11 rounded-full bg-cath-red-700 text-white font-semibold flex items-center justify-center text-base ${
                        user.avatarImageUrl ? "hidden" : "flex"
                      }`}
                    >
                      {user.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    {/* Small Reaction Badge on bottom-right of avatar */}
                    <div className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-white">
                      <ReactionBadge
                        type={user.reactionType || activeTab}
                        size={18}
                      />
                    </div>
                  </div>

                  <span
                    className={`font-semibold text-[15px] text-gray-900 truncate group-hover:underline ${
                      user.accountId ? "group-hover:text-cath-red-700" : ""
                    }`}
                  >
                    {user.username}
                  </span>
                </div>

                {/* Right: View Profile Button */}
                {user.accountId && (
                  <button
                    type="button"
                    onClick={() => handleUserClick(user)}
                    className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0 ml-2 cursor-pointer"
                  >
                    <User size={15} />
                    <span>
                      {t.news?.newsDetail?.viewProfile || "Trang cá nhân"}
                    </span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReactionsListModal;
