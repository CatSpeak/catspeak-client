import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Globe,
  GraduationCap,
  Calendar,
  Clock,
  AlignLeft,
  Pencil,
  Users,
  Share2,
  Check,
  Presentation,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { copyShareLink } from "@/shared/utils/shareUtils"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"
import {
  defaultCourseThumbnail,
  getSafeMediaUrl,
  formatCurrency,
} from "../../utils/courseUtils"

const GeneralSection = ({
  classData = {},
  isStudent = false,
  id: propId,
  navigate: propNavigate,
  showActionsDropdown: propShowActionsDropdown,
  setShowActionsDropdown: propSetShowActionsDropdown,
  onCompleteClass,
  onCancelClassClick,
  isActionPending = false,
  formatCurrency: propFormatCurrency,
  getWeeklyScheduleText: propGetWeeklyScheduleText,
  cd: propCd,
  thumbnailUrl,
  className = "",
}) => {
  const { t } = useLanguage()
  const { formatDate, formatWeeklySchedule } = useTimezone()
  const hookNavigate = useNavigate()
  const params = useParams()

  const navigate = propNavigate || hookNavigate
  const id = propId || classData?.id || params.id

  const c = t.courses || {}
  const cd = propCd || c.classDetail || {}
  const ui = c.workspaceUi || {}

  const [linkCopied, setLinkCopied] = useState(false)
  const [internalShowActions, setInternalShowActions] = useState(false)

  const showActions =
    propShowActionsDropdown !== undefined
      ? propShowActionsDropdown
      : internalShowActions
  const setShowActions = propSetShowActionsDropdown || setInternalShowActions

  const displayThumbnail =
    thumbnailUrl || getSafeMediaUrl(classData?.thumbnailUrl)

  const normalizedStatus = String(classData?.status || "")
    .trim()
    .toUpperCase()
  const isArchivedClass = normalizedStatus === "ARCHIVED"
  const isCompletedClass = normalizedStatus === "COMPLETED"

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/explore-courses/class/${id}`
    const ok = await copyShareLink({
      url: shareUrl,
      successMessage: cd.linkCopied || "Link copied!",
      errorMessage: cd.linkCopyFailed || "Failed to copy link",
    })
    if (ok) {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const scheduleText =
    typeof propGetWeeklyScheduleText === "function"
      ? propGetWeeklyScheduleText()
      : formatWeeklySchedule(classData || {}, ui.tba)

  const currencyFormatter = propFormatCurrency || formatCurrency

  const totalValue = classData.progress
    ? classData.progress.totalSessions
    : (classData.totalSessions ?? classData.teachingProgress?.total)

  const total =
    Number.isFinite(Number(totalValue)) && Number(totalValue) > 0
      ? Number(totalValue)
      : 0

  return (
    <div
      className={`bg-white rounded-3xl border border-border shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* Visual Banner */}
      <div className="relative p-6 sm:p-8 min-h-[380px] flex flex-col justify-end text-white">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${displayThumbnail || defaultCourseThumbnail})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        </div>

        {/* Share / Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          title={cd.shareClass || "Share class"}
          className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-all active:scale-90 cursor-pointer"
        >
          {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
        </button>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              {classData?.title || ui.untitledClass || "Untitled class"}
            </h2>
          </div>

          {!isStudent &&
            (isCompletedClass ? (
              <span
                role="status"
                className="h-10 px-5 bg-emerald-100 text-emerald-800 font-bold text-sm rounded-full flex items-center justify-center"
              >
                {cd.classCompleted || "Class completed"}
              </span>
            ) : (
              <div className="relative shrink-0">
                <button
                  type="button"
                  disabled={isActionPending}
                  aria-expanded={showActions}
                  aria-haspopup="menu"
                  onClick={() => setShowActions(!showActions)}
                  className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil size={14} />
                  <span>{cd.customizeClass || "Customize"}</span>
                </button>

                {showActions && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 text-gray-700"
                  >
                    {!isArchivedClass ? (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setShowActions(false)
                            navigate(
                              `/workspace/courses/edit-class/${encodeURIComponent(String(id))}`,
                            )
                          }}
                          className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold transition-colors"
                        >
                          {cd.editClass || "Edit Class"}
                        </button>
                        {/* <button
                          type="button"
                          role="menuitem"
                          disabled={isActionPending}
                          onClick={() => {
                            setShowActions(false)
                            onCompleteClass?.()
                          }}
                          className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold transition-colors"
                        >
                          {cd.completeClass || "Complete Class"}
                        </button> */}
                        <button
                          type="button"
                          role="menuitem"
                          disabled={isActionPending}
                          onClick={() => {
                            setShowActions(false)
                            onCancelClassClick?.()
                          }}
                          className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold text-[#BA021C] transition-colors"
                        >
                          {cd.cancelClass || "Cancel Class"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowActions(false)
                          navigate(`/workspace/classes/create-class`, {
                            state: { recoverClassId: id },
                          })
                        }}
                        className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold text-[#b20a1c] transition-colors"
                      >
                        {cd.reopenClass || "Reopen Class (Recover)"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Information Card Content */}
      <div className="p-6 flex flex-col gap-6">
        {/* Opening Fee */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center font-bold text-lg">
              $
            </div>
            <span className="text-sm font-bold text-gray-500">
              {cd.classFee || "Class Fee"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xl font-bold text-[#990011]">
            <span>
              {classData?.tuitionFee !== undefined &&
              classData?.tuitionFee !== null
                ? Number(classData.tuitionFee) === 0
                  ? c.student?.priceFree || "Miễn phí"
                  : `${currencyFormatter(classData.tuitionFee)} ${ui.currencyVnd || "VND"}`
                : "—"}
            </span>
            <span
              className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center cursor-help shrink-0"
              title={cd.classFeeHelp || "Tuition fee charged per student"}
            >
              ?
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Language - Blue */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.language || "Language"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {getLocalizedLanguageName(classData?.language, t) || "—"}
              </span>
            </div>
          </div>

          {/* Level - Yellow */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#fff9cc] text-[#e3b709] flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.level || "Level"}
              </span>
              <span className="inline-flex mt-1 items-center justify-center px-3 py-0.5 text-xs font-bold text-white bg-[#e3b709] rounded-full w-fit">
                {classData?.levels?.join(", ") || "—"}
              </span>
            </div>
          </div>

          {/* Admission Period - Purple */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#fad9ff] text-[#c460d1] flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.enrollmentPeriod || "Admission Period"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {classData?.enrollmentStart && classData?.enrollmentEnd
                  ? `${formatDate(classData.enrollmentStart)} - ${formatDate(classData.enrollmentEnd)}`
                  : ui.tba || "TBA"}
              </span>
            </div>
          </div>

          {/* Weekly Schedule - Orange */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#ffebee] text-[#f73b4e] flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.weeklySchedule || "Weekly Schedule"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {scheduleText}
              </span>
            </div>
          </div>

          {/* Class Size - Amber/Yellow */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#e2d6ff] text-[#8c65e0] flex items-center justify-center">
              <Users size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.classSize || "Class Size"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {classData?.slots ?? "—"} {cd.studentsLabel || "students"}
              </span>
            </div>
          </div>

          {/* Total sessions */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#ffdcc4] text-[#ff8330] flex items-center justify-center">
              <Presentation size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.totalSessions || "Số buổi học"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {total > 0
                  ? `${total} ${cd.sessionsCountLabel || "buổi"}`
                  : classData.totalSessions
                    ? `${classData.totalSessions} ${cd.sessionsCountLabel || "buổi"}`
                    : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-border pt-6">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
            <AlignLeft size={18} />
          </div>
          <div className="flex flex-col gap-0 w-full min-w-0">
            <span className="text-sm text-gray-400">
              {cd.description || "Description"}
            </span>
            <RenderHTML
              html={classData?.description}
              className="text-gray-600 text-sm leading-relaxed mt-0.5"
              fallback={
                <span className="text-gray-600 text-sm leading-relaxed mt-0.5">
                  {cd.noDescription || "No description provided."}
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralSection
