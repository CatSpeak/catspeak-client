import React from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Clock, Users, Link, Bookmark } from "lucide-react"
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
import Animated3DCard from "@/shared/components/ui/animations/Animated3DCard"

import { getTranslatedRoomName } from "../utils/roomNameUtils"

const RoomCard = ({ room }) => {
  console.log(room)
  const [searchParams] = useSearchParams()
  const { language, t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const navigate = useNavigate()

  const translatedName = React.useMemo(() => {
    return getTranslatedRoomName(room.name, t)
  }, [room.name, t.rooms.specialNames])

  const isRoomFull =
    room.maxParticipants !== null &&
    (room.currentParticipantCount || 0) >= room.maxParticipants

  const handleJoinRoom = (e) => {
    e.stopPropagation()

    // If user is not authenticated, open login modal instead of navigating
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }

    // If authenticated, open room in the same page
    navigate(`/room/${room.roomId}`)
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

  const [showDevModal, setShowDevModal] = React.useState(false)
  const [showFullModal, setShowFullModal] = React.useState(false)

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
      <Animated3DCard
        onClick={handleRoomClick}
        style={{ fontFamily: "'Inter', sans-serif" }}
        className="relative flex w-full flex-col overflow-hidden rounded-xl bg-white border border-[#C6C6C6]"
      >
        {/* Cover Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
            alt="Room Cover"
            className="h-full w-full object-cover transition-transform duration-500"
          />

          {/* Top Overlay: Tags & Bookmark */}
          <div className="absolute left-4 top-4 right-14 flex flex-wrap gap-2">
            {room.requiredLevel && (
              <span className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>

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
          <div className="mb-3 h-px w-full bg-gray-200" />

          {/* Footer Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            {/* Participants */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200">
                <Users size={16} className="text-[#990011]" />
              </div>
              <span className="text-sm whitespace-nowrap">
                {room.maxParticipants === null
                  ? `${room.currentParticipantCount || 0} ${t.rooms.participants}`
                  : `${room.currentParticipantCount || 0}/${room.maxParticipants} ${t.rooms.participants}`}
              </span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200">
                <Clock size={16} className="text-[#990011]" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                {/* <span>{dateStr}</span> */}
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </Animated3DCard>

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
