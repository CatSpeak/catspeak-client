import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getRoomShareUrl } from "@/shared/utils/shareUtils";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, Users, Link as LinkIcon, Bookmark, Lock } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/features/auth";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import { useTimezone } from "@/shared/hooks/useTimezone";
import { calculateEndDate, isRoomExpired } from "@/shared/utils/dateUtils";
import toast from "react-hot-toast";
import { useToggleBookmarkRoomMutation } from "@/store/api/roomsApi";
import RoomFullModal from "./RoomFullModal";
import ENThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-ANH.png";
import ZHThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-TQ.png";
import JPThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-NHAT.jpg";
import { getTopicIcon, getTopicMeta } from "../utils/getTopicIcon";

const RoomCard = ({ room }) => {
  const { t } = useLanguage()
  const { formatTime } = useTimezone()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const navigate = useNavigate()
  const { lang } = useParams()

  const [toggleBookmark] = useToggleBookmarkRoomMutation()
  const [isBookmarked, setIsBookmarked] = useState(
    Boolean(room.isBookmarked ?? room.isBookmark ?? room.bookmarked),
  )

  useEffect(() => {
    queueMicrotask(() => {
      setIsBookmarked(
        Boolean(room.isBookmarked ?? room.isBookmark ?? room.bookmarked),
      )
    })
  }, [room.isBookmarked, room.isBookmark, room.bookmarked])

  const currentLang =
    lang ||
    (typeof window !== "undefined"
      ? localStorage.getItem("communityLanguage")
      : null) ||
    "en"
  const fallbackThumbnail =
    currentLang === "ja"
      ? JPThumbnail
      : "zh" === currentLang
        ? ZHThumbnail
        : ENThumbnail
  const [imageError, setImageError] = useState(false)
  const displayThumbnail =
    imageError || !room.thumbnailUrl ? fallbackThumbnail : room.thumbnailUrl

  const translatedName = room.name
  const isUnlimitedParticipants =
    room.maxParticipants === null ||
    room.maxParticipants === undefined ||
    room.maxParticipants >= 2147483647 ||
    room.maxParticipants <= 0

  const isRoomFull =
    !isUnlimitedParticipants &&
    (room.currentParticipantCount || 0) >= room.maxParticipants

  const isExpired = isRoomExpired(room);
  // Ticket 02: keep expired visible but disabled in workspace (worker will delete); hide only in community listing
  const isWorkspaceBookmark = window.location.pathname.includes("/workspace/rooms");
  if (isExpired && !isWorkspaceBookmark) {
    return null;
  }

  const isPrivate = room.privacy === "Private" || room.isPrivate;
  const hasPassword =
    room.hasPassword || room.isPasswordProtected || !!room.password

  const roomId = room.roomId || room.id

  const handleJoinRoom = (e) => {
    e.stopPropagation()

    if (isExpired) {
      toast.error(
        t?.rooms?.callEnded?.expiredToast || "Phòng này đã hết thời hạn sử dụng!"
      );
      return;
    }

    // If user is not authenticated, open login modal instead of navigating
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }

    // If authenticated, navigate to the unified meet page
    const communityLang = localStorage.getItem("communityLanguage") || "en"
    navigate(`/${communityLang}/meet/${roomId}`)
  }

  // Badge helpers (Ticket 02) — derive from server DTO when available
  const activityBadge = room.activity || ((room.currentParticipantCount || 0) > 0 ? "InUse" : "Empty")
  const roomTypeVal = room.roomType ?? room.RoomType
  const isCustomType = roomTypeVal === 4 || roomTypeVal === "4" || roomTypeVal === "Custom" || room.isUnlimited || room.IsUnlimited
  const roomTypeBadge = isCustomType ? "Custom" : "Temporary"
  const isPrivateRoom = room.privacy === "Private" || room.isPrivate || room.Privacy === 1
  const visibilityBadge = isPrivateRoom ? "Private" : "Public"
  const languageBadge = room.languageType || room.LanguageType || room.language || "—"
  let isUnlimitedRoom = isCustomType || room.duration === null
  if (room.isUnlimited !== undefined && room.isUnlimited !== null) isUnlimitedRoom = room.isUnlimited
  else if (room.IsUnlimited !== undefined && room.IsUnlimited !== null) isUnlimitedRoom = room.IsUnlimited

  // Duration: prefer server remainingTime/remainingSeconds (Ticket 02), fallback to legacy calculate
  const createDate = room.createDate
    ? new Date(room.createDate)
    : room.createdAt
      ? new Date(room.createdAt)
      : new Date()
  const isInfiniteDuration = room.duration === null
  const durationMinutes = room.duration || 20
  const endDate = calculateEndDate(createDate, durationMinutes)
  const serverRemaining = room.remainingTime ?? room.RemainingTime
  const serverRemainingSec = room.remainingSeconds ?? room.RemainingSeconds
  let timeStr
  if (isUnlimitedRoom) timeStr = t.rooms.noLimit || "Unlimited"
  else if (serverRemaining) timeStr = serverRemaining
  else if (serverRemainingSec != null) {
    const s = serverRemainingSec
    const m = Math.floor(s / 60)
    const sec = s % 60
    timeStr = `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  } else if (isInfiniteDuration) timeStr = t.rooms.noLimit
  else timeStr = `${formatTime(createDate)} - ${formatTime(endDate)}`

  const [showFullModal, setShowFullModal] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  const handleRoomClick = (e) => {
    if (isExpired) {
      e.stopPropagation();
      toast.error(
        t?.rooms?.callEnded?.expiredToast || "Phòng này đã hết thời hạn sử dụng!"
      );
      return;
    }

    if (isRoomFull) {
      e.stopPropagation()
      setShowFullModal(true)
      return
    }

    handleJoinRoom(e)
  }

  const handleBookmarkClick = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    const targetRoomId = roomId
    if (!targetRoomId) return

    const prev = isBookmarked
    setIsBookmarked(!prev)
    try {
      const res = await toggleBookmark(targetRoomId).unwrap()
      if (res?.data?.isBookmarked !== undefined) {
        setIsBookmarked(res.data.isBookmarked)
      }
      toast.success(
        res?.message ||
          (prev
            ? t.rooms?.unbookmarkSuccess || "Đã bỏ lưu phòng"
            : t.rooms?.bookmarkSuccess || "Đã lưu phòng thành công"),
      )
    } catch (err) {
      setIsBookmarked(prev)
      toast.error(
        err?.data?.message ||
          (prev ? "Không thể bỏ lưu phòng" : "Không thể lưu phòng"),
      )
    }
  }

  const handleCopyLink = (e) => {
    e.stopPropagation()
    const communityLang = localStorage.getItem("communityLanguage") || "en"
    const baseUrl = `${window.location.origin}/${communityLang}/meet/${roomId}`
    const link = getRoomShareUrl({ baseUrl, room })
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết", { position: "top-center" })
      })
  }

  return (
    <>
      <div
        onClick={handleRoomClick}
        style={{
          fontFamily: "var(--font-primary)",
          WebkitFontSmoothing: "antialiased",
        }}
        className="relative h-full w-full rounded-xl bg-white dark:bg-[#1A1A1A] flex flex-col overflow-hidden [isolation:isolate] border border-border dark:border-[#3F3F3F] shadow-sm select-none cursor-pointer outline-offset-4 touch-manipulation transition-colors duration-200 ease-out hover:bg-[#F2F2F2] dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D]"
      >
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-[inherit] border-b border-border dark:border-[#3F3F3F]">
          {/* Blurred Background Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
            style={{ backgroundImage: `url(${displayThumbnail})` }}
          />
          {/* Main Image */}
          <img
            src={displayThumbnail}
            onError={() => setImageError(true)}
            alt="Room Cover"
            className={`relative z-10 h-full w-full ${!imageError && room.thumbnailUrl ? "object-contain" : "object-cover"}`}
          />

          {/* Top Left: Badges */}
          <div className="absolute left-2 top-2 max-w-[65%] flex items-center gap-1.5 z-10 p-1">
            {isExpired && (
              <div
                className="flex shrink-0 items-center justify-center h-7 sm:h-8 px-2.5 bg-[#580009] text-white border border-white/25 text-[11px] sm:text-xs font-bold rounded-md shadow-sm cursor-default"
                title={t?.rooms?.expiredBadge || "Đã hết hạn"}
              >
                {t?.rooms?.expiredBadge || "Đã hết hạn"}
              </div>
            )}
            {room.requiredLevel && (
              <div
                className="flex shrink-0 items-center justify-center h-7 sm:h-8 px-3 bg-cath-red-800 text-[11px] sm:text-xs font-bold text-white rounded-md shadow-sm truncate cursor-default"
                title={
                  t?.rooms?.filters?.levels?.[
                    room.requiredLevel?.toLowerCase()
                  ] ||
                  `${t?.rooms?.filters?.levelLabel || "Trình độ"}: ${room.requiredLevel}`
                }
              >
                {t?.rooms?.filters?.levels?.[
                  room.requiredLevel?.toLowerCase()
                ] || room.requiredLevel}
              </div>
            )}
            {(() => {
              const activeTopic =
                room.topic ||
                (Array.isArray(room.topics) && room.topics.length > 0
                  ? room.topics[0]
                  : undefined)
              const { topicKey } = getTopicMeta(activeTopic)
              const topicLabel =
                t?.rooms?.filters?.topics?.[topicKey] ||
                activeTopic ||
                t?.rooms?.filters?.topics?.other ||
                "Khác"
              return (
                <div
                  className="flex shrink-0 items-center justify-center h-7 w-7 sm:h-8 sm:w-8 bg-cath-red-800 rounded-full shadow-sm z-10 cursor-default"
                  title={topicLabel}
                >
                  {getTopicIcon(activeTopic)}
                </div>
              )
            })()}
          </div>

          {/* Top Right: Actions & Status */}
          <div className="absolute right-2 top-2 flex items-center gap-1.5 z-10 p-1">
            {(isPrivate || hasPassword) && (
              <div
                className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm shadow-sm"
                title={
                  isPrivate && hasPassword
                    ? "Private & Password Protected"
                    : isPrivate
                      ? "Private Room"
                      : "Password Protected"
                }
              >
                <Lock size={14} className="text-white" />
              </div>
            )}
            <div
              className={`flex shrink-0 h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 shadow-sm cursor-pointer ${
                isBookmarked
                  ? "bg-cath-red-700/20 hover:bg-cath-red-700/30 ring-1 ring-cath-red-700/40"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              onClick={handleBookmarkClick}
              title={
                isBookmarked
                  ? t?.rooms?.unbookmark || "Bỏ lưu phòng"
                  : t?.rooms?.bookmark || "Lưu phòng"
              }
            >
              <Bookmark
                size={16}
                className={`transition-all duration-200 ${
                  isBookmarked
                    ? "text-cath-red-700 dark:text-red-400 fill-cath-red-700 dark:fill-red-400 scale-110"
                    : "text-cath-red-800 dark:text-red-300 fill-none"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={`flex flex-1 flex-col p-4 pb-4 ${isExpired ? "opacity-60" : ""}`}>
          {/* Title & Link */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-bold line-clamp-1 text-black dark:text-white leading-snug">
              {translatedName}
            </h3>
            <div
              onClick={handleCopyLink}
              title={t?.rooms?.copyLinkTooltip || "Sao chép liên kết"}
              className="flex items-center justify-center text-cath-red-800 dark:text-red-400 shrink-0 hover:scale-110 transition-all active:scale-95 cursor-pointer p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-rose-950/40"
            >
              <LinkIcon size={18} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {!isWorkspaceBookmark && (
              <>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${isCustomType ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40" : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40"}`}>
                  {t.rooms?.filters?.roomTypes?.[roomTypeBadge] || roomTypeBadge}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${isPrivateRoom ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40" : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"}`}>
                  {t.rooms?.filters?.visibilities?.[visibilityBadge] || visibilityBadge}
                </span>
              </>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-[#3F3F3F]">
              {t.rooms?.aiSettings?.[languageBadge?.toLowerCase()] || languageBadge}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${activityBadge === "InUse" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40" : "bg-gray-100 dark:bg-[#272727] text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-[#3F3F3F]"}`}>
              {activityBadge === "InUse" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {t.rooms?.filters?.activities?.[activityBadge] || (activityBadge === "InUse" ? "In Use" : "Empty")}
            </span>
          </div>

          {isExpired && (
            <div className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/40 rounded-lg px-2 py-1 text-center">
              {t.rooms?.expiredBadge || "Đã hết hạn"}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-auto flex justify-between items-center gap-3 sm:gap-4 flex-wrap">
            {/* Participants */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-[#EDC589] dark:border-amber-800/40">
                <Users size={14} className="text-[#8B5A2B] dark:text-amber-300" />
              </div>
              <span className="text-[13px] sm:text-[14px] font-medium text-black dark:text-white whitespace-nowrap">
                {isUnlimitedParticipants
                  ? `${room.currentParticipantCount || 0} ${t.rooms.people}`
                  : `${room.currentParticipantCount || 0}/${room.maxParticipants} ${t.rooms.people}`}
              </span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-[#EDC589] dark:border-amber-800/40">
                <Clock size={14} className="text-[#8B5A2B] dark:text-amber-300" />
              </div>
              <div className="flex items-center text-[13px] sm:text-[14px] font-medium text-black dark:text-white whitespace-nowrap">
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoomFullModal
        open={showFullModal}
        onClose={() => setShowFullModal(false)}
      />

      {showCopied &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] px-4 py-2 bg-black/75 text-white rounded-full text-[15px] font-medium pointer-events-none shadow-lg whitespace-nowrap">
            {t?.rooms?.copySuccess || "Đã sao chép liên kết!"}
          </div>,
          document.body,
        )}
    </>
  )
}

export default RoomCard
