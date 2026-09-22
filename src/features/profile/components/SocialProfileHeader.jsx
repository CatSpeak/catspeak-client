import React, { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import {
  Edit2,
  UserPlus,
  Check,
  BadgeCheck,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Quote,
  Globe,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import RequestButton from "@/shared/components/ui/buttons/RequestButton"
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../../../store/api/social/friendshipApi"
import { openWidget } from "@/store/slices/messageWidgetSlice"
import ProfileAvatarNCover from "@/shared/components/profile/ProfileAvatarNCover"

const SocialProfileHeader = ({
  profile = {},
  t = {},
  targetAccountId,
  isOwnProfile,
  onEditClick,
  friendsCount = 0,
  followersCount = 0,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isBioExpanded, setIsBioExpanded] = useState(false)

  const displayName = profile?.fullName || profile?.username || ""
  const username = profile?.username || ""
  const showHandle = Boolean(
    profile?.fullName &&
    profile?.username &&
    profile?.fullName.toLowerCase() !== profile?.username.toLowerCase()
  )

  const isTeacher = Boolean(
    profile?.isTeacher ||
    profile?.accountType === "Teacher"
  )
  const headline = profile?.headline || null
  const introduction = profile?.introduction || null
  const teachingMotto = profile?.teachingMotto || null
  const teacherSlug = profile?.teacherSlug || targetAccountId

  const parsedLanguages = useMemo(() => {
    if (!profile?.languagesTeach) return []
    try {
      if (typeof profile.languagesTeach === "string") {
        const parsed = JSON.parse(profile.languagesTeach)
        return Array.isArray(parsed) ? parsed : []
      }
      if (Array.isArray(profile.languagesTeach)) {
        return profile.languagesTeach
      }
    } catch {
      return profile.languagesTeach
        .split(",")
        .map((l) => ({ language: l.trim() }))
    }
    return []
  }, [profile?.languagesTeach])

  // API Hooks
  const { data: statusResponse } = useGetConnectionStatusQuery(
    targetAccountId,
    {
      skip: isOwnProfile || !targetAccountId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  )
  const status =
    statusResponse?.data !== undefined ? statusResponse.data : statusResponse

  const [followUser, { isLoading: isFollowingLoading }] =
    useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowingLoading }] =
    useUnfollowUserMutation()

  const isFollowLoading = isFollowingLoading || isUnfollowingLoading

  const handleFollowToggle = async () => {
    if (isFollowLoading) return
    const toastId = "follow-action"

    try {
      if (status?.isFollowing) {
        await unfollowUser(targetAccountId).unwrap()
        toast.success(t.profile?.social?.unfollowSuccess || "Đã hủy theo dõi", {
          id: toastId,
        })
      } else {
        await followUser(targetAccountId).unwrap()
        toast.success(t.profile?.social?.followSuccess || "Đã theo dõi", {
          id: toastId,
        })
      }
    } catch (error) {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      })
      console.error(error)
    }
  }

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick()
    } else {
      navigate("/setting/account")
    }
  }

  const handleSendMessage = () => {
    dispatch(openWidget())
  }

  const actions = (
    <>
      {isOwnProfile ? (
        <div className="flex items-center gap-2 w-full md:w-auto">
          <PillButton
            variant="outline"
            startIcon={<Edit2 className="w-4 h-4" />}
            onClick={handleEdit}
            className="max-[425px]:flex-1"
          >
            {t.profile?.personalInfo?.edit || "Chỉnh sửa trang cá nhân"}
          </PillButton>

          {isTeacher && (
            <Link to={`/explore/teachers/${encodeURIComponent(teacherSlug)}`}>
              <PillButton
                variant="secondary"
                startIcon={<GraduationCap className="w-4 h-4" />}
                className="max-[425px]:flex-1"
              >
                {t.profile?.instructor?.viewPublicPage || "Trang giảng viên"}
              </PillButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full md:w-auto">
          <PillButton
            variant={status?.isFollowing ? "secondary" : "primary"}
            startIcon={status?.isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            loading={isFollowLoading}
            className={`max-[425px]:flex-1 ${
              isFollowLoading ? "cursor-not-allowed" : ""
            }`}
          >
            {status?.isFollowing
              ? t.profile?.social?.following || "Đang theo dõi"
              : t.profile?.social?.follow || "Theo dõi"}
          </PillButton>

          <RequestButton
            id={targetAccountId}
            relationship={status}
            t={t}
            className="max-[425px]:flex-1"
          />

          <PillButton
            variant="outline"
            startIcon={<MessageSquare className="w-4 h-4" />}
            onClick={handleSendMessage}
            className="max-[425px]:flex-1"
          >
            {t.profile?.social?.message || "Nhắn tin"}
          </PillButton>

          {isTeacher && (
            <Link to={`/explore/teachers/${encodeURIComponent(teacherSlug)}`}>
              <PillButton
                variant="ghost"
                startIcon={<ExternalLink className="w-4 h-4" />}
                title={t.profile?.instructor?.viewPublicPage || "Xem trang giảng viên công khai"}
                className="px-2.5"
              />
            </Link>
          )}
        </div>
      )}
    </>
  )

  const headerInfo = (
    <div className="flex flex-col gap-1.5">
      {/* Name and Badges */}
      <div className="flex items-center flex-wrap gap-2.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate max-w-full">
          {displayName}
        </h1>

        {/* Verified Teacher Badge */}
        {isTeacher && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-xs select-none"
            title={t.profile?.badges?.verifiedTeacher || "Giảng viên đã xác thực"}
          >
            <BadgeCheck className="w-4 h-4 text-blue-600 fill-blue-100 shrink-0" />
            <span>{t.profile?.badges?.teacher || "Giảng viên"}</span>
          </div>
        )}
      </div>

      {/* Handle & Headline */}
      <div className="flex flex-col gap-0.5">
        {showHandle && (
          <span className="text-xs font-medium text-gray-500">
            @{username}
          </span>
        )}
        {headline && (
          <p className="text-sm font-medium text-gray-600 line-clamp-2 max-w-2xl">
            {headline}
          </p>
        )}
      </div>

      {/* Stats & Location Meta */}
      <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mt-0.5">
        <span className="font-semibold text-gray-800">
          {friendsCount}{" "}
          <span className="font-normal text-gray-500 lowercase">
            {t.profile?.tabs?.friends || "bạn bè"}
          </span>
        </span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="font-semibold text-gray-800">
          {followersCount}{" "}
          <span className="font-normal text-gray-500 lowercase">
            {t.profile?.friends?.subTabs?.followers || "người theo dõi"}
          </span>
        </span>
        {profile?.address && (
          <>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {profile.address}
            </span>
          </>
        )}
      </div>
    </div>
  )

  const hasExtraContent = Boolean(
    teachingMotto ||
    introduction ||
    parsedLanguages.length > 0 ||
    (isOwnProfile && isTeacher && !introduction)
  )

  return (
    <ProfileAvatarNCover
      profile={profile}
      t={t}
      isOwnProfile={isOwnProfile}
      headerInfo={headerInfo}
      actions={actions}
    >
      {/* Extended Facebook-style Content: Bio, Motto, Language Chips */}
      {hasExtraContent && (
        <div className="flex flex-col gap-3">
          {/* Teaching Motto (Quote block) */}
          {teachingMotto && (
            <div className="flex items-start gap-2.5 text-sm italic text-gray-700 bg-amber-50/50 border-l-3 border-amber-400 px-3.5 py-2 rounded-r-lg max-w-3xl shadow-2xs">
              <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 rotate-180" />
              <span className="font-medium">“{teachingMotto}”</span>
            </div>
          )}

          {/* Self-Introduction (Bio block with read more) */}
          {introduction && (
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{t.profile?.sections?.aboutMe || "Giới thiệu bản thân"}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {isBioExpanded || introduction.length <= 220
                  ? introduction
                  : `${introduction.slice(0, 220)}...`}
              </p>
              {introduction.length > 220 && (
                <button
                  type="button"
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  className="mt-2 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {isBioExpanded ? (
                    <>
                      Thu gọn <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Xem thêm <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Teaching Languages Chips */}
          {parsedLanguages.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 pt-0.5">
              <span className="text-xs font-medium text-gray-500 inline-flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {t.profile?.instructor?.teachingLanguages || "Ngôn ngữ giảng dạy:"}
              </span>
              {parsedLanguages.map((lang, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {lang.language} {lang.level ? `(${lang.level})` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Add bio CTA for own teacher profile if missing */}
          {isOwnProfile && isTeacher && !introduction && (
            <Link
              to="/setting/instructor"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-primary/50 bg-gray-50/50 hover:bg-primary/5 transition-all text-xs font-medium text-gray-600 hover:text-primary max-w-md group"
            >
              <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              <span>Thêm lời giới thiệu bản thân vào hồ sơ giáo viên</span>
            </Link>
          )}
        </div>
      )}
    </ProfileAvatarNCover>
  )
}

export default SocialProfileHeader
