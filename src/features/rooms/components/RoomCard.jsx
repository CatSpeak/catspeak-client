import React, { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import InteractiveCard from "@/shared/components/ui/InteractiveCard"
import { Clock, Users, Link, Bookmark, Lock } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import {
  formatDate,
  formatTimeRange,
  calculateEndDate,
} from "@/shared/utils/dateFormatter"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import Modal from "@/shared/components/ui/Modal"
import RoomFullModal from "./RoomFullModal"
import meetingFallbackImage from "@/shared/assets/images/rooms/meeting.jpeg"

const RoomCard = ({ room }) => {
  const [searchParams] = useSearchParams()
  const { language, t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const navigate = useNavigate()

  const translatedName = room.name
  const isRoomFull =
    room.maxParticipants !== null &&
    (room.currentParticipantCount || 0) >= room.maxParticipants

  const isPrivate = room.privacy === "Private" && room.hasPassword

  const handleJoinRoom = (e) => {
    e.stopPropagation()

    // If user is not authenticated, open login modal instead of navigating
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }

    // If authenticated, navigate to the unified meet page
    const communityLang = localStorage.getItem("communityLanguage") || "en"
    navigate(`/${communityLang}/meet/${room.roomId}`)
  }

  // Date and time formatting using locale-aware utilities
  const createDate = new Date(room.createDate)
  const dateStr = formatDate(createDate)

  const isInfiniteDuration = room.duration === null
  const durationMinutes = room.duration || 20 // fallback to 20 if not null
  const endDate = calculateEndDate(createDate, durationMinutes)
  const timeStr = isInfiniteDuration
    ? t.rooms.noLimit
    : formatTimeRange(createDate, endDate)

  // Placeholder code simulation
  const roomCode = `room-${room.roomId}`.toLowerCase()

  const [showDevModal, setShowDevModal] = useState(false)
  const [showFullModal, setShowFullModal] = useState(false)

  const handleRoomClick = (e) => {
    if (isRoomFull) {
      e.stopPropagation()
      setShowFullModal(true)
      return
    }

    handleJoinRoom(e)
  }

  const handleBookmarkClick = (e) => {
    e.stopPropagation()
    setShowDevModal(true)
  }

  return (
    <>
      <div
        style={{
          fontFamily: "var(--font-primary)",
          WebkitFontSmoothing: "antialiased",
        }}
        className="h-full w-full"
      >
        <InteractiveCard
          onClick={handleRoomClick}
          className="h-full w-full"
          innerClassName="h-full w-full"
        >
          {/* Cover Image Section */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black/5">
          {/* Blurred Background Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
            style={{ backgroundImage: `url(${room.thumbnailUrl || meetingFallbackImage})` }}
          />

          <img
            src={room.thumbnailUrl || meetingFallbackImage}
            alt="Room Cover"
            className="relative z-10 h-full w-full object-contain transition-transform duration-500"
          />

          {/* Subtle overlay */}
          <div className="absolute inset-0 z-10 bg-black/5 pointer-events-none" />

          {/* Top Overlay: Tags & Bookmark */}
          <div className="absolute z-20 left-4 top-4 right-14 flex flex-wrap gap-2">
            {room.requiredLevel && (
              <span className="rounded-full bg-cath-red-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-full bg-cath-red-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>

          {/* Private room lock badge */}
          {isPrivate && (
            <div className="absolute z-20 right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
              <Lock size={14} className="text-white" />
            </div>
          )}

          {/* <div
            className="absolute right-2 top-2 z-20 flex h-10 w-10 flex-col items-center justify-center transition-all duration-300"
            onClick={handleBookmarkClick}
          >
            <Bookmark className="drop-shadow-md transition-all duration-200 text-white hover:text-gray-200" />
          </div> */}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-3">
          {/* Title */}
          <h3 className="text-base font-bold line-clamp-1">{translatedName}</h3>
          {/* Room Link/Code */}
          <div className="mb-2 flex items-center gap-2">
            <Link size={14} className="text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">
              {roomCode}
            </span>
          </div>

          {/* Divider */}
          <div className="mb-3 h-px w-full bg-[#e5e5e5]" />

          {/* Footer Info */}
          <div className="mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            {/* Participants */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-[#E5E5E5]">
                <Users size={16} className="text-cath-red-700" />
              </div>
              <span className="text-sm whitespace-nowrap">
                {room.maxParticipants === null
                  ? `${room.currentParticipantCount || 0} ${t.rooms.participants}`
                  : `${room.currentParticipantCount || 0}/${room.maxParticipants} ${t.rooms.participants}`}
              </span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-[#E5E5E5]">
                <Clock size={16} className="text-cath-red-700" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                {/* <span>{dateStr}</span> */}
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
        </InteractiveCard>
      </div>

      <InDevelopmentModal
        open={showDevModal}
        onCancel={() => setShowDevModal(false)}
      />

      <RoomFullModal
        open={showFullModal}
        onClose={() => setShowFullModal(false)}
      />
    </>
  )
}

export default RoomCard
