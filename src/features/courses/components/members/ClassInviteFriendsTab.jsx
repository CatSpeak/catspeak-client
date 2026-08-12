import React, { useMemo, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import { useInviteToClassMutation } from "@/store/api/coursesApi"
import { PillButton } from "@/shared/components/ui/buttons"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { getSafeMediaUrl } from "../../utils/courseUtils"
import {
  UserPlus,
  CheckCircle2,
  Mail,
  Search,
  Users,
} from "lucide-react"
import toast from "react-hot-toast"

const getInitials = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "—"
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase()
}

const ClassInviteFriendsTab = ({ classData, cd = {} }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user: authUser } = useAuth()
  const { data: profileResponse } = useGetUserProfileQuery()
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = authUser?.accountId || profile?.accountId || profile?.id

  const [inviteToClass] = useInviteToClassMutation()

  const [searchQuery, setSearchQuery] = useState("")
  const [invitedIds, setInvitedIds] = useState(() => new Set())
  const [invitingIds, setInvitingIds] = useState(() => new Set())

  // Fetch friends of the current user
  const {
    data: friendsResponse,
    isLoading: isFriendsLoading,
    isFetching: isFriendsFetching,
  } = useGetFriendsQuery(currentUserId, {
    skip: !currentUserId,
  })

  // Collect all enrolled student/member IDs from classData to filter out
  const enrolledStudentIds = useMemo(() => {
    const candidates = [
      classData?.students,
      classData?.members,
      classData?.enrollments,
    ].find(Array.isArray) ?? []

    const ids = new Set()
    candidates.forEach((person) => {
      const id = person?.accountId ?? person?.id ?? person?.studentId ?? person?.userId
      if (id !== undefined && id !== null) {
        ids.add(String(id))
      }
    })

    const teacherId =
      classData?.teacherId ??
      classData?.instructorId ??
      classData?.teacher?.id ??
      classData?.teacher?.accountId
    if (teacherId != null) {
      ids.add(String(teacherId))
    }

    if (currentUserId) {
      ids.add(String(currentUserId))
    }

    return ids
  }, [classData, currentUserId])

  // Filter out friends who are already in the class
  const availableFriends = useMemo(() => {
    const rawFriends = Array.isArray(friendsResponse)
      ? friendsResponse
      : friendsResponse?.data || []

    return rawFriends.filter((friend) => {
      const friendId = friend?.accountId ?? friend?.id
      if (friendId === undefined || friendId === null) return false
      return !enrolledStudentIds.has(String(friendId))
    })
  }, [friendsResponse, enrolledStudentIds])

  // Filter by search keyword
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return availableFriends
    const query = searchQuery.toLowerCase().trim()
    return availableFriends.filter((friend) => {
      const name = (friend.username || friend.name || "").toLowerCase()
      const email = (friend.email || "").toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [availableFriends, searchQuery])

  const handleProfileNavigate = useCallback((personId) => {
    if (personId) {
      navigate(`/profile/${personId}`)
    }
  }, [navigate])

  const handleInviteFriend = useCallback(async (friend) => {
    const friendId = String(friend?.accountId ?? friend?.id ?? "")
    const email = (friend?.email || "").trim()
    const classId = classData?.id || classData?.classId

    if (!friendId || invitedIds.has(friendId) || invitingIds.has(friendId)) return

    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp học!")
      return
    }

    if (!email) {
      toast.error(cd.noEmailToInvite || "Bạn bè này chưa có email để nhận lời mời!")
      return
    }

    setInvitingIds((prev) => new Set(prev).add(friendId))

    try {
      await inviteToClass({ classId, emails: [email] }).unwrap()

      setInvitedIds((prev) => new Set(prev).add(friendId))
      const friendName = friend.username || friend.name || "bạn bè"
      const successMessage = cd.toastInviteSuccess
        ? cd.toastInviteSuccess.replace("{{name}}", friendName)
        : `Đã gửi lời mời tham gia lớp học cho ${friendName}!`
      toast.success(successMessage)
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.data?.title ||
        err?.message ||
        cd.toastInviteFailed ||
        "Không thể gửi lời mời. Vui lòng thử lại!"
      toast.error(errorMsg)
    } finally {
      setInvitingIds((prev) => {
        const next = new Set(prev)
        next.delete(friendId)
        return next
      })
    }
  }, [invitedIds, invitingIds, cd, classData, inviteToClass])

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-6">
      {/* ─── SECTION HEADER & SEARCH ─── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">
            {(cd.inviteFriends || "Mời bạn bè").toLocaleUpperCase()} ({availableFriends.length})
          </h3>
        </div>

        {availableFriends.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder={cd.searchFriends || "Tìm kiếm bạn bè..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#990011] focus:bg-white transition"
            />
          </div>
        )}
      </section>

      {/* ─── CONTENT AREA ─── */}
      {isFriendsLoading || (isFriendsFetching && !friendsResponse) ? (
        <div className="py-12 flex justify-center items-center">
          <LoadingSpinner className="h-6 w-6" />
        </div>
      ) : availableFriends.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <UserPlus size={24} />
          </div>
          <p className="text-sm font-bold text-gray-700">
            {cd.noFriendsToInvite || "Không có bạn bè nào để mời"}
          </p>
          <p className="text-xs text-gray-400 max-w-sm text-center">
            {cd.noFriendsToInviteDesc || "Tất cả bạn bè của bạn đã tham gia lớp học này hoặc bạn chưa có bạn bè trong danh sách."}
          </p>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Search size={24} className="text-gray-300" />
          <p className="text-xs font-bold text-gray-600">
            {cd.noFriendsFound || "Không tìm thấy bạn bè phù hợp"}
          </p>
          <p className="text-[11px] text-gray-400">
            {cd.noFriendsFoundDesc || "Vui lòng thử tìm kiếm với từ khóa khác."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {filteredFriends.map((friend, index) => {
            const id = friend.accountId || friend.id
            const name = friend.username || friend.name || "User"
            const avatar = getSafeMediaUrl(
              friend.avatarImageUrl ||
                friend.avatarUrl ||
                friend.avatar ||
                friend.virtualBackgroundUrl ||
                friend.meetingAvatarUrl,
            )
            const isInvited = invitedIds.has(String(id))
            const isInviting = invitingIds.has(String(id))

            return (
              <div
                key={id ?? `${name}-${index}`}
                className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1 flex-wrap sm:flex-nowrap"
              >
                {/* User Info */}
                <div
                  className={`flex items-center gap-3.5 min-w-0 ${id ? "cursor-pointer group" : ""}`}
                  onClick={() => handleProfileNavigate(id)}
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center shadow-xs overflow-hidden group-hover:ring-2 group-hover:ring-[#990011] transition">
                    {avatar ? (
                      <img className="w-full h-full object-cover" src={avatar} alt={name} />
                    ) : (
                      getInitials(name)
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 truncate group-hover:text-[#990011] transition">
                        {name}
                      </span>
                      {friend.roleName && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-gray-100 text-gray-700 border-gray-200">
                          {friend.roleName}
                        </span>
                      )}
                      {friend.level && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                          {friend.level}
                        </span>
                      )}
                    </div>

                    {friend.email && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-0.5">
                        <Mail size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{friend.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invite Action Button */}
                <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                  <PillButton
                    onClick={() => handleInviteFriend(friend)}
                    disabled={isInvited || isInviting}
                    loading={isInviting}
                    variant={isInvited ? "secondary" : "outline"}
                    startIcon={
                      isInvited ? (
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      ) : (
                        <UserPlus size={15} />
                      )
                    }
                    className="h-9"
                  >
                    {isInvited
                      ? (cd.invited || "Đã gửi lời mời")
                      : (cd.inviteToClass || "Mời tham gia vào lớp này")}
                  </PillButton>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ClassInviteFriendsTab
