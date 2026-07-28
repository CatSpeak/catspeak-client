import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import Switch from "@/shared/components/ui/inputs/Switch"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
import { toast } from "react-hot-toast"

const SystemSettingsPage = () => {
  const { t } = useLanguage()
  const { receiveSystemMsgs, setReceiveSystemMsgs } = useGlobalVideoCall()
  const [searchParams] = useSearchParams()

  const [emailNotifyEnabled, setEmailNotifyEnabled] = useState(() => {
    const saved = localStorage.getItem("catspeak_email_notification_enabled")
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    // Handle ?unsubscribe=true URL query parameter from email footer
    const unsub = searchParams.get("unsubscribe") === "true"
    const emailParam = searchParams.get("email")

    if (unsub) {
      setEmailNotifyEnabled(false)
      localStorage.setItem("catspeak_email_notification_enabled", "false")

      if (emailParam) {
        const apiUrl = import.meta.env.VITE_API_URL || "https://stagingapi.catspeak.com.vn/api"
        fetch(`${apiUrl}/auth/unsubscribe?email=${encodeURIComponent(emailParam)}`, { method: "POST" })
          .catch((err) => console.error("Unsubscribe API error:", err))
      }

      toast.success("Bạn đã hủy nhận email thông báo & tin tức từ CatSpeak thành công.")
    }
  }, [searchParams])

  const handleToggleEmailNotification = (checked) => {
    setEmailNotifyEnabled(checked)
    localStorage.setItem("catspeak_email_notification_enabled", JSON.stringify(checked))

    const apiUrl = import.meta.env.VITE_API_URL || "https://stagingapi.catspeak.com.vn/api"
    const token = localStorage.getItem("token")
    if (token) {
      fetch(`${apiUrl}/user-profile/email-notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isEmailNotificationEnabled: checked })
      }).catch((err) => console.error("Update email notification preference error:", err))
    }

    if (checked) {
      toast.success("Đã bật nhận email thông báo & tin tức từ CatSpeak.")
    } else {
      toast.success("Đã tắt nhận email thông báo từ CatSpeak.")
    }
  }

  return (
    <div>
      <PageTitle>
        {t.nav?.systemConfig || "Thiết lập hệ thống"}
      </PageTitle>

      <div className="space-y-4">
        <FluentCard>
          <div className="flex items-center justify-between gap-5">
            <label className="text-sm font-medium">
              {t.rooms?.chatBox?.showSystemMessages ||
                "Show Cat Speak suggestion messages"}
            </label>

            <Switch
              checked={receiveSystemMsgs}
              onChange={(e) => setReceiveSystemMsgs(e.target.checked)}
              colorClass="peer-checked:bg-green-500"
              showLabel={true}
            />
          </div>
        </FluentCard>

        <FluentCard>
          <div className="flex items-center justify-between gap-5">
            <div>
              <label className="text-sm font-medium block">
                {t.nav?.emailNotifyTitle || "Nhận email thông báo & tin tức từ CatSpeak"}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {t.nav?.emailNotifyDesc || "Cho phép hệ thống gửi các cập nhật quan trọng, tính năng mới và thông báo tài khoản qua email."}
              </p>
            </div>

            <Switch
              checked={emailNotifyEnabled}
              onChange={(e) => handleToggleEmailNotification(e.target.checked)}
              colorClass="peer-checked:bg-[#8f0d15]"
              showLabel={true}
            />
          </div>
        </FluentCard>
      </div>
    </div>
  )
}

export default SystemSettingsPage
