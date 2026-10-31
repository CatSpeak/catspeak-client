import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { getRoomShareUrl } from "@/shared/utils/shareUtils"
import { useNavigate, useParams } from "react-router-dom"
import { Clock, Users, Link as LinkIcon } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { calculateEndDate, isRoomExpired } from "@/shared/utils/dateUtils"
import toast from "react-hot-toast"
import { useToggleBookmarkRoomMutation } from "@/store/api/roomsApi"
import RoomFullModal from "./RoomFullModal"
import ENThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-ANH.png"
import ZHThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-TQ.png"
import JPThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-NHAT.jpg"
import { getTopicMeta } from "../utils/getTopicIcon"
import Badge from "@/shared/components/ui/indicators/Badge"
import Animated3DCard from "@/shared/components/ui/animations/Animated3DCard"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { motion as Motion } from "framer-motion"

const ribbonVariants = {
  unbookmarked: {
    height: 26,
    scaleX: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
    },
  },
  bookmarked: {
    height: 52,
    scaleX: [1, 0.65, 0.65, 1],
    transition: {
      height: {
        duration: 0.42,
        ease: [0.34, 1.25, 0.64, 1],
      },
      scaleX: {
        duration: 0.46,
        times: [0, 0.28, 0.68, 1],
        ease: "easeInOut",
      },
    },
  },
}

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
  const [isActionHovered, setIsActionHovered] = useState(false)

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
        t?.rooms?.callEnded?.expiredToast ||
          "Phong nay da het thoi han su dung!",
      )
      return
    }

    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }

    const communityLang = localStorage.getItem("communityLanguage") || "en"
    setTimeout(() => {
      navigate(`/${communityLang}/meet/${roomId}`)
    }, 120)
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
        t?.rooms?.callEnded?.expiredToast ||
          "Phong nay da het thoi han su dung!",
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
        liftOnHover={false}
        disableHover={isActionHovered}
        rounded="rounded-2xl"
        style={{
          fontFamily: "var(--font-primary)",
          WebkitFontSmoothing: "antialiased",
        }}
        className={`h-full w-full transition-colors duration-200 ease-out ${
          !isActionHovered
            ? "hover:bg-gray-200/80 dark:hover:bg-[#272727] active:bg-gray-300/80 dark:active:bg-[#333333]"
            : ""
        }`}
        containerClassName="h-full w-full"
      >
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-[inherit] border-b border-border">
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

          {/* Top Left: Badges (Privacy, Level, Topic) */}
          <div className="absolute left-2 top-2 max-w-[calc(100%-48px)] flex items-center gap-1.5 z-10 p-1">
            {/* 1st (Far Left): Privacy / Password badge */}
            {(isPrivate || hasPassword) && (
              <Badge
                color="dark"
                title={
                  isPrivate && hasPassword
                    ? "Private & Password Protected"
                    : isPrivate
                      ? t?.rooms?.filters?.visibilities?.Private || "Private"
                      : t?.rooms?.customRooms?.passwordRequired || "Password"
                }
              >
                {hasPassword
                  ? t?.rooms?.customRooms?.passwordRequired || "Password"
                  : t?.rooms?.filters?.visibilities?.Private || "Private"}
              </Badge>
            )}

            {/* 2nd: Required Level badge */}
            {room.requiredLevel && (
              <Badge
                color="cath-red"
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
              </Badge>
            )}

            {/* 3rd: Topic text badge (hide generic 'Other' / 'Khác' topics) */}
            {(() => {
              const activeTopic =
                room.topic ||
                (Array.isArray(room.topics) && room.topics.length > 0
                  ? room.topics[0]
                  : undefined)
              if (!activeTopic) return null

              const { topicKey } = getTopicMeta(activeTopic)
              const isOther =
                topicKey === "other" ||
                ["other", "others", "khác", "khac"].includes(
                  String(activeTopic).trim().toLowerCase(),
                )
              if (isOther) return null

              const topicLabel =
                t?.rooms?.filters?.topics?.[topicKey] || activeTopic
              return (
                <Badge
                  color="cath-red"
                  title={topicLabel}
                  className="max-w-[120px] truncate"
                >
                  {topicLabel}
                </Badge>
              )
            })()}
          </div>

          {/* Top Right: Bookmark Ribbon Hanging from Top Edge */}
          <Motion.button
            type="button"
            initial={false}
            animate={isBookmarked ? "bookmarked" : "unbookmarked"}
            variants={ribbonVariants}
            ref={(el) => {
              if (el) {
                el.onpointerdown = (e) => e.stopPropagation()
              }
            }}
            style={{
              originY: 0,
              originX: 0.5,
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 100%, 50% calc(100% - 6px), 0% 100%)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsActionHovered(true)}
            onMouseLeave={() => setIsActionHovered(false)}
            onClick={handleBookmarkClick}
            title={
              isBookmarked
                ? t?.rooms?.unbookmark || "Bo luu phong"
                : t?.rooms?.bookmark || "Luu phong"
            }
            aria-label={
              isBookmarked
                ? t?.rooms?.unbookmark || "Bo luu phong"
                : t?.rooms?.bookmark || "Luu phong"
            }
            className="absolute top-0 right-3.5 z-20 w-6.5 sm:w-7 cursor-pointer outline-none transition-colors duration-150 select-none drop-shadow-md bg-cath-red-700 hover:bg-cath-red-800"
          />
        </div>

        {/* Content Section — no badges row */}
        <div className="flex flex-1 flex-col pl-4 py-4">
          {/* Title & Link */}
          <div className="flex items-start justify-between gap-2 pr-1 mb-2">
            <h3 className="text-base font-bold line-clamp-2 text-black dark:text-white leading-snug">
              {translatedName}
            </h3>
            <IconButton
              variant="ghost"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsActionHovered(true)}
              onMouseLeave={() => setIsActionHovered(false)}
              onClick={handleCopyLink}
              title={t?.rooms?.copyLinkTooltip || "Sao chep lien ket"}
              aria-label={t?.rooms?.copyLinkTooltip || "Sao chep lien ket"}
              className="shrink-0"
            >
              <LinkIcon />
            </IconButton>
          </div>

          {/* Footer Info */}
          <div className="mt-auto flex justify-between items-center gap-2 flex-wrap pr-4">
            {/* Participants */}
            <div className="flex items-center gap-2">
              <Users
                size={18}
                className="shrink-0 text-secondary dark:text-[#AAAAAA]"
              />
              <span className="text-sm text-secondary dark:text-[#AAAAAA] whitespace-nowrap">
                {isUnlimitedParticipants
                  ? `${room.currentParticipantCount || 0} ${t.rooms.people}`
                  : `${room.currentParticipantCount || 0}/${room.maxParticipants} ${t.rooms.people}`}
              </span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-2">
              <Clock
                size={18}
                className="shrink-0 text-secondary dark:text-[#AAAAAA]"
              />
              <span className="text-sm text-secondary dark:text-[#AAAAAA] whitespace-nowrap">
                {timeStr}
              </span>
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
