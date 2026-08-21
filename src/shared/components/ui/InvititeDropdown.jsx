import React, { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { Check } from "lucide-react"
import Dropdown from "./Dropdown"
import Avatar from "./Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { selectCurrentUser } from "@/store/slices/authSlice"
import {
  useGetFriendsQuery,
  useGetFriendRecommendationsQuery,
} from "@/store/api/social/friendshipApi"

const isUserTeacher = (u) => {
  if (!u) return false
  return (
    u.isTeacher === true ||
    u.isTeacher === 1 ||
    u.isTeacher === "true" ||
    u.roleName === "Expert" ||
    u.role === "Expert" ||
    (typeof u.level === "string" && u.level.trim().toLowerCase() === "expert")
  )
}

/**
 * InvititeDropdown component inheriting props and styling from Dropdown.
 * Supports mode: "friends" | "teachers" | "all" (default = "all").
 */
const InvititeDropdown = ({
  mode = "all", // "friends" | "teachers" | "teacher" | "all"
  selectionMode = "multiple", // "multiple" | "single"
  dropdownMode: customDropdownMode,
  value,
  onChange,
  currentAccountId: customAccountId,
  placeholder,
  searchPlaceholder,
  renderOption,
  dropdownClassName = "w-full min-w-full shadow-xl rounded-2xl",
  className = "w-full",
  maxHeightClass = "max-h-[280px]",
  ...restProps
}) => {
  const { t } = useLanguage()
  const currentUser = useSelector(selectCurrentUser)
  const [searchKeyword, setSearchKeyword] = useState("")

  const isInviteMode = ["friends", "teachers", "teacher", "all"].includes(mode)
  const activeMode = isInviteMode ? mode : "all"
  const dropdownMode =
    customDropdownMode ||
    (mode === "single" || mode === "multiple" ? mode : selectionMode)

  const effectiveAccountId =
    customAccountId ??
    currentUser?.accountId ??
    currentUser?.id ??
    currentUser?.userId

  const isRecMode =
    activeMode === "all" ||
    activeMode === "teachers" ||
    activeMode === "teacher"

  // 1. Friends Query (for mode="friends")
  const { data: friendsResponse, isLoading: isFriendsLoading } =
    useGetFriendsQuery(effectiveAccountId, {
      skip: !effectiveAccountId || activeMode !== "friends",
    })

  // 2. Recommendations Query (for mode="all" or "teachers", pageSize = 5 for all, 20 for teachers to filter)
  const {
    data: recResponse,
    isLoading: isRecLoading,
    isFetching: isRecFetching,
  } = useGetFriendRecommendationsQuery(
    {
      SearchKeyword: searchKeyword ? searchKeyword.trim() : undefined,
      Page: 1,
      PageSize: activeMode === "all" ? 5 : 20,
    },
    { skip: !isRecMode },
  )

  // Normalize friends data
  const friendsList = useMemo(() => {
    if (activeMode !== "friends" || !friendsResponse) return []
    const list = Array.isArray(friendsResponse)
      ? friendsResponse
      : Array.isArray(friendsResponse.data)
        ? friendsResponse.data
        : []

    return list.map((item) => {
      const userObj = item.friend || item.user || item
      const rawId =
        userObj.accountId ??
        userObj.id ??
        userObj.userId ??
        item.accountId ??
        item.id
      const accountId = rawId != null ? Number(rawId) : undefined
      return {
        ...userObj,
        accountId,
        username: userObj.username || userObj.name || userObj.nickname,
        email: userObj.email,
        avatarImageUrl:
          userObj.avatarImageUrl ||
          userObj.avatarUrl ||
          userObj.meetingAvatarUrl,
      }
    })
  }, [friendsResponse, activeMode])

  // Normalize recommendations data
  const recommendationsList = useMemo(() => {
    if (!isRecMode || !recResponse) return []
    const raw = Array.isArray(recResponse.data)
      ? recResponse.data
      : Array.isArray(recResponse)
        ? recResponse
        : []

    const list =
      activeMode === "teachers" || activeMode === "teacher"
        ? raw.filter(isUserTeacher).slice(0, 5)
        : raw.slice(0, 5)

    return list.map((item) => {
      const userObj = item.user || item.friend || item
      const rawId =
        userObj.accountId ??
        userObj.id ??
        userObj.userId ??
        item.accountId ??
        item.id
      const accountId = rawId != null ? Number(rawId) : undefined
      return {
        ...userObj,
        accountId,
        username: userObj.username || userObj.name || userObj.nickname,
        email: userObj.email,
        avatarImageUrl:
          userObj.avatarImageUrl ||
          userObj.avatarUrl ||
          userObj.meetingAvatarUrl,
      }
    })
  }, [recResponse, activeMode, isRecMode])

  const teacherLabel =
    t?.inviteDropdown.teacherBadge ||
    t?.profile?.friends?.teacher ||
    "Giảng viên"

  // Build Dropdown options
  const dropdownOptions = useMemo(() => {
    const sourceList =
      activeMode === "friends" ? friendsList : recommendationsList

    return sourceList
      .filter((user) => user && user.accountId != null)
      .map((user) => {
        const isTeacher = isUserTeacher(user)
        const accountId = Number(user.accountId)
        const displayName =
          user.username ||
          user.name ||
          (user.email ? user.email.split("@")[0] : `User #${accountId}`)
        const email = user.email || ""

        return {
          value: accountId,
          label: displayName,
          subtitle: email || (isTeacher ? teacherLabel : ""),
          searchTerms: `${displayName} ${email} ${user.roleName || ""} ${accountId}`,
          user: { ...user, accountId },
          friend: { ...user, accountId }, // compatibility with older code expecting friend object
        }
      })
  }, [activeMode, friendsList, recommendationsList, teacherLabel])

  // Normalize value prop to numbers if applicable
  const normalizedValue = useMemo(() => {
    if (value === undefined || value === null) return value
    if (Array.isArray(value)) {
      return value
        .map((v) =>
          typeof v === "object"
            ? Number(v?.accountId ?? v?.id ?? v?.value)
            : Number(v),
        )
        .filter((v) => !isNaN(v))
    }
    return typeof value === "object"
      ? Number(value?.accountId ?? value?.id ?? value?.value)
      : isNaN(Number(value))
        ? value
        : Number(value)
  }, [value])

  const isLoading =
    activeMode === "friends" ? isFriendsLoading : isRecLoading || isRecFetching

  // Default placeholders
  const resolvedPlaceholder = useMemo(() => {
    if (placeholder) return placeholder
    if (isLoading)
      return (
        t?.inviteDropdown.loading ||
        t?.common?.loading ||
        t?.loading ||
        "Đang tải..."
      )
    if (dropdownOptions.length === 0) {
      if (activeMode === "friends")
        return (
          t?.inviteDropdown.noFriendsAvailable ||
          "Không có bạn bè nào sẵn sàng để chọn"
        )
      if (activeMode === "teachers" || activeMode === "teacher")
        return (
          t?.inviteDropdown.noTeachersAvailable ||
          "Không có giảng viên nào sẵn sàng để chọn"
        )
      return (
        t?.inviteDropdown.noUsersAvailable ||
        "Không có người dùng nào sẵn sàng để chọn"
      )
    }
    if (activeMode === "friends")
      return t?.inviteDropdown.selectFriends || "Chọn bạn bè..."
    if (activeMode === "teachers" || activeMode === "teacher")
      return t?.inviteDropdown.selectTeachers || "Chọn giảng viên..."
    return t?.inviteDropdown.selectUsers || "Chọn người dùng..."
  }, [placeholder, isLoading, dropdownOptions.length, activeMode, t])

  const resolvedSearchPlaceholder = useMemo(() => {
    if (searchPlaceholder) return searchPlaceholder
    if (activeMode === "teachers" || activeMode === "teacher")
      return (
        t?.inviteDropdown.searchTeachers ||
        "Tìm kiếm giảng viên theo tên hoặc email..."
      )
    if (activeMode === "friends")
      return (
        t?.inviteDropdown.searchFriends ||
        "Tìm kiếm bạn bè theo tên hoặc email..."
      )
    return t?.inviteDropdown.searchUsers || "Tìm kiếm theo tên hoặc email..."
  }, [searchPlaceholder, activeMode, t])

  // Default render option for rich user display
  const defaultRenderOption = (option, isSelected) => {
    const user = option.user || option.friend || {}
    const isTeacher = isUserTeacher(user)
    const isMultiple = dropdownMode === "multiple"

    return (
      <div
        className={`w-full px-3 py-2 flex items-center justify-between transition-colors rounded-xl text-left text-sm hover:bg-neutral-100 ${
          isSelected ? "bg-neutral-50" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
          <Avatar
            src={user.avatarImageUrl || user.avatarUrl || user.meetingAvatarUrl}
            name={user.username || user.name || option.label}
            size={32}
            clickable={false}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">
                {user.username || user.name || option.label || "User"}
              </span>
              {isTeacher && (
                <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {teacherLabel}
                </span>
              )}
            </div>
            {user.email && (
              <span className="text-xs text-gray-500 truncate">
                {user.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center ml-2 shrink-0">
          {isMultiple ? (
            <div
              className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                isSelected
                  ? "bg-[#990011] border-[#990011] text-white"
                  : "border-gray-300 bg-white group-hover:border-gray-400"
              }`}
            >
              {isSelected && <Check size={12} strokeWidth={3} />}
            </div>
          ) : (
            isSelected && <Check size={16} className="text-[#990011]" />
          )}
        </div>
      </div>
    )
  }

  return (
    <Dropdown
      mode={dropdownMode}
      options={dropdownOptions}
      value={normalizedValue}
      onChange={onChange}
      enableSearch={true}
      handleSearch={isRecMode ? (query) => setSearchKeyword(query) : undefined}
      loading={isLoading}
      placeholder={resolvedPlaceholder}
      searchPlaceholder={resolvedSearchPlaceholder}
      disabled={isLoading || restProps.disabled}
      className={className}
      dropdownClassName={dropdownClassName}
      maxHeightClass={maxHeightClass}
      renderOption={renderOption || defaultRenderOption}
      {...restProps}
    />
  )
}

export { InvititeDropdown, InvititeDropdown as InviteDropdown }
export default InvititeDropdown
