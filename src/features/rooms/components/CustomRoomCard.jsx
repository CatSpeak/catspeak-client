import React, { useState } from "react"
import { Users, Copy, Check, Pencil, Trash2, Clock } from "lucide-react"
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
  copiedId,
  isDeleting,
  ct = {},
}) => {
  const { t } = useLanguage()
  const roomId = room.id || room.roomId
  const isCopied = copiedId === roomId
  const [imageError, setImageError] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  console.log(room)

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

  // Privacy & Password
  const isPrivate = room.isPrivate || room.privacy === "Private"
  const hasPassword =
    room.hasPassword || room.isPasswordProtected || !!room.password

  // Duration text
  const durationText =
    room.duration && room.duration > 0
      ? `${room.duration} mins`
      : ct.unlimited || "Unlimited"

  // Participant count calculation
  const participants = Array.isArray(room.currentParticipants)
    ? room.currentParticipants
    : []
  const currentCount = room.currentParticipantCount ?? participants.length
  const maxParticipantsDisplay =
    room.maxParticipants && room.maxParticipants > 0
      ? room.maxParticipants
      : null

  return (
    <div
      onClick={() => onJoin(roomId)}
      className="relative flex flex-col sm:flex-row items-stretch w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white hover:bg-[#F6F6F6] transition-colors duration-200 cursor-pointer"
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
          alt={room.name || "Room Thumbnail"}
          className={`relative z-10 h-full w-full ${!imageError && room.thumbnailUrl ? "object-contain" : "object-cover"}`}
        />
      </div>

      {/* Content Center Section */}
      <div className="flex flex-1 flex-col justify-center px-4 py-3 sm:py-4 gap-2">
        {/* Room Name */}
        <h3 className="font-bold line-clamp-2">{room.name}</h3>

        {/* Stacked Indicators: User Count stacked above Time */}
        <div className="flex flex-col text-sm text-[#606060] gap-1">
          {/* User Count (Participants) */}
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {maxParticipantsDisplay
                ? `${currentCount}/${maxParticipantsDisplay} ${ct.people || "people"}`
                : `${currentCount} ${ct.people || "people"}`}
            </span>
          </div>

          {/* Time (Duration) */}
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{durationText}</span>
          </div>
        </div>

        {/* Level, Topic, Private & Password Chips */}
        {(isPrivate || hasPassword || room.requiredLevel || topicsList.length > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {/* Private Chip */}
            {isPrivate && (
              <Badge color="dark">{ct.private || "Private"}</Badge>
            )}

            {/* Password Chip */}
            {hasPassword && (
              <Badge color="dark">{ct.passwordRequired || "Password Required"}</Badge>
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
        <div className="flex items-center">
          {/* Copy Link */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              onCopyLink(roomId)
            }}
            variant="ghost"
            title={ct.copyLink || "Copy Link"}
          >
            {isCopied ? <Check className="text-emerald-500" /> : <Copy />}
          </IconButton>

          {/* Edit */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              onEdit(room)
            }}
            variant="ghost"
            title={ct.edit || "Edit"}
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
            title={ct.delete || "Delete"}
          >
            <Trash2 />
          </IconButton>
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
        title={ct.deleteConfirm || "Delete room?"}
        message={
          ct.deleteConfirmMessage ||
          `Are you sure you want to delete "${room.name}"? This action cannot be undone.`
        }
        cancelText={ct.cancel || "Cancel"}
        confirmText={isDeleting ? "..." : ct.delete || "Delete"}
        confirmVariant="destructive"
      />
    </div>
  )
}

export default CustomRoomCard
