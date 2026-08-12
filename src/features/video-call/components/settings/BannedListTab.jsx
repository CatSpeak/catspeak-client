import React from "react"
import { ShieldCheck, UserCheck } from "lucide-react"
import { toast } from "react-hot-toast"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import {
  useGetBannedParticipantsQuery,
  useUnbanParticipantMutation,
} from "@/store/api/roomsApi"

const BannedListTab = () => {
  const { t } = useLanguage()
  const pl = t?.rooms?.videoCall?.participantList || {}
  const { room, user, id: roomId, isHost: isHostFromContext } = useVideoCallContext()
  const currentRoomId = room?.id || roomId
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  const { data: bannedData, isLoading: isBannedLoading } =
    useGetBannedParticipantsQuery(currentRoomId, { skip: !isHost || !currentRoomId })
  const [unbanParticipant, { isLoading: isUnbanning }] =
    useUnbanParticipantMutation()

  const bannedList = React.useMemo(() => {
    if (Array.isArray(bannedData)) return bannedData
    if (Array.isArray(bannedData?.data)) return bannedData.data
    if (Array.isArray(bannedData?.data?.data)) return bannedData.data.data
    return []
  }, [bannedData])

  const handleUnban = async (targetAccountId, name) => {
    if (!currentRoomId) return
    try {
      await unbanParticipant({ id: currentRoomId, targetAccountId }).unwrap()
      toast.success(
        `${pl.successUnban || "Đã gỡ cấm thành viên"} ${name ? `(${name})` : ""}`
      )
    } catch (err) {
      toast.error(err?.data?.message || "Không thể gỡ cấm. Vui lòng thử lại.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Subtitle description */}
      <p className="text-sm text-[#606060] px-1">
        {pl.bannedListDesc ||
          "Danh sách các thành viên đã bị Host mời ra khỏi phòng và cấm tham gia lại."}
      </p>

      {/* Loading state */}
      {isBannedLoading ? (
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8 text-center text-sm text-neutral-400">
          {t?.rooms?.waitingScreen?.loading || pl.loading || "Đang tải..."}
        </div>
      ) : bannedList.length === 0 ? (
        /* Clean Empty State */
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-neutral-800">
              {pl.noBannedMembersTitle || "Chưa có thành viên nào bị cấm"}
            </span>
            <span className="text-xs text-neutral-500 max-w-sm">
              {pl.noBannedMembersDesc || "Các thành viên bị Host mời ra khỏi phòng và cấm truy cập lại sẽ hiển thị tại đây."}
            </span>
          </div>
        </div>
      ) : (
        /* Banned Users List Card */
        <div className="bg-white rounded-xl border border-[#e5e5e5] divide-y divide-[#e5e5e5] overflow-hidden">
          {bannedList.map((item) => (
            <div
              key={item.accountId}
              className="flex items-center justify-between p-4 hover:bg-neutral-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={item.avatarImageUrl}
                  name={item.fullName || item.email}
                  size={40}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-neutral-900 truncate">
                    {item.fullName || item.email || `User #${item.accountId}`}
                  </span>
                  {item.email && (
                    <span className="text-xs text-neutral-500 truncate">
                      {item.email}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
                onClick={() =>
                  handleUnban(item.accountId, item.fullName || item.email)
                }
                disabled={isUnbanning}
              >
                <UserCheck size={14} />
                <span>{pl.unban || "Gỡ cấm"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BannedListTab
