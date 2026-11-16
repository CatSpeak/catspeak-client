import React, { useState, useMemo, useEffect } from "react"
import { UserPlus, Settings2, Search, X, Hand, Users } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { canViewBannedList } from "@/features/video-call/utils/roomAccess"
import {
  useGetRoomCoHostQuery,
  useGetRoomStateQuery,
  useGetWaitingQueueQuery,
} from "@/store/api/roomsApi"
import {
  normalizeCoHost,
  hasCoHostPermission,
  CO_HOST_PERMISSIONS,
} from "@/features/co-host/constants"
import { normalizeWaitingQueue } from "./waiting/waitingUtils"

import ParticipantItem from "./ParticipantItem"

import AdvancedModerationActions from "./AdvancedModerationActions"
import InviteParticipantModal from "./InviteParticipantModal"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import Label from "@/shared/components/ui/Label"
import WaitingQueueTab from "./waiting/WaitingQueueTab"
import BannedListTab from "./settings/BannedListTab"
import RoomPoliciesTab from "./settings/RoomPoliciesTab"

const parseMetadata = (metadata) => {
  if (!metadata) return {}
  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

/**
 * Participant list panel.
 * Reads participants and local media state from VideoCallContext.
 * Features 4 tabs:
 * 1. Members (Participant list with search & bulk moderation actions)
 * 2. Waiting (Pre-join approval queue)
 * 3. Banned (Banned participant list & unban actions)
 * 4. Settings (Room policies, toggles & danger zone)
 */
const ParticipantList = ({ hideTitle, externalPending }) => {
  const { t } = useLanguage()
  const {
    participants,
    id: roomId,
    room,
    user,
    isHost: isHostFromContext,
  } = useVideoCallContext()

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("members")

  const pl = t.rooms.videoCall.participantList
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  // Co-host data & permissions
  const { data: coHostData } = useGetRoomCoHostQuery(roomId, {
    skip: !roomId,
  })
  const coHost = normalizeCoHost(coHostData)

  const canMuteAll =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.MUTE_ALL)
  const canToggleSelfUnmute =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE,
    )
  const canToggleSelfCamera =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA,
    )
  const canManageLock =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.LOCK_CLASS)
  const canEndLive =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.END_CLASS)
  const canManageStudentShare =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
    )
  const canManageMemberRecording =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING,
    )
  const canManageGame = isHost

  const canManagePolicies =
    isHost ||
    canMuteAll ||
    canToggleSelfUnmute ||
    canToggleSelfCamera ||
    canManageLock ||
    canEndLive ||
    canManageStudentShare ||
    canManageMemberRecording ||
    canManageGame

  // Room state for waiting queue / lock indicator
  const { data: roomState } = useGetRoomStateQuery(roomId, {
    skip: !roomId,
  })
  const roomStatePayload = roomState?.data ?? roomState
  const requireApproval = roomStatePayload?.settings?.requireApproval ?? false
  const isLocked = roomStatePayload?.settings?.roomLocked ?? false

  // Tab permissions
  const canViewWaiting =
    requireApproval &&
    (isHost ||
      hasCoHostPermission(
        coHost,
        user?.accountId,
        CO_HOST_PERMISSIONS.ADMIT_WAITING,
      ))

  const canViewBanned = canViewBannedList({
    isHost,
    coHost,
    accountId: user?.accountId,
  })

  const { data: waitingQueueData } = useGetWaitingQueueQuery(roomId, {
    skip: !roomId || !canViewWaiting,
  })
  const pendingCount =
    normalizeWaitingQueue(waitingQueueData)?.pendingCount ??
    normalizeWaitingQueue(waitingQueueData)?.pending?.length ??
    0

  // Fallback to "members" tab if current tab becomes unauthorized
  useEffect(() => {
    if (activeTab === "settings" && !canManagePolicies) {
      setActiveTab("members")
    }
    if (activeTab === "waiting" && !canViewWaiting) {
      setActiveTab("members")
    }
    if (activeTab === "banned" && !canViewBanned) {
      setActiveTab("members")
    }
  }, [activeTab, canManagePolicies, canViewWaiting, canViewBanned])

  // Participant list filtering & grouping
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants
    const q = searchQuery.toLowerCase().trim()
    return participants.filter((p) => {
      const name = (p.name || p.identity || "").toLowerCase()
      const meta = parseMetadata(p.metadata)
      const accountId = String(meta.accountId || "")
      return name.includes(q) || accountId.includes(q)
    })
  }, [participants, searchQuery])

  const raisedHandParticipants = useMemo(() => {
    return filteredParticipants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      return meta.handRaised === true
    })
  }, [filteredParticipants])

  const otherParticipants = useMemo(() => {
    return filteredParticipants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      return meta.handRaised !== true
    })
  }, [filteredParticipants])

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-[#3F3F3F] pl-4 pr-1 py-1 min-h-[56px] bg-white dark:bg-[#1A1A1A] shrink-0 gap-2">
        {canViewWaiting || canViewBanned || canManagePolicies ? (
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden flex-1 min-w-0"
            role="tablist"
            aria-label={pl.membersTab || pl.title}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "members"}
              onClick={() => setActiveTab("members")}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold transition-all ${
                activeTab === "members"
                  ? "bg-cath-red-700 text-white shadow-xs"
                  : "text-neutral-600 dark:text-[#AAAAAA] hover:bg-cath-red-700/[0.08] dark:hover:bg-cath-red-700/20 hover:text-cath-red-700 dark:hover:text-red-400"
              }`}
            >
              {pl.membersTab || pl.title} ({participants.length})
            </button>

            {canViewWaiting && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "waiting"}
                onClick={() => setActiveTab("waiting")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "waiting"
                    ? "bg-cath-red-700 text-white shadow-xs"
                    : "text-neutral-600 dark:text-[#AAAAAA] hover:bg-cath-red-700/[0.08] dark:hover:bg-cath-red-700/20 hover:text-cath-red-700 dark:hover:text-red-400"
                }`}
              >
                <span>{t?.rooms?.videoCall?.waitingQueue?.tab || "Chờ"}</span>
                {pendingCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "waiting"
                        ? "bg-white text-cath-red-700"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {canViewBanned && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "banned"}
                onClick={() => setActiveTab("banned")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold transition-all ${
                  activeTab === "banned"
                    ? "bg-cath-red-700 text-white shadow-xs"
                    : "text-neutral-600 dark:text-[#AAAAAA] hover:bg-cath-red-700/[0.08] dark:hover:bg-cath-red-700/20 hover:text-cath-red-700 dark:hover:text-red-400"
                }`}
              >
                {pl.bannedTabShort || "Bị cấm"}
              </button>
            )}

            {canManagePolicies && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "settings"
                    ? "bg-cath-red-700 text-white shadow-xs"
                    : "text-neutral-600 dark:text-[#AAAAAA] hover:bg-cath-red-700/[0.08] dark:hover:bg-cath-red-700/20 hover:text-cath-red-700 dark:hover:text-red-400"
                }`}
              >
                <Settings2 size={15} className="shrink-0" />
                <span>{pl.settingsTab || "Cài đặt"}</span>
                {isLocked && (
                  <span
                    className={`flex h-2 w-2 rounded-full shrink-0 ${
                      activeTab === "settings"
                        ? "bg-white"
                        : "bg-cath-red-700 dark:bg-red-500"
                    }`}
                  />
                )}
              </button>
            )}
          </div>
        ) : !hideTitle ? (
          <span className="text-base font-bold text-neutral-800 dark:text-white truncate flex-1">
            {pl.membersTab || pl.title} ({participants.length})
          </span>
        ) : (
          <div className="flex-1" />
        )}

        {/* Invite action button */}
        <div className="flex items-center shrink-0">
          <IconButton
            variant="ghost"
            onClick={() => setIsInviteModalOpen(true)}
            title={
              t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"
            }
            aria-label={
              t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"
            }
          >
            <UserPlus size={14} />
          </IconButton>
        </div>
      </div>

      {/* Tab 1: Members */}
      {activeTab === "members" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Integrated Search Input (when room has > 5 participants or active query) */}
          {(participants.length > 5 || searchQuery) && (
            <div className="px-2.5 pt-2 shrink-0">
              <div className="relative flex items-center">
                <Search
                  size={13}
                  className="absolute left-2.5 text-neutral-400 dark:text-[#AAAAAA] pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pl.searchPlaceholder || "Tìm theo tên..."}
                  className="w-full h-7.5 pl-8 pr-7 text-xs bg-neutral-100/90 hover:bg-neutral-100 focus:bg-white dark:bg-[#272727] dark:hover:bg-[#333333] dark:focus:bg-[#1A1A1A] border border-transparent focus:border-cath-red-700 dark:focus:border-red-500 rounded-lg outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-[#AAAAAA] text-neutral-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-neutral-400 hover:text-neutral-600 dark:text-[#AAAAAA] dark:hover:text-white p-0.5"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Thao tác nâng cao (Collapsible advanced actions toolbar & modals) */}
          <AdvancedModerationActions coHost={coHost} />

          {/* Participant list items */}
          <div className="flex-1 overflow-y-auto">
            {/* Empty search */}
            {filteredParticipants.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
                <Search
                  size={24}
                  className="text-neutral-300 dark:text-[#3F3F3F]"
                />
                <span className="text-xs text-neutral-500 dark:text-[#AAAAAA]">
                  {pl.noSearchResults || "Không tìm thấy thành viên nào."}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-cath-red-700 dark:text-red-400 font-medium hover:underline"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            )}

            {/* Section: Đang giơ tay */}
            {raisedHandParticipants.length > 0 && (
              <div>
                <Label as="div" className="px-4 pt-4 mb-1">
                  <span>
                    {pl.raisedHandsSection || "Đang giơ tay"} (
                    {raisedHandParticipants.length})
                  </span>
                </Label>

                <ul className="flex flex-col">
                  {raisedHandParticipants.map((participant) => (
                    <li key={participant.identity} className="w-full">
                      <ParticipantItem
                        participant={participant}
                        hostAccountId={room?.creatorId}
                        coHostAccountId={coHost?.coHostAccountId}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Section: Các thành viên khác */}
            {otherParticipants.length > 0 && (
              <div>
                {raisedHandParticipants.length > 0 && (
                  <Label as="div" className="px-4 pt-4 mb-1">
                    <span>
                      {pl.membersSection || "Thành viên trong phòng"} (
                      {otherParticipants.length})
                    </span>
                  </Label>
                )}
                <ul className="flex flex-col">
                  {otherParticipants.map((participant) => (
                    <li key={participant.identity} className="w-full">
                      <ParticipantItem
                        participant={participant}
                        hostAccountId={room?.creatorId}
                        coHostAccountId={coHost?.coHostAccountId}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty state: bạn là người duy nhất trong phòng */}
            {!searchQuery &&
              raisedHandParticipants.length === 0 &&
              otherParticipants.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-[#272727] text-neutral-400 dark:text-[#AAAAAA]">
                    <Users size={22} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                    {pl.emptyRoomTitle || "Chỉ có bạn trong phòng"}
                  </span>
                  <span className="text-[11px] leading-relaxed text-neutral-500 dark:text-[#AAAAAA]">
                    {pl.emptyRoomHint ||
                      "Mời thành viên tham gia để bắt đầu trò chuyện."}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-lg bg-cath-red-700 px-3 text-xs font-semibold text-white transition-all hover:bg-cath-red-800 active:scale-[0.98]"
                  >
                    <UserPlus size={14} aria-hidden="true" />
                    <span>
                      {t.rooms?.videoCall?.inviteParticipant ||
                        "Mời tham gia phòng"}
                    </span>
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Tab 2: Waiting Queue */}
      {canViewWaiting && activeTab === "waiting" && (
        <div className="flex-1 overflow-y-auto">
          <WaitingQueueTab roomId={roomId} externalPending={externalPending} />
        </div>
      )}

      {/* Tab 3: Banned List */}
      {canViewBanned && activeTab === "banned" && (
        <div className="flex-1 overflow-y-auto p-3">
          <BannedListTab />
        </div>
      )}

      {/* Tab 4: Settings & Policies */}
      {canManagePolicies && activeTab === "settings" && (
        <RoomPoliciesTab coHost={coHost} />
      )}

      {/* Invite Modal */}
      <InviteParticipantModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roomId={roomId}
      />
    </div>
  )
}

export default ParticipantList
