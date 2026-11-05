import React, { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { getProfilePath } from "@/shared/utils/navigation"
import Modal from "@/shared/components/ui/Modal"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import Avatar from "@/shared/components/ui/Avatar"
import RequestButton from "@/shared/components/ui/buttons/RequestButton"
import { ReactionBadge, LikeBadge, LoveBadge, HahaBadge } from "./ReactionBadge"
import { getAllReactionsList } from "../utils/reactionUtils"

const ReactionsListModal = ({
  open = false,
  onClose,
  initialTab = "all",
  normalizedReactions = { like: [], love: [], haha: [] },
  totalReactions = 0,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(initialTab || "all")

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || "all")
    }
  }, [open, initialTab])

  const likeList = normalizedReactions?.like || []
  const loveList = normalizedReactions?.love || []
  const hahaList = normalizedReactions?.haha || []
  const allList = getAllReactionsList(normalizedReactions)

  const totalCount = Math.max(totalReactions, allList.length)

  const reactionTabs = useMemo(
    () => [
      {
        id: "all",
        label: t.news?.newsDetail?.all || "Tất cả",
        badge: <span className="text-sm opacity-80">{totalCount}</span>,
      },
      {
        id: "like",
        icon: LikeBadge,
        iconSize: 20,
        label: String(likeList.length),
      },
      {
        id: "love",
        icon: LoveBadge,
        iconSize: 20,
        label: String(loveList.length),
      },
      {
        id: "haha",
        icon: HahaBadge,
        iconSize: 20,
        label: String(hahaList.length),
      },
    ],
    [t, totalCount, likeList.length, loveList.length, hahaList.length],
  )

  const getFilteredUsers = () => {
    switch (activeTab) {
      case "like":
        return likeList
      case "love":
        return loveList
      case "haha":
        return hahaList
      case "all":
      default:
        return allList
    }
  }

  const currentUsers = getFilteredUsers()

  const handleUserClick = (user) => {
    if (!user?.accountId) return
    onClose?.()
    navigate(getProfilePath(user.accountId))
  }

  const modalTitle =
    t.news?.newsDetail?.reactionsModalTitle ||
    (t.news?.newsDetail?.reactions
      ? t.news.newsDetail.reactions.charAt(0).toUpperCase() +
        t.news.newsDetail.reactions.slice(1)
      : "Lượt tương tác")

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="sm:max-w-[540px] h-[100dvh] sm:h-[540px] max-h-[85vh]"
      title={modalTitle}
      showCloseButton={true}
      subHeader={
        <Tabs
          tabs={reactionTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          fullWidth={false}
          height="h-12"
          iconSize={20}
          className="border-b-0"
        />
      }
      subHeaderClassName="p-0 shrink-0 border-b border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A]"
      bodyClassName="!px-0"
    >
      {currentUsers.length === 0 ? (
        <div className="h-full min-h-[140px] flex items-center justify-center text-gray-400 dark:text-neutral-400 text-sm">
          {t.news?.newsDetail?.noReactions || "Chưa có lượt tương tác nào"}
        </div>
      ) : (
        currentUsers.map((user, idx) => (
          <div
            key={user.accountId || `${user.username}-${idx}`}
            onClick={() => handleUserClick(user)}
            className={`flex items-center justify-between min-h-[56px] py-1 px-4 hover:bg-gray-50/80 dark:hover:bg-[#272727]/80 transition-colors ${
              user.accountId ? "cursor-pointer" : ""
            }`}
          >
            {/* Left: Avatar with Reaction Badge + Username */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <Avatar
                  size={40}
                  src={
                    user.avatarImageUrl
                      ? getImageUrl(user.avatarImageUrl)
                      : undefined
                  }
                  name={user.username}
                  clickable={false}
                  hoverScale={false}
                  className="border border-gray-200 dark:border-[#3F3F3F]"
                />

                {/* Small Reaction Badge on bottom-right of avatar */}
                <div className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-white dark:ring-[#1A1A1A]">
                  <ReactionBadge
                    type={user.reactionType || activeTab}
                    size={16}
                  />
                </div>
              </div>

              <span className="font-semibold text-base text-gray-900 dark:text-white truncate">
                {user.username}
              </span>
            </div>

            {/* Right: Add Friend / Relationship Button */}
            {user.accountId && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 ml-2"
              >
                <RequestButton id={user.accountId} />
              </div>
            )}
          </div>
        ))
      )}
    </Modal>
  )
}

export default ReactionsListModal
