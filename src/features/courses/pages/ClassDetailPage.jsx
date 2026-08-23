import React, { lazy, Suspense, useRef, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { MessageSquare, Video } from "lucide-react"

import {
  useGetClassDetailQuery,
  useUpdateClassMutation,
  useDeleteClassMutation
} from "@/store/api/coursesApi"
import { formatCurrency } from "../utils/courseUtils"
import { getClassLanguageCode } from "@/shared/utils/navigation"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

import { Tabs } from "@/shared/components/ui/navigation"
import ClassOverviewTab from "../components/overview/ClassOverviewTab"
import CreatePostTypeModal from "../components/CreatePostTypeModal"

import { useAuth } from "@/features/auth"
import { useRoleOverride } from "../components/RoleSwitcher"

const ClassLectureHallPage = lazy(() => import("../components/lecture-hall/pages/ClassLectureHallPage"))
const ClassGradingTab = lazy(() => import("../components/grading/ClassGradingTab"))
const ClassMembersTab = lazy(() => import("../components/members/ClassMembersTab"))
const ClassInviteFriendsTab = lazy(() => import("../components/members/ClassInviteFriendsTab"))
const VouchersTab = lazy(() => import("@/features/vouchers/components/VouchersTab"))

const TabLoadingFallback = () => (
  <LoadingSpinner className="flex justify-center items-center min-h-[240px]" />
)

const GRADING_DETAIL_PARAM_KEYS = [
  "assignmentId",
  "quizId",
  "studentId",
  "submissionId",
]

const ClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { formatWeeklySchedule } = useTimezone()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const ui = c.workspaceUi || {}

  const { user } = useAuth()
  const { isTeacher } = useRoleOverride()

  const [searchParams, setSearchParams] = useSearchParams()
  const assignmentId = searchParams.get("assignmentId")
  const quizId = searchParams.get("quizId")
  const hasGradingDeepLink = Boolean(assignmentId || quizId)

  const urlTab = searchParams.get("tab")
  const VALID_TABS = [
    "overview",
    "members",
    "lecture-hall",
    "feed",
    "grading",
    "invite-friends",
    "vouchers",
  ]
  const initialTab = (urlTab && VALID_TABS.includes(urlTab)) ? urlTab : "overview"
  const activeTab = hasGradingDeepLink ? "grading" : initialTab

  const handleTabChange = (tab) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set("tab", tab)
    GRADING_DETAIL_PARAM_KEYS.forEach((key) => (
      nextSearchParams.delete(key)
    ))
    setSearchParams(nextSearchParams)
  }

  // Fetch Class Details via RTK Query
  const {
    currentData: detailResponse,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    error: detailError,
    refetch: refetchDetail,
  } = useGetClassDetailQuery(id, { skip: !id })
  const [updateClass, { isLoading: isCompletingClass }] = useUpdateClassMutation()
  const [deleteClass, { isLoading: isCancellingClass }] = useDeleteClassMutation()

  // Process data for rendering
  const classData = (
    detailResponse
    && typeof detailResponse === "object"
    && !Array.isArray(detailResponse)
    && detailResponse.id
  )
    ? detailResponse
    : null

  // State Management for UI Actions
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showCancelClassModal, setShowCancelClassModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const classActionGuardRef = useRef(false)

  // Cancel class handler
  const handleCancelClass = async () => {
    if (
      classActionGuardRef.current
      || isCancellingClass
      || isCompletingClass
      || !id
    ) return
    classActionGuardRef.current = true
    try {
      await deleteClass({ id, courseId: classData?.courseId }).unwrap()
      toast.success(cd.toastCancelSuccess || "Class cancelled successfully")
      navigate("/workspace/classes")
    } catch {
      toast.error(cd.toastCancelFailed || "Failed to cancel class")
    } finally {
      classActionGuardRef.current = false
      setShowCancelClassModal(false)
    }
  }

  // Complete class handler
  const handleCompleteClass = async () => {
    if (
      classActionGuardRef.current
      || isCompletingClass
      || isCancellingClass
      || !id
    ) return
    classActionGuardRef.current = true
    setShowActionsDropdown(false)
    try {
      await updateClass({
        id,
        courseId: classData?.courseId,
        data: { status: "COMPLETED" },
      }).unwrap()
      toast.success(cd.toastCompleteSuccess || "Marked class as complete")
    } catch {
      toast.error(cd.toastCompleteFailed || "Failed to complete class")
    } finally {
      classActionGuardRef.current = false
    }
  }

  const isClassTeacher = Boolean(
    isTeacher
    || user?.isTeacher
    || (user?.accountId && [
      classData?.teacherId,
      classData?.instructorId,
      classData?.teacher?.id,
      classData?.teacher?.accountId,
    ].some((tid) => tid != null && String(tid) === String(user.accountId)))
  )

  const tabs = [
    { value: "overview", label: cd.overview || "Overview" },
    { value: "members", label: cd.members || "Members" },
    { value: "lecture-hall", label: cd.lectureHall || "Lecture Hall" },
    { value: "grading", label: cd.grading || "Grading" },
    ...(isClassTeacher ? [{ value: "invite-friends", label: cd.inviteFriends || "Mời bạn bè" }] : []),
    ...(isClassTeacher ? [{ value: "vouchers", label: cd.vouchers || "Ưu đãi" }] : []),
  ]

  const getWeeklyScheduleText = () => formatWeeklySchedule(classData || {}, ui.tba)

  if (
    isDetailLoading
    || (isDetailFetching && detailResponse === undefined)
  ) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (detailError || !id || !classData) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{cd.loadFailed || "This class could not be loaded. Please try again."}</span>
        {id && (
          <button type="button" onClick={refetchDetail} className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white">
            {cd.retry || "Try again"}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {isDetailFetching && (
        <span role="status" className="sr-only">
          {cd.refreshing || "Refreshing class details"}
        </span>
      )}

      {!hasGradingDeepLink && (
        <>
          {/* ─── Breadcrumb ─── */}
          <Breadcrumb
            items={[
              { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
              { label: c.allClasses?.title || "Toàn bộ lớp học", onClick: () => navigate("/workspace/classes/all-classes") },
              ...(classData.courseId
                ? [
                    {
                      label: classData.courseName || classData.courseTitle || c.student?.courseDetails || "Course Details",
                      onClick: () => navigate(`/workspace/courses/details/${encodeURIComponent(String(classData.courseId))}`),
                    },
                  ]
                : []),
              { label: c.student?.classDetails || "Class Details" },
            ]}
          />

          {/* ─── Page Heading & Header Actions ─── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-black text-gray-950 tracking-tight">
              {c.student?.classDetails || "Class Details"}
            </h1>

            <div className="flex items-center gap-3">
              {/* Vào phòng học button */}
              <button
                type="button"
                onClick={() => navigate(`/${encodeURIComponent(getClassLanguageCode(classData?.language) || "en")}/meet/${encodeURIComponent(`class-${id}`)}`)}
                className="h-10 px-5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <Video size={14} className="fill-white" />
                <span>{cd.joinRoom || c.joinRoom || "Vào phòng học"}</span>
              </button>

              {/* Trò chuyện button */}
              <button
                type="button"
                onClick={() => {
                  if (classData?.chatGroupId) {
                    navigate(`/chat/${classData.chatGroupId}`)
                  } else {
                    navigate("/chat")
                  }
                }}
                className="h-10 px-5 bg-white border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <MessageSquare size={14} className="fill-[#990011]" />
                <span>{c.student?.chat || "Chat"}</span>
              </button>

              {/* Tạo bài button */}
              <button
                type="button"
                onClick={() => setShowCreatePostModal(true)}
                className="h-10 px-5 bg-white border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <span>{cd.createPost || "Create Post"}</span>
                <span className="text-sm font-light">+</span>
              </button>
            </div>
          </div>

          {/* ─── Navigation Tabs ─── */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            fullWidth={false}
            className="border-b border-border/80"
          />
        </>
      )}

      {/* ─── Tab Contents ─── */}
      <Suspense fallback={<TabLoadingFallback />}>
        {activeTab === "overview" && (
          <ClassOverviewTab
            classData={classData}
            isStudent={false}
            isEnrolled={true}
            language={language}
            cd={cd}
            id={id}
            navigate={navigate}
            showActionsDropdown={showActionsDropdown}
            setShowActionsDropdown={setShowActionsDropdown}
            onCompleteClass={handleCompleteClass}
            onCancelClassClick={() => setShowCancelClassModal(true)}
            isActionPending={isCompletingClass || isCancellingClass}
            formatCurrency={formatCurrency}
            getWeeklyScheduleText={getWeeklyScheduleText}
            upcomingSessionLabel={c.courseDetail?.upcomingSession || "Upcoming Session"}
            joinRoomLabel={c.joinRoom || "Join Room"}
            viewAllLabel={c.viewAll || "View All"}
            noUpcomingLabel={c.courseDetail?.noUpcoming || "No upcoming sessions"}
            createClassToScheduleLabel={c.courseDetail?.createClassToSchedule || "Create a class to schedule your first session."}
            teachingTasksLabel={c.teachingTasks || "Teaching Tasks"}
            gradeAssignmentLabel={c.gradeAssignment || "Grade homework"}
            giveFeedbackLabel={c.giveFeedback || "Give feedback"}
            prepareLessonLabel={c.prepareLesson || "Prepare lesson plan"}
            onJoinRoom={() => navigate(
              `/${encodeURIComponent(getClassLanguageCode(classData?.language) || "en")}/meet/${encodeURIComponent(`class-${id}`)}`
            )}
            onTaskAction={() => navigate("/workspace/courses/schedule")}
            onViewTasks={() => navigate("/workspace/courses/schedule")}
          />
        )}

        {activeTab === "members" && (
          <ClassMembersTab
            classData={classData}
            isStudent={false}
          />
        )}

        {activeTab === "lecture-hall" && (
          <ClassLectureHallPage
            id={id}
            isStudent={false}
          />
        )}

        {activeTab === "grading" && (
          <ClassGradingTab
            id={id}
            isStudent={false}
            language={language}
            cd={cd}
          />
        )}

        {activeTab === "invite-friends" && isClassTeacher && (
          <ClassInviteFriendsTab
            classData={classData}
            cd={cd}
          />
        )}

        {activeTab === "vouchers" && isClassTeacher && (
          <VouchersTab
            scope="class"
            classId={id}
          />
        )}
      </Suspense>

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showCancelClassModal}
        onClose={() => {
          if (!isCancellingClass) setShowCancelClassModal(false)
        }}
        onConfirm={handleCancelClass}
        isPending={isCancellingClass}
        title={cd.cancelClass || "Cancel Class"}
        message={cd.confirmCancelClass || "Are you sure you want to cancel this class?"}
        confirmText={cd.cancelClass || "Cancel Class"}
        cancelText={c.createClass?.cancel || "Hủy"}
      />

      <CreatePostTypeModal
        open={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSelect={(type) => {
          if (type === "exam") {
            navigate(`/workspace/courses/class/${encodeURIComponent(String(id))}/create-exam`)
          } else {
            navigate(`/workspace/courses/class/${encodeURIComponent(String(id))}/create-assignment`)
          }
        }}
      />
    </div>
  )
}

export default ClassDetailPage
