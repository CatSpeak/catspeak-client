import React, { useState } from "react"
import { Users, Copy, Check, Pencil, Trash2, Clock, Bookmark } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import Badge from "@/shared/components/ui/indicators/Badge"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTopicIcon } from "../utils/getTopicIcon"
import { formatTopic, formatLevel } from "../utils/formatters"
import ENThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-ANH.png"
import ZHThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-TQ.png"

const CustomRoomCard = ({
  room,
  onEdit,
  onDelete,
  onCopyLink,
  onJoin,
  onToggleBookmark,
  isBookmarkTab = false,
  copiedId,
  isDeleting,
  ct: propsCt = {},
}) => {
  const { t } = useLanguage()
  const customRooms = { ...(t.rooms?.customRooms || {}), ...propsCt }
  const roomId = room.id || room.roomId
  const isCopied = copiedId === roomId
  const [imageError, setImageError] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Thumbnail fallback handling
  const fallbackThumbnail = room.languageType === "Chinese" ? ZHThumbnail : ENThumbnail
  const displayThumbnail =
    imageError || !room.thumbnailUrl ? fallbackThumbnail : room.thumbnailUrl

  // Normalize topics array (supports "topic": "string" or "topics": ["string"])
  const topicsList = Array.isArray(room.topics)
    ? room.topics
    : room.topic
      ? [room.topic]
      : []

  // Password check (supports privacy: 1, "Private", isPrivate, hasPassword)
  const hasPassword =
    room.privacy === 1 ||
    room.privacy === "Private" ||
    room.isPrivate ||
    room.hasPassword ||
    room.isPasswordProtected ||
    !!room.password

  // Duration text (supports remainingTime, isUnlimited, duration)
  const durationText = room.remainingTime
    ? `${room.remainingTime}`
    : room.isUnlimited
      ? customRooms.unlimited || "Unlimited"
      : room.duration && room.duration > 0
        ? `${room.duration} mins`
        : customRooms.unlimited || "Unlimited"

  // Participant count calculation
  const participants = Array.isArray(room.currentParticipants)
    ? room.currentParticipants
    : []
  const currentCount = room.currentParticipantCount ?? participants.length
  const maxParticipantsDisplay =
    room.maxParticipants && room.maxParticipants > 0
      ? room.maxParticipants
      : null

  const deleteConfirmMessage = (
    customRooms.deleteConfirmMessage ||
    `Are you sure you want to delete "${room.name}"? This action cannot be undone.`
  ).replace("{{name}}", room.name || "")

  return (
    <div
      onClick={() => onJoin(roomId)}
      className="relative flex flex-col sm:flex-row items-stretch w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white hover:bg-[#F6F6F6] transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* 16:9 Image Left Section */}
      <div className="relative w-full sm:w-44 sm:self-stretch aspect-video sm:aspect-auto shrink-0 overflow-hidden sm:border-r border-b sm:border-b-0 border-[#e5e5e5] bg-gray-900">
        {/* Blurred Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
          style={{ backgroundImage: `url(${displayThumbnail})` }}
        />
        {/* Main Image */}
        <img
          src={displayThumbnail}
          onError={() => setImageError(true)}
          alt={room.name || "Room thumbnail"}
          className={`relative z-10 h-full w-full ${!imageError && room.thumbnailUrl ? "object-contain" : "object-cover"}`}
        />
      </div>

      {/* Content Center Section */}
      <div className="flex flex-1 flex-col justify-center px-4 py-3 sm:py-4 gap-2">
        {/* Room Name */}
        <div className="flex items-center gap-2">
          <h3 className="font-bold line-clamp-2 text-base text-gray-900">{room.name}</h3>
          {room.activity === "InUse" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              In Use
            </span>
          )}
        </div>

        {/* Stacked Indicators: User Count stacked above Time */}
        <div className="flex flex-col text-sm text-[#606060] gap-1">
          {/* User Count (Participants) */}
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {maxParticipantsDisplay
                ? `${currentCount}/${maxParticipantsDisplay} ${customRooms.people || "people"}`
                : `${currentCount} ${customRooms.people || "people"}`}
            </span>
          </div>

          {/* Time (Duration) */}
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{durationText}</span>
          </div>
        </div>

        {/* Level, Topic & Password Chips */}
        {(hasPassword || room.requiredLevel || topicsList.length > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {/* Password Chip */}
            {hasPassword && (
              <Badge color="dark">
                {customRooms.passwordRequired || "Password required"}
              </Badge>
            )}

            {/* Level Chip */}
            {room.requiredLevel && (
              <Badge color="cath-red">{formatLevel(room.requiredLevel, t)}</Badge>
            )}

            {/* Topic Chips */}
            {topicsList.map((topic, idx) => (
              <Badge key={`${topic}-${idx}`} color="cath-red">
                {formatTopic(topic, t)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Right Section */}
      <div
        className="shrink-0 flex items-center p-4 sm:p-0 sm:pr-5 justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          {/* Copy Link */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              onCopyLink(roomId)
            }}
            variant="ghost"
            title={customRooms.copyLink || "Copy link"}
          >
            {isCopied ? <Check className="text-emerald-500" /> : <Copy />}
          </IconButton>

          {isBookmarkTab ? (
            /* Unbookmark Button */
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                if (onToggleBookmark) onToggleBookmark(roomId)
              }}
              variant="ghost"
              title={t.rooms?.unbookmark || "Bỏ lưu phòng"}
              className="text-cath-red-700 hover:bg-red-50"
            >
              <Bookmark className="fill-cath-red-700 text-cath-red-700" size={18} />
            </IconButton>
          ) : (
            <>
              {/* Edit */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(room)
                }}
                variant="ghost"
                title={customRooms.edit || "Edit"}
              >
                <Pencil />
              </IconButton>

              {/* Delete */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDeleteModalOpen(true)
                }}
                variant="ghost"
                title={customRooms.delete || "Delete"}
              >
                <Trash2 />
              </IconButton>
            </>
          )}
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(roomId)
          setIsDeleteModalOpen(false)
        }}
        title={customRooms.deleteConfirmTitle || customRooms.deleteConfirm || "Delete room?"}
        message={deleteConfirmMessage}
        cancelText={customRooms.cancel || t.cancel || "Cancel"}
        confirmText={isDeleting ? "..." : customRooms.delete || "Delete"}
        confirmVariant="destructive"
      />
    </div>
  )
}

export default CustomRoomCard
