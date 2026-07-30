import React from "react"
import { ArrowLeft, Bell } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getNotificationType } from "../config/notificationTypeConfig"

const NotificationDropdown = ({ onClose, isMobile, notifications, unreadCount, markAsRead, markAllAsRead }) => {
  const { t } = useLanguage()

  const handleClickItem = async (n) => {
    if (!n.isRead) await markAsRead(n.id)
    if (n.resolvedUrl) window.location.href = n.resolvedUrl
  }

  const getIcon = (n) => {
    if (n.icon) return <n.icon className={`mt-0.5 h-4 w-4 shrink-0 ${n.isRead ? "text-gray-400" : n.color}`} />
    const cfg = getNotificationType(n.type)
    return cfg.icon
      ? <cfg.icon className={`mt-0.5 h-4 w-4 shrink-0 ${n.isRead ? "text-gray-400" : cfg.color}`} />
      : <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-blue-500"}`} />
  }

  return (
    <div
      className={`flex flex-col bg-white ${isMobile
        ? "h-full"
        : "rounded-xl shadow-lg ring-1 ring-black ring-opacity-5"
        }`}
    >
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        {isMobile && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {t.header?.notifications || "Notifications"}
        </h3>
        {unreadCount > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            {unreadCount}
          </span>
        )}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            {t.header?.markAllRead || "Mark all as read"}
          </button>
        )}
      </div>

      <div className={`overflow-y-auto ${isMobile ? "flex-1" : "max-h-80"}`}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-gray-400">
            <Bell size={32} strokeWidth={1} />
            <p className="text-sm">{t.header?.noNewNotifications || "No new notifications"}</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`cursor-pointer border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50 ${n.isRead ? "" : "bg-blue-50/50"
                  }`}
                onClick={() => handleClickItem(n)}
              >
                <div className="flex items-start gap-3">
                  {getIcon(n)}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${n.isRead ? "text-gray-600" : "font-medium text-gray-900"}`}>
                      {n?.resolvedTitle || t.header?.newNotificationTitle || "Thông báo mới"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n?.resolvedBody}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown
