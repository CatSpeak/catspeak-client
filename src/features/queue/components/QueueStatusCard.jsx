import React from "react"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const QueueStatusCard = ({
  statusText,
  isConnected,
  position,
  onCancel,
  roomType = "OneToOne",
}) => {
  const { t } = useLanguage()

  const isGroup = roomType === "Group"
  const emoji = isGroup ? "👥" : "😺"
  const subtitle = isGroup
    ? t.rooms?.queue?.findingGroup || "Looking for a study group…"
    : t.rooms.queue.findingMatch

  return (
    <div className="max-w-[400px] w-full rounded-xl overflow-hidden relative border border-[#C6C6C6] shadow-md bg-white">
      {/* Header / Loading State */}
      <div className="bg-[#990011]/[0.04] p-6 flex flex-col items-center gap-4">
        <div className="relative inline-flex items-center justify-center">
          <Loader2
            className="w-[72px] h-[72px] text-[#990011] opacity-80 animate-spin"
            strokeWidth={2}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[2rem] leading-none">{emoji}</div>
          </div>
        </div>

        <div className="text-center">
          <h6 className="text-xl font-bold mb-2 text-black">{statusText}</h6>
          <p className="text-sm text-[#7A7574]">{subtitle}</p>
        </div>
      </div>

      <div className="h-px w-full bg-[#C6C6C6]" />

      <div className="p-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-lg bg-gray-50 border border-[#C6C6C6] flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-500 mb-2">
              {t.rooms.queue.status}
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full shadow-sm ${isConnected ? "bg-green-500" : "bg-orange-500 animate-pulse"}`}
              />
              <span className="text-sm font-medium text-gray-900">
                {isConnected
                  ? t.rooms.queue.connected
                  : t.rooms.queue.connectingStatus}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-[#C6C6C6] flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-500 mb-2">
              {t.rooms.queue.position}
            </span>
            <div className="text-[1.25rem] font-bold text-[#990011] leading-none">
              {position > 0 ? `#${position}` : "--"}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <PillButton onClick={onCancel} className="h-10 w-full">
          {t.rooms.queue.cancelSearch}
        </PillButton>
      </div>
    </div>
  )
}

export default QueueStatusCard
