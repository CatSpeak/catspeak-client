import React from "react"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const NotificationDropdown = ({ onClose, isMobile }) => {
  const { t } = useLanguage()

  return (
    <div
      className={`flex flex-col bg-white p-4 ${
        isMobile
          ? "h-full"
          : "rounded-xl shadow-lg ring-1 ring-black ring-opacity-5"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}
        <h3 className="text-lg font-semibold text-gray-900">{t.header?.notifications || "Notifications"}</h3>
      </div>
      <div
        className={`flex flex-1 flex-col items-center justify-center text-center text-gray-500 ${
          isMobile ? "" : "h-64 flex-none"
        }`}
      >
        <p>{t.header?.noNewNotifications || "No new notifications"}</p>
      </div>
    </div>
  )
}

export default NotificationDropdown
