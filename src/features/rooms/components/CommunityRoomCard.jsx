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
import Animated3DCard from "@/shared/components/ui/animations/Animated3DCard";

/**
 * CommunityRoomCard — dung rieng cho trang /community.
 * Giong RoomCard nhung KHONG hien thi dong badge (Custom / Public / Language / Empty).
 */
const CommunityRoomCard = ({ room }) => {
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

  const isExpired = isRoomExpired(room)
  // Hide expired rooms in the community listing
  if (isExpired) {
    return null
  }

  const isPrivate = room.privacy === "Private" || room.isPrivate
  const hasPassword =
    room.hasPassword || room.isPasswordProtected || !!room.password

  const roomId = room.roomId || room.id

  const handleJoinRoom = (e) => {
    e.stopPropagation()

    if (isExpired) {
      toast.error(
        t?.rooms?.callEnded?.expiredToast || "Phong nay da het thoi han su dung!"
      )
      return
    }

    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }

    const communityLang = localStorage.getItem("communityLanguage") || "en"
    navigate(`/${communityLang}/meet/${roomId}`)
  }

  const roomTypeVal = room.roomType ?? room.RoomType
  const isCustomType =
    roomTypeVal === 4 ||
    roomTypeVal === "4" ||
    roomTypeVal === "Custom" ||
    room.isUnlimited ||
    room.IsUnlimited
  let isUnlimitedRoom = isCustomType || room.duration === null
  if (room.isUnlimited !== undefined && room.isUnlimited !== null)
    isUnlimitedRoom = room.isUnlimited
  else if (room.IsUnlimited !== undefined && room.IsUnlimited !== null)
    isUnlimitedRoom = room.IsUnlimited

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
      e.stopPropagation()
      toast.error(
        t?.rooms?.callEnded?.expiredToast || "Phong nay da het thoi han su dung!"
      )
      return
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
            ? t.rooms?.unbookmarkSuccess || "Da bo luu phong"
            : t.rooms?.bookmarkSuccess || "Da luu phong thanh cong"),
      )
    } catch (err) {
      setIsBookmarked(prev)
      toast.error(
        err?.data?.message ||
          (prev ? "Khong the bo luu phong" : "Khong the luu phong"),
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
        toast.error("Khong the sao chep lien ket", { position: "top-center" })
      })
  }

  return (
    <>
      <Animated3DCard
        onClick={handleRoomClick}
        style={{
          fontFamily: "var(--font-primary)",
          WebkitFontSmoothing: "antialiased",
        }}
        className="h-full w-full"
        containerClassName="h-full w-full"
      >
        <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-border">
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

          {/* Top Left: Level & Topic badges only (no type/visibility badges) */}
          <div className="absolute left-2 top-2 max-w-[65%] flex items-center gap-1.5 z-10 p-1">
            {room.requiredLevel && (
              <div
                className="flex shrink-0 items-center justify-center h-7 sm:h-8 px-3 bg-cath-red-800 text-[11px] sm:text-xs font-bold text-white rounded-md shadow-sm truncate cursor-default"
                title={
                  t?.rooms?.filters?.levels?.[
                    room.requiredLevel?.toLowerCase()
                  ] ||
                  `${t?.rooms?.filters?.levelLabel || "Trinh do"}: ${room.requiredLevel}`
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
                "Khac"
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
                  ? t?.rooms?.unbookmark || "Bo luu phong"
                  : t?.rooms?.bookmark || "Luu phong"
              }
            >
              <Bookmark
                size={16}
                className={`transition-all duration-200 ${
                  isBookmarked
                    ? "text-cath-red-700 fill-cath-red-700 scale-110"
                    : "text-cath-red-800 fill-none"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Content Section — no badges row */}
        <div className="flex flex-1 flex-col p-4 pb-4">
          {/* Title & Link */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-bold line-clamp-1 text-black leading-snug">
              {translatedName}
            </h3>
            <div
              onClick={handleCopyLink}
              title={t?.rooms?.copyLinkTooltip || "Sao chep lien ket"}
              className="flex items-center justify-center text-cath-red-800 shrink-0 hover:scale-110 transition-all active:scale-95 cursor-pointer p-1.5 rounded-full hover:bg-red-50"
            >
              <LinkIcon size={18} />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-auto flex justify-between items-center gap-3 sm:gap-4 flex-wrap">
            {/* Participants */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-[#EDC589]">
                <Users size={14} className="text-[#8B5A2B]" />
              </div>
              <span className="text-[13px] sm:text-[14px] font-medium text-black whitespace-nowrap">
                {isUnlimitedParticipants
                  ? `${room.currentParticipantCount || 0} ${t.rooms.people}`
                  : `${room.currentParticipantCount || 0}/${room.maxParticipants} ${t.rooms.people}`}
              </span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-[#EDC589]">
                <Clock size={14} className="text-[#8B5A2B]" />
              </div>
              <div className="flex items-center text-[13px] sm:text-[14px] font-medium text-black whitespace-nowrap">
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </Animated3DCard>

      <RoomFullModal
        open={showFullModal}
        onClose={() => setShowFullModal(false)}
      />

      {showCopied &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] px-4 py-2 bg-black/75 text-white rounded-full text-[15px] font-medium pointer-events-none shadow-lg whitespace-nowrap">
            {t?.rooms?.copySuccess || "Da sao chep lien ket!"}
          </div>,
          document.body,
        )}
    </>
  )
}

export default CommunityRoomCard
