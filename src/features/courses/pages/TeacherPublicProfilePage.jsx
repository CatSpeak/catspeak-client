import React, { useState } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
  ChevronRight,
  ShieldCheck,
  MapPin,
  Globe,
  MessageSquare,
  UserPlus,
  Check,
  Star,
  Trophy,
  BookOpen,
  ArrowRight,
  Sparkles,
  Flag,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetExploreTeacherDetailQuery } from "@/store/api/exploreTeachersApi"
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/api/social/friendshipApi"
import { openWidget } from "@/store/slices/messageWidgetSlice"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import TeacherOpenClassCard from "../components/TeacherOpenClassCard"
import TeacherClassesModal from "../components/TeacherClassesModal"
import TeacherReviewsModal from "../components/TeacherReviewsModal"
import TeacherReportModal from "../components/TeacherReportModal"
import {
  getTeacherInitials,
  getTeacherHeadline,
  formatRating,
  formatTeacherNumber,
} from "../utils/teacherUtils"
import { getCountryLabel } from "@/shared/constants/countriesOptions"

const TeacherPublicProfilePage = () => {
  const { slugOrId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { user: authUser, isAuthenticated } = useAuth()

  // ─── Fetch Teacher Details Query ───
  const {
    data: teacher,
    isLoading,
    isError,
    refetch,
  } = useGetExploreTeacherDetailQuery(slugOrId, {
    skip: !slugOrId,
  })

  const teacherAccountId = teacher?.accountId

  // ─── Connection / Follow Status ───
  const isOwnProfile =
    isAuthenticated &&
    (authUser?.accountId === teacherAccountId ||
      authUser?.id === teacherAccountId)

  const { data: statusResponse } = useGetConnectionStatusQuery(
    teacherAccountId,
    {
      skip: !isAuthenticated || !teacherAccountId || isOwnProfile,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  )
  const connectionStatus =
    statusResponse?.data !== undefined ? statusResponse.data : statusResponse
  const isFollowing = connectionStatus?.isFollowing || false

  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowLoading }] =
    useUnfollowUserMutation()
  const isFollowActionPending = isFollowLoading || isUnfollowLoading

  // Unfollow Confirmation Modal State (BR-EX-GV-12)
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false)
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false)
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  // ─── Action Handlers ───
  const handleReportClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } })
      return
    }
    setIsReportModalOpen(true)
  }

  const handleMessageClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } })
      return
    }
    dispatch(openWidget())
  }

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } })
      return
    }
    if (isOwnProfile || !teacherAccountId || isFollowActionPending) return

    if (isFollowing) {
      // Show confirmation dialog before unfollowing (BR-EX-GV-12)
      setIsUnfollowModalOpen(true)
    } else {
      try {
        await followUser(teacherAccountId).unwrap()
        toast.success(t.courses?.followSuccess || "Đã theo dõi giảng viên")
      } catch (err) {
        toast.error(
          t.courses?.errorOccurred || "Không thể thực hiện hành động này"
        )
      }
    }
  }

  const handleConfirmUnfollow = async () => {
    if (!teacherAccountId || isFollowActionPending) return
    try {
      await unfollowUser(teacherAccountId).unwrap()
      setIsUnfollowModalOpen(false)
      toast.success(t.courses?.unfollowSuccess || "Đã hủy theo dõi")
    } catch (err) {
      toast.error(t.courses?.errorOccurred || "Không thể hủy theo dõi")
    }
  }

  // ─── Render Loading State ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-pulse">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
          <div className="h-48 bg-white rounded-2xl border border-slate-200" />
          <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    )
  }

  // ─── Render Error / Not Found State ───
  if (isError || !teacher) {
    return (
      <div className="min-h-[70vh] bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            {t.courses?.teacherNotFound || "Không tìm thấy giảng viên"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t.courses?.teacherNotFoundDesc ||
              "Giảng viên bạn đang tìm kiếm không tồn tại hoặc đã ngừng hoạt động."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Thử lại
            </button>
            <Link
              to="/explore-courses"
              className="px-5 py-2 rounded-xl bg-[#990011] text-white text-xs font-bold hover:bg-[#80000e] transition-colors"
            >
              {t.courses?.backToExplore || "Khám phá khóa học"}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Teacher fields
  const fullName = teacher.fullName || "Giảng viên"
  const initials = getTeacherInitials(fullName)
  const headline = getTeacherHeadline(
    teacher,
    t.courses?.defaultTeacherHeadline || "Giảng viên chuyên môn"
  )
  const ratingValue = formatRating(teacher.rating)
  const reviewCount = teacher.reviewCount || 0
  const studentCount = teacher.studentCount || 0
  const activeClassCount = teacher.activeClassCount || 0
  const courseCount = teacher.courseCount || activeClassCount || 0
  const yearsExp = Number(
    teacher.yearsOfExperience ??
      (Array.isArray(teacher.experience) && teacher.experience.length > 0
        ? teacher.experience.length
        : 0)
  )
  const activeClasses = teacher.activeClasses || []
  const totalOpenClasses = teacher.totalOpenClasses || activeClasses.length
  const featuredReviews = teacher.featuredReviews || []
  const starDistribution = teacher.starDistribution || {}

  // Star distribution calculation
  const totalReviewsCount = reviewCount || 1

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16">
      {/* ─── Breadcrumbs ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 select-none">
          <Link
            to="/"
            className="hover:text-slate-900 transition-colors"
          >
            {t.courses?.home || "Trang chủ"}
          </Link>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <Link
            to="/explore-courses"
            className="hover:text-slate-900 transition-colors"
          >
            {t.courses?.exploreCourses || "Khám phá khóa học"}
          </Link>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <span className="font-bold text-[#990011] truncate">{fullName}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
        {/* ─── Header Card: Cover + Avatar + Bio + Follow/Chat Buttons + Stats ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Cover Gradient */}
          <div className="relative h-48 sm:h-60 bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 flex items-start justify-end p-4 sm:p-6 overflow-hidden">
            {/* Subtle decorative glow */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#990011]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Specialty tag on cover */}
            <div className="relative z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold select-none shadow-xs">
              <Sparkles size={13} className="text-amber-300" />
              <span>{headline}</span>
            </div>
          </div>

          {/* Profile Overview & Stats Body */}
          <div className="relative px-6 sm:px-8 pb-6">
            {/* Profile Avatar + Identity + Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
              {/* Avatar + Info */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {/* Avatar (112x112 on desktop, 96x96 on mobile) */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 -mt-12 sm:-mt-14 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md shrink-0 flex items-center justify-center select-none z-10">
                  {teacher.avatarUrl && !avatarError ? (
                    <img
                      src={teacher.avatarUrl}
                      alt={fullName}
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#990011] to-[#66000B] text-white font-black text-2xl sm:text-3xl flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name, Headline, Verified Badge Pill, Location */}
                <div className="flex flex-col gap-1.5 pt-2 sm:pt-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {fullName}
                    </h1>

                    {/* Verified Badge Pill (BR-EX-GV-02) */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold select-none">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>
                        {t.courses?.verifiedBadge ||
                          "Giảng viên được xác minh bởi Cat Speak"}
                      </span>
                    </div>
                  </div>

                  {/* Subtitle / Email */}
                  <div className="text-xs sm:text-sm font-medium text-slate-600">
                    {headline}
                    {teacher.email && (
                      <span className="text-slate-400"> · {teacher.email}</span>
                    )}
                  </div>

                  {/* Meta items: Location & Highlight Certs */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      <span>
                        {teacher.address ||
                          getCountryLabel(
                            teacher.country || teacher.nationality,
                            "Việt Nam",
                          )}
                      </span>
                    </div>

                    <span className="text-slate-300">•</span>

                    <div className="flex items-center gap-1">
                      <Globe size={13} className="text-slate-400" />
                      <span>
                        {teacher.headline || "TESOL Certified · IELTS"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Message & Follow */}
              {!isOwnProfile && (
                <div className="flex items-center gap-3 pt-2 lg:pt-0">
                  {/* Message Button */}
                  <button
                    type="button"
                    onClick={handleMessageClick}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border-2 border-[#990011] text-[#990011] hover:bg-[#990011]/5 transition-colors font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98]"
                  >
                    <MessageSquare size={16} />
                    <span>{t.courses?.sendMessage || "Nhắn tin"}</span>
                  </button>

                  {/* Follow / Following Button */}
                  <button
                    type="button"
                    onClick={handleFollowClick}
                    disabled={isFollowActionPending}
                    className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-[0.98] ${
                      isFollowing
                        ? "bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "bg-[#990011] text-white hover:bg-[#80000e]"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={16} className="text-emerald-600 stroke-[2.5]" />
                        <span>{t.courses?.following || "Đang theo dõi"}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>{t.courses?.follow || "Theo dõi"}</span>
                      </>
                    )}
                  </button>

                  {/* Report Button */}
                  <button
                    type="button"
                    onClick={handleReportClick}
                    title="Báo cáo giảng viên"
                    aria-label="Báo cáo giảng viên"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#990011] hover:border-red-200 hover:bg-red-50/50 transition-colors font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                  >
                    <Flag size={16} />
                    <span className="hidden sm:inline">Báo cáo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Stats Row (3 Columns: Rating, Experience, Courses) */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 pt-5">
              {/* Rating */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-4 text-center">
                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-slate-900">
                  <Star
                    size={20}
                    className="text-amber-400 fill-amber-400 shrink-0"
                  />
                  <span>{ratingValue}</span>
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 truncate">
                  {t.courses?.ratingLabel || "Đánh giá"} (
                  {formatTeacherNumber(reviewCount)} nhận xét)
                </div>
              </div>

              {/* Experience */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-4 text-center">
                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-slate-900">
                  <Trophy
                    size={20}
                    className="text-amber-500 shrink-0"
                  />
                  <span>{yearsExp} Năm KN</span>
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 truncate">
                  {t.courses?.teachingExp || "Kinh nghiệm giảng dạy"}
                </div>
              </div>

              {/* Open Classes / Courses */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-4 text-center">
                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-slate-900">
                  <BookOpen
                    size={20}
                    className="text-blue-600 shrink-0"
                  />
                  <span>{courseCount}</span>
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 truncate">
                  {t.courses?.openedCourses || "Khóa học đã mở"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bio Card ("Giới thiệu bản thân") ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
            <h2 className="text-lg font-extrabold text-slate-900">
              {t.courses?.aboutMe || "Giới thiệu bản thân"}
            </h2>
          </div>

          {/* Bio text */}
          <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
            {teacher.introduction ||
              teacher.bio ||
              "Giảng viên chưa cập nhật thông tin giới thiệu chi tiết."}
          </div>

          {/* Footer of Bio Card: Update date & Link to Competency */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {t.courses?.lastUpdated?.replace("{{time}}", "2 ngày trước") ||
                "Cập nhật lần cuối: Gần đây"}
            </span>

            <Link
              to={`/explore/teachers/${encodeURIComponent(slugOrId)}/competency`}
              className="font-bold text-[#990011] hover:text-[#80000e] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>
                {t.courses?.viewCompetencyProfile || "Xem thêm hồ sơ năng lực"}
              </span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* ─── Open Classes Section ("Lớp học đang mở") ─── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
              <h2 className="text-lg font-extrabold text-slate-900">
                {t.courses?.openClasses || "Lớp học đang mở"}
              </h2>
            </div>

            {totalOpenClasses > 0 && (
              <button
                type="button"
                onClick={() => setIsClassesModalOpen(true)}
                className="text-xs sm:text-sm font-bold text-[#990011] hover:text-[#80000e] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {t.courses?.viewAllClassesCount?.replace(
                    "{{count}}",
                    totalOpenClasses
                  ) || `Xem tất cả (${totalOpenClasses} lớp)`}
                </span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Classes List (Max 3) */}
          {activeClasses.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {activeClasses.slice(0, 3).map((cls) => (
                <TeacherOpenClassCard key={cls.classId} classItem={cls} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-sm text-slate-500">
              {t.courses?.noClassesOpen ||
                "Hiện tại giảng viên chưa có lớp học nào đang mở."}
            </div>
          )}
        </div>

        {/* ─── Student Reviews Section ("Đánh giá từ học viên") ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
            <h2 className="text-lg font-extrabold text-slate-900">
              {t.courses?.studentReviews || "Đánh giá từ học viên"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Overall Rating & Star Distribution (5 Columns) */}
            <div className="md:col-span-5 flex flex-col gap-4">
              {/* Score & Stars */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">
                  {ratingValue}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-0.5">
                    {t.courses?.basedOnReviews?.replace(
                      "{{count}}",
                      formatTeacherNumber(reviewCount)
                    ) || `Dựa trên ${reviewCount} nhận xét`}
                  </span>
                </div>
              </div>

              {/* 5-Star Distribution Bars */}
              <div className="flex flex-col gap-2 pt-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = starDistribution[star] || 0
                  const pct =
                    totalReviewsCount > 0
                      ? Math.round((count / totalReviewsCount) * 100)
                      : 0
                  return (
                    <div
                      key={star}
                      className="flex items-center gap-2 text-xs text-slate-600 font-semibold"
                    >
                      <span className="w-10 shrink-0">{star} sao</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#FBBF24] rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-slate-400 font-medium shrink-0">
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Featured Reviews (7 Columns) */}
            <div className="md:col-span-7 flex flex-col gap-4 md:border-l md:border-slate-100 md:pl-8">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t.courses?.featuredReviews || "NHẬN XÉT TIÊU BIỂU"}
              </span>

              {featuredReviews.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {featuredReviews.slice(0, 2).map((rev) => {
                    const revDate = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : ""
                    return (
                      <div
                        key={rev.reviewId}
                        className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {rev.studentName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {revDate}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={
                                s <= Math.round(rev.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>

                        {/* Comment text */}
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{rev.comment}"
                        </p>

                        {/* Class link */}
                        {rev.className && (
                          <div className="pt-1">
                            <Link
                              to={`/explore-courses/class/${rev.classId}`}
                              className="text-[11px] font-bold text-[#990011] hover:underline"
                            >
                              Lớp: {rev.className}
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  {t.courses?.noReviewsYet ||
                    "Chưa có nhận xét nào từ học viên."}
                </div>
              )}

              {/* View all reviews button */}
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#990011] text-[#990011] hover:bg-[#990011]/5 transition-colors text-xs sm:text-sm font-bold text-center cursor-pointer active:scale-[0.99]"
              >
                {t.courses?.viewAllReviews || "Xem tất cả nhận xét"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── All Open Classes Modal (Ticket 08) ─── */}
      <TeacherClassesModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
        slugOrId={slugOrId}
        teacherName={fullName}
        initialClasses={activeClasses}
      />

      {/* ─── All Student Reviews Modal (Ticket 08) ─── */}
      <TeacherReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        slugOrId={slugOrId}
        teacherName={fullName}
        initialRating={teacher.rating}
        initialReviewCount={teacher.reviewCount}
        initialStarDistribution={teacher.starDistribution}
      />

      {/* ─── Unfollow Confirmation Modal (BR-EX-GV-12) ─── */}
      <ConfirmationModal
        open={isUnfollowModalOpen}
        onClose={() => setIsUnfollowModalOpen(false)}
        onConfirm={handleConfirmUnfollow}
        title={t.courses?.unfollowConfirmTitle || "Bỏ theo dõi giảng viên"}
        message={
          t.courses?.unfollowConfirmMessage?.replace("{{name}}", fullName) ||
          `Bạn có chắc chắn muốn bỏ theo dõi giảng viên ${fullName}?`
        }
        cancelText={t.courses?.cancel || "Hủy"}
        confirmText={t.courses?.unfollow || "Bỏ theo dõi"}
        confirmVariant="destructive"
        isPending={isFollowActionPending}
      />

      {/* ─── Teacher Report Modal ─── */}
      <TeacherReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        teacherAccountId={teacherAccountId}
        teacherName={fullName}
      />
    </div>
  )
}

export default TeacherPublicProfilePage
