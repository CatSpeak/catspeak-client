import React, { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Sun, Moon, SunMoon } from "lucide-react"
import Switch from "@/shared/components/ui/inputs/Switch"
import SegmentedControl from "@/shared/components/ui/inputs/SegmentedControl"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTheme } from "@/shared/context/ThemeContext"
import { VietNam, China, UK, Japan } from "@/shared/assets/icons/flags"
import { useAuth } from "@/features/auth"
import { useTabAnimation } from "@/shared/hooks/useTabAnimation"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
import {
  getTimezoneOptions,
  getBrowserTimeZone,
} from "@/shared/constants/timezones"
import { userApi, useGetUserProfileQuery } from "@/store/api/userApi"
import { useProfileState } from "@/features/settings/hooks/useProfileState"
import { useProfileMutations } from "@/features/settings/hooks/useProfileMutations"
import AccountCredentialsForm from "@/features/settings/components/AccountCredentialsForm"
import ChangePasswordSection from "@/features/settings/components/ChangePasswordSection"
import { setCredentials } from "@/store/slices/authSlice"
import {
  resolveCoreApiBase,
  unsubscribeEmailNotifications,
} from "@/features/settings/utils/unsubscribeApi"
import { toast } from "react-hot-toast"

const LANGUAGES = [
  { key: "vi", fallbackLabel: "Tiếng Việt", flag: VietNam },
  { key: "zh", fallbackLabel: "中文", flag: China },
  { key: "en", fallbackLabel: "English", flag: UK },
  { key: "ja", fallbackLabel: "日本語", flag: Japan },
]

const SystemSettingsPage = () => {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const timezoneOptions = useMemo(
    () => getTimezoneOptions(language),
    [language],
  )
  const languageOptions = useMemo(
    () =>
      LANGUAGES.map((l) => ({
        value: l.key,
        label: t.header?.languages?.[l.key] || l.fallbackLabel,
        icon: (
          <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border">
            <img
              src={l.flag}
              alt=""
              className="block h-full w-full object-cover"
              draggable={false}
            />
          </span>
        ),
      })),
    [t],
  )
  const themeOptions = useMemo(
    () => [
      {
        value: "light",
        label: t.nav?.themeLight || "Sáng",
        icon: Sun,
        iconClassName: "text-amber-500",
      },
      {
        value: "dark",
        label: t.nav?.themeDark || "Tối",
        icon: Moon,
        iconClassName: "text-amber-400",
      },
      {
        value: "system",
        label: t.nav?.themeSystem || "Hệ thống",
        icon: SunMoon,
        iconClassName: "text-slate-500 dark:text-neutral-400",
      },
    ],
    [t],
  )
  const {
    receiveSystemMsgs,
    setReceiveSystemMsgs,
    joinLeaveSound,
    setJoinLeaveSound,
  } = useGlobalVideoCall()
  const gt = t?.rooms?.videoCall?.general || {}
  const { animationsEnabled: tabAnimationsEnabled, setTabAnimationPreference } =
    useTabAnimation()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const user = useSelector((state) => state.auth?.user)
  const token = useSelector((state) => state.auth?.token)
  const dispatch = useDispatch()
  const [updateUserProfile] = userApi.useUpdateUserProfileMutation()

  // Credentials (username, nickname) moved from /setting/account.
  const { data: privateProfileData } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const profile = privateProfileData?.data ?? privateProfileData ?? null
  const stateHooks = useProfileState(profile)
  const mutationHooks = useProfileMutations(t, profile, stateHooks)

  const {
    formData,
    editingField,
    errors,
    handleEdit,
    handleCancel,
    handleChange,
  } = stateHooks

  const { isUpdating, handleSave } = mutationHooks

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

  const unsubHandledRef = useRef(null)

  useEffect(() => {
    // Handle ?unsubscribe=true URL query parameter from email footer
    const unsub = searchParams.get("unsubscribe") === "true"
    const emailParam = (searchParams.get("email") || "").trim()
    const hmacToken = (searchParams.get("token") || "").trim()

    if (!unsub) return

    if (!emailParam) {
      toast.error("Liên kết hủy nhận email thiếu địa chỉ email.")
      return
    }

    const requestKey = `${emailParam}::${hmacToken}`
    if (unsubHandledRef.current === requestKey) return
    unsubHandledRef.current = requestKey

    const authToken = token || localStorage.getItem("token") || ""
    unsubscribeEmailNotifications({
      email: emailParam,
      token: hmacToken,
      authToken,
    })
      .then(() => {
        setEmailNotifyEnabled(false)
        try {
          localStorage.setItem("catspeak_email_notification_enabled", "false")
        } catch {
          /* ignore storage error */
        }
        toast.success(
          "Bạn đã hủy nhận email thông báo & tin tức từ CatSpeak thành công.",
        )
      })
      .catch((err) => {
        console.error("Unsubscribe API error:", err)
        toast.error(
          err?.message ||
            "Không thể hủy nhận email thông báo. Vui lòng thử lại hoặc tắt trực tiếp trong cài đặt.",
        )
      })
  }, [searchParams, token])

  const handleToggleEmailNotification = (checked) => {
    setEmailNotifyEnabled(checked)
    try {
      localStorage.setItem(
        "catspeak_email_notification_enabled",
        JSON.stringify(checked),
      )
    } catch {
      /* ignore storage error */
    }

    const apiUrl = resolveCoreApiBase()
    const authToken = token || localStorage.getItem("token")
    if (authToken) {
      fetch(`${apiUrl}/user-profile/email-notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ isEmailNotificationEnabled: checked }),
      }).catch((err) =>
        console.error("Update email notification preference error:", err),
      )
    }
  }

  const handleTimeZoneChange = async (newTz) => {
    if (!newTz || newTz === selectedTz) return
    setSelectedTz(newTz)
    setSavingTz(true)
    try {
      const updatedProfile = await updateUserProfile({
        timeZone: newTz,
      }).unwrap()
      // Sync Redux state so every useTimezone() consumer re-renders immediately
      const payload = updatedProfile?.data ?? updatedProfile
      if (payload && user) {
        dispatch(
          setCredentials({
            user: { ...user, ...payload, timeZone: newTz },
            token,
          }),
        )
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
    <div className="p-4 pb-24 max-w-7xl mx-auto">
      <PageTitle className="mb-4">
        {t.nav?.systemConfig || "Thiết lập hệ thống"}
      </PageTitle>

      {isAuthenticated ? (
        <div className="flex flex-col gap-4 w-full mb-4">
          <AccountCredentialsForm
            formData={formData}
            editingField={editingField}
            isUpdating={isUpdating}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            onChange={handleChange}
            errors={errors}
            t={t}
          />

          <ChangePasswordSection t={t} />
        </div>
      ) : null}

      <div>
        {isAuthenticated && (
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            {t.nav?.otherSettings || "Khác"}
          </h2>
        )}

        <div className="flex flex-col gap-2">
          {/* Language Preference */}
          <FluentCard>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-base font-medium block text-gray-900 dark:text-white">
                  {t.header?.language || "Ngôn ngữ"}
                </label>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {t.nav?.languageDesc ||
                    "Chọn ngôn ngữ hiển thị giao diện cho CatSpeak."}
                </p>
              </div>

              <div className="w-full sm:w-auto">
                <Dropdown
                  options={languageOptions}
                  value={language}
                  onChange={setLanguage}
                  placeholder={t.header?.language || "Chọn ngôn ngữ"}
                />
              </div>
            </div>
          </FluentCard>

          {/* Theme Preference (Light / Dark / System) */}
          <FluentCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-base font-medium block text-gray-900 dark:text-white">
                  {t.nav?.themeTitle || "Giao diện (Theme)"}
                </label>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {t.nav?.themeDesc ||
                    "Tùy chỉnh giao diện Sáng, Tối hoặc tự động theo cài đặt Hệ thống của thiết bị."}
                </p>
              </div>

              <SegmentedControl
                value={theme}
                onChange={setTheme}
                options={themeOptions}
                aria-label={t.nav?.themeTitle || "Giao diện (Theme)"}
                className="self-start sm:self-auto"
              />
            </div>
          </FluentCard>

          {/* Tab Switch Animation Preference */}
          <FluentCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-base font-medium block text-gray-900 dark:text-white">
                  {t.nav?.tabAnimationTitle || "Hiệu ứng chuyển tab"}
                </label>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {t.nav?.tabAnimationDesc ||
                    "Bật hoặc tắt hiệu ứng trượt chuyển động khi chuyển đổi qua lại giữa các tab."}
                </p>
              </div>

              <Switch
                checked={tabAnimationsEnabled}
                onChange={(e) => setTabAnimationPreference(e.target.checked)}
                colorClass="peer-checked:bg-[#8f0d15] dark:peer-checked:bg-red-600"
                showLabel={true}
              />
            </div>
          </FluentCard>

          {/* Room System Messages Preference */}
          <FluentCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-base font-medium block text-gray-900 dark:text-white">
                  {gt.receiveSystemMsgs || "Nhận thông báo tin nhắn hệ thống"}
                </label>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {gt.receiveSystemMsgsDesc ||
                    "Hiển thị các thông báo tự động từ hệ thống trong khi cuộc họp đang diễn ra."}
                </p>
              </div>

              <Switch
                checked={receiveSystemMsgs}
                onChange={(e) => setReceiveSystemMsgs(e.target.checked)}
                colorClass="peer-checked:bg-[#8f0d15] dark:peer-checked:bg-red-600"
                showLabel={true}
              />
            </div>
          </FluentCard>

          {/* Room Join / Leave Sound Alert Preference */}
          <FluentCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-base font-medium block text-gray-900 dark:text-white">
                  {gt.joinLeaveSound || "Âm thanh khi người dùng vào / ra phòng"}
                </label>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {gt.joinLeaveSoundDesc ||
                    "Phát chuông thông báo âm thanh khi có thành viên mới vào hoặc rời khỏi cuộc họp."}
                </p>
              </div>

              <Switch
                checked={joinLeaveSound === true}
                onChange={(e) => setJoinLeaveSound(e.target.checked)}
                colorClass="peer-checked:bg-[#8f0d15] dark:peer-checked:bg-red-600"
                showLabel={true}
              />
            </div>
          </FluentCard>

          <FluentCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-base font-medium block text-gray-900 dark:text-white">
                  {t.nav?.emailNotifyTitle ||
                    "Nhận email thông báo & tin tức từ CatSpeak"}
                </label>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {t.nav?.emailNotifyDesc ||
                    "Cho phép hệ thống gửi các cập nhật quan trọng, tính năng mới và thông báo tài khoản qua email."}
                </p>
              </div>

              <Switch
                checked={emailNotifyEnabled}
                onChange={(e) =>
                  handleToggleEmailNotification(e.target.checked)
                }
                colorClass="peer-checked:bg-[#8f0d15] dark:peer-checked:bg-red-600"
                showLabel={true}
              />
            </div>
          </FluentCard>

          {/* Time Zone Preference */}
          {isAuthenticated && (
            <FluentCard>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-base font-medium block text-gray-900 dark:text-white">
                    {t.nav?.timezoneTitle || "Múi giờ"}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    {t.nav?.timezoneDesc ||
                      "Điều chỉnh lịch hẹn, lịch sử trò chuyện và thống kê theo múi giờ của bạn."}
                  </p>
                </div>

                <div className="w-full sm:w-auto">
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
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemSettingsPage
