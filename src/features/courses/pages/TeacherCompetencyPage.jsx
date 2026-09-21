import React, { useState } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Star,
  Trophy,
  BookOpen,
  MessageSquare,
  UserPlus,
  Check,
  Award,
  GraduationCap,
  Briefcase,
  Lightbulb,
  MapPin,
  Calendar,
  Sparkles,
  Quote,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetExploreTeacherCompetencyQuery } from "@/store/api/exploreTeachersApi"
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/api/social/friendshipApi"
import { openWidget } from "@/store/slices/messageWidgetSlice"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import TeacherReviewsModal from "../components/TeacherReviewsModal"
import {
  getTeacherInitials,
  getTeacherHeadline,
  formatRating,
  formatTeacherNumber,
} from "../utils/teacherUtils"

/**
 * Trang Hồ sơ Năng lực Chuyên sâu của Giảng viên (EX-GV-03, Ticket 09)
 * Theo mockup: designs/explore-teacher/Hồ sơ năng lực - Giảng viên Nguyễn Bình.html
 */
const TeacherCompetencyPage = () => {
  const { slugOrId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { user: authUser, isAuthenticated } = useAuth()

  // ─── Query Hook: Competency Detail ───
  const {
    data: teacher,
    isLoading,
    isError,
    refetch,
  } = useGetExploreTeacherCompetencyQuery(slugOrId, {
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

  // Unfollow Modal & Reviews Modal States
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false)
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  // ─── Action Handlers ───
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

  // ─── Loading Skeleton ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-pulse">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-44 bg-white rounded-2xl border border-slate-200" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="h-48 bg-white rounded-2xl border border-slate-200" />
              <div className="h-56 bg-white rounded-2xl border border-slate-200" />
            </div>
            <div className="lg:col-span-4 h-96 bg-white rounded-2xl border border-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  // ─── Error / Not Found ───
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
              "Hồ sơ năng lực bạn đang tìm kiếm không tồn tại hoặc đã ngừng hoạt động."}
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
    t.courses?.defaultTeacherHeadline || "Giảng viên ngôn ngữ"
  )
  const ratingValue = formatRating(teacher.rating)
  const reviewCount = teacher.reviewCount || 0
  const studentCount = teacher.studentCount || 0
  const activeClassCount = teacher.activeClassCount || 0
  const teachingMotto = teacher.teachingMotto
  const introduction = teacher.introduction
  const certificates = teacher.certificates || []
  const education = teacher.education || []
  const experience = teacher.experience || []
  const teachingMethods = teacher.teachingMethods
  const starDistribution = teacher.starDistribution || {}
  const featuredReviews = teacher.featuredReviews || []
  const totalReviewsCount = reviewCount || 1

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16">
      {/* ─── Breadcrumbs & Back Bar ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-hidden">
            <Link
              to="/"
              className="hover:text-slate-900 transition-colors shrink-0"
            >
              {t.courses?.home || "Trang chủ"}
            </Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <Link
              to="/explore-courses"
              className="hover:text-slate-900 transition-colors shrink-0"
            >
              {t.courses?.exploreCourses || "Khám phá khóa học"}
            </Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <Link
              to={`/explore/teachers/${encodeURIComponent(slugOrId)}`}
              className="hover:text-slate-900 transition-colors truncate"
            >
              {fullName}
            </Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="font-bold text-[#990011] shrink-0">
              {t.courses?.competencyProfile || "Hồ sơ năng lực"}
            </span>
          </nav>

          {/* Back button */}
          <Link
            to={`/explore/teachers/${encodeURIComponent(slugOrId)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#990011] transition-colors shrink-0"
          >
            <ArrowLeft size={14} />
            <span>
              {t.courses?.backToTeacherProfile || "Quay lại trang giảng viên"}
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
        {/* ─── Compact Teacher Identity Header Card ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar + Identity + Stats */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar 72x72 */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center select-none">
              {teacher.avatarUrl && !avatarError ? (
                <img
                  src={teacher.avatarUrl}
                  alt={fullName}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#990011] to-[#66000B] text-white font-black text-xl flex items-center justify-center">
                  {initials}
                </div>
              )}
            </div>

            {/* Name + Verified Badge + Stats line */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                  {fullName}
                </h1>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold select-none">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>
                    {t.courses?.verifiedBadge ||
                      "Giảng viên được xác minh bởi Cat Speak"}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div className="text-xs text-slate-600 truncate font-medium">
                {headline}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span>{ratingValue}</span>
                  <span className="text-slate-400 font-normal">
                    ({formatTeacherNumber(reviewCount)})
                  </span>
                </div>

                <span className="text-slate-200">│</span>

                <div className="flex items-center gap-1 text-slate-700">
                  <Trophy size={13} className="text-amber-500" />
                  <span>5 Năm KN</span>
                </div>

                <span className="text-slate-200">│</span>

                <div className="flex items-center gap-1 text-slate-700">
                  <BookOpen size={13} className="text-blue-600" />
                  <span>{activeClassCount || 10} Khóa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleMessageClick}
                className="px-4 py-2 rounded-xl border border-[#990011] text-[#990011] hover:bg-[#990011]/5 transition-colors font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageSquare size={14} />
                <span>{t.courses?.sendMessage || "Nhắn tin"}</span>
              </button>

              <button
                type="button"
                onClick={handleFollowClick}
                disabled={isFollowActionPending}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
                  isFollowing
                    ? "bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100"
                    : "bg-[#990011] text-white hover:bg-[#80000e]"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check size={14} className="text-emerald-600 stroke-[2.5]" />
                    <span>{t.courses?.following || "Đang theo dõi"}</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>{t.courses?.follow || "Theo dõi"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ─── Main 2-Column Layout (Main Content + Sticky Reviews Sidebar) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── Left Column (8 cols): Competency Sections ─── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Teaching Motto (Châm ngôn giảng dạy nổi bật) */}
            {teachingMotto && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-red-50/70 via-amber-50/40 to-slate-50 border border-red-100/80 shadow-2xs relative overflow-hidden">
                <Quote
                  size={48}
                  className="absolute -bottom-2 -right-2 text-[#990011]/10 pointer-events-none"
                />
                <div className="relative z-10 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-[#990011] uppercase tracking-wider">
                    {t.courses?.teachingMottoTitle || "Triết lý giảng dạy"}
                  </span>
                  <blockquote className="text-base sm:text-lg font-bold text-slate-900 italic leading-snug">
                    "{teachingMotto}"
                  </blockquote>
                </div>
              </div>
            )}

            {/* 2. Introduction ("Giới thiệu bản thân") */}
            {introduction && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {t.courses?.aboutMe || "Giới thiệu bản thân"}
                  </h2>
                </div>

                <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
                  {introduction}
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
                  {t.courses?.lastUpdated?.replace("{{time}}", "2 ngày trước") ||
                    "Cập nhật lần cuối: 2 ngày trước"}
                </div>
              </div>
            )}

            {/* 3. Certificates & Credentials ("Chứng chỉ & Bằng cấp") - BR-EX-GV-13 */}
            {certificates.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {t.courses?.certificatesCredentials ||
                      "Chứng chỉ & Bằng cấp"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Award size={18} className="text-amber-500 shrink-0" />
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {cert.name}
                          </h3>
                        </div>
                        {cert.issuedYear && (
                          <span className="text-[11px] font-bold text-slate-400 shrink-0">
                            {cert.issuedYear}
                          </span>
                        )}
                      </div>

                      {cert.scoreDetails && (
                        <div className="text-xs font-semibold text-slate-700 bg-white/80 px-2.5 py-1 rounded-md border border-slate-100">
                          {cert.scoreDetails}
                        </div>
                      )}

                      {cert.issuedBy && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          Cấp bởi: {cert.issuedBy}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Education ("Học vấn") - BR-EX-GV-13 */}
            {education.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {t.courses?.educationTitle || "Học vấn"}
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
                  {education.map((edu, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <GraduationCap size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {edu.school}
                          </h3>
                          {edu.period && (
                            <span className="text-xs text-slate-400 font-medium">
                              Niên khóa: {edu.period}
                            </span>
                          )}
                        </div>

                        {edu.major && (
                          <div className="text-xs font-medium text-slate-700 mt-0.5">
                            {edu.major}
                          </div>
                        )}

                        {edu.degreeGrade && (
                          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 inline-block px-2 py-0.5 rounded mt-2">
                            {edu.degreeGrade}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Experience Timeline ("Kinh nghiệm giảng dạy") - BR-EX-GV-13 */}
            {experience.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {t.courses?.teachingExpTitle || "Kinh nghiệm giảng dạy"}
                  </h2>
                </div>

                <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-6">
                  {experience.map((exp, index) => {
                    const isCurrent =
                      exp.isCurrent ||
                      (exp.period && /nay|present|hiện/i.test(exp.period))

                    return (
                      <div key={index} className="relative">
                        {/* Dot indicator on timeline */}
                        <span
                          className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                            isCurrent
                              ? "bg-emerald-500 ring-4 ring-emerald-100"
                              : "bg-slate-300"
                          }`}
                        />

                        {/* Experience item details */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <h3 className="font-extrabold text-slate-900 text-sm">
                              {exp.role} ·{" "}
                              <span className="text-slate-600 font-semibold">
                                {exp.organization}
                              </span>
                            </h3>

                            {/* Period Badge */}
                            {exp.period && (
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  isCurrent
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {exp.period}
                                {exp.yearsCount ? ` · ${exp.yearsCount} năm` : ""}
                              </span>
                            )}
                          </div>

                          {/* Location */}
                          {exp.location && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin size={11} />
                              <span>{exp.location}</span>
                            </div>
                          )}

                          {/* Description */}
                          {exp.description && (
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 6. Teaching Methods ("Phương pháp giảng dạy") - BR-EX-GV-13 */}
            {teachingMethods &&
              (teachingMethods.tags?.length > 0 ||
                teachingMethods.description) && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {t.courses?.teachingMethodsTitle ||
                        "Phương pháp giảng dạy"}
                    </h2>
                  </div>

                  {/* Keyword tags */}
                  {Array.isArray(teachingMethods.tags) &&
                    teachingMethods.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {teachingMethods.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg bg-red-50 text-[#990011] text-xs font-bold border border-red-100/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Method Description text */}
                  {teachingMethods.description && (
                    <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line pt-2">
                      {teachingMethods.description}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* ─── Right Column (4 cols): Sticky Reviews Sidebar ─── */}
          <div className="lg:col-span-4 sticky top-6 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#990011]" />
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t.courses?.studentReviews || "Đánh giá từ học viên"}
                  </h3>
                </div>
              </div>

              {/* Big Score + Stars */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">
                  {ratingValue}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {t.courses?.basedOnReviews?.replace(
                      "{{count}}",
                      formatTeacherNumber(reviewCount)
                    ) || `Dựa trên ${reviewCount} nhận xét`}
                  </span>
                </div>
              </div>

              {/* 5-Star Distribution Bars */}
              <div className="flex flex-col gap-1.5 pt-1">
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
                      <span className="w-9 shrink-0">{star} sao</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#FBBF24] rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-7 text-right text-slate-400 font-medium shrink-0 text-[11px]">
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Featured Reviews in Sidebar (1 or 2) */}
              {featuredReviews.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.courses?.featuredReviews || "NHẬN XÉT TIÊU BIỂU"}
                  </span>

                  {featuredReviews.slice(0, 2).map((rev) => (
                    <div
                      key={rev.reviewId}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{rev.studentName}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={11}
                              className={
                                s <= Math.round(rev.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-600 italic leading-relaxed text-[11px]">
                        "{rev.comment}"
                      </p>

                      {rev.className && (
                        <Link
                          to={`/explore-courses/class/${rev.classId}`}
                          className="text-[10px] font-bold text-[#990011] hover:underline"
                        >
                          Lớp: {rev.className}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* View All Reviews Button -> Opens Modal */}
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#990011] text-[#990011] hover:bg-[#990011]/5 transition-colors text-xs font-bold text-center cursor-pointer active:scale-[0.99] mt-2"
              >
                {t.courses?.viewAllReviews || "Xem tất cả nhận xét"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── All Reviews Modal (Ticket 08) ─── */}
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
    </div>
  )
}

export default TeacherCompetencyPage
