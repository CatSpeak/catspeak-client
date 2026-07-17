import { memo } from "react"
import {
  X,
  Bell,
  BellOff,
  Search,
  Image,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react"
import {
  getConversationName,
  getOtherUser,
  getUserColor,
} from "../data/chatMockData"

/**
 * MemberRow — single member in the group members list.
 */
const MemberRow = memo(({ user, isCurrentUser }) => {
  const isOnline = user?.status === "online"
  const isAway = user?.status === "away"

  return (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-[#F8F8F8] rounded-lg transition-colors">
      <div className="relative shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ backgroundColor: getUserColor(user?.id || "") }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        {(isOnline || isAway) && (
          <div
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
              isOnline ? "bg-[#22C55E]" : "bg-[#F59E0B]"
            }`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1A1A1A] truncate">
          {user?.name}
          {isCurrentUser && (
            <span className="text-[#9CA0AB] font-normal"> (You)</span>
          )}
        </p>
        <p className="text-[11px] text-[#9CA0AB] truncate">{user?.about}</p>
      </div>
    </div>
  )
})
MemberRow.displayName = "MemberRow"

/**
 * ChatUserPanel — toggleable right-side info panel.
 *
 * Shows user info for direct chats or group details for group chats.
 * Includes members list, shared media placeholder, and quick actions.
 *
 * @param {object}   conversation - Active conversation
 * @param {object}   usersMap     - Users map
 * @param {object}   currentUser  - Current user
 * @param {function} onClose      - Close panel handler
 */
const ChatUserPanel = ({ conversation, usersMap, currentUser, onClose }) => {
  if (!conversation) return null

  const isGroup = conversation.type === "group"
  const otherUser = getOtherUser(conversation, usersMap)
  const name = getConversationName(conversation, usersMap)

  const memberCount = conversation.participants.length
  const isOnline = otherUser?.status === "online"

  // Status text
  const statusText = isGroup
    ? `${memberCount} members`
    : isOnline
      ? "Active now"
      : otherUser?.lastSeen
        ? `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "Offline"

  return (
    <div className="w-[340px] h-full flex flex-col border-l border-[#E5E5E5] bg-white shrink-0 overflow-hidden">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[64px] border-b border-[#E5E5E5] shrink-0">
        <h3 className="text-[14px] font-semibold text-[#1A1A1A]">
          {isGroup ? "Group Info" : "Profile"}
        </h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Content ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {/* Profile section */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4">
          {/* Large avatar */}
          {isGroup ? (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#990011] to-[#E7001A] flex items-center justify-center">
              <Users size={32} className="text-white" />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: getUserColor(otherUser?.id || "") }}
            >
              {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <h2 className="mt-3 text-[16px] font-semibold text-[#1A1A1A] text-center">
            {name}
          </h2>
          <p className="mt-0.5 text-[12px] text-[#9CA0AB] flex items-center gap-1.5">
            {!isGroup && isOnline && (
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
            )}
            {statusText}
          </p>

          {/* About */}
          {!isGroup && otherUser?.about && (
            <p className="mt-3 text-[13px] text-[#606060] text-center leading-relaxed">
              {otherUser.about}
            </p>
          )}
        </div>

        {/* ── Quick actions ──────────────────────── */}
        <div className="px-4 pb-4">
          <div className="bg-[#F8F8F8] rounded-xl overflow-hidden">
            <ActionRow
              icon={conversation.muted ? BellOff : Bell}
              label={conversation.muted ? "Unmute" : "Mute notifications"}
            />
            <ActionRow icon={Search} label="Search in conversation" />
          </div>
        </div>

        {/* ── Shared media ───────────────────────── */}
        <div className="px-4 pb-4">
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F8F8F8] hover:bg-[#F2F2F2] transition-colors">
            <div className="flex items-center gap-3">
              <Image size={18} className="text-[#606060]" />
              <span className="text-[13px] font-medium text-[#1A1A1A]">
                Shared media
              </span>
            </div>
            <ChevronRight size={16} className="text-[#9CA0AB]" />
          </button>
        </div>

        {/* ── Group members ──────────────────────── */}
        {isGroup && (
          <div className="px-4 pb-4">
            <h4 className="text-[12px] font-semibold text-[#9CA0AB] uppercase tracking-wide px-1 mb-2">
              Members · {memberCount}
            </h4>
            <div className="space-y-0.5">
              {conversation.participants.map((pId) => {
                const user =
                  pId === "me"
                    ? { ...currentUser, id: "me" }
                    : usersMap[pId]
                return (
                  <MemberRow
                    key={pId}
                    user={user}
                    isCurrentUser={pId === "me"}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* ── Danger zone ────────────────────────── */}
        {isGroup && (
          <div className="px-4 pb-6">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#DC2626] hover:bg-red-50 transition-colors">
              <LogOut size={18} />
              <span className="text-[13px] font-medium">Leave group</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ActionRow — a quick-action row in the panel.
 */
const ActionRow = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#F2F2F2] transition-colors text-left">
    <Icon size={18} className="text-[#606060] shrink-0" />
    <span className="text-[13px] text-[#1A1A1A]">{label}</span>
  </button>
)

export default memo(ChatUserPanel)
