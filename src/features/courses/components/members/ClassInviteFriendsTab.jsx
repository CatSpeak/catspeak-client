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
  const [emailInput, setEmailInput] = useState("")
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
    const email = friend.email
    const friendId = friend.accountId || friend.id
    if (!classId) return

    if (!email) {
      toast.error(
        t.courses?.inviteNoEmail ||
          "Không tìm thấy email của bạn bè này để gửi lời mời.",
      )
      return
    }

    try {
      await inviteToClass({
        classId,
        emails: [email],
      }).unwrap()

      setInvitedMap((prev) => ({ ...prev, [friendId]: true }))
      toast.success(
        t.courses?.inviteSuccess || `Đã gửi lời mời đến ${friend.nickname || friend.username || email}`,
      )
    } catch (err) {
      toast.error(t.courses?.inviteError || "Có lỗi xảy ra khi gửi lời mời.")
      console.error(err)
    }
  }

  const handleInviteByEmail = async (e) => {
    e?.preventDefault?.()
    const trimmed = emailInput.trim()
    if (!trimmed || !classId) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.")
      return
    }

    try {
      await inviteToClass({
        classId,
        emails: [trimmed],
      }).unwrap()

      setEmailInput("")
      toast.success(t.courses?.inviteSuccess || `Đã gửi lời mời đến ${trimmed}`)
    } catch (err) {
      toast.error(t.courses?.inviteError || "Có lỗi xảy ra khi gửi lời mời.")
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ─── EMAIL INVITATION SECTION ─── */}
      <FluentCard className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Mail size={18} className="text-[#990011]" />
              <span>{cd.inviteByEmail || "Mời bằng địa chỉ Email"}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {cd.inviteByEmailDesc ||
                "Gửi lời mời trực tiếp đến học viên hoặc người quen qua email."}
            </p>
          </div>

          <form onSubmit={handleInviteByEmail} className="flex gap-2 max-w-xl">
            <input
              type="email"
              placeholder="example@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#990011] focus:ring-1 focus:ring-[#990011] outline-none transition"
            />
            <PillButton
              type="submit"
              variant="primary"
              startIcon={<Send size={15} />}
              loading={isInviting}
              disabled={isInviting || !emailInput.trim()}
            >
              {cd.sendInvite || "Gửi lời mời"}
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