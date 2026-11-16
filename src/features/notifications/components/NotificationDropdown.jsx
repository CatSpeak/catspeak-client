import React from "react"
import { ArrowLeft, Bell } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getNotificationType } from "../config/notificationTypeConfig"

const NotificationDropdown = ({ onClose, isMobile, notifications, unreadCount, markAsRead, markAllAsRead }) => {
  const { t } = useLanguage()
  const { formatRelative } = useTimezone()

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
      className={`flex flex-col bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] ${isMobile
        ? "h-full"
        : "rounded-xl shadow-lg ring-1 ring-black ring-opacity-5"
        }`}
    >
      <div className="flex items-center gap-3 border-b border-border dark:border-[#3F3F3F] p-4">
        {isMobile && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#272727]"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-[#AAAAAA]" />
          </button>
        )}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
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
            className="text-xs font-medium text-blue-600 dark:text-[#FF0033] hover:text-blue-800 dark:hover:underline"
          >
            {t.header?.markAllRead || "Mark all as read"}
          </button>
        )}
      </div>

      <div className={`overflow-y-auto ${isMobile ? "flex-1" : "max-h-80"}`}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-gray-400 dark:text-[#AAAAAA]">
            <Bell size={32} strokeWidth={1} />
            <p className="text-sm">{t.header?.noNewNotifications || "No new notifications"}</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`cursor-pointer border-b border-gray-50 dark:border-[#3F3F3F] px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#272727] ${n.isRead ? "" : "bg-blue-50/50 dark:bg-[#272727]/60"
                  }`}
                onClick={() => handleClickItem(n)}
              >
                <div className="flex items-start gap-3">
                  {getIcon(n)}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${n.isRead ? "text-gray-600 dark:text-[#AAAAAA]" : "font-medium text-gray-900 dark:text-white"}`}>
                      {n?.resolvedTitle || t.header?.newNotificationTitle || "Thông báo mới"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-[#AAAAAA]">{n?.resolvedBody}</p>
                    <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                      {n.createdAt ? formatRelative(n.createdAt) : ""}
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
