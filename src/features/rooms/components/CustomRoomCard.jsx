import React, { useState } from "react"
import {
  Users,
  Check,
  Pencil,
  Trash2,
  Clock,
  Bookmark,
  Share,
  Lock,
} from "lucide-react"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTopicIcon, getTopicMeta } from "../utils/getTopicIcon"
import ENThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-ANH.png"
import ZHThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-TQ.png"
import JPThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-NHAT.jpg"
import Animated3DCard from "@/shared/components/ui/animations/Animated3DCard"

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
  const fallbackThumbnail =
    room.languageType === "Japanese"
      ? JPThumbnail
      : "Chinese" == room.languageType
        ? ZHThumbnail
        : ENThumbnail
  const displayThumbnail =
    imageError || !room.thumbnailUrl ? fallbackThumbnail : room.thumbnailUrl

  // Normalize topic
  const activeTopic =
    room.topic ||
    (Array.isArray(room.topics) && room.topics.length > 0
      ? room.topics[0]
      : undefined)

  // Password check (supports privacy: 1, "Private", isPrivate, hasPassword)
  const isPrivate =
    room.privacy === "Private" || room.isPrivate || room.privacy === 1
  const hasPassword =
    isPrivate || room.hasPassword || room.isPasswordProtected || !!room.password

  // Duration text (supports remainingTime, isUnlimited, duration)
  const durationText = room.remainingTime
    ? `${room.remainingTime}`
    : room.isUnlimited || room.duration === null
      ? customRooms.unlimited || t.rooms?.noLimit || "Không giới hạn"
      : room.duration && room.duration > 0
        ? `${room.duration} ${t.rooms?.minutes || "phút"}`
        : customRooms.unlimited || t.rooms?.noLimit || "Không giới hạn"

  // Participant count calculation
  const participants = Array.isArray(room.currentParticipants)
    ? room.currentParticipants
    : []
  const currentCount = room.currentParticipantCount ?? participants.length ?? 0
  const maxParticipantsDisplay =
    room.maxParticipants && room.maxParticipants > 0
      ? room.maxParticipants
      : null

  const deleteConfirmMessage = (
    customRooms.deleteConfirmMessage ||
    `Bạn có chắc chắn muốn xóa "${room.name}"? Hành động này không thể hoàn tác.`
  ).replace("{{name}}", room.name || "")

  const handleCardClick = () => {
    if (onJoin) onJoin(roomId)
  }

  return (
    <>
      <Animated3DCard
        onClick={handleCardClick}
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
            alt={room.name || "Room Cover"}
            className={`relative z-10 h-full w-full ${!imageError && room.thumbnailUrl ? "object-contain" : "object-cover"}`}
          />

          {/* Top Left: Badges (Level & Topic) */}
          <div className="absolute left-2 top-2 max-w-[55%] flex items-center gap-1.5 z-10 p-1">
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
                {room.requiredLevel}
              </div>
            )}
            {activeTopic &&
              (() => {
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
            {hasPassword && (
              <div
                className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm shadow-sm"
                title={
                  isPrivate ? "Phòng riêng tư" : "Được bảo vệ bằng mật khẩu"
                }
              >
                <Lock size={14} className="text-white" />
              </div>
            )}

            {isBookmarkTab ? (
              <div
                className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 shadow-sm cursor-pointer bg-cath-red-700/20 hover:bg-cath-red-700/30 ring-1 ring-cath-red-700/40"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onToggleBookmark) onToggleBookmark(roomId)
                }}
                title={t?.rooms?.unbookmark || "Bỏ lưu phòng"}
              >
                <Bookmark
                  size={16}
                  className="text-cath-red-700 fill-cath-red-700 scale-110 transition-all duration-200"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-sm">
                {/* Edit Button */}
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(room)
                    }}
                    className="flex shrink-0 h-7 w-7 items-center justify-center rounded-full hover:bg-white/30 text-white transition-colors"
                    title={customRooms.edit || "Chỉnh sửa"}
                  >
                    <Pencil size={13} />
                  </button>
                )}

                {/* Delete Button */}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDeleteModalOpen(true)
                    }}
                    className="flex shrink-0 h-7 w-7 items-center justify-center rounded-full hover:bg-red-600/80 text-white transition-colors"
                    title={customRooms.delete || "Xóa phòng"}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4 pb-4">
          {/* Title & Copy Link */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="text-lg font-bold line-clamp-1 text-black leading-snug">
                {room.name}
              </h3>
              {room.activity === "InUse" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Use
                </span>
              )}
            </div>

            {onCopyLink && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onCopyLink(roomId)
                }}
                title={
                  customRooms.copyLink ||
                  t?.rooms?.copyLinkTooltip ||
                  "Sao chép liên kết"
                }
                className="flex items-center justify-center text-cath-red-800 shrink-0 hover:scale-110 transition-all active:scale-95 cursor-pointer p-1.5 rounded-full hover:bg-red-50"
              >
                {isCopied ? (
                  <Check size={18} className="text-emerald-600" />
                ) : (
                  <Share size={18} />
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-auto flex justify-between items-center gap-3 sm:gap-4 flex-wrap">
            {/* Participants */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-[#EDC589]">
                <Users size={14} className="text-[#8B5A2B]" />
              </div>
              <span className="text-[13px] sm:text-[14px] font-medium text-black whitespace-nowrap">
                {maxParticipantsDisplay
                  ? `${currentCount}/${maxParticipantsDisplay} ${t.rooms?.people || "người"}`
                  : `${currentCount} ${t.rooms?.people || "người"}`}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-[#EDC589]">
                <Clock size={14} className="text-[#8B5A2B]" />
              </div>
              <div className="flex items-center text-[13px] sm:text-[14px] font-medium text-black whitespace-nowrap">
                <span>{durationText}</span>
              </div>
            </div>
          </div>
        </div>
      </Animated3DCard>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(roomId)
          setIsDeleteModalOpen(false)
        }}
        title={
          customRooms.deleteConfirmTitle ||
          customRooms.deleteConfirm ||
          "Xóa phòng?"
        }
        message={deleteConfirmMessage}
        cancelText={customRooms.cancel || t.cancel || "Hủy"}
        confirmText={isDeleting ? "..." : customRooms.delete || "Xóa"}
        confirmVariant="destructive"
      />
    </>
  )
}

export default CustomRoomCard
