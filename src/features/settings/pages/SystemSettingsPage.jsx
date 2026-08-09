import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import Switch from "@/shared/components/ui/inputs/Switch"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
import { getTimezoneOptions, getBrowserTimeZone } from "@/shared/constants/timezones"
import { userApi } from "@/store/api/userApi"
import { setCredentials } from "@/store/slices/authSlice"
import { toast } from "react-hot-toast"

const SystemSettingsPage = () => {
  const { t, language } = useLanguage()
  const timezoneOptions = useMemo(() => getTimezoneOptions(language), [language])
  const { receiveSystemMsgs, setReceiveSystemMsgs } = useGlobalVideoCall()
  const [searchParams] = useSearchParams()
  const user = useSelector((state) => state.auth?.user)
  const token = useSelector((state) => state.auth?.token)
  const dispatch = useDispatch()
  const [updateUserProfile] = userApi.useUpdateUserProfileMutation()

  const currentTz = user?.timeZone || getBrowserTimeZone()
  const [selectedTz, setSelectedTz] = useState(currentTz)
  const [savingTz, setSavingTz] = useState(false)

  useEffect(() => {
    if (currentTz) {
      setSelectedTz(currentTz)
    }
  }, [currentTz])

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
      toast.success(t.nav?.emailNotifyOn || "Đã bật nhận email thông báo & tin tức từ CatSpeak.")
    } else {
      toast.success(t.nav?.emailNotifyOff || "Đã tắt nhận email thông báo từ CatSpeak.")
    }
  }

  const handleTimeZoneChange = async (newTz) => {
    if (!newTz || newTz === selectedTz) return
    setSelectedTz(newTz)
    setSavingTz(true)
    try {
      const updatedProfile = await updateUserProfile({ timeZone: newTz }).unwrap()
      // Sync Redux state so every useTimezone() consumer re-renders immediately
      const payload = updatedProfile?.data ?? updatedProfile
      if (payload && user) {
        dispatch(setCredentials({
          user: { ...user, ...payload, timeZone: newTz },
          token,
        }))
      }
      toast.success(t.nav?.timezoneUpdated || "Đã cập nhật múi giờ.")
    } catch (err) {
      // Revert on failure
      setSelectedTz(currentTz)
      console.error("Update time zone error:", err)
      toast.error(t.nav?.timezoneUpdateFailed || "Cập nhật múi giờ thất bại.")
    } finally {
      setSavingTz(false)
    }
  }

  return (
    <div>
      <PageTitle>{t.nav?.systemConfig || "Thiết lập hệ thống"}</PageTitle>

      <div className="space-y-4 mt-3">
        <FluentCard>
          <div className="flex items-center justify-between gap-5">
            <label className="text-sm font-medium">
              {t.rooms?.chatBox?.showSystemMessages ||
                "Show Cat Speak suggestion messages"}
            </label>

            <Switch
              checked={receiveSystemMsgs}
              onChange={(e) => setReceiveSystemMsgs(e.target.checked)}
              colorClass="peer-checked:bg-[#8f0d15]"
              showLabel={true}
            />
          </div>
        </FluentCard>

        <FluentCard>
          <div className="flex items-center justify-between gap-5">
            <div>
              <label className="text-sm font-medium block">
                {t.nav?.emailNotifyTitle ||
                  "Nhận email thông báo & tin tức từ CatSpeak"}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {t.nav?.emailNotifyDesc ||
                  "Cho phép hệ thống gửi các cập nhật quan trọng, tính năng mới và thông báo tài khoản qua email."}
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

        <FluentCard>
          <div className="flex items-center justify-between gap-5">
            <div className="flex-1">
              <label className="text-sm font-medium block">
                {t.nav?.timezoneTitle || "Múi giờ"}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {t.nav?.timezoneDesc || "Điều chỉnh lịch hẹn, lịch sử trò chuyện và thống kê theo múi giờ của bạn."}
              </p>
            </div>

            <div className="w-80 max-w-full">
              <Dropdown
                options={timezoneOptions}
                value={selectedTz}
                onChange={handleTimeZoneChange}
                disabled={savingTz}
                placeholder={t.nav?.timezoneSelect || "Chọn múi giờ"}
              />
            </div>
          </div>
        </FluentCard>
      </div>
    </div>
  );
}

export default SystemSettingsPage
