import React, { useRef, useState, useEffect, useContext } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  UserPlus,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Check,
  UserCheck,
} from "lucide-react"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useFollowUserMutation,
  useSendFriendRequestMutation,
} from "@/store/api/social/friendshipApi"
import { useGetInFeedRecommendationsQuery } from "@/store/api/social/recommendationsApi"
import { useRecommendationTracking } from "../../hooks/useRecommendationTracking"

// ── 1. Individual In-Feed Card Component ─────────────────────────────────────
const InFeedCard = ({
  item,
  languageCommunity,
  onNavigate,
  onFollow,
  onFriendRequest,
  onJoinGroup,
}) => {
  const { t } = useLanguage()
  const { elementRef, trackCardClick, trackActionClick } = useRecommendationTracking({
    itemType: item.type,
    targetId: item.id,
    placement: "in_feed",
    languageCommunity,
  })

  const [localStatus, setLocalStatus] = useState(item.actionStatus || "none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCardClick = () => {
    trackCardClick()
    onNavigate(item)
  }

  const handleAction = async (e) => {
    e.stopPropagation()
    if (isSubmitting) return

    trackActionClick(item.type === "teacher" ? "Follow" : item.type === "group" ? "JoinGroup" : "AddFriend")
    setIsSubmitting(true)

    try {
      if (item.type === "teacher") {
        await onFollow(item.id, localStatus, setLocalStatus)
      } else if (item.type === "group") {
        await onJoinGroup(item.id, localStatus, setLocalStatus)
      } else {
        await onFriendRequest(item.id, localStatus, setLocalStatus)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      ref={elementRef}
      onClick={handleCardClick}
      className="flex flex-col justify-between w-[240px] sm:w-[260px] shrink-0 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 hover:shadow-md transition-all cursor-pointer group"
    >
      <div>
        {/* Top Header / Avatar */}
        <div className="flex flex-col items-center text-center">
          {item.type === "group" ? (
            <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-neutral-800 relative">
              {item.coverUrl || item.avatarUrl ? (
                <img
                  src={item.coverUrl || item.avatarUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                  {item.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div className="relative mb-3">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/50 text-cath-red-700 dark:text-rose-400 font-bold text-xl flex items-center justify-center">
                  {(item.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              {item.isVerified && (
                <ShieldCheck className="w-5 h-5 text-blue-500 absolute bottom-0 right-0 bg-white dark:bg-neutral-900 rounded-full" />
              )}
            </div>
          )}

          {/* Name */}
          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-cath-red-700 dark:group-hover:text-rose-400 transition-colors">
            {item.name}
          </h4>

          {/* Subtitle / Description */}
          <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
            {item.subTitle || item.description}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {item.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around py-3 my-3 border-y border-slate-100 dark:border-neutral-800/80 text-xs text-slate-600 dark:text-neutral-400">
          {item.type === "teacher" && (
            <>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-800 dark:text-white">
                  {item.rating?.toFixed(1) || "5.0"}
                </span>
                <span className="text-[10px]">({item.reviewCount || 10})</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{item.memberCount?.toLocaleString() || 0} học viên</span>
              </div>
            </>
          )}

          {item.type === "group" && (
            <>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{item.memberCount?.toLocaleString() || 0} tv</span>
              </div>
              <div className="flex items-center gap-1 text-cath-red-600 dark:text-rose-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{item.postCountInfo || "Sôi nổi"}</span>
              </div>
            </>
          )}

          {item.type === "user" && (
            <>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{item.mutualFriendCount || 0} bạn chung</span>
              </div>
              <div className="truncate">
                <span>{item.postCountInfo || "Hoạt động"}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full mt-1">
        {item.type === "teacher" && (
          <button
            type="button"
            onClick={handleAction}
            className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              localStatus === "following"
                ? "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300"
                : "bg-cath-red-600 hover:bg-cath-red-700 text-white shadow-xs"
            }`}
          >
            {localStatus === "following" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.recommendations?.actions?.following || "Đang theo dõi"}</span>
              </>
            ) : (
              <span>{t.recommendations?.actions?.follow || "Theo dõi"}</span>
            )}
          </button>
        )}

        {item.type === "group" && (
          <button
            type="button"
            onClick={handleAction}
            className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              localStatus === "requested"
                ? "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 cursor-default"
                : localStatus === "joined"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                  : "bg-cath-red-600 hover:bg-cath-red-700 text-white shadow-xs"
            }`}
          >
            {localStatus === "requested" ? (
              <span>{t.recommendations?.actions?.requestSent || "Đã gửi yêu cầu"}</span>
            ) : localStatus === "joined" ? (
              <span>{t.recommendations?.actions?.joined || "Đã tham gia"}</span>
            ) : (
              <span>{t.recommendations?.actions?.joinGroup || "Tham gia nhóm"}</span>
            )}
          </button>
        )}

        {item.type === "user" && (
          <button
            type="button"
            onClick={handleAction}
            className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              localStatus === "requested"
                ? "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                : "bg-cath-red-600 hover:bg-cath-red-700 text-white shadow-xs"
            }`}
          >
            {localStatus === "requested" ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.recommendations?.actions?.friendRequestSent || "Đã gửi lời mời"}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t.recommendations?.actions?.addFriend || "Kết bạn"}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ── 2. Main In-Feed Section Component ────────────────────────────────────────
const InFeedRecommendationSection = ({
  cycleType = "teacher",
  languageCommunity = 0,
}) => {
  const navigate = useNavigate()
  const { lang = "vi" } = useParams()
  const token = useSelector((s) => s.auth?.token)
  const { openAuthModal } = useContext(AuthModalContext)
  const { t } = useLanguage()

  const [followUser] = useFollowUserMutation()
  const [sendFriendRequest] = useSendFriendRequestMutation()

  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const { data, isError, isLoading } = useGetInFeedRecommendationsQuery({
    cycleType,
    languageCommunity,
    count: 6,
  })

  const items = data?.items || []

  // Check scroll boundary to show/hide arrows
  const checkScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    checkScroll()
  }, [items])

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current
    if (!el) return
    const offset = direction === "left" ? -280 : 280
    el.scrollBy({ left: offset, behavior: "smooth" })
  }

  // Guard: if guest tries to action
  const ensureLoggedIn = () => {
    if (!token) {
      openAuthModal("login")
      return false
    }
    return true
  }

  // Optimistic follow (BR-DX-12)
  const handleFollow = async (targetId, currentStatus, setStatus) => {
    if (!ensureLoggedIn()) return
    const prev = currentStatus
    setStatus("following")
    try {
      await followUser(targetId).unwrap()
    } catch {
      setStatus(prev)
      alert("Không thể thực hiện. Vui lòng thử lại.")
    }
  }

  // Optimistic friend request (BR-DX-12)
  const handleFriendRequest = async (targetId, currentStatus, setStatus) => {
    if (!ensureLoggedIn()) return
    const prev = currentStatus
    setStatus("requested")
    try {
      await sendFriendRequest(targetId).unwrap()
    } catch {
      setStatus(prev)
      alert("Không thể thực hiện. Vui lòng thử lại.")
    }
  }

  // Group join action -> navigate to chat room directly
  const handleJoinGroup = async (targetId, currentStatus, setStatus) => {
    if (!ensureLoggedIn()) return
    navigate(`/chat/${targetId}`)
  }

  const handleNavigateItem = (item) => {
    if (item.type === "group") {
      navigate(`/chat/${item.id}`)
    } else {
      navigate(`/workspace/profile/${item.id}`)
    }
  }

  const handleViewAll = () => {
    navigate(`/${lang}/cat-speak/recommendations?tab=${data?.cycleType || cycleType}`)
  }

  // BR-DX-15: Fail silently if error or empty
  if (isError || (!isLoading && items.length === 0)) {
    return null
  }

  const title = data?.title || t.recommendations?.inFeed?.defaultTitle || "Đề xuất dành cho bạn"
  const subTitle =
    data?.subTitle ||
    t.recommendations?.inFeed?.defaultSubTitle ||
    "Gợi ý kết nối và cùng nhau học tập ngoại ngữ"

  return (
    <div className="w-full my-4 p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-white dark:from-[#141414] dark:to-[#1A1A1A] rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cath-red-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
              {t.recommendations?.badge || "Đề xuất"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            {subTitle}
          </p>
        </div>

        {/* Scroll Arrows on Desktop */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 transition-all ${
              canScrollLeft
                ? "text-slate-700 dark:text-neutral-200 hover:bg-slate-50 cursor-pointer shadow-xs"
                : "text-slate-300 dark:text-neutral-600 opacity-50 cursor-not-allowed"
            }`}
            aria-label={t.recommendations?.inFeed?.scrollLeft || "Cuộn sang trái"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 transition-all ${
              canScrollRight
                ? "text-slate-700 dark:text-neutral-200 hover:bg-slate-50 cursor-pointer shadow-xs"
                : "text-slate-300 dark:text-neutral-600 opacity-50 cursor-not-allowed"
            }`}
            aria-label={t.recommendations?.inFeed?.scrollRight || "Cuộn sang phải"}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[240px] sm:w-[260px] h-64 shrink-0 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-neutral-800" />
                <div className="w-32 h-4 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                <div className="w-24 h-3 bg-slate-200 dark:bg-neutral-800 rounded-md" />
              </div>
              <div className="w-full h-8 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
            </div>
          ))
        ) : (
          items.map((item) => (
            <InFeedCard
              key={`${item.type}_${item.id}`}
              item={item}
              languageCommunity={languageCommunity}
              onNavigate={handleNavigateItem}
              onFollow={handleFollow}
              onFriendRequest={handleFriendRequest}
              onJoinGroup={handleJoinGroup}
            />
          ))
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-neutral-800 flex justify-end">
        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cath-red-600 dark:text-rose-400 hover:text-cath-red-700 hover:underline transition-colors cursor-pointer"
        >
          <span>
            {data?.cycleType === "teacher"
              ? t.recommendations?.inFeed?.viewAllTeachers || "Xem tất cả giảng viên"
              : data?.cycleType === "group"
                ? t.recommendations?.inFeed?.viewAllGroups || "Xem tất cả nhóm học"
                : t.recommendations?.inFeed?.viewAllFriends || "Xem tất cả bạn bè"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default InFeedRecommendationSection
