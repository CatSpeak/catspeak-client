import React, { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { UserPlus, Search, Mail, Send, CheckCircle2, UserCheck, Users } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { selectCurrentUser } from "@/store/slices/authSlice"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import { useInviteToClassMutation } from "@/store/api/coursesApi"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import { LoadingSpinner, EmptyState } from "@/shared/components/ui/indicators"
import FluentCard from "@/shared/components/ui/FluentCard"
import InvititeDropdown from "@/shared/components/ui/InvititeDropdown"

const ClassInviteFriendsTab = ({ classData, cd = {} }) => {
  const { t } = useLanguage()
  const currentUser = useSelector(selectCurrentUser)
  const currentAccountId =
    currentUser?.accountId ?? currentUser?.id ?? currentUser?.userId

  const classId = classData?.id || classData?.classId
  const existingMembers = useMemo(() => {
    const list = [
      classData?.students,
      classData?.members,
      classData?.enrollments,
    ].find(Array.isArray) || []
    return new Set(
      list.map((m) => String(m.id || m.accountId || m.studentId || m.userId)),
    )
  }, [classData])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccountIds, setSelectedAccountIds] = useState([])
  const [invitedMap, setInvitedMap] = useState({})

  const { data: friendsResponse, isLoading: isLoadingFriends } =
    useGetFriendsQuery(currentAccountId, { skip: !currentAccountId })

  const [inviteToClass, { isLoading: isInviting }] = useInviteToClassMutation()

  const friendsList = useMemo(() => {
    const raw = Array.isArray(friendsResponse)
      ? friendsResponse
      : friendsResponse?.data || []
    return raw.map((f) => {
      const friendObj = f.friend || f.user || f
      return {
        ...friendObj,
        friendshipId: f.friendshipId || f.id,
        accountId: friendObj.accountId || friendObj.id || friendObj.userId,
      }
    })
  }, [friendsResponse])

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friendsList
    const query = searchQuery.toLowerCase().trim()
    return friendsList.filter((f) => {
      const name = (f.name || f.nickname || f.username || "").toLowerCase()
      const email = (f.email || "").toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [friendsList, searchQuery])

  const handleInviteFriend = async (friend) => {
    const friendId = friend.accountId || friend.id
    if (!classId) return

    if (!friendId) {
      toast.error("Không tìm thấy thông tin tài khoản để gửi lời mời.")
      return
    }

    try {
      const res = await inviteToClass({
        classId,
        accountIds: [Number(friendId)],
      }).unwrap()

      const results = res?.data?.results || []
      const itemRes = results.find(
        (r) => Number(r.accountId) === Number(friendId),
      )
      const status = itemRes?.status || "invited"

      if (status === "invited") {
        setInvitedMap((prev) => ({ ...prev, [friendId]: true }))
        toast.success(
          t.courses?.inviteSuccess ||
            `Đã gửi lời mời đến ${
              friend.nickname || friend.username || friend.name || "bạn bè"
            }`,
        )
      } else if (status === "already_enrolled") {
        toast.error("Học viên này đã ghi danh vào lớp học.")
      } else if (status === "is_teacher") {
        toast.error("Đây là tài khoản của giảng viên lớp học.")
      } else if (status === "not_found") {
        toast.error("Không tìm thấy tài khoản học viên.")
      } else {
        setInvitedMap((prev) => ({ ...prev, [friendId]: true }))
        toast.success(
          t.courses?.inviteSuccess || "Đã gửi lời mời thành công",
        )
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          t.courses?.inviteError ||
          "Có lỗi xảy ra khi gửi lời mời.",
      )
      console.error(err)
    }
  }

  const handleInviteSelected = async (e) => {
    e?.preventDefault?.()
    if (!classId) return
    const idsToSend = (
      Array.isArray(selectedAccountIds)
        ? selectedAccountIds
        : [selectedAccountIds]
    )
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0)

    if (idsToSend.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người dùng để gửi lời mời.")
      return
    }

    try {
      const res = await inviteToClass({
        classId,
        accountIds: idsToSend,
      }).unwrap()

      const results = res?.data?.results || []
      const invitedCount = results.filter((r) => r.status === "invited").length
      const alreadyEnrolledCount = results.filter(
        (r) => r.status === "already_enrolled",
      ).length
      const notFoundCount = results.filter(
        (r) => r.status === "not_found",
      ).length
      const isTeacherCount = results.filter(
        (r) => r.status === "is_teacher",
      ).length

      const newInvited = {}
      results.forEach((r) => {
        if (r.status === "invited") {
          newInvited[r.accountId] = true
        }
      })
      setInvitedMap((prev) => ({ ...prev, ...newInvited }))
      setSelectedAccountIds([])

      if (invitedCount > 0) {
        if (
          alreadyEnrolledCount > 0 ||
          notFoundCount > 0 ||
          isTeacherCount > 0
        ) {
          const details = []
          if (alreadyEnrolledCount > 0)
            details.push(`${alreadyEnrolledCount} đã vào lớp`)
          if (notFoundCount > 0)
            details.push(`${notFoundCount} không tìm thấy`)
          if (isTeacherCount > 0)
            details.push(`${isTeacherCount} là giảng viên`)
          toast.success(
            `Đã gửi lời mời cho ${invitedCount} người (${details.join(", ")})`,
          )
        } else {
          toast.success(
            t.courses?.inviteSuccess || "Đã gửi lời mời thành công!",
          )
        }
      } else if (alreadyEnrolledCount > 0) {
        toast.error("Học viên đã chọn đều đã ghi danh vào lớp học.")
      } else if (isTeacherCount > 0) {
        toast.error("Không thể mời giảng viên của lớp.")
      } else {
        toast.error(res?.message || "Không thể gửi lời mời.")
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          t.courses?.inviteError ||
          "Có lỗi xảy ra khi gửi lời mời.",
      )
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ─── DIRECT INVITATION SECTION ─── */}
      <FluentCard className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <UserPlus size={18} className="text-[#990011]" />
              <span>
                {cd.inviteDirect ||
                  cd.inviteByEmail ||
                  "Mời học viên / người dùng"}
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {cd.inviteDirectDesc ||
                cd.inviteByEmailDesc ||
                "Tìm kiếm và gửi lời mời tham gia lớp học đến học viên hoặc người dùng."}
            </p>
          </div>

          <form
            onSubmit={handleInviteSelected}
            className="flex flex-col sm:flex-row gap-2 max-w-xl items-stretch sm:items-center"
          >
            <div className="flex-1">
              <InvititeDropdown
                mode="all"
                value={selectedAccountIds}
                onChange={(newValues) => setSelectedAccountIds(newValues)}
                disabled={isInviting}
                dropdownClassName="w-full min-w-[280px] shadow-xl rounded-2xl"
              />
            </div>
            <PillButton
              type="submit"
              variant="primary"
              startIcon={<Send size={15} />}
              loading={isInviting}
              disabled={isInviting || selectedAccountIds.length === 0}
              className="shrink-0"
            >
              {cd.sendInvite || "Gửi lời mời"}
              {selectedAccountIds.length > 0
                ? ` (${selectedAccountIds.length})`
                : ""}
            </PillButton>
          </form>
        </div>
      </FluentCard>

      {/* ─── FRIENDS LIST INVITATION SECTION ─── */}
      <FluentCard className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-[#990011]" />
                <span>{cd.inviteFriendsList || "Danh sách bạn bè"}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {cd.inviteFriendsListDesc || "Chọn từ danh sách bạn bè để mời tham gia lớp học."}
              </p>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={cd.searchFriends || "Tìm bạn bè..."}
              className="sm:w-[260px]"
            />
          </div>

          {isLoadingFriends ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredFriends.length === 0 ? (
            <EmptyState
              icon={Users}
              message={
                searchQuery
                  ? "Không tìm thấy bạn bè nào phù hợp."
                  : "Bạn chưa có bạn bè nào trong danh sách."
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFriends.map((friend) => {
                const friendId = friend.accountId || friend.id
                const isAlreadyInClass =
                  friendId != null && existingMembers.has(String(friendId))
                const isInvited = Boolean(invitedMap[friendId])
                const name =
                  friend.nickname || friend.username || friend.name || "Bạn bè"

                return (
                  <div
                    key={friendId || friend.email}
                    className="flex items-center justify-between gap-3 p-3.5 bg-gray-50/60 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        size={40}
                        src={friend.avatarImageUrl || friend.avatarUrl || friend.avatar}
                        name={name}
                        accountId={friendId}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-900 truncate">
                          {name}
                        </span>
                        {friend.email && (
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {friend.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAlreadyInClass ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                          <CheckCircle2 size={13} />
                          <span>{cd.alreadyJoined || "Đã vào lớp"}</span>
                        </span>
                      ) : isInvited ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                          <UserCheck size={13} />
                          <span>{cd.invited || "Đã mời"}</span>
                        </span>
                      ) : (
                        <PillButton
                          variant="secondary"
                          startIcon={<UserPlus size={14} />}
                          onClick={() => handleInviteFriend(friend)}
                          disabled={isInviting}
                          className="!h-8 !px-3 !text-xs"
                        >
                          {cd.invite || "Mời"}
                        </PillButton>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </FluentCard>
    </div>
  )
}

export default ClassInviteFriendsTab