import React from "react"
import { useNavigate } from "react-router-dom"
import { Bot, HardDrive, DoorOpen, Film, Layers, Users, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const FEATURE_CONFIG_MAP = {
  MAX_AI_MESSAGES: {
    icon: Bot,
    titleKey: "aiChat",
    defaultTitle: "AI Chat Assistant",
    actionTextKey: null,
    actionPath: null, // Bỏ navigate "Hỏi AI Ngay"
    gradient: "from-blue-500 to-indigo-600",
  },
  MAX_RECORDING_STORAGE_MB: {
    icon: HardDrive,
    titleKey: "storage",
    defaultTitle: "Dung Lượng Bản Ghi",
    actionTextKey: "actionManageRecordings",
    defaultActionText: "Quản Lý Bản Ghi",
    actionPath: "/workspace/recordings",
    gradient: "from-purple-500 to-pink-600",
  },
  MAX_ACTIVE_CUSTOM_ROOMS: {
    icon: DoorOpen,
    titleKey: "customRooms",
    defaultTitle: "Phòng Custom Hoạt Động",
    actionTextKey: "actionCreateRoom",
    defaultActionText: "Tạo Phòng Mới",
    actionPath: "/workspace/rooms",
    gradient: "from-amber-500 to-orange-600",
  },
  MAX_CUSTOM_ROOMS: {
    icon: DoorOpen,
    titleKey: "customRooms",
    defaultTitle: "Phòng Custom Hoạt Động",
    actionTextKey: "actionCreateRoom",
    defaultActionText: "Tạo Phòng Mới",
    actionPath: "/workspace/rooms",
    gradient: "from-amber-500 to-orange-600",
  },
  MAX_REELS_UPLOAD: {
    icon: Film,
    titleKey: "reels",
    defaultTitle: "Tải Lên Reels (Mỗi Tháng)",
    actionTextKey: "actionUploadReel",
    defaultActionText: "Đăng Reel Mới",
    actionPath: "/workspace/reels",
    gradient: "from-emerald-500 to-teal-600",
  },
  MAX_ACTIVE_STORIES: {
    icon: Layers,
    titleKey: "stories",
    defaultTitle: "Active Stories",
    actionTextKey: "actionViewLetters",
    defaultActionText: "Xem Thư",
    actionPathGetter: (lang) => `/${lang || "vi"}/cat-speak/letters`,
    gradient: "from-rose-500 to-red-600",
  },
  MAX_PARTICIPANTS_IN_CUSTOM_ROOMS: {
    icon: Users,
    titleKey: "maxParticipants",
    defaultTitle: "Sức Chứa Phòng Custom",
    actionTextKey: null,
    actionPath: null,
    isCapacityOnly: true,
    gradient: "from-cyan-500 to-blue-600",
  },
  MAX_PARTICIPANTS: {
    icon: Users,
    titleKey: "maxParticipants",
    defaultTitle: "Sức Chứa Phòng Custom",
    actionTextKey: null,
    actionPath: null,
    isCapacityOnly: true,
    gradient: "from-cyan-500 to-blue-600",
  },
}

const UsageQuotaCard = ({ feature }) => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const quotasT = t?.planUsage?.quotas || {}

  if (!feature) return null

  const { featureCode, featureName, limitValue, usedValue, remainingValue, isExceeded, unit } = feature
  const codeKey = featureCode?.toUpperCase()

  const config = FEATURE_CONFIG_MAP[codeKey] || {
    icon: Layers,
    titleKey: null,
    defaultTitle: featureName || featureCode,
    actionTextKey: null,
    defaultActionText: "Xem Chi Tiết",
    actionPath: null,
    gradient: "from-gray-600 to-gray-800",
  }

  const IconComponent = config.icon
  const displayTitle = (config.titleKey && quotasT[config.titleKey]) || featureName || config.defaultTitle
  const actionPath = config.actionPathGetter ? config.actionPathGetter(language) : config.actionPath
  const actionText = (config.actionTextKey && quotasT[config.actionTextKey]) || config.defaultActionText

  const isCapacityOnly = config.isCapacityOnly || usedValue === "N/A"

  // Calculate percentage
  let percentage = 0
  const limitNum = parseFloat(limitValue) || 0
  const usedNum = parseFloat(usedValue) || 0

  if (limitNum > 0 && !isCapacityOnly) {
    percentage = Math.min(100, Math.round((usedNum / limitNum) * 100))
  }

  // Color Coding Status
  let statusColor = "bg-emerald-500"
  let textColor = "text-emerald-600"
  let borderColor = "border-emerald-100"
  let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200"

  if (!isCapacityOnly) {
    if (isExceeded || percentage >= 90) {
      statusColor = "bg-rose-500"
      textColor = "text-rose-600"
      borderColor = "border-rose-200"
      badgeBg = "bg-rose-50 text-rose-700 border-rose-200"
    } else if (percentage >= 75) {
      statusColor = "bg-amber-500"
      textColor = "text-amber-600"
      borderColor = "border-amber-200"
      badgeBg = "bg-amber-50 text-amber-700 border-amber-200"
    }
  }

  return (
    <div className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${borderColor}`}>
      <div>
        {/* Header: Icon & Badge Status */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-md`}>
            <IconComponent className="w-6 h-6" />
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
            {!isCapacityOnly && (isExceeded || percentage >= 90) ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                {quotasT.statusWarning || "Gần Đạt Giới Hạn"}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {quotasT.statusNormal || "Bình Thường"}
              </>
            )}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-1">{displayTitle}</h3>
        
        {/* Usage Stat Number / Capacity Display */}
        {isCapacityOnly ? (
          <div className="flex items-baseline gap-1.5 my-3">
            <span className="text-2xl font-extrabold text-gray-900">{limitValue || "100"}</span>
            <span className="text-gray-500 text-sm font-medium">{unit || "participants"}</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5 my-3">
            <span className="text-2xl font-extrabold text-gray-900">{usedValue}</span>
            <span className="text-gray-400 text-sm font-medium">/ {limitValue === "0" || !limitValue ? (quotasT.unlimited || "Không giới hạn") : `${limitValue} ${unit}`}</span>
          </div>
        )}

        {/* Progress Bar (Only for non-capacity quantifiable features) */}
        {!isCapacityOnly && limitNum > 0 && (
          <div className="space-y-1.5 mb-4">
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
              <span>{quotasT.used || "Đã dùng"}: {percentage}%</span>
              {remainingValue != null && (
                <span className={textColor}>{quotasT.remaining || "Còn lại"}: {remainingValue} {unit}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="w-full mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600 hover:text-cath-red-700 transition-colors group"
        >
          <span>{actionText}</span>
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cath-red-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </button>
      )}
    </div>
  )
}

export default UsageQuotaCard
